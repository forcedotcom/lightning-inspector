
import GlobalEventBus from "../../core/GlobalEventBus.js";



export default class EventsDataStore {
    eventNodes=[];
    _events=[];
    _eventsMap=new Map();
    _actionsMap=new Map();
    _handled=new Map();
    _contextStack=[];
    _currentContext=null;
    recording=true;
    filter="";
    showAppEvents=true;
    showCmpEvents=true;
    showUnhandledEvents=false;
    showNativeAuraEvents=false;

    constructor(props) {
        this.handleAuraInspectorEventLogOnEventStart = this.handleAuraInspectorEventLogOnEventStart.bind(this);
        this.handleAuraInspectorEventLogOnEventEnd = this.handleAuraInspectorEventLogOnEventEnd.bind(this);
        this.handleAuraInspectorEventLogOnClientActionStart = this.handleAuraInspectorEventLogOnClientActionStart.bind(this);
        this.handleAuraInspectorEventLogOnClientActionEnd = this.handleAuraInspectorEventLogOnClientActionEnd.bind(this);
    }

    startListening() {
        GlobalEventBus.subscribe("AuraInspector:OnEventStart", this.handleAuraInspectorEventLogOnEventStart);
        GlobalEventBus.subscribe("AuraInspector:OnEventEnd", this.handleAuraInspectorEventLogOnEventEnd);
        GlobalEventBus.subscribe("AuraInspector:OnClientActionStart", this.handleAuraInspectorEventLogOnClientActionStart);
        GlobalEventBus.subscribe("AuraInspector:OnClientActionEnd", this.handleAuraInspectorEventLogOnClientActionEnd);
    }

    stopListening() {
        GlobalEventBus.unsubscribe("AuraInspector:OnEventStart", this.handleAuraInspectorEventLogOnEventStart);
        GlobalEventBus.unsubscribe("AuraInspector:OnEventEnd", this.handleAuraInspectorEventLogOnEventEnd);
        GlobalEventBus.unsubscribe("AuraInspector:OnClientActionStart", this.handleAuraInspectorEventLogOnClientActionStart);
        GlobalEventBus.unsubscribe("AuraInspector:OnClientActionEnd", this.handleAuraInspectorEventLogOnClientActionEnd);
    }

    isAllowed() {
        return true;
    }

    getEventId(eventInfo) {
        if(('id' in eventInfo) === false) { 
            eventInfo.id = "event_" + eventInfo.startTime;
        }
        return eventInfo.id;
    }

    storeFilteredEvent(eventInfo) {
        const MAX_EVENTS = 100000; // We could store a LOT of events, so lets just set a high max.

        if(this._events.length > MAX_EVENTS) {
            var removed = this._events.pop();
            this._eventsMap.delete(this.getEventId(removed));
        }
        this._events.push(eventInfo);
    }

    getHandledDataTree(contextId, previousId) {
        let tree = [];
        let currentHandlers = this._handled.get(contextId) || [];
        let id;
        let data;
        let type;

        if(this._actionsMap.has(contextId)) {
            type = "action";
            data = this._actionsMap.get(contextId);
        } else if(this._eventsMap.has(contextId)) {
            let currentEvent = this._eventsMap.get(contextId);
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

    handleAuraInspectorEventLogOnEventStart(eventInfo) {
        var eventId = this.getEventId(eventInfo);

        this._contextStack.push(eventId);
        this._currentContext = eventId;
        this._handled.set(this._currentContext, []);
    }

    handleAuraInspectorEventLogOnEventEnd(eventInfo) {
        if(!this.recording) { return; }

        // Store event data for this event
        this.storeEvent(eventInfo);

        // If its allowed, also add it to the list of displayed events.
        if(this.isAllowed(eventInfo)) {
            this.storeFilteredEvent(eventInfo);
            const newCard = this.createCard(this.getEventId(eventInfo));
            this.eventNodes.push(newCard);
        }

       if(!this._currentContext) {
            return;
        }

        var startContextId = this._contextStack.pop();
        if(!startContextId) { return; }
        if(this._contextStack.length !== 0) {
            this._currentContext = this._contextStack[this._contextStack.length-1];

            var stored = this._handled.get(this._currentContext);
            stored.push(eventInfo);
        } else {
            this._currentContext = null;

            // Build Handled By Tree
            // TODO: NEEDS REACTIFYING
            var tree = this.getHandledDataTree(startContextId);
            const stringTree = JSON.stringify(tree);
            const eventNodes = this.eventNodes;
            for(var c=0;c<tree.length;c++) {
                let eventId = tree[c].id;
                // Find the proper item, and update it.
                let index = eventNodes.findIndex(event => {
                    return event.props.id === eventId;
                });
                if(index !== -1) {
                    this._eventsMap.get(eventId).handledByTree = stringTree;
                    eventNodes[index] = this.createCard(eventId);
                }

                // var eventElement = document.getElementById(tree[c].id);
                // if(eventElement){
                //     this._eventsMap.get(tree[c].id).handledByTree = tree;
                //     eventElement.setAttribute("handledByTree", JSON.stringify(tree));
                // }
            }
            this._handled = new Map();
        }

        this.setState({eventNodes: this.eventNodes.slice(0)});
    }


    handleAuraInspectorEventLogOnClientActionStart(actionInfo) {
        if(!this._currentContext) {
            return;
        }

        var id = "action_" + actionInfo.actionId;

        this._handled.set(id, []);

        this._contextStack.push(id);
        this._currentContext = id;
    }

    handleAuraInspectorEventLogOnClientActionEnd(actionInfo) {
        if(!this._currentContext) {
            return;
        }

        this._contextStack.pop();
        this._currentContext = this._contextStack[this._contextStack.length-1];

        var data = { "id": "action_" + actionInfo.actionId, "scope": actionInfo.scope, "name": actionInfo.name, "actionId": actionInfo.actionId };

        var stored = this._handled.get(this._currentContext);
        stored.push(data);

        this._actionsMap.set(data.id, data);
    }
}