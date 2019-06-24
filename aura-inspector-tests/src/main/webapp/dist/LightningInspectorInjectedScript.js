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
/******/ 	return __webpack_require__(__webpack_require__.s = 15);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/LightningInspectorInjectedScript.js":
/*!*************************************************!*\
  !*** ./src/LightningInspectorInjectedScript.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _ComponentSerializer = __webpack_require__(/*! ./aura/gatherer/ComponentSerializer.js */ "./src/aura/gatherer/ComponentSerializer.js");

var _ComponentSerializer2 = _interopRequireDefault(_ComponentSerializer);

var _JsonSerializer = __webpack_require__(/*! ./aura/JsonSerializer.js */ "./src/aura/JsonSerializer.js");

var _JsonSerializer2 = _interopRequireDefault(_JsonSerializer);

var _unStrictApis = __webpack_require__(/*! ./aura/gatherer/unStrictApis.js */ "./src/aura/gatherer/unStrictApis.js");

var _unStrictApis2 = _interopRequireDefault(_unStrictApis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//*** Used by Aura Inspector
// This is injected in the DOM directly via <script> injection
const $Aura = {};

// Do NOT use this pattern, it's tech-debt and should be removed. Add all logic to AuraInspector.
$Aura.actions = {
    "AuraDevToolService.AddStyleRules": function () {
        var styleRuleId = "AuraDevToolService.AddStyleRules";

        // Already added
        if (document.getElementById(styleRuleId)) {
            return;
        }

        var rules = `
                .auraDevToolServiceHighlight3:before{
                   position:absolute;
                   display:block;
                   width:100%;
                   height:100%;
                   z-index: 10000;
                   background-color:#006699;
                   opacity:.3;
                   content:' ';
                   border : 2px dashed white;
                }
                .auraDevToolServiceHighlight4.auraDevToolServiceHighlight3:before {
                   opacity: 0;
                   transition: opacity 2s;
                }
            `;

        var style = document.createElement("style");
        style.id = styleRuleId;
        style.textContent = rules;
        style.innerText = rules;

        var head = document.head;
        head.appendChild(style);

        document.body.addEventListener("transitionend", function removeClassHandler(event) {
            var removeClassName = "auraDevToolServiceHighlight3";
            var addClassName = "auraDevToolServiceHighlight4";
            var element = event.target;
            if (element) {
                element.classList.remove(removeClassName);
                element.classList.remove(addClassName);
            }
        });
    }
};

var $Symbol = Symbol.for("AuraDevTools");

// Communicate directly with the aura inspector
$Aura.Inspector = new AuraInspector();
$Aura.Inspector.init();

// Attach to the global object so our integrations can access it, but
// use a symbol so it doesn't create a global property.
window[$Symbol] = $Aura;

function AuraInspector() {
    var subscribers = {};
    var PUBLISH_KEY = "AuraInspector:publish";
    var PUBLISH_BATCH_KEY = "AuraInspector:publishbatch";
    var BOOTSTRAP_KEY = "AuraInspector:bootstrap";
    var postMessagesQueue = [];
    var batchPostId = null;
    var lastItemInspected;
    var countMap = {};
    var instrumented = {
        "actions": false,
        "all": false
    };

    // For dropping actions
    var actionsWatched = {};
    var actionsToWatch = {};

    this.init = function () {
        // Add Rightclick handler. Just track what we rightclicked on.
        addRightClickObserver();

        this.subscribe("AuraInspector:ContextElementRequest", () => {
            if (lastItemInspected && lastItemInspected.nodeType === 1) {
                this.publish("AuraInspector:ShowComponentInTree", lastItemInspected.getAttribute("data-aura-rendered-by"));
            }
        });

        // Aura's present, our script is present, bootstrap!
        this.subscribe("AuraInspector:OnAuraInitialized", () => {
            this.instrument();
            this.subscribe("AuraInspector:OnPanelConnect", AuraInspector_OnPanelLoad.bind(this));
        });

        // Component tree hovering to show the element in the dom.
        this.subscribe("AuraInspector:OnHighlightComponent", AuraInspector_OnAddHighlightDomNode);
        this.subscribe("AuraInspector:OnHighlightComponentEnd", AuraInspector_OnRemoveHighlightDomNode);

        // Action dropping and modifying
        this.subscribe("AuraInspector:OnActionToWatchEnqueue", AuraInspector_OnActionToWatchEnqueue.bind(this));
        this.subscribe("AuraInspector:OnActionToRemoveFromWatchEnqueue", AuraInspector_RemoveActionFromWatch.bind(this));
        this.subscribe("AuraInspector:OnActionToWatchClear", AuraInspector_RemoveActionsFromWatch.bind(this));

        // Aura is present and the root has already been initialized.
        if (window.$A && window.$A.getContext && !!window.$A.getContext()) {
            this.instrument();
            this.publish("AuraInspector:OnAuraInitialized", "InjectedScript: Aura Present already during load.");
        }

        if (document.readyState === "complete") {
            if (!window.$A) {
                this.publish("AuraInspector:OnAuraUnavailable", {});
            }
        } else {
            window.addEventListener("load", () => {
                if (!window.$A) {
                    this.publish("AuraInspector:OnAuraUnavailable", {});
                }
            });
        }

        this.publish("AuraInspector:OnInjectionScriptInitialized");
    };

    this.search = function (action, term) {
        if (action === "performSearch") {
            this.publish("AuraInspector:Search", term);
        } else {
            this.publish("AuraInspector:CancelSearch");
        }
    };

    this.instrument = function () {
        if (instrumented.all) {
            // If you close the panel, then reopen it, the bootstrap will have already happened
            // on the page. But the inspector doesn't know that, we still need to communicate
            // to it that we're done. So we always post the bootstrap back.
            window.postMessage({
                "action": "AuraInspector:bootstrap",
                "key": "AuraInspector:bootstrap",
                "data": "InjectedScript: Aura is already present at initialization, calling bootstrap."
            }, window.location.origin);
            return;
        }

        if (typeof $A === "undefined" || !($A.getContext && $A.getContext())) {
            // Aura isn't ready yet.
            return;
        }

        // Try catches for branches that don't have the overrides
        // This instrument is where we add the methods _$getRawValue$() and _$getSelfGlobalId$() to the
        // component prototype. This allowed us to move to outputing the component from injected code, vs code in the framework.
        // Would be nice to get rid of needing this.
        // When all of 222 is gone, you can remove this. 
        try {
            $A.installOverride("outputComponent", function () {});
        } catch (e) {}

        try {
            // Counts how many times various things have happened.
            bootstrapCounters();
        } catch (e) {}

        try {
            // Actions Tab
            this.instrumentActions();
        } catch (e) {}
        try {
            // Perf Tab
            bootstrapPerfDevTools();
        } catch (e) {}
        try {
            // Events Tab
            bootstrapEventInstrumentation();
        } catch (e) {}

        try {
            bootstrapTransactionReporting();
        } catch (e) {}

        // Need a way to conditionally do this based on a user setting.
        $A.PerfDevTools.init();

        window.postMessage({
            "action": "AuraInspector:bootstrap",
            "key": "AuraInspector:bootstrap",
            "data": "InjectedScript: $Aura.Inspector.instrument()"
        }, window.location.origin);

        instrumented.all = true;
    };

    // Just incase for legacy, remove say 210
    this.bootstrap = this.instrument;

    this.instrumentActions = function () {
        if (instrumented.actions) {
            return;
        }

        $A.installOverride("enqueueAction", OnEnqueueAction);
        //$A.installOverride("Action.finishAction", OnFinishAction);
        $A.installOverride("Action.abort", OnAbortAction);
        $A.installOverride("Action.runDeprecated", OnActionRunDeprecated);
        $A.installOverride("Action.finishAction", Action_OnFinishAction.bind(this));
        $A.installOverride("ClientService.send", ClientService_OnSend.bind(this));
        $A.installOverride("ClientService.decode", ClientService_OnDecode.bind(this));

        instrumented.actions = true;

        //oldResponse: XMLHttpRequest
        //actionsFromAuraXHR: AuraXHR keep an object called actions, it has all actions client side are waiting for response, a map between actionId and action.
        function ClientService_OnDecode(config, oldResponse, noStrip) {
            //var response = oldResponse["response"];
            if (!oldResponse["response"] || oldResponse["response"].length == 0) {
                console.warn("AuraInspectorInjectedScript.onDecode received a bad response.", oldResponse);
                return config["fn"].call(config["scope"], oldResponse, noStrip);
            }

            //modify response if we find the action we are watching
            var response = oldResponse["response"];
            var oldResponseText = oldResponse["responseText"];
            var newResponseText = oldResponseText;
            // var responseModified = false;//if we modify the response, set this to true
            // var responseWithError = false;//if we send back error response, set this to true
            // var responseWithIncomplete = false;//if we want to kill the action, set this to true

            if (this.hasWatchedActions()) {
                try {
                    for (var actionId in actionsWatched) {
                        if (!oldResponseText.includes(actionId) || !oldResponseText.startsWith("while(1);")) {
                            continue;
                        }

                        var actionWatched = actionsWatched[actionId];
                        var actionsObj = getActionsFromResponseText(oldResponseText);
                        var responseActions = actionsObj && actionsObj.actions || [];

                        var actionFound;
                        var restOfActions = responseActions.filter(current => {
                            if (current.id === actionId) {
                                actionFound = current;
                                return false;
                            } else {
                                return true;
                            }
                        });

                        // We have not yet found an action in the existing set we want to modify
                        if (!actionFound) {
                            continue;
                        }
                        //we would like to return error response
                        if (actionWatched.nextError) {
                            actionFound.state = "ERROR";
                            actionFound.error = [actionWatched.nextError];
                            actionFound.returnValue = null;
                            var actionsEndIndex = oldResponseText.indexOf("context\"");
                            newResponseText = "while(1);\n{\"actions\":" + JSON.stringify(restOfActions.concat(actionFound)) + ",\"" + oldResponseText.substring(actionsEndIndex, oldResponseText.length);
                            //move the actionCard from watch list to Processed
                            //this will call AuraInspectorActionsView_OnActionStateChange in AuraInspectorActionsView.js
                            $Aura.Inspector.publish("AuraInspector:OnActionStateChange", {
                                "id": actionId,
                                "idtoWatch": actionWatched.idtoWatch,
                                "state": "RESPONSEMODIFIED",
                                "sentTime": performance.now() //do we need this?
                            });

                            const newHttpRequest = {
                                "status": 200,
                                "response": newResponseText,
                                "responseText": newResponseText,
                                "$hasError": true
                            };

                            return config["fn"].call(config["scope"], newHttpRequest, noStrip);
                        }
                        //we would like to return non-error response
                        else if (actionWatched.nextResponse) {
                                var responseModified = Object.assign(actionFound.returnValue, actionWatched.nextResponse);
                                if (responseModified) {
                                    actionFound.returnValue = responseModified;
                                    var actionsEndIndex = oldResponseText.indexOf("context\"");
                                    newResponseText = "while(1);\n{\"actions\":" + JSON.stringify(restOfActions.concat(actionFound)) + ",\"" + oldResponseText.substring(actionsEndIndex, oldResponseText.length);

                                    //move the actionCard from watch list to Processed
                                    //this will call AuraInspectorActionsView_OnActionStateChange in AuraInspectorActionsView.js
                                    $Aura.Inspector.publish("AuraInspector:OnActionStateChange", {
                                        "id": actionId,
                                        "idtoWatch": actionWatched.idtoWatch,
                                        "state": "RESPONSEMODIFIED",
                                        "sentTime": performance.now() //do we need this?
                                    });

                                    const newHttpRequest = Object.assign($A.util.apply({}, oldResponse), {
                                        "response": newResponseText,
                                        "responseText": newResponseText,
                                        "$isModified": true
                                    });

                                    return config["fn"].call(config["scope"], newHttpRequest, noStrip);
                                }
                            }
                            //we would like to kill action, return incomplete
                            else {
                                    //responseWithIncomplete = true;
                                    //move the actionCard from watch list to Processed
                                    //this will call AuraInspectorActionsView_OnActionStateChange in AuraInspectorActionsView.js
                                    $Aura.Inspector.publish("AuraInspector:OnActionStateChange", {
                                        "id": actionId,
                                        "idtoWatch": actionWatched.idtoWatch,
                                        "state": "RESPONSEMODIFIED",
                                        "sentTime": performance.now(), //do we need this?
                                        "byChaosRun": actionWatched.byChaosRun
                                    });
                                    if (actionWatched.byChaosRun) {
                                        $Aura.Inspector.publish("AuraInspector:OnCreateChaosCard", { "message": "Drop action " + actionWatched.id + ", the old actionId from replay: " + actionWatched.idtoWatch });
                                        if (actionWatched.id === actionWatched.idtoWatch) {
                                            console.warn("The action in your replay has the same id as the action being dropped, this will confuse ActionTab, as it use actionId to find and move actionCard around. Please change action id in your replay file to something else, like 9999 :-) ");
                                        }
                                    }

                                    const newHttpRequest = {
                                        "status": 0,
                                        "$isIncomplete": true
                                    };

                                    return config["fn"].call(config["scope"], newHttpRequest, noStrip);
                                }
                    }
                } catch (e) {
                    console.warn("get response we cannot parse with JSON.parse, skip", oldResponse, e);
                    return config["fn"].call(config["scope"], oldResponse, noStrip);
                }
            }

            /** CHAOS **/
            // if($Sfdc.chaos.shouldWeDropAction()) {
            //     //if we are in a new chaos run and user would like to drop action randomly
            //     responseWithIncomplete = $Sfdc.chaos.randomlyDropAction(responseWithIncomplete, oldResponseText); 
            // }

            // if($Sfdc.chaos.shouldWeErrorResponseAction()) {
            //     //if we are in a new chaos run and we would like to return error response randomly
            //     const resObj = $Sfdc.chaos.randomlyReturnErrorResponseForAction(responseWithIncomplete, oldResponseText);
            //     responseWithError = resObj.responseWithError;
            //     newResponseText = resObj.newResponseText;
            // }
            /** End Chaos **/

            // if(responseWithIncomplete) {
            //     const newHttpRequest = {
            //         "status": 0,
            //         "$isIncomplete": true
            //     };

            //     return config["fn"].call(config["scope"], newHttpRequest, noStrip);
            // }
            // else if(responseModified === true) {
            //     const newHttpRequest = Object.assign({}, oldResponse, {
            //         "response": newResponseText,
            //         "responseText": newResponseText,
            //         "$isModified": true
            //     });
            //     newHttpRequest["response"] = newResponseText;
            //     newHttpRequest["responseText"] = newResponseText;

            //     return config["fn"].call(config["scope"], newHttpRequest, noStrip);
            // } else if (responseWithError === true) {
            //     const newHttpRequest = {
            //         "status": 500, // As long as it's not 200
            //         "response": newResponseText,
            //         "responseText": newResponseText,
            //         "$hasError": true
            //     };

            //     return config["fn"].call(config["scope"], newHttpRequest, noStrip);
            // } else {
            //     //nothing happended, just send back oldResponse
            //     return config["fn"].call(config["scope"], oldResponse, noStrip);
            // }

            //nothing happended, just send back oldResponse
            return config["fn"].call(config["scope"], oldResponse, noStrip);
        }

        function addMessageAndStackToResponse(response, message, stack) {
            var actionsStartIdx = response.indexOf("actions");
            if (actionsStartIdx > 0) {
                return response.substring(0, actionsStartIdx - 1) + "\"message\":\"" + message + "\",\"stack\":\"" + stack + "\"," + response.substring(actionsStartIdx - 1, response.length);
            } else {
                return response;
            }
        }

        function getActionsFromResponseText(response) {
            var actionsStartIdx = response.indexOf("actions");
            var actionsEndIndex = response.indexOf("\"context\":");
            if (actionsStartIdx >= 0 && actionsEndIndex >= 0) {
                var actionsStrInResponse = response.substring(actionsStartIdx, actionsEndIndex).replace(/\s/g, ""); //we don't want '"' right before the 'context'
                if (actionsStrInResponse.lastIndexOf(",") == actionsStrInResponse.length - 1) {
                    //get rid of ','
                    actionsStrInResponse = actionsStrInResponse.substring(0, actionsStrInResponse.length - 1);
                }
                return JSON.parse("{\"" + actionsStrInResponse + "}");
            }
        }
    };

    this.getWatchedAction = function (id) {
        return actionsWatched[id];
    };

    this.isWatchingForAction = function (reference) {
        if (typeof reference === "string") {
            return actionsToWatch[reference];
        }
        var name = reference.actionName;
        if ($A.util.isAction(reference)) {
            name = reference.getDef().toString();
        }

        for (var actionName in actionsToWatch) {
            if (actionName.includes(name)) {
                return actionsToWatch[actionName];
            }
        }
        return null;
    };

    this.hasWatchedActions = function () {
        return Object.getOwnPropertyNames(actionsWatched).length > 0;
    };

    this.isWatchingForActions = function () {
        return Object.getOwnPropertyNames(actionsToWatch).length > 0;
    };

    this.setWatchedActionAsProcessed = function (actionId) {
        delete actionsWatched[actionId];

        // what about actionsToWatch?
    };

    this.setWatchAsProcessed = function (actionName) {
        delete actionsToWatch[actionName];
    };

    this.setWatchedAction = function (action) {
        actionsWatched[action.getId()] = action;
    };

    //this.setWatchedAction = function() {};
    this.watchAction = function (action) {
        actionsToWatch[action.actionName] = action;
    };

    this.cancelWatchOfAction = function (actionName) {
        if (!actionName) {
            return;
        }

        if (actionsToWatch.hasOwnProperty(actionName)) {
            delete actionsToWatch[actionName];
        }
    };

    this.cancelWatchOfAllActions = function () {
        actionsToWatch = {};
    };

    this.publish = function (key, data) {
        if (!key) {
            return;
        }

        // We batch the post messages
        // to avoid excessive messages which was causing
        // stabalization issues.
        postMessagesQueue.push({ "key": key, "data": data });

        if (batchPostId === null || batchPostId === undefined) {
            batchPostId = sendQueuedPostMessages();
        }
    };

    this.subscribe = function (key, callback) {
        if (!key || !callback) {
            return;
        }

        if (!subscribers[key]) {
            subscribers[key] = [];
        }

        subscribers[key].push(callback);
    };

    this.unsubscribe = function (key, callback) {
        if (!key || !callback) {
            return false;
        }

        if (!subscribers[key]) {
            return false;
        }

        var listeners = subscribers[key];
        subscribers[key] = listeners.filter(function (item) {
            return item !== callback;
        });
    };

    // Overriden by some tricky code down below to try to get into the context of the app.
    this.accessTrap = function (callback) {
        if (typeof callback === "function") {
            callback();
        }
    };

    /**
     * Get all the top level elements.
     * This obviously includes $A.getRoot(), but for Lightning Out that is empty.
     * So we also include all the Disconnected components attached to dom elements.
     */
    this.getRootComponents = function () {
        console.log(_ComponentSerializer2.default.getRootComponents());
        console.log("a");
        return _ComponentSerializer2.default.getRootComponents();
    };

    this.getComponent = function (componentId, options) {
        console.log(_ComponentSerializer2.default.getComponent(componentId, options));
        return _ComponentSerializer2.default.getComponent(componentId, options);
    };

    /**
     * Increment a counter for the specified key.
     * @example
     * $Aura.Inspector.count('rendered');
     * $Aura.Inspector.count('rendered');
     * $Aura.Inspector.getCount('rendered'); // 2
     * @param  {String} key Any unique ID to count
     */
    this.count = function (key) {
        countMap[key] = countMap.hasOwnProperty(key) ? countMap[key] + 1 : 1;
    };

    /**
     * Get how many times a key has been counted without incrementing the counter.
     *
     * @param  {String} key Unique id to count.
     */
    this.getCount = function (key) {
        return countMap.hasOwnProperty(key) ? countMap[key] : 0;
    };

    /**
     * Reset a counted key to 0.
     *
     * @param  {String} key Unique id that you passed to this.count(key) to increment the counter.
     */
    this.clearCount = function (key) {
        if (countMap.hasOwnProperty(key)) {
            delete countMap[key];
        }
    };

    // Start listening for messages
    window.addEventListener("message", Handle_OnPostMessage);

    function Handle_OnPostMessage(event) {
        if (event && event.data) {
            if (event.data.action === PUBLISH_KEY) {
                callSubscribers(event.data.key, event.data.data);
            } else if (event.data.action === PUBLISH_BATCH_KEY) {
                var data = event.data.data || [];
                for (var c = 0, length = data.length; c < length; c++) {
                    callSubscribers(data[c].key, data[c].data);
                }
            }
        }
    }

    function AuraInspector_OnPanelLoad() {
        if (window.$A) {
            window.postMessage({
                "action": "AuraInspector:bootstrap",
                "key": "AuraInspector:bootstrap",
                "data": "Panel connected, the injected script has already bootstrapped."
            }, window.location.origin);
        }
    }

    // This is temporary till we can add the data-ltngout-rendered-by attribute.
    function getComponentForLtngOut(components) {
        if (!components.length) {
            return;
        }
        let owner = components[0].getOwner();
        while (!owner.getOwner().isInstanceOf("aura:application") && owner.getOwner() !== owner) {
            owner = owner.getOwner();
        }
        return owner;
    }

    function callSubscribers(key, data) {
        if (subscribers[key]) {
            subscribers[key].forEach(function (callback) {
                callback(data);
            });
        }
    }

    function sendQueuedPostMessages() {
        if ("requestIdleCallback" in window) {
            batchPostId = window.requestIdleCallback(sendQueuedPostMessagesCallback);
        } else {
            batchPostId = window.requestAnimationFrame(sendQueuedPostMessagesCallback);
        }

        function sendQueuedPostMessagesCallback() {
            if (postMessagesQueue.length) {
                try {
                    window.postMessage({
                        "action": PUBLISH_BATCH_KEY,
                        "data": postMessagesQueue
                    }, window.location.origin);
                } catch (e) {
                    console.error("AuraInspector: Failed to communicate to inspector.", e);
                }
            }
            postMessagesQueue = [];
            batchPostId = null;
        }
    }

    function addRightClickObserver() {
        document.addEventListener("mousedown", function (event) {
            // Right Click
            if (event.button === 2) {
                var current = event.target;
                while (current && current != document && !current.hasAttribute("data-aura-rendered-by")) {
                    current = current.parentNode;
                }
                lastItemInspected = current;
            }
        });
    }
}

function wrapFunction(target, methodName, newFunction) {
    if (typeof target[methodName] != "function") {
        return;
    }
    var original = target[methodName];
    target[methodName] = function () {
        newFunction.apply(this, arguments);
        return original.apply(this, arguments);
    };
}

function AuraInspector_OnAddHighlightDomNode(globalId) {
    // Ensure the classes are present that HighlightElement depends on.
    if (!$Aura.actions["AuraDevToolService.AddStyleRules"].addedStyleRules) {
        $Aura.actions["AuraDevToolService.AddStyleRules"]();
        $Aura.actions["AuraDevToolService.AddStyleRules"].addedStyleRules = true;
    }

    const className = "auraDevToolServiceHighlight3";
    const previous = document.getElementsByClassName(className);
    for (let d = previous.length - 1, current; d >= 0; d--) {
        current = previous[d];
        current.classList.remove(className);
        current.classList.remove("auraDevToolServiceHighlight4");
    }

    // Apply the classes to the elements
    if (globalId) {
        var cmp = $A.getComponent(globalId);
        if (cmp && cmp.isValid()) {
            var elements = cmp.getElements() || [];
            // todo: add classes to elements
            for (var c = 0, length = elements.length; c < length; c++) {
                if (elements[c].nodeType === 1) {
                    elements[c].classList.add(className);
                }
            }
        }
    }
}

function AuraInspector_OnRemoveHighlightDomNode() {
    const removeClassName = "auraDevToolServiceHighlight3";
    const addClassName = "auraDevToolServiceHighlight4";
    const previous = document.getElementsByClassName(removeClassName);
    for (let d = previous.length - 1; d >= 0; d--) {
        previous[d].classList.add(addClassName);
    }
}

function Action_OnFinishAction(config, context) {
    var startCounts = {
        "created": $Aura.Inspector.getCount("component_created")
    };

    var ret = config["fn"].call(config["scope"], context);

    var action = config["self"];

    // Only handle Server Actions, its entirely possible for you to $A.enqueueAction() something from the controller.
    if (!action.getDef().isServerAction()) {
        return ret;
    }

    var data = {
        "id": action.getId(),
        "state": action.getState(),
        "fromStorage": action.isFromStorage(),
        "returnValue": _JsonSerializer2.default.stringify(action.getReturnValue()),
        "error": _JsonSerializer2.default.stringify(action.getError()),
        "finishTime": performance.now(),
        "stats": {
            "created": $Aura.Inspector.getCount("component_created") - startCounts.created
        }
    };

    var actionWatched = this.getWatchedAction(action.getId());
    if (actionWatched) {
        if (actionWatched.nextError != undefined) {
            data.howDidWeModifyResponse = "responseModified_error";
        } else if (actionWatched.nextResponse != undefined) {
            data.howDidWeModifyResponse = "responseModified_modify";
        } else {
            data.howDidWeModifyResponse = "responseModified_drop";
        }

        this.setWatchedActionAsProcessed(action.getId());
    }

    this.publish("AuraInspector:OnActionStateChange", data);

    return ret;
}

function AuraInspector_OnActionToWatchEnqueue(data) {
    if (!data) {
        console.error("AuraDevToolService.AddActionToWatch receive no data from publisher");
    }
    //check if we already has the action in actionsToWatch, if so replace it with the new one
    var alreadyAdded = this.isWatchingForAction(data);

    if (alreadyAdded) {
        this.cancelWatchOfAction(data.actionName);
    } else {
        //remove the stored response from action storage -- if there is any
        if (data.actionIsStorable && data.actionIsStorable === true) {
            var actionsStorage = $A.storageService.getStorage("actions");
            var actionStorageKey = data.actionStorageKey; //data.actionName+JSON.stringify(data.actionParameter);//
            if (actionsStorage && actionStorageKey && actionStorageKey.length) {
                actionsStorage.get(actionStorageKey).then(function () {
                    //console.log("find storage item for action:", data);
                    actionsStorage.remove(actionStorageKey).then(function () {
                        $Aura.Inspector.publish("AuraInspector:RemoveStorageData", { 'storageKey': actionStorageKey });
                    });
                }, function (e) {
                    console.warn("cannot find storage item for action:", data);
                });
            }
        }
    }

    this.watchAction(data);

    //ask chaos view to create a chaos card
    /** MOVE:Chaos */
    if (data.byChaosRun) {
        var actionName = data.actionName;
        if (actionName.indexOf("ACTION$") >= 0) {
            //action could be long, make it more readable
            actionName = actionName.substr(actionName.indexOf("ACTION$") + 7, actionName.length - 1);
        }
        $Aura.Inspector.publish("AuraInspector:OnCreateChaosCard", { "message": "add action " + actionName + " to watch list" });
    }
}

function AuraInspector_RemoveActionFromWatch(data) {
    if (!data) {
        console.error("AuraDevToolService.RemoveActionFromWatch receive no data from publisher");
    }

    this.cancelWatchOfAction(data.actionName);
}

/*
handler for AuraInspector:OnActionToWatchClear, this will clear up all actions from watch list
*/
function AuraInspector_RemoveActionsFromWatch() {
    this.cancelWatchOfAllActions();
}

/**
 * Go through actionToWatch, if we run into an action we are watching, either drop it
 * or register with actionsWatched, so we can modify response later in onDecode 
 */
function ClientService_OnSend(config, auraXHR, actions, method, options) {
    if (actions) {
        for (var c = 0; c < actions.length; c++) {
            if (this.isWatchingForActions()) {
                var action = actions[c];
                var actionToWatch = this.isWatchingForAction(action);
                if (actionToWatch) {
                    //udpate the record of what we are watching, this is mainly for action we want to modify response
                    if (this.getWatchedAction(action.getId())) {
                        console.warn("Error: we already watching this action:", action);
                    } else {
                        //copy nextResponse to actionWatched
                        action['nextError'] = actionToWatch.nextError;
                        action['nextResponse'] = actionToWatch.nextResponse;
                        action['idtoWatch'] = actionToWatch.actionId;
                        if (actionToWatch.byChaosRun) {
                            action['byChaosRun'] = actionToWatch.byChaosRun;
                        }

                        this.setWatchedAction(action);
                    }

                    this.setWatchAsProcessed(actionToWatch.actionName);
                }
            }

            $Aura.Inspector.publish("AuraInspector:OnActionStateChange", {
                "id": actions[c].getId(),
                "state": "RUNNING",
                "sentTime": performance.now()
            });
        }
    }

    var ret = config["fn"].call(config["scope"], auraXHR, actions, method, options);

    return ret;
}

function OnEnqueueAction(config, action, scope) {
    var ret = config["fn"].call(config["scope"], action, scope);

    if (action.getDef().isServerAction()) {
        var cmp = action.getComponent();
        var data = {
            "id": action.getId(),
            "params": _JsonSerializer2.default.stringify(action.getParams()),
            "abortable": action.isAbortable(),
            "storable": action.isStorable(),
            "background": action.isBackground(),
            "state": action.getState(),
            "isRefresh": action.isRefreshAction(),
            "defName": action.getDef() + "",
            "fromStorage": action.isFromStorage(),
            "enqueueTime": performance.now(),
            "storageKey": action.getStorageKey(),
            "callingCmp": cmp && cmp.getGlobalId()
        };

        $Aura.Inspector.publish("AuraInspector:OnActionEnqueue", data);
    }
    return ret;
}

// function OnFinishAction(config, context) {
//     var startCounts = {
//         "created": $Aura.Inspector.getCount("component_created")
//     };

//     var ret = config["fn"].call(config["scope"], context);

//     var action = config["self"];

//     var data = {
//         "id": action.getId(),
//         "state": action.getState(),
//         "fromStorage": action.isFromStorage(),
//         "returnValue": Serializer.stringify(action.getReturnValue()),
//         "error": Serializer.stringify(action.getError()),
//         "finishTime": performance.now(),
//         "stats": {
//             "created": $Aura.Inspector.getCount("component_created") - startCounts.created
//         }
//     };

//     $Aura.Inspector.publish("AuraInspector:OnActionStateChange", data);

//     return ret;
// }

function OnAbortAction(config, context) {
    var ret = config["fn"].call(config["scope"], context);

    var action = config["self"];

    if (action.getDef().isServerAction()) {
        var data = {
            "id": action.getId(),
            "state": action.getState(),
            "finishTime": performance.now()
        };

        $Aura.Inspector.publish("AuraInspector:OnActionStateChange", data);
    }

    return ret;
}

function OnActionRunDeprecated(config, event) {
    var action = config["self"];
    var startTime = performance.now();
    var data = {
        "actionId": action.getId(),
        "isServerAction": action.getDef().isServerAction()
    };

    $Aura.Inspector.publish("AuraInspector:OnClientActionStart", data);

    var ret = config["fn"].call(config["scope"], event);

    data = {
        "actionId": action.getId(),
        "name": action.getDef().getName(),
        "scope": action.getComponent().getGlobalId()
    };

    $Aura.Inspector.publish("AuraInspector:OnClientActionEnd", data);
}

function bootstrapCounters() {
    // Count how many components are being created.
    $A.installOverride("ComponentService.createComponentPriv", function () {
        var config = Array.prototype.shift.apply(arguments);

        var ret = config["fn"].apply(config["scope"], arguments);

        $Aura.Inspector.count("component_created");

        return ret;
    });

    // No way of displaying this at the moment.
    // wrapFunction($A.Component.prototype, "render", function(){
    //     $Aura.Inspector.count("component_rendered");
    //     $Aura.Inspector.count(this.getGlobalId() + "_rendered");
    // });

    wrapFunction($A.Component.prototype, "rerender", function () {
        $Aura.Inspector.count("component_rerendered");
        $Aura.Inspector.count(this.getGlobalId() + "_rerendered");
    });

    /*
        I'll admit, this is a  hack into the Aura access check framework.
        I shouldn't rely on this, it's merely a best case scenario work around.
        Fallbacks should be present if I use this method.
     */
    var originalRender = $A.Component.prototype.render;
    wrapFunction($A.Component.prototype, "render", function () {
        var current = this.getDef();
        while (current.getSuperDef()) {
            current = current.getSuperDef();
        }
        if (current.getDescriptor().getQualifiedName() === "markup://aura:application") {
            $Aura.Inspector.accessTrap = $A.getCallback(function (callback) {
                if (typeof callback === "function") {
                    callback();
                }
            });
            // No need anymore to do the override. It's simply to attach this access trap.
            $A.Component.prototype.render = originalRender;
        }
    });
    // No way of displaying this at the moment.
    // wrapFunction($A.Component.prototype, "unrender", function(){
    //     $Aura.Inspector.count("component_unrendered");
    //     $Aura.Inspector.count(this.getGlobalId() + "_unrendered");
    // });
}

function bootstrapEventInstrumentation() {

    $A.installOverride("Event.fire", _unStrictApis2.default.OnEventFire.bind($Aura, output));

    function output(data) {
        var componentToJSON = $A.Component.prototype.toJSON;
        delete $A.Component.prototype.toJSON;

        var json = _JsonSerializer2.default.stringify(data, function (key, value) {
            if ($A.util.isComponent(value)) {
                return "[Component] {" + value.getGlobalId() + "}";
            } else if (value instanceof Function) {
                return value + "";
            }
            return value;
        });

        $A.Component.prototype.toJSON = componentToJSON;

        return json;
    }
}

function bootstrapTransactionReporting() {
    $A.metricsService.enablePlugins();

    $A.metricsService.transactionStart("AuraInspector", "transactionstab");

    $A.metricsService.onTransactionEnd(function (transaction) {
        setTimeout(() => {
            $Aura.Inspector.publish("AuraInspector:OnTransactionEnd", transaction);
        }, 0);
    });

    $A.metricsService.onTransactionsKilled(function (transactions) {
        if (transactions) {
            for (var c = 0; c < transactions.length; c++) {
                if (transactions[c].id === "AuraInspector:transactionstab") {
                    $A.metricsService.transactionStart("AuraInspector", "transactionstab");
                }
            }
        }
    });
}

function bootstrapPerfDevTools() {
    $A.PerfDevToolsEnabled = true;

    var OPTIONS = {
        componentCreation: true,
        componentRendering: true,
        timelineMarks: false,
        transactions: true
    },
        CMP_CREATE_MARK = 'componentCreation',
        START_SUFIX = 'Start',
        END_SUFIX = 'End',
        CMP_CREATE_END = CMP_CREATE_MARK + END_SUFIX,
        SAMPLING_INTERVAL = 0.025;

    $A.PerfDevTools = {
        init: function (cfg) {
            cfg || (cfg = {});
            this._initializeOptions(cfg);
            this._hooks = {};
            this.collector = {
                componentCreation: [],
                rendering: []
            };
            this._initializeHooks();
        },
        clearMarks: function (marks) {
            this._resetCollector(marks);
        },
        _initializeOptions: function (cfg) {
            this.opts = {
                componentCreation: cfg.componentCreation || OPTIONS.componentCreation,
                componentRendering: cfg.componentRendering || OPTIONS.componentRendering,
                timelineMarks: typeof cfg.timelineMarks === 'boolean' ? cfg.timelineMarks : OPTIONS.timelineMarks,
                transactions: cfg.transactions || OPTIONS.transactions
            };
        },
        _initializeHooks: function () {
            if (this.opts.componentCreation /* && $A.getContext().mode !== 'PROD'*/) {
                    this._initializeHooksComponentCreation();
                }
        },
        _createNode: function (name, mark, id) {
            return {
                id: id,
                mark: mark,
                name: name,
                timestamp: window.performance.now()
            };
        },
        _resetCollector: function (type) {
            if (type) {
                this.collector[type] = [];
                return;
            }

            for (var i in this.collector) {
                this.collector[i] = [];
            }
        },
        _initializeHooksComponentCreation: function () {
            this._hookOverride("ComponentService.createComponentPriv", CMP_CREATE_MARK);
        },
        getComponentCreationProfile: function () {
            return this._generateCPUProfilerDataFromMarks(this.collector.componentCreation);
        },
        _hookOverride: function (key, mark) {
            $A.installOverride(key, function () {
                var config = Array.prototype.shift.apply(arguments);
                var args = Array.prototype.slice.apply(arguments);
                var cmpConfig = arguments[0];
                var callback = arguments[1];
                var descriptor = $A.util.isString(cmpConfig) ? cmpConfig : (cmpConfig["componentDef"]["descriptor"] || cmpConfig["componentDef"]) + '';

                var collector = this.collector[mark];
                collector.push(this._createNode(descriptor, mark + START_SUFIX));

                // When there is a callback, no return value is provided.
                // The return value is passed to the callback in this case. 
                if (typeof callback === "function") {
                    args[1] = (newCmp, status, message) => {
                        if (newCmp) {
                            var id = newCmp.getGlobalId && newCmp.getGlobalId() || "([ids])";
                            collector.push(this._createNode(descriptor, mark + END_SUFIX, id));
                        }
                        callback(newCmp, status, message);
                    };
                }

                var ret = config["fn"].apply(config["scope"], args);

                if (ret !== undefined) {
                    var id = ret.getGlobalId && ret.getGlobalId() || "([ids])";
                    collector.push(this._createNode(descriptor, mark + END_SUFIX, id));
                }
                return ret;
            }.bind(this), this);
        },
        _hookMethod: function (host, methodName, mark) {
            var self = this;
            var hook = host[methodName];
            var collector = this.collector[mark];

            this._hooks[methodName] = hook;
            host[methodName] = function (config) {
                if (Array.isArray(config)) {
                    return hook.apply(this, arguments);
                }

                var descriptor = (config.componentDef.descriptor || config.componentDef) + '',
                    collector = self.collector[mark];

                // Add mark
                collector.push(self._createNode(descriptor, mark + START_SUFIX));

                // Hook!
                var result = hook.apply(this, arguments);
                var id = result.getGlobalId && result.getGlobalId() || '([ids])';

                // End mark
                collector.push(self._createNode(descriptor, mark + END_SUFIX, id));
                return result;
            };
        },
        _generateCPUProfilerDataFromMarks: function (marks) {
            if (!marks || !marks.length) {
                return {};
            }

            //global stuff for the id
            var id = 0;
            function nextId() {
                return ++id;
            }
            function logTree(stack, mark) {
                // UNCOMMENT THIS FOR DEBUGGING PURPOSES:
                // var d = '||| ';
                // console.log(Array.apply(0, Array(stack)).map(function(){return d;}).join(''), mark);
            }

            function hashCode(name) {
                var hash = 0,
                    i,
                    chr,
                    len;
                if (name.length == 0) return hash;
                for (i = 0, len = name.length; i < len; i++) {
                    chr = name.charCodeAt(i);
                    hash = (hash << 5) - hash + chr;
                    hash |= 0; // Convert to 32bit integer
                }
                return Math.abs(hash);
            }

            function generateNode(name, options) {
                options || (options = {});
                return {
                    functionName: name || "Random." + Math.random(),
                    scriptId: "3",
                    url: options.details || "",
                    lineNumber: 0,
                    columnNumber: 0,
                    hitCount: options.hit || 0,
                    callUID: hashCode(name),
                    children: [],
                    deoptReason: "",
                    id: nextId()
                };
            }

            var endText = CMP_CREATE_END,
                startTime = marks[0].timestamp,
                // Get from first and last mark
            endTime = marks[marks.length - 1].timestamp,
                markLength = marks.length,
                duration = endTime - startTime,
                sampling = SAMPLING_INTERVAL,
                root = generateNode("(root)"),
                idle = generateNode("(idle)"),
                current = generateNode(marks[0].name),
                stack = [current, root];

            current._startTime = marks[0].timestamp;

            function generateTimestamps(startTime, endTime) {
                var diff = endTime - startTime,
                    ticks = Math.round(diff / sampling),
                    // every N miliseconds
                time = startTime,
                    ts = [time];

                for (var i = 1; i < ticks; i++) {
                    time += sampling;
                    ts.push(time);
                }
                return ts;
            }

            function generateSamples(root, size, idle) {
                var samples = new Array(size).join("," + idle.id).split(idle.id);
                samples[0] = idle.id;
                var currentIndex = 0;
                var idleHits = 0;

                function calculateTimesForNode(node) {
                    if (node._idleHits) {
                        currentIndex += node._idleHits;
                        idleHits += node._idleHits;
                    }

                    for (var i = 0; i < node.hitCount; i++) {
                        samples[currentIndex + i] = node.id;
                    }
                    currentIndex += node.hitCount;

                    for (var j = 0; j < node.children.length; j++) {
                        calculateTimesForNode(node.children[j]);
                    }
                }
                calculateTimesForNode(root, root.id);
                idle.hitCount = Math.max(0, size - currentIndex + idleHits); //update idle with remaining hits
                return samples;
            }

            logTree(stack.length - 1, 'open: ' + marks[0].name);
            for (var i = 1; i < markLength; i++) {
                var tmp = marks[i];
                if (stack[0].functionName === tmp.name && tmp.mark === endText) {
                    var tmpNode = stack.shift();
                    tmpNode._endTime = tmp.timestamp;
                    tmpNode._totalTime = tmpNode._endTime - tmpNode._startTime;
                    tmpNode._childrenTime = tmpNode.children.reduce(function (p, c) {
                        return p + c._totalTime;
                    }, 0);
                    tmpNode._selfTime = tmpNode._totalTime - tmpNode._childrenTime;
                    tmpNode.hitCount = Math.floor(tmpNode._selfTime / sampling);
                    tmpNode._cmpId = tmp.id;
                    tmpNode._childComponentCount += tmpNode.children.length;

                    //push into the parent
                    stack[0].children.push(tmpNode);
                    stack[0]._childComponentCount += tmpNode._childComponentCount;
                    logTree(stack.length, 'close: ' + tmp.name + ' selfTime: ' + tmpNode._selfTime.toFixed(4) + '| totalTime: ' + tmpNode._totalTime.toFixed(4));
                } else {

                    current = generateNode(tmp.name);
                    current._startTime = tmp.timestamp;
                    current._childComponentCount = 0;
                    if (stack.length === 1 && markLength - i > 1) {
                        current._idleHits = Math.floor((tmp.timestamp - marks[i - 1].timestamp) / sampling);
                    }

                    stack.unshift(current);
                    logTree(stack.length - 1, 'open: ' + tmp.name);
                }
            }
            root.children.push(idle);
            var timestamp = generateTimestamps(startTime, endTime);
            var samples = generateSamples(root, timestamp.length, idle);

            return {
                head: root,
                startTime: startTime / 1000,
                endTime: endTime / 1000,
                timestamp: timestamp,
                samples: samples
            };
        }
    };
};

/***/ }),

