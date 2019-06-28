import React, { PureComponent } from "react";
import PropTypes from 'prop-types';

import debounce from "debounce";
import debounceRender from "react-debounce-render";
import Immutable from "immutable";

import BrowserApi from "../../aura/viewer/BrowserApi.js";
import GlobalEventBus from "../../core/GlobalEventBus.js";

import ClearButton from "../components/ClearButton.js";
import EventCardList from "../components/EventCardList.js";
import OnOffButton from "../components/OnOffButton.js";
import RecordButton from "../components/RecordButton.js";
import EventCard from "../components/events/EventCard.js";

import "../../devtoolsPanel/devtoolsPanel.css";

export default class EventLogPanel extends PureComponent {
    static childContextTypes = {
        assetBasePath: PropTypes.string
    };

    constructor(props) {
        super(props);

        this.state = {
            eventNodes: [],

            _events: [],
            _eventsMap: new Map(),
            _actionsMap: new Map(),
            _handled: new Map(),
            _contextStack: [],
            _currentContext: null,

            recording: true,
            filter: "",
            showAppEvents: true,
            showCmpEvents: true,
            showUnhandledEvents: false,
            showNativeAuraEvents: false
        };

        this.handleClearButtonClick = this.handleClearButtonClick.bind(this);
        this.handleRecordButtonClick = this.handleRecordButtonClick.bind(this);
        this.handleFilterSearch = this.handleFilterSearch.bind(this);
        this.handleFilterSearchDebounced = debounce(this.handleFilterSearch, 200);
        this.handleFilterAppEventsClick = this.handleFilterAppEventsClick.bind(this);
        this.handleFilterCmpEventsClick = this.handleFilterCmpEventsClick.bind(this);
        this.handleFilterUnhandledEventsClick = this.handleFilterUnhandledEventsClick.bind(this);
        this.handleFilterNativeAuraEvents = this.handleFilterNativeAuraEvents.bind(this);

        GlobalEventBus.subscribe("AuraInspector:OnEventStart", this.handleAuraInspectorEventLogOnEventStart.bind(this));
        GlobalEventBus.subscribe("AuraInspector:OnEventEnd", this.handleAuraInspectorEventLogOnEventEnd.bind(this));
        GlobalEventBus.subscribe("AuraInspector:OnClientActionStart", this.handleAuraInspectorEventLogOnClientActionStart.bind(this));
        GlobalEventBus.subscribe("AuraInspector:OnClientActionEnd", this.handleAuraInspectorEventLogOnClientActionEnd.bind(this));
    }

    getChildContext() {
        return { 
            'assetBasePath': '/dist/slds/'
        };
    }


    /**
     * Has the event been filtered out of the response? 
     * Returns true if the event is allowed to show up in the list of events displayed to the user.
     */
    isAllowed(eventInfo) {
        if(!eventInfo) { return false; }
        if(!this.state.showAppEvents && eventInfo.type === "APPLICATION") { return false; }
        if(!this.state.showCmpEvents && eventInfo.type === "COMPONENT") { return false; }
        if(!this.state.showUnhandledEvents && !this.hasHandledData(eventInfo)) { return false; }

        if(!this.state.showNativeAuraEvents && eventInfo.name.startsWith("markup://aura:")) { return false; }

        const eventName = this.state.filter;
        if(eventName) {
            if(eventName.startsWith("!")) {
                eventName = eventName.substr(1);
                return !eventInfo.name.includes(eventName);
            }
            return eventInfo.name.includes(eventName);
        }

        return true;
    }

    createCard(eventId) {
        const eventInfo = this.state._eventsMap.get(eventId);
        
        return (<EventCard {...eventInfo}/>);
    }

    storeEvent(eventInfo) {
        const eventId = this.getEventId(eventInfo);
        const eventData = {
            "title": this.formatEventTitle(eventInfo.name, eventInfo.type),
            "name": eventInfo.name,
            "sourceId": eventInfo.sourceId || "",
            "endTime": eventInfo.endTime,
            "startTime": eventInfo.startTime,
            "duration": (eventInfo.endTime - eventInfo.startTime).toFixed(4),
            "type": eventInfo.type,
            "caller": eventInfo.caller,
            "parameters": eventInfo.parameters,
            "id": eventId, 
            "handledBy": eventInfo.handledBy || JSON.stringify(this.state._handled.get(eventId))
        };

        this.state._eventsMap.set(eventId, eventData);
    }

    formatEventTitle(name, eventType) {
        if(name.startsWith("markup://")) {
            name = name.substr(9);
        }

        const type = eventType === "APPLICATION" ? "APP" : "CMP";

        return `[${type}] ${name}`;
    }

    storeFilteredEvent(eventInfo) {
        const MAX_EVENTS = 100000; // We could store a LOT of events, so lets just set a high max.

        if(this.state._events.length > MAX_EVENTS) {
            var removed = this.state._events.pop();
            this.state._eventsMap.delete(this.getEventId(removed));
        }
        this.state._events.push(eventInfo);
    }

