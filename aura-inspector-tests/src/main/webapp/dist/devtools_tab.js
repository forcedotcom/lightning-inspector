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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/aura/viewer/BrowserApi.js":
/*!***************************************!*\
  !*** ./src/aura/viewer/BrowserApi.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Interact with the Browser Extensions API
 * Abstracted so we can normalize browser API differences in the WebExtensions protocol and chrome.
 */
class BrowserApi {
    static eval(command) {
        return new Promise((resolve, reject) => {
            getBrowserApi().devtools.inspectedWindow.eval(command, function (returnValue, exceptionInfo) {
                if (exceptionInfo) {
                    reject(exceptionInfo);
                }
                resolve(returnValue);
            });
        });
    }
}

exports.default = BrowserApi;
function getBrowserApi() {
    if (typeof browser !== "undefined") {
        return browser;
    }
    return chrome;
}

/***/ }),

/***/ "./src/devtools.js":
/*!*************************!*\
  !*** ./src/devtools.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _BrowserApi = __webpack_require__(/*! ./aura/viewer/BrowserApi.js */ "./src/aura/viewer/BrowserApi.js");

var _BrowserApi2 = _interopRequireDefault(_BrowserApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Detect if we are inspecting anything other than a DevTools Window
chrome.devtools.inspectedWindow.eval("location.protocol", loadDevtools); //chrome.devtools.inspectedWindow.eval("!!window[Symbol.for('AuraDevTools')] && !!window.$A", function(isAuraPresent){


function loadDevtools(protocol) {
    var isDevTools = protocol === "chrome-devtools:";

    // So we don't include Aura when inspecting an Inspector
    if (!isDevTools) {
        chrome.devtools.panels.create(chrome.i18n.getMessage("devtools_tabname"), "icon24.png", "viewerPanel.html", function ( /*ExtensionPanel*/panel) {

            // Test button, not sure what to do with this.
            // var button = panel.createStatusBarButton("images/icon24.png", "Test", false);
            // button.onClicked.addListener(function(){
            //     alert("Clicked");
            // });
            //
            // Implement Search!
            panel.onSearch.addListener(function (action, queryString) {
                // TODO: Abstract the Symbol.for() stuff? 
                // Maybe just InjectedScript.search(); ?
                _BrowserApi2.default.eval(`window[Symbol.for('AuraDevTools')].Inspector.search('${action}', '${queryString}')`);
            });
        });

        chrome.devtools.panels.elements.createSidebarPane(chrome.i18n.getMessage("devtools_tabname"), function (sidebar) {
            sidebar.setPage("viewerSidebar.html");
        });

        chrome.devtools.panels.elements.onSelectionChanged.addListener(function () {
            _BrowserApi2.default.eval("window.$A && this.$0 && $0.getAttribute && $0.getAttribute('data-aura-rendered-by')").then(function (globalId) {
                if (globalId) {
                    // Need to include undefined at the end, or devtools can't handle it internally.
                    // You'll see this error.
                    // "Extension server error: Inspector protocol error: Object has too long reference chain(must not be longer than 1000)"
                    var command = "$auraTemp = $A.getCmp('" + globalId + "'); undefined;";
                    _BrowserApi2.default.eval(command);
                }
            });
        });
    }
}

/***/ }),

/***/ 2:
/*!*******************************!*\
  !*** multi ./src/devtools.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./src/devtools.js */"./src/devtools.js");


/***/ })

/******/ });
//# sourceMappingURL=devtools_tab.js.map