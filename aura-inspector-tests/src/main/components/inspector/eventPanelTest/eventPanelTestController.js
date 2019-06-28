({
    init: function(cmp, event, helper) {

    },

    handleTestApiReady: function(cmp, event, helper) {
        var container = cmp.find("event-panel-container").getElement();
        
        window[Symbol.for("AuraDevTools")].Test.listen();
        window[Symbol.for("AuraDevTools")].Test.renderEventLogPanel(container);
    },

    handleLoadLabels: function (component) {
        var serverAction = $A.get("c.aura://ComponentController.loadLabels");
        serverAction.setCallback(this, function(action) { console.log("ComponentController.loadLabels", action); });
        $A.enqueueAction(serverAction);
    },

    handleCustomAppEvent: function(cmp, event, helper) {
        console.log("custom app event");

        var evt = cmp.getEvent("customCmpEvent");
        evt.fire();
    },

    handleChainEventsClick: function(cmp, event, helper){
        var evt = $A.getEvt("markup://inspector:customAppEvent");
        evt.fire();        
    },

    handleFireCustomAppEventWithParameters: function(cmp, event, helper){
        var evt = $A.getEvt("markup://inspector:customAppEventWithAttributes");
        evt.setParams({
            "attribute1": "First Attribute",
            "attribute2": "Second Attribute",
            "attribute3": "Third Attribute",
            "attribute4": "Fourth Attribute",
            "attribute5": "Fifth Attribute"
        });
        evt.fire();

        var evt = $A.getEvt("markup://inspector:customAppEvent");
        evt.fire();
        
    }
})
