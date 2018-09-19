/* -------------------------------------------------- */
/*  Start of Webpack Chrome Hot Extension Middleware  */
/* ================================================== */
/*  This will be converted into a lodash templ., any  */
/*  external argument must be provided using it       */
/* -------------------------------------------------- */
(function (chrome, window) {
    var signals = JSON.parse('{"SIGN_CHANGE":"SIGN_CHANGE","SIGN_RELOAD":"SIGN_RELOAD","SIGN_RELOADED":"SIGN_RELOADED","SIGN_LOG":"SIGN_LOG","SIGN_CONNECT":"SIGN_CONNECT"}');
    var config = JSON.parse('{"RECONNECT_INTERVAL":2000,"SOCKET_ERR_CODE_REF":"https://tools.ietf.org/html/rfc6455#section-7.4.1"}');
    var reloadPage = "true" === "true";
    var wsHost = "ws://localhost:9090";
    var SIGN_CHANGE = signals.SIGN_CHANGE,
        SIGN_RELOAD = signals.SIGN_RELOAD,
        SIGN_RELOADED = signals.SIGN_RELOADED,
        SIGN_LOG = signals.SIGN_LOG,
        SIGN_CONNECT = signals.SIGN_CONNECT;
    var RECONNECT_INTERVAL = config.RECONNECT_INTERVAL,
        SOCKET_ERR_CODE_REF = config.SOCKET_ERR_CODE_REF;
    var runtime = chrome.runtime,
        tabs = chrome.tabs;

    var manifest = runtime.getManifest();
    var formatter = function formatter(msg) {
        return '[ WCER: ' + msg + ' ]';
    };
    var logger = function logger(msg) {
        var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "info";
        return console[level](formatter(msg));
    };
    var timeFormatter = function timeFormatter(date) {
        return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    };
    function contentScriptWorker() {
        runtime.sendMessage({ type: SIGN_CONNECT }, function (msg) {
            return console.info(msg);
        });
        runtime.onMessage.addListener(function (_ref) {
            var type = _ref.type,
                payload = _ref.payload;

            switch (type) {
                case SIGN_RELOAD:
                    logger("Detected Changes. Reloading ...");
                    reloadPage && window.location.reload();
                    break;
                case SIGN_LOG:
                    console.info(payload);
                    break;
            }
        });
    }
    function backgroundWorker(socket) {
        runtime.onMessage.addListener(function (action, sender, sendResponse) {
            if (action.type === SIGN_CONNECT) {
                sendResponse(formatter("Connected to Chrome Extension Hot Reloader"));
            }
        });
        socket.addEventListener("message", function (_ref2) {
            var data = _ref2.data;

            var _JSON$parse = JSON.parse(data),
                type = _JSON$parse.type,
                payload = _JSON$parse.payload;

            if (type === SIGN_CHANGE) {
                tabs.query({ status: "complete" }, function (loadedTabs) {
                    loadedTabs.forEach(function (tab) {
                        return tabs.sendMessage(tab.id, { type: SIGN_RELOAD });
                    });
                    socket.send(JSON.stringify({
                        type: SIGN_RELOADED,
                        payload: formatter(timeFormatter(new Date()) + ' - ' + manifest.name + ' successfully reloaded')
                    }));
                    runtime.reload();
                });
            } else {
                runtime.sendMessage({ type: type, payload: payload });
            }
        });
        socket.addEventListener("close", function (_ref3) {
            var code = _ref3.code;

            logger('Socket connection closed. Code ' + code + '. See more in ' + SOCKET_ERR_CODE_REF, "warn");
            var intId = setInterval(function () {
                logger("WEPR Attempting to reconnect ...");
                var ws = new WebSocket(wsHost);
                ws.addEventListener("open", function () {
                    clearInterval(intId);
                    logger("Reconnected. Reloading plugin");
                    runtime.reload();
                });
            }, RECONNECT_INTERVAL);
        });
    }
    runtime.reload ? backgroundWorker(new WebSocket(wsHost)) : contentScriptWorker();
})(chrome, window);
/* ----------------------------------------------- */
/* End of Webpack Chrome Hot Extension Middleware  */
/* ----------------------------------------------- *//******/ (function(modules) { // webpackBootstrap
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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ({

/***/ 2:
/*!******************************!*\
  !*** ./src/bg/background.js ***!
  \******************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

eval("// if you checked \"fancy-settings\" in extensionizr.com, uncomment this lines\n\n// var settings = new Store(\"settings\", {\n//     \"sample_setting\": \"This is how you use Store.js to remember values\"\n// });\n\n\n//example of using a message handler from the inject scripts\nchrome.extension.onMessage.addListener(\n  (request, sender, sendResponse)=> {\n    switch (request.msg) {\n      case \"pageActionState\":\n        if(request.value) {\n          chrome.pageAction.show(sender.tab.id);\n          console.log(\"Activating extension on\", sender.tab.url);\n        }\n        break;\n      default:\n        sendResponse();\n    }\n  }\n);\n\nchrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {\n  if (changeInfo.url) {\n    console.log('Tab %d got new URL: %s', tabId, changeInfo.url);\n    chrome.pageAction.hide(tabId);\n  }\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMi5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9iZy9iYWNrZ3JvdW5kLmpzPzYyOTEiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gaWYgeW91IGNoZWNrZWQgXCJmYW5jeS1zZXR0aW5nc1wiIGluIGV4dGVuc2lvbml6ci5jb20sIHVuY29tbWVudCB0aGlzIGxpbmVzXG5cbi8vIHZhciBzZXR0aW5ncyA9IG5ldyBTdG9yZShcInNldHRpbmdzXCIsIHtcbi8vICAgICBcInNhbXBsZV9zZXR0aW5nXCI6IFwiVGhpcyBpcyBob3cgeW91IHVzZSBTdG9yZS5qcyB0byByZW1lbWJlciB2YWx1ZXNcIlxuLy8gfSk7XG5cblxuLy9leGFtcGxlIG9mIHVzaW5nIGEgbWVzc2FnZSBoYW5kbGVyIGZyb20gdGhlIGluamVjdCBzY3JpcHRzXG5jaHJvbWUuZXh0ZW5zaW9uLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihcbiAgKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKT0+IHtcbiAgICBzd2l0Y2ggKHJlcXVlc3QubXNnKSB7XG4gICAgICBjYXNlIFwicGFnZUFjdGlvblN0YXRlXCI6XG4gICAgICAgIGlmKHJlcXVlc3QudmFsdWUpIHtcbiAgICAgICAgICBjaHJvbWUucGFnZUFjdGlvbi5zaG93KHNlbmRlci50YWIuaWQpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiQWN0aXZhdGluZyBleHRlbnNpb24gb25cIiwgc2VuZGVyLnRhYi51cmwpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgc2VuZFJlc3BvbnNlKCk7XG4gICAgfVxuICB9XG4pO1xuXG5jaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoKHRhYklkLCBjaGFuZ2VJbmZvLCB0YWIpID0+IHtcbiAgaWYgKGNoYW5nZUluZm8udXJsKSB7XG4gICAgY29uc29sZS5sb2coJ1RhYiAlZCBnb3QgbmV3IFVSTDogJXMnLCB0YWJJZCwgY2hhbmdlSW5mby51cmwpO1xuICAgIGNocm9tZS5wYWdlQWN0aW9uLmhpZGUodGFiSWQpO1xuICB9XG59KTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2JnL2JhY2tncm91bmQuanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAyIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOyIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///2\n");

/***/ })

/******/ });