/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/contentScript.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/contentScript.js":
/*!******************************!*\
  !*** ./src/contentScript.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


if (!window.AuraInspector) {

    // Initialize
    var inspector = new AuraInspectorContentScript();
    inspector.init();

    window.AuraInspector = window.AuraInspector || {};
    window.AuraInspector.ContentScript = inspector;

    function AuraInspectorContentScript() {
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
        this.connect = function (onConnectCallback) {
            // Don't setup everything again, that wouldn't make sense
            if (runtime) {
                return;
            }
            runtime = chrome.runtime.connect();
            runtime.onDisconnect.addListener(this.disconnect.bind(this));

            // Inject the script that will talk with the $A services.
            var scriptElement = window.document.createElement("script");
            //scriptElement.src = chrome.extension.getURL('src/AuraInspectorInjectedScript.js');
            scriptElement.src = chrome.extension.getURL('/dist/LightningInspectorInjectedScript.js');
            scriptElement.async = scriptElement.defer = false;
            scriptElement.onload = function () {
                this.parentNode.removeChild(this);
                if (onConnectCallback) {
                    onConnectCallback();
                }
            };
            (document.head || document.documentElement).appendChild(scriptElement);
        };

        /**
         * Happens when you close the tab
         */
        this.disconnect = function () {

            window.removeEventListener("message", Handler_OnWindowMessage);
            runtime.onMessage.removeListener(Handler_OnRuntimeMessage);
            runtime = null;
        };

        this.init = function () {
            this.connect(() => {
                this.injectBootstrap();
            });

            // Simply catches publish commands and passes them to the AuraInspector
            window.addEventListener("message", Handler_OnWindowMessage);

            // Catches all runtime commands and passes them to the injected script
            runtime.onMessage.addListener(Handler_OnRuntimeMessage);
        };

        this.injectBootstrap = function () {
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
                        window[injectedScript].Inspector.instrument();
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
                        var _Aura = global.Aura;
                        Object.defineProperty(global, "Aura", {
                            enumerable: true,
                            configurable: true,
                            get: function() { return _Aura; },
                            set: function(val) {
                                val.beforeFrameworkInit = val.beforeFrameworkInit || [];
                                val.beforeFrameworkInit.push(notifyDevTools);
                                _Aura = val;
                            }
                        });
                        var _$A = global.$A;
                        Object.defineProperty(global, "$A", {/*from 204 and beyond, we no longer need this set*/
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

        this.isConnected = function () {
            return !!runtime;
        };

        function Handler_OnWindowMessage(event) {
            // Don't handle messages from myself.
            if (runtime && allowedPostMessageKeys[event.data.action]) {
                //console.log("ContentScript-ToRuntime:", event.data.action, event.data);
                runtime.postMessage(event.data);
            } else {
                //console.log("NotAllowedContentScript:", event.data.action, event.data);
            }
        }

        function Handler_OnRuntimeMessage(event) {
            if (event && event.data && allowedPostMessageKeys[event.data.action]) {
                //console.log("ContentScript-FromRuntime:", event.data.action, event.data);
                window.postMessage(event.data);
            }
        }
    }
}

/***/ })

/******/ });
//# sourceMappingURL=contentScript.js.map