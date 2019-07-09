({

    /**
     * Verify that the root has its descriptor serialized appropriately.
     */
    testComponentTreeSerialize: {
        test: function(cmp) {
            this.util.getInjectedAPI((api) => {
                const EXPECTED = "markup://inspector:injectedScriptTest";
                const serializedApp = JSON.parse(api.getComponent($A.getRoot()));

                const ACTUAL = serializedApp.descriptor;

                $A.test.assertEquals(EXPECTED, ACTUAL);
            });
        }
    },

    /**
     * Utilities to interact with the Lightning Injected Script
     */
    util: {
        "getInjectedAPI": function (resolve) {
            $A.test.addWaitFor(true, function() {
                return !!window[Symbol.for("AuraDevTools")];
            }, function() {
                resolve(window[Symbol.for("AuraDevTools")].Inspector);
            });
            
        }
    }
})