/***/ "./src/aura/ControlCharacters.js":
/*!***************************************!*\
  !*** ./src/aura/ControlCharacters.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
const ControlCharacters = {
    "COMPONENT_CONTROL_CHAR": "\u263A", // ☺ - This value is a component Global Id
    "ACTION_CONTROL_CHAR": "\u2744", // ❄ - This is an action
    "ESCAPE_CHAR": "\u2353", // ⍓ This value was escaped, unescape before using.
    //"UNDEFINED_CHAR" : "\u2349", // ⍉ Was literally undefined,
    //"NULL_CHAR": "\u2400", // ␀Was literally null

    isComponentId(id) {
        return typeof id == "string" && id.startsWith(ControlCharacters.COMPONENT_CONTROL_CHAR);
    },

    isActionId(id) {
        return typeof id == "string" && id.startsWith(ControlCharacters.ACTION_CONTROL_CHAR);
    },

    getCleanId(id) {
        if (typeof id !== "string") {
            return id;
        }
        if (this.isComponentId(id) || this.isActionId(id) || id.substring(0, 1) == ControlCharacters.ESCAPE_CHAR) {
            return id.substring(1);
        }
        return id;
    }

};

Object.freeze(ControlCharacters);

exports.default = ControlCharacters;

/***/ }),

