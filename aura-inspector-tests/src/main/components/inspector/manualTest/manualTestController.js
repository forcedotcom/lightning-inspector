({
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
        helper.recordPublishCommands($A.getCallback(function() {
            console.log("Event fired");
            var evt = $A.getEvt("markup://inspector:customAppEvent");
            evt.fire();
        }));
    }
})