    getHandledDataTree(contextId, previousId) {
        let tree = [];
        let currentHandlers = this.state._handled.get(contextId) || [];
        let id;
        let data;
        let type;

        if(this.state._actionsMap.has(contextId)) {
            type = "action";
            data = this.state._actionsMap.get(contextId);
        } else if(this.state._eventsMap.has(contextId)) {
            let currentEvent = this.state._eventsMap.get(contextId);
            type = "event";
            data = { "id": currentEvent.id, "sourceId": currentEvent.sourceId, "name": currentEvent.name, "startTime": currentEvent.startTime };
        }

        if(data) {
            tree.push({ "id": contextId, "parent": previousId, "data": data , "type": type });
        }

        var handled;
        for(var c=0;c<currentHandlers.length;c++) {
            handled = currentHandlers[c];
            id = currentHandlers[c].id;
            tree = tree.concat(this.getHandledDataTree(id, contextId));
        }
        return tree;
    }

    hasHandledData(eventInfo) {
        if('handledBy' in eventInfo) { 
            return !eventInfo.handledBy || eventInfo.handledBy.length !== 0; 
        }

        var eventId = this.getEventId(eventInfo);
        var handleData = this.state._handled.get(eventId);
        if(handleData) {
            return handleData.length > 0;
        }
        return false;
    }

    getEventId(eventInfo) {
        if(('id' in eventInfo) === false) { 
            eventInfo.id = "event_" + eventInfo.startTime;
        }
        return eventInfo.id;
    }

    handleClearButtonClick() {
        this.setState({
            eventNodes: [],
            _events: [],
            _eventsMap: new Map(),
            _actionsMap: new Map(),
            _handled: new Map(),
            _contextStack: [],
            _currentContext: null
        });
    }

    handleRecordButtonClick(isRecording) {
        this.setState(function(state, props){
            return {
                recording: !state.recording
            }
        });
    }

    handleFilterSearch(eventInfo) {
        var term = eventInfo.target.value;
        this.setState({filter: term});
    }

    handleFilterNativeAuraEvents() {
        this.setState(prevState => ({
            showNativeAuraEvents: !prevState.showNativeAuraEvents
        }));
    }

    handleFilterAppEventsClick() {
        this.setState(prevState => ({
            showAppEvents: !prevState.showAppEvents
        }));
    }

    handleFilterCmpEventsClick() {
        this.setState(prevState => ({
            showCmpEvents: !prevState.showCmpEvents
        }));
    }

    handleFilterUnhandledEventsClick() {
        this.setState(prevState => ({
            showUnhandledEvents: !prevState.showUnhandledEvents
        }));
    }

    handleAuraInspectorEventLogOnEventStart(eventInfo) {
        if(!this.state.recording) {
            return;
        }

        var eventId = this.getEventId(eventInfo);

        this.state._contextStack.push(eventId);
        this.state._currentContext = eventId;
        this.state._handled.set(this.state._currentContext, []);
    }

    handleAuraInspectorEventLogOnEventEnd(eventInfo) {
        if(!this.state.recording) { return; }

        // Store event data for this event
        this.storeEvent(eventInfo);

        // If its allowed, also add it to the list of displayed events.
        if(this.isAllowed(eventInfo)) {
            this.storeFilteredEvent(eventInfo);
            const newCard = this.createCard(this.getEventId(eventInfo));
            this.state.eventNodes.push(newCard);
        }

       if(!this.state._currentContext) {
            return;
        }

        var startContextId = this.state._contextStack.pop();
        if(!startContextId) { return; }
        if(this.state._contextStack.length !== 0) {
            this.state._currentContext = this.state._contextStack[this.state._contextStack.length-1];

            var stored = this.state._handled.get(this.state._currentContext);
            stored.push(eventInfo);
        } else {
            this.state._currentContext = null;

            // Build Handled By Tree
            // TODO: NEEDS REACTIFYING
            var tree = this.getHandledDataTree(startContextId);
            const stringTree = JSON.stringify(tree);
            const eventNodes = this.state.eventNodes;
            for(var c=0;c<tree.length;c++) {
                let eventId = tree[c].id;
                // Find the proper item, and update it.
                let index = eventNodes.findIndex(event => {
                    return event.props.id === eventId;
                });
                if(index !== -1) {
                    this.state._eventsMap.get(eventId).handledByTree = stringTree;
                    eventNodes[index] = this.createCard(eventId);
                }

                // var eventElement = document.getElementById(tree[c].id);
                // if(eventElement){
                //     this.state._eventsMap.get(tree[c].id).handledByTree = tree;
                //     eventElement.setAttribute("handledByTree", JSON.stringify(tree));
                // }
            }
            this.state._handled = new Map();
        }

        this.setState({eventNodes: this.state.eventNodes.slice(0)});
    }