/***/ "./src/aura/JsonSerializer.js":
/*!************************************!*\
  !*** ./src/aura/JsonSerializer.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ControlCharacters = __webpack_require__(/*! ./ControlCharacters.js */ "./src/aura/ControlCharacters.js");

var _ControlCharacters2 = _interopRequireDefault(_ControlCharacters);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let increment = 1;

class JsonSerializer {
    /**
     * Safe because it handles circular references in the data structure.
     *
     * Will add control characters and shorten components to just their global ids.
     * Formats DOM elements in a pretty manner.
     */
    static stringify(originalValue) {
        // For circular dependency checks
        var doNotSerialize = {
            "[object Window]": true,
            "[object global]": true,
            "__proto__": null
        };
        var visited = new Set();
        var toJSONCmp = $A.Component.prototype.toJSON;
        delete $A.Component.prototype.toJSON;
        var result = "{}";
        try {
            result = JSON.stringify(originalValue, function (key, value) {
                if (value === document) {
                    return {};
                }
                if (Array.isArray(this) || key) {
                    value = this[key];
                }
                if (!value) {
                    return value;
                }

                if (typeof value === "string" && (value.startsWith(_ControlCharacters2.default.COMPONENT_CONTROL_CHAR) || value.startsWith(_ControlCharacters2.default.ACTION_CONTROL_CHAR))) {
                    return _ControlCharacters2.default.ESCAPE_CHAR + escape(value);
                }

                if (value instanceof Error) {
                    return value + "";
                }

                if (value instanceof HTMLElement) {
                    var attributes = value.attributes;
                    var domOutput = [];
                    for (var c = 0, length = attributes.length, attribute; c < length; c++) {
                        attribute = attributes.item(c);
                        domOutput.push(attribute.name + '="' + attribute.value + '"');
                    }
                    return `<${value.tagName} ${domOutput.join(' ')}>`; // Serialize it specially.
                }

                if (value instanceof Text) {
                    return value.nodeValue;
                }

                // TODO: Consider handling invalid components differently.
                if ($A.util.isComponent(value)) {
                    if (value.isValid()) {
                        return _ControlCharacters2.default.COMPONENT_CONTROL_CHAR + value.getGlobalId();
                    } else {
                        return value.toString();
                    }
                }

                if ($A.util.isExpression(value)) {
                    return value.toString();
                }

                if ($A.util.isAction(value)) {
                    return _ControlCharacters2.default.ACTION_CONTROL_CHAR + value.getDef().toString();
                }

                if (Array.isArray(value)) {
                    return value.slice();
                }

                if (typeof value === "object") {
                    if ("$serId$" in value && visited.has(value)) {
                        return {
                            "$serRefId$": value["$serId$"],
                            "__proto__": null
                        };
                    } else if (doNotSerialize[Object.prototype.toString.call(value)]) {
                        value = {};
                    } else if (!Object.isSealed(value) && !$A.util.isEmpty(value)) {
                        visited.add(value);
                        value.$serId$ = increment++;
                    }
                }

                if (typeof value === "function") {
                    return value.toString();
                }

                return value;
            });
        } catch (e) {
            console.error("AuraInspector: Error serializing object to json.", e);
        }

        visited.forEach(function (item) {
            if ("$serId$" in item) {
                delete item["$serId$"];
            }
        });

        $A.Component.prototype.toJSON = toJSONCmp;

        return result;
    }

