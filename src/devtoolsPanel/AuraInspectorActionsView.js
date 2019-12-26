/* Listens for actions and shows them in the actions tab */
export default function AuraInspectorActionsView(devtoolsPanel) {
    var _rendered = false;
    var _list;

    var _pending;
    var _running;
    var _completed;

    var _watchList;

    var _toWatch;
    var _processed;

    var _listening;
    var _filtered = {
        all: false,
        storable: false,
        stored: false,
        success: false,
        incomplete: false,
        error: false,
        aborted: false,
        background: false,
        name: ''
    };

    var actions = new Map();

    var labels = {
        record: chrome.i18n.getMessage('menu_record'),
        filter: chrome.i18n.getMessage('menu_filter'),
        clear: chrome.i18n.getMessage('menu_clear'),
        storable: chrome.i18n.getMessage('actions_menu_storable'),
        cached: chrome.i18n.getMessage('actions_menu_cached'),
        background: chrome.i18n.getMessage('actions_menu_background'),
        success: chrome.i18n.getMessage('actions_menu_success'),
        incomplete: chrome.i18n.getMessage('actions_menu_incomplete'),
        error: chrome.i18n.getMessage('actions_menu_error'),
        aborted: chrome.i18n.getMessage('actions_menu_aborted'),
        record_tooltip: chrome.i18n.getMessage('actions_menu_record_tooltip'),
        storable_tooltip: chrome.i18n.getMessage('actions_menu_storable_tooltip'),
        cached_tooltip: chrome.i18n.getMessage('actions_menu_cached_tooltip'),
        background_tooltip: chrome.i18n.getMessage('actions_menu_background_tooltip'),
        success_tooltip: chrome.i18n.getMessage('actions_menu_success_tooltip'),
        incomplete_tooltip: chrome.i18n.getMessage('actions_menu_incomplete_tooltip'),
        error_tooltip: chrome.i18n.getMessage('actions_menu_error_tooltip'),
        pendingoverrides: chrome.i18n.getMessage('actions_section_pendingoverrides'),
        pendingoverrides_desc: chrome.i18n.getMessage(
            'actions_section_pendingoverrides_description'
        ),
        processedoverrides: chrome.i18n.getMessage('actions_section_processedoverrides'),
        pending: chrome.i18n.getMessage('actions_section_pending'),
        running: chrome.i18n.getMessage('actions_section_running'),
        completed: chrome.i18n.getMessage('actions_section_completed')
    };

    var markup = `
        <menu type="toolbar">
            <li class="record-button"><aurainspector-onOffButton class="circle on" data-filter="all" title="${labels.record_tooltip}"><span>${labels.record}</span></aurainspector-onOffButton></li>
            <li><button id="clear-button" class="clear-status-bar-item status-bar-item" title="${labels.clear}"><div class="glyph"></div><div class="glyph shadow"></div></button></li>
            <li class="divider" style="margin-left: -3px;"></li>
            <li><input id="filter-text" type="search" placeholder="${labels.filter}"/></li>
            <li class="divider"></li>
            <li><aurainspector-onOffButton class="on" data-filter="storable" title="${labels.storable_tooltip}"><span>${labels.storable}</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="stored" title="${labels.cached_tooltip}"><span>${labels.cached}</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="background" title="${labels.background_tooltip}"><span>${labels.background}</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="success" title="${labels.success_tooltip}"><span>${labels.success}</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="incomplete" title="${labels.incomplete_tooltip}"><span>${labels.incomplete}</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="error" title="${labels.error_tooltip}"><span>${labels.error}</span></aurainspector-onOffButton></li>
            <li><aurainspector-onOffButton class="on" data-filter="aborted" title="${labels.aborted_tooltip}"><span>${labels.aborted}</span></aurainspector-onOffButton></li>
        </menu>
        <div class="actions-tab">
            <div id="actionsToWatch-list" class="actionsToWatch-list">
                <section class="dark">
                    <h1>${labels.pendingoverrides}</h1>
                    <div id="actionsToWatch-pending" class="drop-zone">
                        <span class="description">${labels.pendingoverrides_desc}</span>
                    </div>
                </section>
                <section id="actionsToWatch-completed" class="dark">
                    <h1>${labels.processedoverrides}</h1>
                </section>
            </div>
            <div id="actions-list" class="actions-list">
                <section id="actions-pending">
                    <h1>${labels.pending}</h1>
                </section>
                <section id="actions-running">
                    <h1>${labels.running}</h1>
                </section>
                <section id="actions-completed">
                    <h1>${labels.completed}</h1>
                </section>
            </div>
        </div>
    `;

    this.title = chrome.i18n.getMessage('tabs_actions');
    this.panelId = 'actions';

    this.init = function(tabBody) {
        tabBody.innerHTML = markup;

        _list = tabBody.querySelector('#actions-list');
        _pending = tabBody.querySelector('#actions-pending');
        _running = tabBody.querySelector('#actions-running');
        _completed = tabBody.querySelector('#actions-completed');

        _watchList = tabBody.querySelector('#actionsToWatch-list');
        _toWatch = tabBody.querySelector('#actionsToWatch-pending');
        _processed = tabBody.querySelector('#actionsToWatch-completed');

        // Start listening for events to draw
        devtoolsPanel.subscribe(
            'AuraInspector:OnActionEnqueue',
            AuraInspectorActionsView_OnActionEnqueue.bind(this)
        );
        devtoolsPanel.subscribe(
            'AuraInspector:OnActionStateChange',
            AuraInspectorActionsView_OnActionStateChange.bind(this)
        );
        devtoolsPanel.subscribe(
            'AuraInspector:OnPanelConnect',
            AuraInspectorActionsView_OnBootstrap.bind(this)
        );

        devtoolsPanel.subscribe(
            'AuraInspector:RemoveActionFromWatchList',
            AuraInspectorActionsView_OnRemoveActionFromWatchList.bind(this)
        );
        devtoolsPanel.subscribe(
            'AuraInspector:EnqueueNextResponseForAction',
            AuraInspectorActionsView_OnEnqueueNextResponseForAction.bind(this)
        );
        devtoolsPanel.subscribe(
            'AuraInspector:EnqueueNextErrorForAction',
            AuraInspectorActionsView_OnEnqueueNextErrorForAction.bind(this)
        );

        devtoolsPanel.subscribe(
            'AuraInspector:ActionOperationInChaosRun',
            AuraInspectorActionsView_OnActionOperationInChaosRun.bind(this)
        );
        devtoolsPanel.subscribe(
            'AuraInspector:EnqueueNextDropForChaosReplay',
            AuraInspectorActionsView_OnEnqueueNextDropForChaosReplay.bind(this)
        );

        // Attach event handlers
        _watchList.addEventListener('dragover', ActionsToWatch_OnDragOver);
        _watchList.addEventListener('dragleave', ActionsToWatch_OnDragLeave);
        _watchList.addEventListener('dragend', ActionsToWatch_OnDragEnd);
        _watchList.addEventListener('drop', ActionsToWatch_OnDrop.bind(this));

        var menu = tabBody.querySelector('menu');
        menu.addEventListener('click', Menu_OnClick.bind(this));

        var clearButton = tabBody.querySelector('#clear-button');
        clearButton.addEventListener('click', ClearButton_OnClick.bind(this));

        var filterText = tabBody.querySelector('#filter-text');
        filterText.addEventListener('change', FilterText_OnChange.bind(this));
        filterText.addEventListener('keyup', debounce(FilterText_OnChange.bind(this), 200));
    };

    this.render = function() {
        if (_rendered) {
            return;
        }

        devtoolsPanel.publish('AuraInspector:OnActionToWatchClear', {});
    };

    this.refresh = function() {
        removeAllCards();

        devtoolsPanel.publish('AuraInspector:OnActionToWatchClear', {});

        actions.forEach(function(action) {
            upsertCard(action);
        });
    };

    function AuraInspectorActionsView_OnBootstrap() {
        // refresh everything
        actions = new Map();

        removeAllCards();
    }

    function AuraInspectorActionsView_OnActionEnqueue(action) {
        // Store for later redrawing
        actions.set(action.id, action);

        upsertCard(action);
    }

    /*
        event handler for "AuraInspector:OnActionStateChange"
        {
            "id": actionWatchedId,
            "idtoWatch": actionWatched.idtoWatch,
            "state": "RESPONSEMODIFIED", "RUNNING", "NEW", "ERROR", "INCOMPLETE" or "SUCCESS"
            "sentTime": performance.now(),
            "byChaosRun": true if by replaying chaos run
        }
    */
    function AuraInspectorActionsView_OnActionStateChange(data) {
        //for action card on the right side, we successfully modify the response, now move the action card from Watch List to Processed
        if (data && data.state && data.state === 'RESPONSEMODIFIED') {
            upsertCard(data);
            //for action card on the left side
        } else {
            if (!actions.has(data.id)) {
                return;
            }

            var action = actions.get(data.id);
            Object.assign(action, data);

            upsertCard(action);
        }
    }

    function ClearButton_OnClick(event) {
        actions = new Map();

        this.refresh();
    }

    function FilterText_OnChange(event) {
        var text = event.srcElement;
        _filtered.name = text.value;

        this.refresh();
    }

    function Menu_OnClick(event) {
        var target = getParent(event.target, 'aurainspector-onOffButton');

        if (target && target.hasAttribute('data-filter')) {
            var filter = target.getAttribute('data-filter');
            if (_filtered.hasOwnProperty(filter)) {
                _filtered[filter] = !target.classList.contains('on');
                if (filter !== 'all') {
                    this.refresh();
                }
            }
        }
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

    function isAllowed(action) {
        if (_filtered.all) {
            return false;
        }
        if (_filtered.storable && action.storable) {
            return false;
        }
        if (_filtered.background && action.background) {
            return false;
        }
        if (_filtered.success && action.state === 'SUCCESS') {
            return false;
        }
        if (_filtered.incomplete && action.state === 'INCOMPLETE') {
            return false;
        }
        if (_filtered.error && action.state === 'ERROR') {
            return false;
        }
        if (_filtered.aborted && action.state === 'ABORTED') {
            return false;
        }
        if (_filtered.stored && action.fromStorage) {
            return false;
        }

        if (_filtered.name) {
            // Allows you to do !aura:// to get everything that doesn't match the pattern.
            var exclude = _filtered.name.indexOf('!') === 0;
            if (exclude) {
                var name = _filtered.name.substr(1);
                return !action.defName.includes(name);
            }
            return action.defName.includes(_filtered.name);
        }

        return true;
    }

    function upsertCard(action) {
        var card;
        if (action.idtoWatch) {
            //card on the right side: move from Watch List
            card = document.getElementById('action_card_' + action.idtoWatch);
            card.parentNode.removeChild(card);
            //the action we just dropped/modified is a new action, let's update the card with new actionId
            //this only move the card from Watch List to Processed
            //at the point we don't have the result/parameter now as the action hasn't come back from server yet.
            //if we would like to update that, would need to delay this logic
            card.setAttribute('actionId', action.id);
            card.setAttribute('returnError', action.error);
            //also want to hide choice to drop/modify action
            card.setAttribute('toWatch', 'false');
            //let's make it draggable again, so people can drag already processed action back to watch list
            card.setAttribute('draggable', 'true');
            card.classList.add('draggable');
            card.classList.remove('dropped');
            card.classList.remove('actionsToWatch-list');
            card.addEventListener('dragstart', drag.bind(this));
            card.addEventListener('dragend', endDrag.bind(this));
            card.setAttribute('collapsible', 'false');
        } else {
            //card on the left side
            if (!isAllowed(action)) {
                return;
            }

            if (action.state === 'NEW') {
                card = createActionCard(action.id, false);
            } else {
                card = document.getElementById('action_card_' + action.id);
                if (!card) {
                    card = createActionCard(action.id, false);
                }
                card.setAttribute('state', action.state);
                card.setAttribute('returnValue', action.returnValue);
                card.setAttribute('fromStorage', action.fromStorage);
                card.setAttribute('storageKey', action.storageKey);
                card.setAttribute('returnError', action.error);
                //let's give user some idea if the action result was modified, and if so, in which way
                //responseModified_modify, responseModified_drop or responseModified_error
                card.setAttribute('howDidWeModifyResponse', action.howDidWeModifyResponse);
                if (action.howDidWeModifyResponse != undefined) {
                    card.classList.add(action.howDidWeModifyResponse);
                }
                if (action.stats) {
                    card.setAttribute('stats', JSON.stringify(action.stats));
                }
                if (card.parentNode) {
                    card.parentNode.removeChild(card);
                }
            }
        }

        //console.log("move actionCard state:"+action.state+" actionId:"+action.id, action);
        switch (action.state) {
            case 'RUNNING':
                _running.appendChild(card);
                break;
            case 'NEW':
                _pending.appendChild(card);
                break;
            case 'RESPONSEMODIFIED':
                _processed.appendChild(card);
                break;
            case 'ERROR':
                _completed.insertBefore(card, _completed.querySelector('.action-card'));
                break;
            case 'INCOMPLETE':
                _completed.insertBefore(card, _completed.querySelector('.action-card'));
            default:
                //"SUCCESS"
                _completed.insertBefore(card, _completed.querySelector('.action-card'));
                break;
        }
    }

    function removeAllCards() {
        if (_list) {
            var cards = _list.querySelectorAll('aurainspector-actionCard');
            for (var c = 0, length = cards.length; c < length; c++) {
                cards[c].parentNode.removeChild(cards[c]);
            }
        }
        if (_watchList) {
            var cards = _watchList.querySelectorAll('aurainspector-actionCard');
            for (var c = 0, length = cards.length; c < length; c++) {
                cards[c].parentNode.removeChild(cards[c]);
            }
        }
    }

    function createActionCard(actionId, toWatch) {
        if (!actions.has(actionId)) {
            return;
        }

        var action = actions.get(actionId);
        var params = action.params;

        var card = document.createElement('aurainspector-actionCard');
        card.id = 'action_card_' + action.id;
        card.className = 'action-card is-collapsed action-card-state-' + action.state;
        card.setAttribute('actionId', action.id);
        card.setAttribute('name', action.defName);
        card.setAttribute('parameters', params);
        card.setAttribute('state', action.state);
        card.setAttribute('isStorable', action.storable);
        card.setAttribute('isRefresh', action.isRefresh);
        card.setAttribute('isAbortable', action.abortable);
        card.setAttribute('isBackground', action.background);
        card.setAttribute('returnValue', action.returnValue);
        card.setAttribute('isFromStorage', action.fromStorage);
        card.setAttribute('storageKey', action.storageKey);
        card.setAttribute('dropOrModify', 'dropAction');
        card.setAttribute('errorResponseType', 'exceptionEvent');
        card.setAttribute('callingComponent', action.callingCmp || '');
        if (action.stats) {
            card.setAttribute('stats', JSON.stringify(action.stats));
        }
        //if card is on the watch list, it's not draggable, we need to remember that in the actionCard itself.
        if (toWatch === true) {
            card.setAttribute('toWatch', true);
            card.setAttribute('collapsible', 'false');
        } else {
            //we allow people to drag the card when the card is on the left side
            card.setAttribute('draggable', 'true');
            card.classList.add('draggable');
            card.addEventListener('dragstart', drag.bind(this));
            card.addEventListener('dragend', endDrag.bind(this));
            card.setAttribute('toWatch', false);
        }

        return card;
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

    //remove the tooltip message (it should be the last child node of element)
    function removeTooltipMessage(event) {
        var element = event.currentTarget;
        if (element.childNodes[element.childNodes.length - 1].id === 'toolTipElement') {
            element.removeChild(element.childNodes[element.childNodes.length - 1]);
        }
    }

    function ActionsToWatch_OnDragOver(event) {
        event.preventDefault();
        _toWatch.className = 'drop-zone allow-drop';
    }

    function ActionsToWatch_OnDragLeave(event) {
        _toWatch.className = 'drop-zone';
    }

    function ActionsToWatch_OnDragEnd(event) {
        _toWatch.className = 'drop-zone';
    }

    function endDrag(event) {
        event.target.classList.remove('dragging');
        if (event.dataTransfer.dropEffect != 'none') {
            event.target.classList.add('dropped');
            event.target.setAttribute('draggable', 'false');
            event.target.classList.remove('draggable');
        }
    }

    function drag(event) {
        event.target.classList.add('dragging');
        event.dataTransfer.setData('text', event.target.getAttribute('actionId').toString());
    }

    //create a new action card with actionId
    //actionId : "123;a" , required
    function createActionCardIntoWatchDiv(actionId) {
        var actionCard = createActionCard(actionId, true);
        if (!_toWatch) {
            var command = "console.log('_toWatch missing');";
            chrome.devtools.inspectedWindow.eval(command);
        }
        actionCard.classList.remove('is-collapsed');
        _toWatch.appendChild(actionCard);
    }

    //handler for AuraInspector:RemoveActionFromWatchList from actionCard.removeActionCard
    //actionInfo = JSON.stringify ... {
    //                        'actionName': string,
    //                         'actionId': string, like "action_card_1852;a"
    //                       };
    function AuraInspectorActionsView_OnRemoveActionFromWatchList(actionInfo) {
        //console.log("AuraInspectorActionsView_OnRemoveActionFromWatchingList:", actionInfo);
        if (actionInfo && actionInfo.actionName) {
            //call AuraInspectorInjectedScript.RemoveActionFromWatch
            devtoolsPanel.publish('AuraInspector:OnActionToRemoveFromWatchEnqueue', actionInfo);
            //make actionCard on the leftside draggable again
            var card = document.getElementById(actionInfo.actionId);
            if (card) {
                card.setAttribute('draggable', 'true');
                card.classList.remove('dropped');
                card.classList.add('draggable');
            } else {
                console.log(
                    "AuraInspectorActionsView_OnRemoveActionFromWatchList, couldn't find actionCard on leftside for :",
                    actionInfo
                );
            }
        } else {
            console.log(
                'AuraInspectorActionsView_OnRemoveActionFromWatchList, bad actionInfo:',
                actionInfo
            );
        }
    }

    //handler for AuraInspector:EnqueueNextResponseForAction from actionCard.saveNextResponse
    //actionInfo = JSON.stringify ... {
    //'actionName': string,
    //'actionParameter': obj
    //'actionId': string, like "713;a"
    //'nextResponse': { key: newValue }
    //'nextError' : { "message":bla, "stack":bla }
    //}};
    //then call AuraInspectorInjectedScript.AddActionToWatch
    function AuraInspectorActionsView_OnEnqueueNextResponseForAction(actionInfo) {
        if (actionInfo && actionInfo.actionId && actionInfo.nextResponse) {
            var action = actions.get(actionInfo.actionId);
            //fill in action info from original action
            actionInfo.actionIsStorable = action.storable;
            actionInfo.actionStorageKey = action.storageKey;
            //call AuraInspectorInjectedScript.AddActionToWatch
            devtoolsPanel.publish('AuraInspector:OnActionToWatchEnqueue', actionInfo);
        }
    }

    /*
        event handler for AuraInspector:EnqueueNextErrorForAction, called from saveErrorResponse in actionCard.js
        actionInfo:{
                'actionName': this.getAttribute("name"),//necessary, as we use this as key in actionsToWatch AuraInspectorInjectedScript.js
                'actionId': actionId.substring(12, actionId.length), //action_card_713;a --> 713;a
                'nextResponse': undefined,
                'nextError': {'message':string, 'stack':string}
        }
    */
    function AuraInspectorActionsView_OnEnqueueNextErrorForAction(actionInfo) {
        if (actionInfo && actionInfo.actionId && actionInfo.nextError) {
            var action = actions.get(actionInfo.actionId);
            //call AuraInspectorInjectedScript.AddActionToWatch
            devtoolsPanel.publish('AuraInspector:OnActionToWatchEnqueue', actionInfo);
        }
    }

    function ActionsToWatch_OnDrop(event) {
        event.preventDefault();

        _toWatch.className = 'drop-zone';

        if (event && event.dataTransfer) {
            var data = event.dataTransfer.getData('text'); //data is actionId : "123;a"
            if (!data) {
                var command = "console.log('dataTransfer.getData.text is missing');";
                chrome.devtools.inspectedWindow.eval(command);
            } else {
                createActionCardIntoWatchDiv(data);
                var action = actions.get(data);
                var dataToPublish = {
                    actionName: action.defName, //no need
                    actionParameter: action.params, //no need for here...yet
                    actionId: action.id, //713;a
                    actionIsStorable: action.storable,
                    actionStorageKey: action.storageKey,
                    nextResponse: undefined //this has to be undefined
                };
                //call AuraInspectorInjectedScript.AddActionToWatch
                devtoolsPanel.publish('AuraInspector:OnActionToWatchEnqueue', dataToPublish);
            }
        }
    }

    /********************************* functions for Chaos Tab start *******************************/

    /*
        event handler for AuraInspector:DropActionInChaosRun
        called by onDecode in AuraInspectionInjectedScript 
        data:{'id': actionsFromOldResponse[i].id, 'actionOperation': 'Drop' or 'ErrorResponse'}
    */
    function AuraInspectorActionsView_OnActionOperationInChaosRun(data) {
        if (data && data.id) {
            if (!actions.has(data.id)) {
                console.err(
                    "Chaos run just request to drop an action that's not in action list of Action View",
                    data,
                    actions
                );
            }
            //we need tell Chaos Tab to draw a chaos card with action name
            var action = actions.get(data.id);
            action['actionOperation'] = data.actionOperation;
            //call AuraDevToolService.RecordActionOperation in AuraInspectionInjectedScript.js
            devtoolsPanel.publish('AuraInspector:OnSomeActionOperationDuringChaosRun', action);
        }
    }

    /*
        event handler for AuraInspector:ErrorActionInChaosRun
    */
    function AuraInspectorActionsView_OnErrorActionInChaosRun(data) {
        if (data && data.id) {
            if (!actions.has(data.id)) {
                console.err(
                    "Chaos run just request to drop an action that's not in action list of Action View",
                    data,
                    actions
                );
            }
            //we need tell Chaos Tab to draw a chaos card with action name
            var action = actions.get(data.id);
            //call AuraDevToolService.RecordDroppedAction in AuraInspectionInjectedScript.js
            devtoolsPanel.publish('AuraInspector:OnSomeActionGetDropped', action);
        }
    }

    /*
        event handler for "AuraInspector:EnqueueNextDropForChaosReplay".
        called by scheduleActionOperationForNextStep in AuraInspectorInjectedScript
        actionObj: { 'actionName': string,
            'actionId': string //we need this to move action from watch list to processed
            'actionParameter': string //"{..}"
            'actionIsStorable': boolean
            'actionStorageKey': string
            'actionIsAbortable': boolean
            'actionIsBackground': boolean
            'nextResponse': undefined
            'nextError': obj ($A.chaos.errorResponseDuringNewChaosRun) or undefined
        }
    */
    function AuraInspectorActionsView_OnEnqueueNextDropForChaosReplay(actionObj) {
        if (actionObj && actionObj.actionName) {
            var actionCard = createActionCardWithFullActionInfo(actionObj);
            if (!_toWatch) {
                var command = "console.log('_toWatch missing');";
                chrome.devtools.inspectedWindow.eval(command);
            }
            _toWatch.appendChild(actionCard);

            actionObj['byChaosRun'] = true;
            //call AuraInspectorInjectedScript.AddActionToWatch
            devtoolsPanel.publish('AuraInspector:OnActionToWatchEnqueue', actionObj);
        }
    }

    function createActionCardWithFullActionInfo(action) {
        if (action && action.actionName && action.actionParameter && action.actionId) {
            var actionState = 'BYCHAOSRUN';
            var card = document.createElement('aurainspector-actionCard');
            card.id = 'action_card_' + action.actionId;
            card.className = 'action-card action-card-state-' + actionState;
            card.setAttribute('actionId', action.actionId);
            card.setAttribute('name', action.actionName);
            card.setAttribute('parameters', action.actionParameter);
            card.setAttribute('state', actionState);
            card.setAttribute('isStorable', action.actionIsStorable + '');
            card.setAttribute('isRefresh', 'false');
            card.setAttribute('isAbortable', action.actionIsAbortable + '');
            card.setAttribute('isBackground', action.actionIsBackground + '');
            card.setAttribute('returnValue', {});
            card.setAttribute('isFromStorage', 'false');
            card.setAttribute('storageKey', action.actionStorageKey);
            card.setAttribute('dropOrModify', 'dropAction');

            card.setAttribute('toWatch', true);

            card.setAttribute('byChaosRun', true);
        }
        return card;
    }
}
