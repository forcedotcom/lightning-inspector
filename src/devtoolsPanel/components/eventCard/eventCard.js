import { Network, DataSet } from 'vis-network';

const template = document.createElement('template');
template.innerHTML = `<style>
        body {
            font-family: 'Lucida Grande', 'Consolas', 'sans-serif';
        }
        header { 
            display: inline-block; 
        }
        h1 {
            font-weight: 300;
            font-size: 1.125rem;
            line-height: 1.25;
              padding: 0 0 3px 0;
            margin: 0;
            display: inline-block;
        }
        h2 {
            padding: 0 0 0 1em;
            margin: 0;
            color: #0070D2;
            display: inline-block;
            font-size: 1em;
            font-weight: normal;
            font-family: 'Menlo', 'monospace';
        }
        h6 { color: #bbb; display: block; font-size: .75em; margin: 0; padding: 0; }
        dl, dt, dd { margin: 0; padding: 0; display: inline-block; }
        dd { padding: 0 10px; display: block; }
        section > p {
            display: flex;
            flex: 100%;
        }
        table {
            border-collapse: collapse;
        }

        td, th {
            border: 1px solid #c1e3ff;
            padding: 0.3rem;
            text-align: left;
            font-size: .7rem;
            font-family: 'Lucida Grande', 'Consolas', 'sans-serif';
            border-radus: 10px;
            vertical-align: top;
        }

        aurainspector-label {
            display: inline-block;
            font-family: 'Lucida Grande', 'Consolas', 'sans-serif';
            flex: none;
            width: 80px;
            vertical-align: top;
            display: inline-block;
            color: #54698d;
            font-size: 0.75rem;
            line-height: 1.5;
        }

        .parameters, .caller { 
            display: flex; 
            flex:100%;
        }

        .highlight{
            background-color: #ffffc4;
            transition: background-color 1s;
        }

        .eventHandledBy dl, .eventSource{
          font-family: Menlo, monospace;
          font-size: 11px;
          -webkit-font-smoothing: antialiased;
        }

        #eventHandledByGrid {
            width: 700px;
            height: 400px;
            background: #f4f6f9;
            margin-top: .5rem;
        }

        aurainspector-controllerreference {
            cursor: pointer;
            color: #0070D2;
            text-decoration: none;
        }

        aurainspector-controllerreference:active {
            color: #00396b;
        }

        aurainspector-controllerreference:focus {
            outline: #0070D2;
            text-decoration: underline;
        }

        aurainspector-controllerreference:hover {
            color: #005fb2;
            text-decoration: underline;
        }

        #callStack aurainspector-auracomponent {
            display: block;
            padding-left: 1em;
            opacity: .6;
            cursor: pointer;
        }

        #callStack aurainspector-auracomponent:hover {
            opacity: 1;
        }

        #callstack tr:last-child {
            background-color: #ffffe4;
        }

        .hidden { display: none; }

        .slds-m-top--x-small {
          margin-top: 0.5rem; }
            a:active {
              color: #00396b;
            }

            a:focus {
              outline: #0070D2;
              text-decoration: underline;
            }
            a:hover {
              color: #005fb2;
              text-decoration: underline;
            }

            a {
              color: #0070D2;
              text-decoration: none;
            }
            /* Lightning Design System 0.12.1 */
            /*
            Copyright (c) 2015, salesforce.com, inc. All rights reserved.

            Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
            Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
            Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
            Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

            THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
            */
        .slds-button {
          position: relative;
          display: inline-block;
          padding: 0;
          background: transparent;
            background-clip: padding-box;
          border: none;
            border-radius: 0.25rem;
          color: #0070d2;
          font-size: inherit;
          line-height: 2.125rem;
          text-decoration: none;
          -webkit-appearance: none;
          white-space: normal;
          -webkit-user-select: none;
             -moz-user-select: none;
              -ms-user-select: none;
                  user-select: none;
          -webkit-transition: color 0.05s linear, background-color 0.05s linear;
                  transition: color 0.05s linear, background-color 0.05s linear; }
          .slds-button:hover,
          .slds-button:focus,
          .slds-button:active,
          .slds-button:visited {
            text-decoration: none; }
          .slds-button:hover,
          .slds-button:focus {
            color: #005fb2; }
          .slds-button:focus {
            outline: 0;
            box-shadow: 0 0 3px #0070D2; }
          .slds-button:active {
            color: #00396b; }
          .slds-button[disabled] {
            color: #d8dde6; }
          .slds-button:hover .slds-button__icon,
          .slds-button:focus .slds-button__icon,
          .slds-button:active .slds-button__icon,
          .slds-button[disabled] .slds-button__icon {
            fill: currentColor; }
          .slds-button + .slds-button-group {
            margin-left: 0.25rem; }
          .slds-button + .slds-button {
            margin-left: 0.25rem; }

            .slds-button--neutral {
              padding-left: 1rem;
              padding-right: 1rem;
              text-align: center;
              vertical-align: middle;
              border: 1px solid #d8dde6;
              background-color: white; }
              .slds-button--neutral:hover,
              .slds-button--neutral:focus {
                background-color: #f4f6f9; }
              .slds-button--neutral:active {
                background-color: #eef1f6; }
              .slds-button--neutral[disabled] {
                background-color: white;
                cursor: default; }
        .slds-button--small {
          line-height: 1.875rem;
          min-height: 2rem; }
        .slds-button--x-small {
          line-height: 1.25rem;
          min-height: 1.25rem; }

    </style>
    <header>
        <h1><!-- Event Name --></h1>
        <h2><!-- Additional Event Info such as the expression that changed. --></h2>
        <h6><!-- Event Type --></h6>
    </header>
    <section>
        <p>
            <aurainspector-label key="eventcard_parameters"></aurainspector-label><aurainspector-json class="parameters" expandTo="0"><!-- Parameters --></aurainspector-json>
        </p>
        <p>
            <aurainspector-label key="eventcard_caller"></aurainspector-label><aurainspector-outputfunction class="caller"><!-- Caller --></aurainspector-outputfunction>
        </p>
        <p>
            <aurainspector-label key="eventcard_source"></aurainspector-label><span id="eventSource" class="eventSource"></span>
        </p>
        <p>
            <aurainspector-label key="eventcard_duration"></aurainspector-label><span id="eventDuration" class="eventDuration"></span>
        </p>
<!-- 	    <p>
            <aurainspector-label key="eventcard_handledby"></aurainspector-label><span id="eventHandledBy" class="eventHandledBy"></span>
        </p> -->
        <p>
            <aurainspector-label key="eventcard_callStack"></aurainspector-label>
            <table id="callStack" class="callStack"></table>
        </p>

        <button id="gridToggle" class="hidden slds-button slds-button--neutral slds-button--x-small slds-m-top--x-small"><aurainspector-label key="eventcard_togglegrid"></aurainspector-label></button>
        <div id="eventHandledByGrid" class="hidden">
        </div>
    </section>`;