    /** 
     * 
     */
    static parse(json) {
        if (json === undefined || json === null) {
            return json;
        }

        return resolve(JSON.parse(json));
    }
}

exports.default = JsonSerializer; /**
                                   * TODO: When to use this
                                   */

function resolve(object) {
    if (!object) {
        return object;
    }

    var count = 0;
    var serializationMap = new Map();
    var unresolvedReferences = [];

    function innerResolve(current, parent, property) {
        if (!current) {
            return current;
        }
        if (typeof current === "object") {
            if (current.hasOwnProperty("$serRefId$")) {
                if (serializationMap.has(current["$serRefId$"])) {
                    return serializationMap.get(current["$serRefId$"]);
                } else {
                    // Probably Out of order, so we'll do it after scanning the entire tree
                    unresolvedReferences.push({ parent: parent, property: property, $serRefId$: current["$serRefId$"] });
                    return current;
                }
            }

            if (current.hasOwnProperty("$serId$")) {
                serializationMap.set(current["$serId$"], current);
                delete current["$serId$"];
            }

            for (var property in current) {
                if (current.hasOwnProperty(property)) {
                    if (typeof current[property] === "object") {
                        current[property] = innerResolve(current[property], current, property);
                    }
                }
            }
        }
        return current;
    }

    object = innerResolve(object);

    // If we had some resolutions out of order, lets clean those up now that we've parsed everything that is serialized.
    var unresolved;
    for (var c = 0, length = unresolvedReferences.length; c < length; c++) {
        unresolved = unresolvedReferences[c];
        unresolved.parent[unresolved.property] = serializationMap.get(unresolved["$serRefId$"]);
    }

    return object;
}

