/* Listens for events and shows them in the event log */
export default function AuraInspectorEventLog(devtoolsPanel) {
    var _visible = {
        all: false, // default off because of the volume of data this collects
        eventName: '',
        application: true,
        component: true,
        unhandled: false
    };
    var ol;
    var _events = [];
    var _eventsMap = new Map();
    var _actionsMap = new Map();
    var MAX_EVENTS = 100000; // We could store a LOT of events, so lets just set a high max.
    var _contextStack = [];
    var _currentContext = null;
    var _handled = new Map();

    var labels = {
        toggle_recording: chrome.i18n.getMessage('menu_record'),
        clear: chrome.i18n.getMessage('menu_clear'),
        filter: chrome.i18n.getMessage('menu_filter'),
        appEvents: chrome.i18n.getMessage('eventlog_menu_appevents'),
        cmpEvents: chrome.i18n.getMessage('eventlog_menu_cmpevents'),
        unhandledEvents: chrome.i18n.getMessage('eventlog_menu_unhandled'),
        appEvents_tooltip: chrome.i18n.getMessage('eventlog_menu_appevents_tooltip'),
        cmpEvents_tooltip: chrome.i18n.getMessage('eventlog_menu_cmpevents_tooltip'),
        unhandledEvents_tooltip: chrome.i18n.getMessage('eventlog_menu_unhandled_tooltip')
    };

    var markup = `
        <div class="grid grid-columns scroll-wrapper">
            <menu type="toolbar" class="no-flex">
                <li class="record-button"><aurainspector-onoffbutton class="circle" data-filter="all" title="${labels.toggle_recording}"><span>${labels.toggle_recording}</span></aurainspector-onoffbutton></li>
                <li><button id="clear-button" class="clear-status-bar-item status-bar-item" title="${labels.clear}"><div class="glyph"></div><div class="glyph shadow"></div></button></li>
                <li class="divider" style="margin-left: -3px;"></li>
                <li><input id="filter-text" type="search" placeholder="${labels.filter}"/></li>
                <li class="divider"></li>
                <li><aurainspector-onoffbutton class="on" data-filter="application" title="${labels.appEvents_tooltip}"><span>${labels.appEvents}</span></aurainspector-onoffbutton></li>
                <li><aurainspector-onoffbutton class="on" data-filter="component" title="${labels.cmpEvents_tooltip}"><span>${labels.cmpEvents}</span></aurainspector-onoffbutton></li>
                <li><aurainspector-onoffbutton class="" data-filter="unhandled" title="${labels.unhandledEvents_tooltip}"><span>${labels.unhandledEvents}</span></aurainspector-onoffbutton></li>
            </menu>
            <ol class="event-log flex scroll" id="event-log"></ol>
        </div>
    `;

    this.title = chrome.i18n.getMessage('tabs_eventlog');

    this.init = function(tabBody) {
        tabBody.innerHTML = markup;

        ol = tabBody.querySelector('ol#event-log');

        // Start listening for events to draw
        devtoolsPanel.subscribe(
            'AuraInspector:OnEventStart',
            AuraInspectorEventLog_OnEventStart.bind(this)
        );
        devtoolsPanel.subscribe(
            'AuraInspector:OnEventEnd',
            AuraInspectorEventLog_OnEventEnd.bind(this)
        );
        devtoolsPanel.subscribe(
            'AuraInspector:OnClientActionStart',
            AuraInspectorEventLog_OnClientActionStart.bind(this)
        );
        devtoolsPanel.subscribe(
            'AuraInspector:OnClientActionEnd',
            AuraInspectorEventLog_OnClientActionEnd.bind(this)
        );

        var clearButton = tabBody.querySelector('#clear-button');
        clearButton.addEventListener('click', ClearButton_OnClick.bind(this));

        var filterText = tabBody.querySelector('#filter-text');
        filterText.addEventListener('change', FilterText_OnChange.bind(this));
        filterText.addEventListener('keyup', debounce(FilterText_OnChange.bind(this), 200));

        var menu = tabBody.querySelector('menu');
        menu.addEventListener('click', Menu_OnClick.bind(this));
    };

    this.refresh = function() {
        // remove all the events
        ol.removeChildren();

        var event;
        for (var c = 0, length = _events.length; c < length; c++) {
            event = _events[c];
            if (isAllowed(event)) {
                addCard(event);
            }
        }
    };

    this.render = function() {
        devtoolsPanel.hideSidebar();
    };

    function isRecording() {
        return _visible.all;
    }

    // Returns True if allowed, false if filtered out.
    function isAllowed(eventInfo) {
        if (!eventInfo) {
            return false;
        }
        if (!_visible.application && eventInfo.type === 'APPLICATION') {
            return false;
        }
        if (!_visible.component && eventInfo.type === 'COMPONENT') {
            return false;
        }
        if (!_visible.unhandled && !hasHandledData(eventInfo)) {
            return false;
        }

        var eventName = _visible.eventName;
        if (eventName) {
            if (eventName.startsWith('!')) {
                eventName = eventName.substr(1);
                return !eventInfo.name.includes(eventName);
            }
            return eventInfo.name.includes(eventName);
        }

        return true;
    }

    function addCard(eventInfo) {
        var eventId = getEventId(eventInfo);

        var li = document.createElement('li');

        var expand = document.createElement('button');
        expand.value = 'OFF';
        expand.className = 'toggle';
        // expand.textContent = "+";
        expand.addEventListener('click', ExpandButton_OnClick);

        var card = document.createElement('aurainspector-event-card');
        card.setAttribute('name', eventInfo.name);
        card.setAttribute('sourceId', eventInfo.sourceId || '');
        card.setAttribute('duration', (eventInfo.endTime - eventInfo.startTime).toFixed(4));
        card.setAttribute('type', eventInfo.type);
        card.setAttribute('caller', eventInfo.caller);
        card.setAttribute('parameters', eventInfo.parameters);
        card.setAttribute('collapsed', 'true');

        if (!eventInfo.handledBy) {
            var handleData = _handled.get(eventId);
            if (handleData) {
                card.setAttribute('handledBy', JSON.stringify(handleData));
                eventInfo.handledBy = handleData;
            }
        } else {
            card.setAttribute('handledBy', JSON.stringify(eventInfo.handledBy));
            card.setAttribute('handledByTree', JSON.stringify(eventInfo.handledByTree || '{}'));
        }

        card.id = eventId;

        li.appendChild(expand);
        li.appendChild(card);
        ol.insertBefore(li, ol.firstChild);

        if (ol.childNodes.length >= MAX_EVENTS) {
            ol.lastChild.remove();
        }
        card.addEventListener('navigateToEvent', AuraInspectorEventLog_OnEventClick);
        return card;
    }

    function storeEvent(eventInfo) {
        _eventsMap.set(getEventId(eventInfo), eventInfo);
    }

    function storeFilteredEvent(eventInfo) {
        if (_events.length > MAX_EVENTS) {
            var removed = _events.pop();
            _eventsMap.delete(getEventId(removed));
        }
        _events.push(eventInfo);
    }

    function getHandledDataTree(contextId, previousId) {
        var tree = [];
        var currentHandlers = _handled.get(contextId) || [];
        var id;
        var data;
        var type;

        if (_actionsMap.has(contextId)) {
            type = 'action';
            data = _actionsMap.get(contextId);
        } else if (_eventsMap.has(contextId)) {
            type = 'event';
            var currentEvent = _eventsMap.get(contextId);
            data = {
                id: currentEvent.id,
                sourceId: currentEvent.sourceId,
                name: currentEvent.name,
                startTime: currentEvent.startTime
            };
        }

        if (data) {
            tree.push({ id: contextId, parent: previousId, data: data, type: type });
        }

        var handled;
        for (var c = 0; c < currentHandlers.length; c++) {
            handled = currentHandlers[c];
            id = currentHandlers[c].id;
            tree = tree.concat(getHandledDataTree(id, contextId));
        }
        return tree;
    }

    function hasHandledData(eventInfo) {
        if ('handledBy' in eventInfo) {
            return !eventInfo.handledBy || eventInfo.handledBy.length !== 0;
        }

        var eventId = getEventId(eventInfo);
        var handleData = _handled.get(eventId);
        if (handleData) {
            return handleData.length > 0;
        }
        return false;
    }

    function getEventId(eventInfo) {
        if ('id' in eventInfo) {
            return eventInfo.id;
        }
        eventInfo.id = 'event_' + eventInfo.startTime;
        return eventInfo.id;
    }

    function getParent(element, selector) {
        if (!element) {
            return null;
        }
        if (!selector) {
            return element.parentNode;
        }
        var current = element;
        while (!current.matches(selector)) {
            current = current.parentNode;
            if (!current || !current.matches) {
                return null;
            }
        }
        return current;
    }

    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    function AuraInspectorEventLog_OnEventStart(eventInfo) {
        if (!isRecording()) {
            return;
        }

        var eventId = getEventId(eventInfo);

        _contextStack.push(eventId);
        _currentContext = eventId;
        _handled.set(_currentContext, []);
    }

    function AuraInspectorEventLog_OnEventEnd(eventInfo) {
        if (!isRecording()) {
            return;
        }

        storeEvent(eventInfo);

        if (isAllowed(eventInfo)) {
            storeFilteredEvent(eventInfo);
            addCard(eventInfo);
        }

        if (!_currentContext) {
            return;
        }

        var startContextId = _contextStack.pop();
        if (!startContextId) {
            return;
        }
        if (_contextStack.length !== 0) {
            _currentContext = _contextStack[_contextStack.length - 1];

            var stored = _handled.get(_currentContext);
            stored.push(eventInfo);
        } else {
            _currentContext = null;

            // Build Handled By Tree
            var tree = getHandledDataTree(startContextId);
            for (var c = 0; c < tree.length; c++) {
                var eventElement = document.getElementById(tree[c].id);
                if (eventElement) {
                    _eventsMap.get(tree[c].id).handledByTree = tree;
                    eventElement.setAttribute('handledByTree', JSON.stringify(tree));
                }
            }
            _handled = new Map();
        }
    }

    // Highlights the event card
    function AuraInspectorEventLog_OnEventClick(eventInfo) {
        // No id specified
        if (!eventInfo.detail) {
            return;
        }

        var card = document.getElementById(event.detail.eventId);

        if (!card) {
            return;
        } else {
            var button = card.previousElementSibling;
            button.value = 'ON';

            card.setAttribute('collapsed', 'false');
            card.scrollIntoView({ block: 'end', behavior: 'smooth' });

            //var newEvent = new Event('highlightCard');
            //card.dispatchEvent(newEvent);
            card.highlight();
        }
    }

    function AuraInspectorEventLog_OnClientActionStart(actionInfo) {
        if (!_currentContext) {
            return;
        }

        var id = 'action_' + actionInfo.actionId;

        _handled.set(id, []);

        _contextStack.push(id);
        _currentContext = id;
    }

    function AuraInspectorEventLog_OnClientActionEnd(actionInfo) {
        if (!_currentContext) {
            return;
        }

        _contextStack.pop();
        _currentContext = _contextStack[_contextStack.length - 1];

        var data = {
            id: 'action_' + actionInfo.actionId,
            scope: actionInfo.scope,
            name: actionInfo.name,
            actionId: actionInfo.actionId
        };

        var stored = _handled.get(_currentContext);
        stored.push(data);

        _actionsMap.set(data.id, data);
    }

    function ClearButton_OnClick(event) {
        // Clear the stored events?
        _events = [];
        _eventsMap = new Map();
        _actionsMap = new Map();
        _handled = new Map();
        _contextStack = [];
        _currentContext = null;

        ol.removeChildren();
    }

    function ExpandButton_OnClick(event) {
        var button = event.currentTarget;
        var card = button.nextSibling;

        if (button.value == 'OFF') {
            button.value = 'ON';
            card.setAttribute('collapsed', 'false');
        } else {
            button.value = 'OFF';
            card.setAttribute('collapsed', 'true');
        }
    }

    function FilterText_OnChange(event) {
        var text = event.srcElement;
        _visible.eventName = text.value;

        this.refresh();
    }

    function Menu_OnClick(event) {
        var target = getParent(event.target, 'aurainspector-onoffbutton');

        if (target && target.hasAttribute('data-filter')) {
            var filter = target.getAttribute('data-filter');
            if (_visible.hasOwnProperty(filter)) {
                _visible[filter] = target.classList.contains('on');
                if (filter !== 'all') {
                    this.refresh();
                }
            }
        }
    }
}