class EventCardElement extends HTMLElement {
    static EVENT_INDEX = 0;

    static get observedAttributes() {
        return ['collapsed', 'showgrid', 'showGrid'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    /*
        New Action Card created, update it's body
     */
    connectedCallback() {
        if (this.shadowRoot.hasChildNodes()) {
            return;
        }

        var clone = document.importNode(template.content, true);

        this.shadowRoot.appendChild(clone);

        var toggleButton = this.shadowRoot.querySelector('#gridToggle');
        toggleButton.addEventListener('click', ToggleButton_OnClick.bind(this));

        var section = this.shadowRoot.querySelector('section');
        section.addEventListener('transitionend', function(event) {
            var element = event.target;
            element.classList.remove('highlight');
        });

        var model = {
            eventName: this.getAttribute('name'),
            eventSourceId: this.getAttribute('sourceId'),
            eventDuration: this.getAttribute('duration'),
            eventType: this.getAttribute('type') === 'APPLICATION' ? 'APP' : 'CMP',
            eventCaller: this.getAttribute('caller'),
            parameters: this.getAttribute('parameters') //,
            // handledBy: 		this.getAttribute("handledBy"),
            // handledByTree: 	this.getAttribute("handledByTree")
        };

        // remove markup:// from the event name if present
        if (model.eventName.startsWith('markup://')) {
            model.eventName = model.eventName.substr(9);
        }

        // I'm still working on what the best pattern is here
        // This seems sloppy
        this.shadowRoot.querySelector('h1').textContent = model.eventName;
        this.shadowRoot.querySelector('h6').textContent = model.eventType;
        this.shadowRoot.querySelector('.caller').textContent = model.eventCaller;
        this.shadowRoot.querySelector('#eventDuration').textContent = model.eventDuration + 'ms';
        this.shadowRoot.querySelector('.parameters').textContent = model.parameters;

        // hide when clicked (does not detect click)
        var collapsed = this.getAttribute('collapsed');
        if (collapsed === 'true' || collapsed === 'collapsed') {
            var section = this.shadowRoot.querySelector('section');
            section.classList.add('hidden');
        }

        var source = this.shadowRoot.querySelector('#eventSource');
        if (model.eventSourceId) {
            var auracomponent = document.createElement('aurainspector-auracomponent');
            auracomponent.setAttribute('globalId', model.eventSourceId);
            source.appendChild(auracomponent);
        } else {
            source.classList.add('hidden');
        }

        // Special additions to the title of the event card.
        if (model.eventName === 'aura:valueChange') {
            this.shadowRoot.querySelector('h2').textContent =
                '{! ' + JSON.parse(model.parameters).expression + ' }';
        }
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        if (!this.shadowRoot.hasChildNodes()) {
            return;
        }

        if (attr === 'collapsed') {
            const section = this.shadowRoot.querySelector('section');
            const isCollapsed = this.isCollapsed();
            if (newValue === 'true' || (newValue === 'collapsed' && !isCollapsed)) {
                section.classList.add('hidden');
            } else if (newValue !== 'true' && newValue !== 'collapsed' && isCollapsed) {
                section.classList.remove('hidden');

                this.renderCallStack();

                if (this.getAttribute('showGrid') === 'true') {
                    this.renderHandledByTree();
                }
            }
        }
        if (attr === 'showgrid' || attr === 'showGrid') {
            if (newValue === 'true') {
                this.renderHandledByTree();
            } else {
                this.shadowRoot.querySelector('#eventHandledByGrid').classList.add('hidden');
            }
        }
    }

    isCollapsed() {
        const section = this.shadowRoot.querySelector('section');
        return section.classList.contains('hidden');
    }

    highlight() {
        var section = this.shadowRoot.querySelector('section');
        section.classList.add('highlight');
    }

    renderHandledByTree() {
        var handledByTree = getData(this.getAttribute('handledByTree')) || [];

        // Empty, or just itself? Don't draw
        if (handledByTree.length < 2) {
            return;
        }

        var gridContainer = this.shadowRoot.querySelector('#eventHandledByGrid');
        gridContainer.removeChildren();
        gridContainer.classList.remove('hidden');

        var eventId = this.id;
        var rawEdges = [];
        var rawNodes = [];

        for (var c = 0; c < handledByTree.length; c++) {
            var handled = handledByTree[c];
            var data;
            if (handled.type === 'action') {
                data = {
                    id: handled.id,
                    label: `{${handled.data.scope}} c.${handled.data.name}`,
                    color: 'maroon'
                };
            } else {
                var label = handled.data.sourceId
                    ? `{${handled.data.sourceId}} ${handled.data.name}`
                    : handled.data.name;
                data = { id: handled.id, label: label, color: 'steelblue' };
                // Handle the selected node
                if (handled.id === eventId) {
                    data.size = 60;
                    data.color = '#333';
                }
            }
            rawNodes.push(data);

            if (handled.parent) {
                rawEdges.push({ from: handled.id, to: handled.parent, arrows: 'from' });
            }
        }

        var nodes = new DataSet(rawNodes);
        var edges = new DataSet(rawEdges);
        var options = {
            nodes: {
                borderWidth: 1,
                shape: 'box',
                size: 50,
                font: {
                    color: '#fff'
                },
                color: {
                    border: '#222'
                }
            },
            layout: {
                hierarchical: {
                    enabled: true,
                    //levelSeparation: 70,
                    direction: 'DU', // UD, DU, LR, RL
                    sortMethod: 'directed' // hubsize, directed
                }
            },
            interaction: {
                dragNodes: true
            }
        };

        var network = new Network(gridContainer, { nodes: nodes, edges: edges }, options);
        network.on(
            'doubleClick',
            function(params) {
                if (params.nodes.length) {
                    var id = params.nodes[0];
                    if (id.startsWith('event_')) {
                        this.dispatchEvent(
                            new CustomEvent('navigateToEvent', { detail: { eventId: id } })
                        );
                    }
                }
            }.bind(this)
        );
    }

    renderCallStack() {
        const element = this;
        var events;
        var data = getData(element.getAttribute('handledByTree')) || [];
        var handledContainer = element.shadowRoot.querySelector('#callStack');
        handledContainer.removeChildren();

        if (!data || data.length === 0) {
            handledContainer.appendChild(createEmptyMessageRow());
            return;
        }

        events = getCallStackData(element, data);

        handledContainer.appendChild(createHeaderRow());

        // Write to the table for every event
        for (var c = events.length - 1; c >= 0; c--) {
            var tr;
            var scope;
            var event = events[c];

            // Create the list of actions that were fired by each event
            tr = document.createElement('tr');

            tr.appendChild(createEventLabel(event));
            tr.appendChild(createActionData(event));

            handledContainer.appendChild(tr);
        }

        function createEventLabel(event) {
            //var eventIndex = 0;
            var eventInfo = event[0]; // Not sure why only the first event
            var eventLabel;
            var td;
            var scope;

            if (eventInfo.data.sourceId) {
                scope = document.createElement('aurainspector-auracomponent');
                scope.setAttribute('summarize', true);
                scope.setAttribute('globalId', eventInfo.data.sourceId);
            }
            //  else {
            // 	scope = document.createTextNode("{" + eventInfo.data.sourceId + "}");
            // }
            td = document.createElement('td');

            eventLabel = document.createElement('a');
            eventLabel.textContent = eventInfo.data.sourceId
                ? eventInfo.data.name
                : eventInfo.data.name;
            eventLabel.href = '';
            eventLabel.setAttribute('data-globalid', eventInfo.id);
            eventLabel.setAttribute('data-controller-name', eventInfo.data.name);
            eventLabel.addEventListener('click', EventCallStackEvent_OnClick);

            td.appendChild(eventLabel);
            if (scope) {
                td.appendChild(scope);
            }

            return td;
        }

        function createActionData(event) {
            var td = document.createElement('td');

            for (var a = 1; a < event.length; a++) {
                var handled = event[a];

                let controller = document.createElement('aurainspector-controllerreference');
                controller.setAttribute('expression', '{!c.' + handled.data.name + '}');
                controller.setAttribute('component', handled.data.scope);
                controller.textContent = 'c.' + handled.data.name;

                // if (a > 1) {
                //     td.appendChild(document.createElement('br'));
                // }

                td.appendChild(controller);
            }
            return td;
        }

        function createHeaderRow() {
            var tr;
            var th;

            tr = document.createElement('tr');

            th = document.createElement('th');
            th.appendChild(document.createTextNode(chrome.i18n.getMessage('eventcard_event')));
            tr.appendChild(th);

            th = document.createElement('th');
            th.appendChild(document.createTextNode(chrome.i18n.getMessage('eventcard_actions')));
            tr.appendChild(th);

            return tr;
        }

        function createEmptyMessageRow() {
            var td;
            var tr;

            td = document.createElement('td');
            td.appendChild(document.createTextNode(chrome.i18n.getMessage('eventcard_none')));

            tr = document.createElement('tr');
            tr.appendChild(td);

            return tr;
        }
    }
}

customElements.define('aurainspector-event-card', EventCardElement);

function getData(data) {
    if (!data) {
        return data;
    }
    if (data.length === 0) {
        return data;
    }
    if (typeof data === 'string') {
        return JSON.parse(data);
    }
    return data;
}

function getCallStackData(element, data) {
    // id of the current element we are examining in call stack
    var currentId = element.id;
    var events = [];
    var actions = [];

    // Get list of all events in chronological order in call stack
    while (currentId != null) {
        // If null, that means there is no parent of previous
        //search every element in data to find
        for (var c = 0; c < data.length; c++) {
            var handled = data[c];

            if (handled.id === currentId) {
                if (handled.type === 'event') {
                    events.push([handled]);
                } else {
                    actions.push(handled);
                }

                if (handled.parent) {
                    currentId = handled.parent;
                } else {
                    currentId = null;
                }
            }
        }
    }

    // Get action children for current event
    for (var c = 0; c < data.length; c++) {
        if (data[c].parent && data[c].parent === element.id && data[c].type === 'action') {
            actions.push(data[c]);
        }
    }

    // For each action append to return events array so it looks like:
    // [ (event), (action), (action), (action) ]
    for (var count = 0; count < actions.length; count++) {
        var handled = actions[count];

        for (var c = 0; c < events.length; c++) {
            var event = events[c][EventCardElement.EVENT_INDEX];
            if (handled.parent === event.id) {
                events[c].push(handled);
            }
        }
    }

    return events;
}

function EventCallStackEvent_OnClick(e) {
    this.dispatchEvent(
        new CustomEvent('navigateToEvent', { detail: { eventId: e.path[0].dataset.globalid } })
    );

    e.preventDefault();
}

function ToggleButton_OnClick(event) {
    var showGrid = this.getAttribute('showGrid');
    this.setAttribute('showGrid', !showGrid || showGrid !== 'true' ? 'true' : 'false');
}