/***/ }),

/***/ "./src/aura/gatherer/ComponentSerializer.js":
/*!**************************************************!*\
  !*** ./src/aura/gatherer/ComponentSerializer.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _JsonSerializer = __webpack_require__(/*! ../JsonSerializer.js */ "./src/aura/JsonSerializer.js");

var _JsonSerializer2 = _interopRequireDefault(_JsonSerializer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ComponentSerializer {

    /**
     * Get all the top level elements.
     * This obviously includes $A.getRoot(), but for Lightning Out that is empty.
     * So we also include all the Disconnected components attached to dom elements.
     */
    static getRootComponents() {
        var topLevelDomNodes = null;
        var rootNodes = [];
        try {
            var app = $A.getRoot();
            rootNodes.push({
                "id": app.getGlobalId(),
                "components": [this.getComponent(app.getGlobalId())]
            });

            if (app.isInstanceOf("ltng:outApp")) {
                topLevelDomNodes = document.querySelectorAll("[data-ltngout-rendered-by]");

                var map = {};
                var parentNodes = [];

                topLevelDomNodes.forEach(node => {
                    const id = node.getAttribute("data-ltngout-rendered-by");
                    const component = $A.getComponent(id);

                    rootNodes.push({
                        "dom": node,
                        "id": "data-ltngout-rendered-by$" + id,
                        "components": [this.getComponent(id, { "body": false })]
                    });
                });
            }
        } catch (e) {}

        return _JsonSerializer2.default.stringify(rootNodes);
    }

    static bootStrapInjectedAPI() {
        // This api is added by us in an override. If it's not there when we try to serialize a component we'll have issues.
        // So if its not there, just run the bootstrap code.
        if ($A.componentService.getSelfGlobalId) {
            return;
        }

        // Will exist in one scenario (when running the old version)
        if (!("_$getSelfGlobalId$" in component)) {
            // Adds the _$getSelfGlobalId$ to Component prototype
            try {
                $A.installOverride("outputComponent", function () {});
                $A.componentService.getSelfGlobalId = function (component) {
                    if (component == null) {
                        return null;
                    }
                    if (component._$getSelfGlobalId$) {
                        return component._$getSelfGlobalId$();
                    }
                };
                $A.componentService.getAttributeExpression = function (component, key) {
                    if (component !== undefined && $A.util.isComponent(component)) {
                        var value = component._$getRawValue$(key);
                        if ($A.util.isExpression(value)) {
                            return value.toString();
                        }
                    }
                    return null;
                };
            } catch (e) {}
        }
    }

    static getComponent(componentId, options) {
        var component = $A.util.isComponent(componentId) ? componentId : $A.getComponent(componentId);
        var configuration = Object.assign({
            "attributes": true, // True to serialize the attributes, if you just want the body you can set this to false and body to true. (Good for serializing supers)
            "body": true, // Serialize the Body? This can be expensive so you can turn it off.
            "elementCount": false, // Count all child elements of all the elements associated to a component.
            "model": false, // Serialize the model data as well
            "valueProviders": false, // Should we serialize the attribute and facet value providers to the output? Could be a little slow now since we serialize passthrough value keys which could be big objects.
            "handlers": false // Do we serialize the event handlers this component is subscribed to?
        }, options);
        if (component) {
            // TODO: Consider removing this, will no longer gack.
            if (!component.isValid()) {
                return JSON.stringify({
                    "valid": false,
                    "__proto__": null // no inherited properties
                });
            } else {
                ComponentSerializer.bootStrapInjectedAPI();
                var isTypeModule = isModule(component);
                var output = {
                    "descriptor": component.getDef().getDescriptor().toString(),
                    "globalId": $A.componentService.getSelfGlobalId(component),
                    "rendered": component.isRendered(),
                    "isConcrete": component.isConcrete(),
                    "valid": component.isValid(),
                    "expressions": {},
                    "attributes": {},
                    "__proto__": null, // no inherited properties
                    "elementCount": 0,
                    // TODO: Implement properly or remove.
                    "rerender_count": 0, //this.getCount($A.componentService.getSelfGlobalId(component) + "_rerendered")
                    "isModule": isTypeModule

                    // Added Later
                    //,"super": ""
                    //,"model": null
                };

                if (!isTypeModule) {
                    // Throws an exception when used on an InteropComponent
                    output["localId"] = component.getLocalId();
                }

                // VALUE PROVIDERS
                if (configuration.valueProviders) {
                    output["attributeValueProvider"] = getValueProvider(component.getAttributeValueProvider());
                    output["facetValueProvider"] = getValueProvider(component.getComponentValueProvider());
                }

                // ATTRIBUTES
                if (!isTypeModule && configuration.attributes) {
                    var auraError = $A.error;
                    var attributes = component.getDef().getAttributeDefs();

                    try {
                        // The Aura Inspector isn't special, it doesn't
                        // have access to the value if the access check
                        // system prevents it. So we should notify we
                        // do not have access.
                        var accessCheckFailed;

                        // Track Access Check failure on attribute access
                        $A.error = function (message, error) {
                            if (message.indexOf("Access Check Failed!") === 0) {
                                accessCheckFailed = true;
                            }
                        };

                        attributes.each(function (attributeDef) {
                            var key = attributeDef.getDescriptor().getName();
                            var value;
                            var expression;
                            accessCheckFailed = false;

                            // BODY
                            // If we don't want the body serialized, skip it.
                            // We would only want the body if we are going to show
                            // the components children.
                            if (key === "body" && !configuration.body) {
                                return;
                            }
                            try {
                                expression = $A.componentService.getAttributeExpression(component, key);
                                value = component.get("v." + key);
                            } catch (e) {
                                value = undefined;
                            }
                            if (value === undefined || value === null) {
                                value = value + "";
                            }
                            output.attributes[key] = accessCheckFailed ? "[ACCESS CHECK FAILED]" : value;

                            if (expression !== null) {
                                output.expressions[key] = expression;
                            }
                        }.bind(this));
                    } catch (e) {
                        console.error(e);
                    } finally {
                        $A.error = auraError;
                    }
                }
                // BODY
                else if (configuration.body) {
                        var expression = [];
                        var value = new Map();

                        var supers = [];
                        var selfAndSupers = [component];
                        var superComponent = component;
                        while (superComponent = superComponent.getSuper()) {
                            selfAndSupers.push(superComponent);
                            supers.push($A.componentService.getSelfGlobalId(superComponent));
                        }
                        if (supers.length) {
                            output["supers"] = supers;
                        }

                        try {
                            // globalId or localId or component.id?
                            expression.push({
                                id: $A.componentService.getSelfGlobalId(component),
                                value: $A.componentService.getAttributeExpression(component, key)
                            });
                            value = selfAndSupers.map(component => component.id, component.get("v.body"));
                        } catch (e) {
                            value = undefined;
                        }
                        if (value === undefined || value === null) {
                            value = value + "";
                        }
                        output.attributes[key] = value;

                        if (expression !== null) {
                            output.expressions[key] = expression;
                        }
                    }

                // ELEMENT COUNT
                // Concrete is the only one with elements really, so doing it at the super
                // level is duplicate work.
                if (component.isConcrete() && configuration.elementCount) {
                    var elements = component.getElements() || [];
                    var elementCount = 0;
                    for (var c = 0, length = elements.length; c < length; c++) {
                        if (elements[c] instanceof HTMLElement) {
                            // Its child components, plus itself.
                            elementCount += elements[c].getElementsByTagName("*").length + 1;
                        }
                    }
                    output.elementCount = elementCount;
                }

                // MODEL
                if (configuration.model) {
                    var model = component.getModel();
                    if (model) {
                        output["model"] = model.data;
                    }
                }

                // HANDLERS
                if (configuration.handlers) {
                    var handlers = {};
                    var events = component.getEventDispatcher();
                    var current;
                    var apiSupported = true; // 204+ only. Don't want to error in 202. Should remove this little conditional in 204 after R2.
                    for (var eventName in events) {
                        current = events[eventName];
                        if (Array.isArray(current) && current.length && apiSupported) {
                            handlers[eventName] = [];
                            for (var c = 0; c < current.length; c++) {
                                if (!current[c].hasOwnProperty("actionExpression")) {
                                    apiSupported = false;
                                    break;
                                }
                                handlers[eventName][c] = {
                                    "expression": current[c]["actionExpression"],
                                    "valueProvider": getValueProvider(current[c]["valueProvider"])
                                };
                            }
                        }
                    }
                    if (apiSupported) {
                        output["handlers"] = handlers;
                    }
                }

                // Output to the dev tools
                return _JsonSerializer2.default.stringify(output);
            }
        }
        return "";
    }
}

exports.default = ComponentSerializer; /** Serializing Passthrough Values as valueProviders is a bit complex, so we have this helper function to do it. */

function getValueProvider(valueProvider) {
    if ($A.componentService.getSelfGlobalId(valueProvider) !== null) {
        return $A.componentService.getSelfGlobalId(valueProvider);
    }

    // Probably a passthrough value
    const output = {
        // Can't do providers yet since we don't have a way to get access to them.
        // We should though, it would be great to see in the inspector.
        //"providers": safeStringify()
        $type$: "passthrough"
    };

    if ('getPrimaryProviderKeys' in valueProvider) {
        const values = {};
        let value;
        let keys;
        let provider = valueProvider;
        while (provider && !("getGlobalId" in provider)) {
            keys = provider.getPrimaryProviderKeys();
            for (var c = 0; c < keys.length; c++) {
                let key = keys[c];
                if (!values.hasOwnProperty(key)) {
                    value = provider.get(key);
                    if ($A.util.isComponent(value)) {
                        values[key] = {
                            "id": value
                        };
                    } else {
                        values[key] = value;
                    }
                }
            }
            provider = provider.getComponent();
        }
        if (provider && "getGlobalId" in provider) {
            output["globalId"] = $A.componentService.getSelfGlobalId(provider);
        }
        output["values"] = values;
    } else {
        while (!("getGlobalId" in valueProvider)) {
            valueProvider = valueProvider.getComponent();
        }
        output["globalId"] = $A.componentService.getSelfGlobalId(valueProvider);
    }

    return output;
}

// This is temporary till we can add the data-ltngout-rendered-by attribute.
function getComponentForLtngOut(components) {
    if (!components.length) {
        return;
    }
    let owner = components[0].getOwner();
    while (!owner.getOwner().isInstanceOf("aura:application") && owner.getOwner() !== owner) {
        owner = owner.getOwner();
    }
    return owner;
}

function isModule(component) {
    if (!component) {
        return false;
    }

    const toString = component.toString();

    return toString === "InteropComponent" || toString.startsWith("InteropComponent:");
}

/***/ }),

