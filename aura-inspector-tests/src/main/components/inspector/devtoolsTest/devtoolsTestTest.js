({
    /**
     * Devtools Panels Test Plan
     */
    setUp: function(cmp) {
        // Wait to run anything till the Test Api is ready.
        // this should also be enough for having EventLogPanel ready
        return new Promise((resolve, reject) => {
            var handler = function() {
                cmp.removeEventHandler("inspector:testApiReady", handler);
                //this.util.clearEventsList();
                resolve();                
            }.bind(this);

            // Is the test API Ready?
            const $Aura = window[Symbol.for("AuraDevTools")];
            if($Aura !== undefined && $Aura.Test) {
                handler = null;
                resolve();
            } else {
                cmp.addEventHandler("inspector:testApiReady", handler);
            }

        });
    },

    util: {
        
    }
})