(function(global){

    if(global.AuraInspector) {
        return;
    }

    // Initialize
    var inspector = new AuraInspectorContentScript();
        inspector.init();

    global.AuraInspector = global.AuraInspector || {};
    global.AuraInspector.ContentScript = inspector;


    function AuraInspectorContentScript(){
        var runtime = null;
        var allowedPostMessageKeys = {
            "AuraInspector:publishbatch": true,
            "AuraInspector:publish": true,
            "AuraInspector:bootstrap": true
        };

        /**
         * Initializes the connection to the chrome extensions runtime
         * Happens when we include the content script on the page.
         */
        this.connect = function () {
            // Don't setup everything again, that wouldn't make sense
            if(runtime) { return; }
            runtime = chrome.runtime.connect();
            runtime.onDisconnect.addListener(this.disconnect.bind(this));

            // Inject the script that will talk with the $A services.
            var scriptElement = global.document.createElement("script");
            scriptElement.src = chrome.extension.getURL('AuraInspectorInjectedScript.js');
            scriptElement.async = scriptElement.defer = false;
            scriptElement.onload = function() {
                this.parentNode.removeChild(this);
            };
            (document.head||document.documentElement).appendChild(scriptElement);
        };

        /**
         * Happens when you close the tab
         */
        this.disconnect = function() {

            window.removeEventListener("message", Handler_OnWindowMessage);
            runtime.onMessage.removeListener(Handler_OnRuntimeMessage);
            runtime = null;
        };

        this.init = function(){
            this.connect();
            this.injectBootstrap();

            // Simply catches publish commands and passes them to the AuraInspector
            window.addEventListener("message", Handler_OnWindowMessage);

            // Catches all runtime commands and passes them to the injected script
            runtime.onMessage.addListener(Handler_OnRuntimeMessage);
        };



        this.injectBootstrap = function() {
            var script = document.createElement("script");
            script.textContent = script.text = `
                /**  Aura Inspector Script, ties into $A.initAsync and $A.initConfig to initialize the inspector as soon as possible. **/
                (function(global){
                    var injectedScript = Symbol.for('AuraDevTools');
                    function wrap(obj, original, before, after) {/*from 204 and beyond, we no longer need this wrap*/
                        return function() {
                            if(before) before.apply(obj, arguments);
                            var returnValue = original.apply(obj, arguments);
                            if(after) after.apply(obj, arguments);
                            return returnValue;
                        }
                    }
                    var initialized = false;
                    function notifyDevTools() {
                        if(initialized) { return; }
                        // Try to bootstrap, this way all the actions get caught as postMessage is async.
                        window[injectedScript].Inspector.bootstrap();
                        window.postMessage({
                            action  : "AuraInspector:publish",
                            key: "AuraInspector:OnAuraInitialized",
                            data: "ContentScript: notifyDevTools()"
                        }, window.location.origin);
                        // Only do once.
                        initialized = true;
                    }

                    // Since we were injected, Aura could already be available. If so, let the devtools know.
                    if(!global.$A || !(global.$A.getContext && global.$A.getContext())) {
                        var _Aura;
                        Object.defineProperty(window, "Aura", {
                            enumerable: true,
                            configurable: true,
                            get: function() { return _Aura; },
                            set: function(val) {
                                val.beforeFrameworkInit = val.beforeFrameworkInit || [];
                                val.beforeFrameworkInit.push(notifyDevTools);
                                _Aura = val;
                            }
                        });
                        var _$A;
                        Object.defineProperty(window, "$A", {/*from 204 and beyond, we no longer need this set*/
                            enumerable: true,
                            configurable: true,
                            get: function() { return _$A; },
                            set: function(val) {
                                if(val && val.initAsync) {
                                    val.initAsync = wrap(val, val.initAsync, notifyDevTools);
                                }
                                if(val && val.initConfig) {
                                    val.initConfig = wrap(val, val.initConfig, notifyDevTools);
                                }

                                _$A = val;

                            }
                        });
                    }
                })(this);
            `;
            document.documentElement.appendChild(script);
        };


        this.isConnected = function() {
            return !!runtime;
        };

        function Handler_OnWindowMessage(event){
            // Don't handle messages from myself.
            if(runtime && allowedPostMessageKeys[event.data.action]) {
                //console.log("ContentScript-ToRuntime:", event.data.action, event.data);
                runtime.postMessage(event.data);
            } else {
                //console.log("NotAllowedContentScript:", event.data.action, event.data);
            }
        }

        function Handler_OnRuntimeMessage(event){
            if(event && event.data && allowedPostMessageKeys[event.data.action]) {
                //console.log("ContentScript-FromRuntime:", event.data.action, event.data);
                window.postMessage(event.data);
            }
        }

    }
})(this);