/***/ "./src/aura/gatherer/unStrictApis.js":
/*!*******************************************!*\
  !*** ./src/aura/gatherer/unStrictApis.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/** 
 * This file is included in the InjectedScript, but is not run through the es2015 transform. 
 * So all this code is not included in a use_strict directive, or transpiled.
 */

/** Doesn't work when used with use_strict */
exports.OnEventFire = function OnEventFire(output, config, params) {
    var startTime = performance.now();
    var eventId = "event_" + startTime;
    var data = {
        "id": eventId
    };

    this.Inspector.publish("AuraInspector:OnEventStart", data);

    var ret = config["fn"].call(config["scope"], params);

    var event = config["scope"];
    var source = event.getSource();

    data = {
        "id": eventId,
        "name": event.getDef().getDescriptor().getQualifiedName(),
        "parameters": output(event.getParams()),
        "sourceId": source ? source.getGlobalId() : "",
        "startTime": startTime,
        "endTime": performance.now(),
        "type": event.getDef().getEventType()
    };

    // Having troubles with this in strict mode.
    // Should probably either remove this, or disable the use strict.
    try {
        data["caller"] = arguments.callee.caller.caller.caller+"";
    } catch(e) {}

    this.Inspector.publish("AuraInspector:OnEventEnd", data);

    return ret;
}

/***/ }),

/***/ 15:
/*!*******************************************************************************************!*\
  !*** multi ./src/LightningInspectorInjectedScript.js ./src/aura/gatherer/unStrictApis.js ***!
  \*******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ./src/LightningInspectorInjectedScript.js */"./src/LightningInspectorInjectedScript.js");
module.exports = __webpack_require__(/*! ./src/aura/gatherer/unStrictApis.js */"./src/aura/gatherer/unStrictApis.js");


/***/ })

/******/ });
//# sourceMappingURL=LightningInspectorInjectedScript.js.map