    // Highlights the event card
    handleAuraInspectorEventLogOnEventClick(eventInfo){
        // No id specified
        if(!eventInfo.detail) { 
            return; 
        }
        
        var card = document.getElementById(event.detail.eventId);

        if(!card){
            return;

        } else {
            var button = card.previousElementSibling;
            button.value = "ON";

            card.setAttribute("collapsed", "false");
            card.scrollIntoView({block: "end", behavior: "smooth"});

            //var newEvent = new Event('highlightCard');
            //card.dispatchEvent(newEvent);
            card.highlight();
        }
    }

    handleAuraInspectorEventLogOnClientActionStart(actionInfo) {
        if(!this.state._currentContext) {
            return;
        }

        var id = "action_" + actionInfo.actionId;

        this.state._handled.set(id, []);

        this.state._contextStack.push(id);
        this.state._currentContext = id;
    }

    handleAuraInspectorEventLogOnClientActionEnd(actionInfo) {
        if(!this.state._currentContext) {
            return;
        }

        this.state._contextStack.pop();
        this.state._currentContext = this.state._contextStack[this.state._contextStack.length-1];

        var data = { "id": "action_" + actionInfo.actionId, "scope": actionInfo.scope, "name": actionInfo.name, "actionId": actionInfo.actionId };

        var stored = this.state._handled.get(this.state._currentContext);
        stored.push(data);

        this.state._actionsMap.set(data.id, data);
    }

    render() {
        console.count("EventLogPanel:render");
        const labels = {
            toggle_recording: BrowserApi.getLabel("menu_record"),
            clear: BrowserApi.getLabel("menu_clear"),
            filter: BrowserApi.getLabel("menu_filter"),
            appEvents: BrowserApi.getLabel("eventlog_menu_appevents"),
            cmpEvents: BrowserApi.getLabel("eventlog_menu_cmpevents"),
            unhandledEvents: BrowserApi.getLabel("eventlog_menu_unhandled"),
            appEvents_tooltip: BrowserApi.getLabel("eventlog_menu_appevents_tooltip"),
            cmpEvents_tooltip: BrowserApi.getLabel("eventlog_menu_cmpevents_tooltip"),
            unhandledEvents_tooltip: BrowserApi.getLabel("eventlog_menu_unhandled_tooltip"),
            showNativeAuraEvents: BrowserApi.getLabel("show_native_aura_events"),
            showNativeAuraEvents_tooltip: BrowserApi.getLabel("show_native_aura_events_tooltip")
        };

        const filterAppEventsProps = {
            onClick: this.handleFilterAppEventsClick,
            selected: this.state.showAppEvents,
            label: labels.appEvents,
            tooltip: labels.appEvents_tooltip
        };

        const filterCmpEventsProps = {
          onClick: this.handleFilterCmpEventsClick,
          selected: this.state.showCmpEvents,
          label: labels.cmpEvents,
          tooltip: labels.cmpEvents_tooltip
        };

        const filterUnhandledEventsProps = {
          onClick: this.handleFilterUnhandledEventsClick,
          selected: this.state.showUnhandledEvents,
          label: labels.unhandledEvents,
          tooltip: labels.unhandledEvents_tooltip,
        };

        const filterNativeAuraEventsProps = {
            onClick: this.handleFilterNativeAuraEvents,
            selected: this.state.showNativeAuraEvents,
            label: labels.showNativeAuraEvents,
            tooltip: labels.showNativeAuraEvents_tooltip
        }

        const Fragment = React.Fragment;
        const DebouncedEventCardList = debounceRender(EventCardList, 750);

        return (
            <Fragment>
                <menu type="toolbar" className="slds-col">
                    <li className="slds-p-right_small">
                        <RecordButton onClick={this.handleRecordButtonClick} title={labels.toggle_recording} tooltip={labels.toggle_recording} recording={this.state.recording}/>
                    </li>
                    <li className="slds-p-right_x-small">
                        <ClearButton onClick={this.handleClearButtonClick} title={labels.clear} tooltip={labels.clear}/>
                    </li>
                    <li className="divider"></li>
                    <li><input id="filter-text" type="search" onChange={this.handleFilterSearchDebounced} onKeyUp={this.handleFilterSearchDebounced} placeholder={labels.filter}/></li>
                    <li className="divider"></li>
                    <li className="slds-p-right_medium">
                        <OnOffButton {...filterAppEventsProps} />
                    </li>
                    <li className="slds-p-right_small">
                        <OnOffButton {...filterCmpEventsProps} />
                    </li>
                    <li className="slds-p-right_medium">
                        <OnOffButton {...filterUnhandledEventsProps} />
                    </li>
                    <li className="slds-p-right_medium">
                        <OnOffButton {...filterNativeAuraEventsProps} />
                    </li>
                </menu>
                <div className="slds-col slds-scrollable_y slds-p-bottom_large inspector-tab-body-content">
                    <DebouncedEventCardList listItems={this.state.eventNodes}/>
                </div>
            </Fragment>
        );
    }

}