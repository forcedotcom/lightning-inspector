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
/******/ 	return __webpack_require__(__webpack_require__.s = 9);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/devtoolsPanel/components/controllerreference/controllerreference.js":
/*!*********************************************************************************!*\
  !*** ./src/devtoolsPanel/components/controllerreference/controllerreference.js ***!
  \*********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function () {

    var ownerDocument = document.currentScript.ownerDocument;

    var controllerreference = Object.create(HTMLDivElement.prototype);

    controllerreference.createdCallback = function () {
        // Had two different modes, one that works on textContent, the other that works on expression, componentid combination
        var expression = this.getAttribute("expression");
        var componentid = this.getAttribute("component");

        if (expression && componentid) {
            var template = ownerDocument.querySelector("template");
            //console.log(template);

            var clone = document.importNode(template.content, true);

            clone.querySelector("aurainspector-auracomponent").setAttribute("globalId", componentid);

            var expression_element = clone.querySelector("#expression");
            expression_element.appendChild(document.createTextNode(expression));
            expression_element.addEventListener("click", ControllerReference_OnClick.bind(this));

            var shadowRoot = this.createShadowRoot();
            shadowRoot.appendChild(clone);
        } else {
            this.addEventListener("click", ControllerReference_OnClick.bind(this));
        }
    };

    function parse(reference) {
        if (!reference) {
            return null;
        }
        var parts = reference.split("$");
        return {
            "prefix": parts[0],
            "component": parts[1],
            "method": parts[3]
        };
    }

    function ControllerReference_OnClick(event) {
        var command;
        var reference = this.textContent;
        var expression = this.getAttribute("expression");
        if (reference && !expression) {
            var info = parse(reference);
            if (!info) {
                return;
            }

            command = `
                (function(definition) {
                    if(definition) {
                        inspect(definition.prototype.controller["${info.method}"]);
                    }
                })($A.componentService.getComponentClass("markup://${info.prefix}:${info.component}"))`;
            chrome.devtools.inspectedWindow.eval(command);
        } else if (expression) {
            // expression, component combination
            var expression = this.getAttribute("expression");
            var componentid = this.getAttribute("component");

            if (expression && componentid) {
                expression = expression.substring(4, expression.length - 1);
                command = `
                    (function(cmp){
                        if(!cmp){ return; }
                        var reference = cmp.controller["${expression}"];
                        if(reference) {
                            inspect(reference);
                        }
                    })($A.getComponent("${componentid}"));
                `;
                chrome.devtools.inspectedWindow.eval(command);
            }
        }
    }

    document.registerElement("aurainspector-controllerreference", {
        prototype: controllerreference
    });
})();

/***/ }),

/***/ 9:
/*!***************************************************************************************!*\
  !*** multi ./src/devtoolsPanel/components/controllerreference/controllerreference.js ***!
  \***************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./src/devtoolsPanel/components/controllerreference/controllerreference.js */"./src/devtoolsPanel/components/controllerreference/controllerreference.js");


/***/ })

/******/ });
//# sourceMappingURL=component-controllerreference.js.map