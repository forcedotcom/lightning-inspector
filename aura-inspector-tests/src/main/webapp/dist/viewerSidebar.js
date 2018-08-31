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

/***/ "./node_modules/css-loader/index.js!./src/devtoolsPanel/devtoolsPanel.css":
/*!***********************************************************************!*\
  !*** ./node_modules/css-loader!./src/devtoolsPanel/devtoolsPanel.css ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../../node_modules/css-loader/lib/css-base.js */ "./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "/**\n * Ideally we would be entirely based on SLDS.\n * Investigate what would be required for that to happen. \n */\n\nhtml {\n  color: rgb(22, 50, 92);\n  font-family: 'Lucida Grande', sans-serif;\n}\nbody, form, ul, li, p, h1, h2, h3, h4, h5 { margin: 0; padding: 0; }\nh1{\n  font-weight: normal;\n  font-size: 0.75rem;\n  line-height: 1.25;\n}\nbody { background-color: #fefefe; color: #111; margin: 0; display: flex; flex-direction: column; height: 100%; }\nimg { border: none; }\np { font-size: 1em; margin: 0 0 1em 0; }\ninput, select, textarea, th, td { font-size: 12px; }\na {\n  color: #0070D2;\n  text-decoration: none;\n}\na:active {\n  color: #00396b;\n}\na:focus {\n  outline: #0070D2;\n  text-decoration: underline;\n}\na:hover {\n  color: #005fb2;\n  text-decoration: underline;\n}\nsection > h1 {\n  background: #f4f6f9;\n  color: #54698d;\n  letter-spacing: 0.0625em;\n  margin: .5rem 0 0 0;\n  padding: 0.75rem 1rem;\n  text-transform: uppercase;\n}\nsection.dark > h1 {\n  background: #eef1f6;\n  color: #54698d;\n}\n.label {\n  color: #54698d;\n  flex: 0 0 auto;\n  font-size: 0.75rem;\n  line-height: 1.5;\n  vertical-align: top;\n  display: block;\n}\ntextarea, input {\n  background-color: #fff;\n  color: #16325c;\n  border: 1px solid #d8dde6;\n  border-radius: .25rem;\n  width: 100%;\n  transition: border .1s linear,background-color .1s linear;\n  display: inline-block;\n  resize: vertical;\n  padding: .5rem .75rem;\n}\n\n.card{\n  background-color: #ffffff;\n  border: 1px solid #e0e5ee;\n  border-radius: .25rem;\n  display: block;\n}\n\nbutton {\n  /*.slds-button {*/\n  position: relative;\n  display: inline-block;\n  padding: 0;\n  background-clip: padding-box;\n  border-radius: 0.25rem;\n  color: #0070d2;\n  font-size: inherit;\n  text-decoration: none;\n  -webkit-appearance: none;\n  white-space: normal;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  -webkit-transition: color 0.05s linear, background-color 0.05s linear;\n  transition: color 0.05s linear, background-color 0.05s linear;\n  /*}*/\n}\nbutton:focus {\n  outline: 0;\n  box-shadow: 0 0 3px #0070D2;\n}\nbutton.text-button{\n  /*.slds-button--x-small {*/\n  line-height: 1.25rem;\n  min-height: 1.25rem;\n  /*}*/\n  /*.slds-button--neutral {*/\n  padding-left: 1rem;\n  padding-right: 1rem;\n  text-align: center;\n  vertical-align: middle;\n  border: 1px solid #d8dde6;\n  background-color: white;\n  /*}*/\n}\nbutton.text-button:hover,\nbutton.text-button:focus {\n  background-color: #f4f6f9;\n  color: #005fb2;\n}\nbutton.text-button:active {\n  background-color: #eef1f6;\n  color: #00396b;\n}\nbutton[disabled].text-button {\n  background-color: white;\n  cursor: default;\n}\nbutton.button--brand {\n    /*.slds-button--x-small {*/\n    line-height: 1.25rem;\n    min-height: 1.25rem;\n    /*}*/\n    padding-left: 1rem;\n    padding-right: 1rem;\n    text-align: center;\n    vertical-align: middle;\n    background-color: #0070d2;\n    border: 1px solid #0070d2;\n    color: #fff;\n}\nbutton.button--brand:active {\n    background-color: #00396b;\n}\n\nbutton.button--brand:focus, button.button--brand:hover {\n    background-color: #005fb2;\n    color: #fff;\n}\n\n.refresh-toolbar-item .glyph {\n    -webkit-mask-position: 0 0;\n}\n.toolbar-item > .glyph {\n    position: relative;\n    left: -3px;\n}\nbutton#clear-button {\n  left: -5px;\n}\nheader.tabs {\n  background: #F0F1F2;\n  box-shadow: 0 1px 0 #e0e5ee;\n  padding: 0 3em 0 1em;\n  position: relative;\n}\nheader.tabs button {\n  background: transparent;\n  border: 1px solid transparent;\n  border-radius: 0;\n  color: #000;\n  margin: .6em .2em -1px .2em;\n  padding: 2px 6px 3px 6px;\n  cursor: pointer;\n}\nheader.tabs button:hover {\n  border: 1px solid #DADEE2;\n  background: #F5F6F7;\n  margin-bottom: -1px;\n}\nheader.tabs button:focus {\n  outline: 1px solid #FF9F05;\n}\nheader.tabs button.selected {\n  background: #fff;\n  border: 1px solid #DADEE2;\n  margin-bottom:-1px;\n}\n/*------utility classes--------*/\n.m-horizontal--x-small{\n  margin-right: .5rem;\n  margin-left: .5rem;\n}\n.m-bottom--x-small{\n  margin-bottom: .5rem;\n}\n.m-top--x-small{\n  margin-top: .5rem;\n}\n.p-around--x-small{\n  padding: .5rem;\n}\n.grid {\n    display: -ms-flexbox;\n    display: flex;\n    position: relative;\n}\n.grid--vertical-align-center {\n    -ms-flex-align: center;\n    -ms-grid-row-align: center;\n    align-items: center;\n    -ms-flex-line-pack: center;\n    align-content: center;\n}\n.grid--align-spread {\n    -ms-flex-pack: justify;\n    justify-content: space-between;\n}\n\n/*-----dropdown menu styles---------*/\nheader.tabs div.dropdown-trigger#help {\n  position: absolute;\n  bottom: 0;\n  right: 10px;\n}\nheader.tabs div.dropdown-trigger#help .trigger {\n  border: 1px solid #DADEE2;\n}\n#help .trigger svg{\n  width:14px;\n  height:14px;\n  fill:#54698d;\n}\n\nol, ul {\n    list-style: none;\n}\n/*.slds-dropdown-trigger*/\n.dropdown-trigger {\n    position: relative;\n    display: inline-block;\n}\n/*.slds-dropdown*/\n.dropdown {\n    position: absolute;\n    z-index: 7000;\n    left: 50%;\n    float: left;\n    min-width: 6rem;\n    max-width: 20rem;\n    margin-top: .125rem;\n    border: 1px solid #d8dde6;\n    border-radius: .25rem;\n    padding: .25rem 0;\n    font-size: .75rem;\n    background: #fff;\n    box-shadow: 0 2px 3px 0 rgba(0,0,0,.16);\n    -webkit-transform: translateX(-50%);\n    transform: translateX(-50%);\n}\n/*.slds-dropdown--right*/\n.dropdown--right {\n    left: auto;\n    right: 0;\n    -webkit-transform: translateX(0);\n    transform: translateX(0);\n}\n/*.slds-dropdown-trigger .slds-dropdown*/\n.slds-dropdown-trigger .slds-dropdown {\n    top: 100%;\n}\n/*.slds-dropdown-trigger--click .slds-dropdown*/\n.dropdown-trigger--click .dropdown {\n    display: none;\n}\n/*.slds-dropdown-trigger--click.is-open .slds-dropdown*/\n.dropdown-trigger--click.is-open .dropdown {\n    display: block;\n    visibility: visible;\n    opacity: 1;\n}\n/*.slds-dropdown__item*/\n.dropdown__item {\n    line-height: 1.5;\n}\n/*.slds-dropdown__item>a*/\n.dropdown__item>a {\n    position: relative;\n    display: -webkit-flex;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-justify-content: space-between;\n    -ms-flex-pack: justify;\n    justify-content: space-between;\n    padding: .5rem .75rem;\n    color: #16325c;\n    white-space: nowrap;\n    cursor: pointer;\n}\n/*.slds-dropdown__item>a:focus, .slds-dropdown__item>a:hover*/\n.dropdown__item>a:hover {\n  text-decoration: none;\n}\n.dropdown__item>a:focus {\n    outline: 0;\n    text-decoration: none;\n    background-color: #f4f6f9;\n}\n/*.slds-dropdown__item>a:active*/\n.dropdown__item>a:active {\n    text-decoration: none;\n    background-color: #eef1f6;\n}\n/*.slds-assistive-text*/\n.assistive-text {\n    position: absolute!important;\n    margin: -1px!important;\n    border: 0!important;\n    padding: 0!important;\n    width: 1px!important;\n    height: 1px!important;\n    overflow: hidden!important;\n    clip: rect(0 0 0 0)!important;\n}\n/*---------------*/\n\nsection.tab-body {\n  display: none;\n  width: 100%;\n  overflow: hidden;\n}\nsection.selected {\n  display: block;\n  height: calc(100% - 28px);\n}\nbody.sidebar-visible section.tab-body,\nbody.sidebar-visible header.tabs {\n  width: 75%;\n}\nbody .sidebar {\n  display: none;\n}\nbody.sidebar-visible .sidebar {\n  display: block;\n}\n\n/* Generic TreeView Rules */\n.tree-view{\n  font-family: Menlo, monospace;\n  font-size: 11px;\n  padding-top: .25rem;\n}\n.tree-view li > span {\n  cursor: pointer;\n  white-space: normal;\n  overflow-wrap: break-word;\n}\n.component-tree .tree-view li > span:hover {\n  background-color: rgba(56, 121, 217, 0.1);\n}\n.tree-view.collapsable li ul { margin: .1em 0 .1em 1.5em; }\n.tree-view.collapsable li { list-style: none; white-space: nowrap; }\n.tree-view.collapsable li.tree-view-parent {}\n\n.tree-view-node-arrow {\n  content: '';\n  display: inline-block;\n  width: 0;\n  height: 0;\n  border-top: 4px solid transparent;\n  border-left: 7px solid #777;\n  border-bottom: 4px solid transparent;\n  margin: 3px 3px 0 0;\n}\n\n.tree-view.collapsable li.tree-view-parent.tree-view-expanded > .tree-view-node-arrow {\n  border-left: 4px solid transparent;\n  border-top: 7px solid #777;\n  border-right: 4px solid transparent;\n  margin: 0 2px 0 0;\n  position: relative;\n  top: 4px;\n}\n\n.tree-view.collapsable li.tree-view-parent > ul {\n  display: none;\n}\n.tree-view.collapsable li.tree-view-parent.tree-view-expanded > ul {\n  display: block;\n}\n.tab-body .panel-status-bar {\n  background-color: transparent;\n  border-bottom: 1px solid #D8DDE6;\n  padding: .5em;\n  margin: 0;\n}\nbutton.status-bar-item {\n  left: 0;\n    padding: 12px;\n}\n.panel-status-bar { border-bottom: 1px solid #D8DDE6; padding:.5em 0; margin: 0; }\n\n/* Common Panel Styles */\nmenu { border-bottom: 1px solid #D8DDE6; padding: .5em; margin: 0; min-height: 35px;}\nmenu li { display: inline-block; list-style: none; vertical-align: middle; }\nmenu button { border: 1px solid #DADEE2; background: #F5F6F7; cursor: pointer; }\nmenu button:active { border: 1px solid #999; background: #ddd; }\nmenu button.status-bar-item:active {\n  border: none;\n  background: none;\n}\nmenu button.status-bar-item:active .glyph:not(.shadow) {\n  background-color: rgb(0, 57, 107);\n}\nmenu li.divider {\n  background: #ccc;\n  display: inline-block;\n  height: 22px;\n  margin: auto 6px;\n  vertical-align: bottom;\n  width: 1px;\n}\nmenu input {\n    background-color: #fff;\n    color: #16325c;\n    border: 1px solid #d8dde6;\n    border-radius: .25rem;\n    width: inherit;\n    transition: border .1s linear,background-color .1s linear;\n    display: inline-block;\n    resize: vertical;\n    padding: 1px;\n}\nmenu .record-button {\n  padding: 5px 0;\n  text-align: center;\n  width: 32px;\n}\nmenu button.circle {\n  border: 0px none;\n  border-radius: 10px;\n}\nmenu aurainspector-onOffButton.circle {\n  border-radius: 50%;\n  background: rgb(103, 103, 103);\n  height: 12px;\n  margin-left: -1px;\n  width: 12px;\n}\nmenu aurainspector-onOffButton.circle:hover {\n  background: rgb(64, 64, 64);\n}\nmenu aurainspector-onOffButton.circle.on {\n  background: rgb(223, 51, 51);\n  box-shadow: 0 0 2px 2px rgb(246, 194, 194);\n}\nmenu aurainspector-onOffButton.circle.on:hover {\n  background: rgb(216, 0, 0);\n}\nmenu aurainspector-onOffButton.circle span {\n  display: none;\n}\nmenu aurainspector-onOffButton {\n  display: inline-block;\n  cursor: pointer;\n  padding: 4px 6px 3px 6px;\n  margin: auto 2px;\n  border-radius: 8px;\n}\nmenu aurainspector-onOffButton:hover {\n  background: rgba(0, 0, 0, .2);\n  color: white;\n}\nmenu aurainspector-onOffButton:active {\n  background: rgba(0, 0, 0, .5);\n  color: white;\n}\nmenu aurainspector-onOffButton.on {\n  background: rgba(0, 0, 0, .3);\n  color: white;\n  text-shadow: rgba(0, 0, 0, .4) 0 1px 0;\n}\n.component-prefix {\n  color: maroon;\n}\n.component-property {\n  color: maroon;\n}\n.component-property-value {\n  color: #333;\n  margin: 0 0 0 3px;\n}\n.component-facet-property {\n  color: maroon;\n}\n.component-tagname {\n  color: blue;\n}\n.component-attribute {\n  color: #993399;\n}\n.component-attribute-pair {\n    padding-left: 0.6em;\n}\n.component-array-length {\n  color: teal;\n  font-size: .9em;\n  font-style: normal;\n}\n\n/* Component Tree */\n/*\n  The beginnings of a resize. Need to get the component tree and component view in sync, so when you change one, the other fills in the space.\n #tab-body-component-tree { resize: horizontal; overflow: auto; } */\n.component-tree { margin: 0 0 0 1em; padding: 0}\n.component-tree .tree-view li.tree-node-selected > span.tree-view-node {\n  background: rgb(56, 121, 217);\n  color: #fff;\n}\n.component-tree .tree-node-selected > span.tree-view-node .component-tagname {\n  color: #fff;\n}\n.component-tree .tree-node-selected > span.tree-view-node .component-attribute {\n  color: #9faab5;\n}\n\n/* IFrame Tabs */\nsection.tab-body.auraInspectorIFrameTab { overflow: hidden; }\n.auraInspectorIFrameTab iframe { width: 100%; height: 100%; }\n\n/* Event Log */\n.event-log {\n  height: 100%;\n  list-style-type: none;\n  margin: 0;\n  padding: 0;\n}\n.event-log li {\n  align-items: flex-start;\n  border-bottom: 1px solid #d8dde6;\n  display: flex;\n  list-style: none;\n  padding: .25rem;\n}\n.event-log li aurainspector-eventCard { display: inline-block; }\n.event-log-timestamp:before { content: \"[\";}\n.event-log-timestamp:after { content: \"]\"; margin: 0 3px 0 0; }\n.event-log-timestamp { color: maroon; }\n\n/* Toggle Button */\nbutton.toggle {\n  background: transparent;\n  border: 0 none;\n  border-radius: .25rem;\n  cursor: pointer;\n  display: inline-block;\n  font-family: monospace;\n  font-size: 1.25em;\n  margin-left: 3px;\n  margin-right: 3px;\n  margin-top: 3px;\n  padding: 3px;\n  vertical-align: top;\n}\nbutton.toggle::before {\n  content: '';\n  display: inline-block;\n  width: 0;\n  height: 0;\n  border-top: 4px solid transparent;\n  border-left: 7px solid #777;\n  border-bottom: 4px solid transparent;\n  margin: 3px 3px 0 0;\n  position: relative;\n  left: 2px;\n  top: -1px;\n}\nbutton.toggle[value=\"ON\"]::before {\n  content: '';\n  display: inline-block;\n  width: 0;\n  height: 0;\n  border-left: 4px solid transparent;\n  border-top: 7px solid #777;\n  border-right: 4px solid transparent;\n  margin: 0 2px 0 0;\n  position: relative;\n  top: 3px;\n  left: 1px;\n}\nbutton.toggle:focus {\n  box-shadow: 0 0 4px 0 #0070d2;\n  outline: none;\n}\n\n.grid{\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  position: relative;\n}\n\n.grid-columns{\n  flex-direction: column;\n}\n.scroll {\n  overflow: scroll;\n  height: 0;\n}\n.scroll-wrapper {\n  height: 100%;\n}\n.flex{\n  flex: 1 1 auto;\n}\n\n.no-flex{\n  flex-shrink: 0;\n  flex-grow: 0;\n}\n\n\n\n\n/* Component View */\n\n.component-view {\n  background: #fff;\n  border-left: 1px solid #e0e5ee;\n  bottom: 0;\n  overflow: auto;\n  padding: 0 0 30px 0;\n  position: absolute;\n  right: 0;\n  width: 25%;\n  top: 0;\n  z-index: 11;\n}\n.component-view ul li {\n  list-style: none;\n  padding: .1em 0 0 0;\n  text-indent: .5em;\n}\n.component-view ul li li {\n  list-style: square inside;\n  padding: 0 0 0 1em;\n}\n.component-view h3 {\n  background: #f4f6f9;\n  border-top: 1px solid #e0e5ee;\n  border-bottom: 1px solid #e0e5ee;\n  color: #000;\n  font-family: 'Lucida Grande', 'Consolas', 'sans-serif';\n  font-size: .75rem;\n  font-weight: normal;\n  padding: .125rem 0;\n  margin: .25rem 0;\n}\n\n/* Performance Tab */\n#flamechart { position: relative; width: 100%; height: 90%;}\n\n/* Transactions Panel */\n\nbutton.record-button {\n    padding: 5px 0;\n    text-align: center;\n    width: 32px;\n    background-color: white;\n    border: none;\n}\nbutton.circle {\n    border: 0px none;\n    border-radius: 10px;\n}\nbutton aurainspector-onOffButton.circle {\n    border-radius: 50%;\n    background: rgb(103, 103, 103);\n    height: 12px;\n    margin-left: -1px;\n    width: 12px;\n}\nbutton aurainspector-onOffButton.circle:hover {\n    background: rgb(64, 64, 64);\n}\nbutton aurainspector-onOffButton.circle.on {\n    background: rgb(223, 51, 51);\n    box-shadow: 0 0 2px 2px rgb(246, 194, 194);\n}\nbutton aurainspector-onOffButton.circle.on:hover {\n    background: rgb(216, 0, 0);\n}\nbutton aurainspector-onOffButton.circle span {\n    display: none;\n}\nbutton aurainspector-onOffButton {\n    display: inline-block;\n    cursor: pointer;\n    padding: 4px 6px 3px 6px;\n    margin: auto 2px;\n    border-radius: 8px;\n}\nbutton aurainspector-onOffButton:hover {\n    background: rgba(0, 0, 0, .2);\n    color: white;\n}\nbutton aurainspector-onOffButton:active {\n    background: rgba(0, 0, 0, .5);\n    color: white;\n}\nbutton aurainspector-onOffButton.on {\n    background: rgba(0, 0, 0, .3);\n    color: white;\n    text-shadow: rgba(0, 0, 0, .4) 0 1px 0;\n}\n\nbutton.transaction-tabs-button{\n    background-color: #E3F2FD;\n    padding: 3px;\n    margin-left: 10px;\n    padding-left: 5px;\n    padding-right: 5px;\n    border-width: 0px;\n}\n\nbutton.transaction-tabs-button.selected{\n    background-color: #EEEEEE;\n}\n\n.trans-panel {\n  height: calc(100% - 60px);\n  overflow: hidden;\n}\n\n.trans-panel table {\n  border-collapse: collapse;\n  font-family:  'Lucida Grande', 'Consolas', 'sans-serif';\n  font-size: 12px;\n  width: 100%;\n  height:100%;\n}\n\n.trans-panel thead {\n    text-align: left;\n    display: table;\n    width: 100%;\n    table-layout: fixed;\n}\n.trans-panel table thead th {\n  box-shadow: 0 -1px 0 0 #d8dde6 inset;\n  color: #54698d;\n  font-weight: normal;\n  font-size: 1em;\n  padding: .5rem;\n  text-transform: uppercase;\n  vertical-align: bottom;\n}\n\n.trans-panel table tbody tr.transport td a {\n  color: #54698d;\n}\n\n.trans-panel tbody td,\n.trans-panel thead th {\n  width: 33%;\n}\n.trans-panel tbody td + td,\n.trans-panel thead th + th {\n  width: 5%;\n}\n.trans-panel tbody td + td + td,\n.trans-panel thead th + th + th {\n  width: 8%;\n}\n.trans-panel tbody td + td + td + td,\n.trans-panel thead th + th + th + th {\n  width: 9%;\n}\n\n.trans-panel thead th + th + th + th + th {\n  width: 45%;\n  padding: 0;\n}\n\n.trans-panel tbody tr td:last-child {\n  width: 45%;\n}\n\n.trans-panel .th-text{\n    vertical-align: bottom;\n    bottom: 20px;\n}\n\n.trans-panel table tbody{\n    height: 100%;\n    overflow: scroll;\n    display: block;\n    padding-bottom: 75px;\n}\n\n.trans-panel table tr{\n    display: table;\n    table-layout: fixed;\n    width: 100%;\n}\n\n.trans-panel table tr.no-display{\n    display: none;\n}\n\n.trans-panel table tbody tr.custom-trans-mark.red{\n    background-color: #fff7fb;\n}\n\n.trans-panel table tbody tr:nth-child(even) {\n    background: #ececec;\n}\n.trans-panel table tbody tr:nth-child(odd) {\n    background: #FFF;\n}\n\n.trans-panel td {\n    word-break:normal;\n    font-size: 11.3px;\n  box-shadow: 0 -1px 0 0 #d8dde6 inset;\n  padding: .43rem;\n  max-width: 350px;\n  white-space: normal;\n  vertical-align: top;\n  word-break: break-all;\n}\n\n.trans-panel td.ctx {\n  overflow-wrap: break-word;\n}\n.trans-panel tr:hover td {\n  background-color: #f0fcff;\n}\n.th-description {\n  font-size: .625rem;\n  text-transform: none;\n}\n\n/* Individual Row styles in the Transactions Grid */\n/*\n.trans-panel .transport,\n.trans-panel .transaction {\n  opacity: .3;\n}\n*/\n/* Transaction Timeline styles */\n.trans-graph-side {\n    position: relative;\n    height: 15px;\n    padding: 0;\n    overflow: visible;\n    font-family: \"Helvetica Neue\", \"Lucida Grande\", sans-serif;\n    text-align: left;\n    font-size: 12px;\n}\n\n.trans-graph-bar-area {\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    right: 12px;\n    left: 12px;\n}\n\n.trans-graph-bar {\n    position: absolute;\n    top: 2px;\n    bottom: 2px;\n    min-width: 3px;\n}\n\n.trans-graph-bar:not(.request-timing) {\n    border-width: 1px;\n    border-style: solid;\n    border-color: hsl(0, 0%, 75%);\n    background: linear-gradient(0deg, hsl(0, 0%, 85%), hsl(0, 0%, 95%));\n}\n\n.trans-graph-bar.waiting:not(.request-timing) {\n    opacity: 0.5;\n}\n\n.trans-graph-bar.request-timing{\n    border: invisible;\n}\n\n.transactions-graph-row {\n  position: relative;\n  width: 100%;\n  height: 9px;\n  border-bottom: 1px dotted #ccc;\n}\n\n.transactions-graph-row .transactions-graph-row-block {\n    min-width: 3px;\n    height: 15px;\n    position: absolute;\n}\n\n.transactions-graph-row.transport .transactions-graph-row-block:nth-child(1) {\n    background-color: #f0c457;\n}\n\n.transactions-graph-row.transaction .transactions-graph-row-block:nth-child(1) {\n    background-color: #d296ce;\n}\n\n.transactions-graph-row .transactions-graph-row-block:nth-child(1) {\n    background-color: #03A9F4;\n    margin: 3px 0;\n    height: 9px;\n}\n\n.transactions-graph-row .transactions-graph-row-block:nth-child(2) {\n    margin: 0;\n    background-color: #00C853;\n    height:15px;\n}\n\n.transactions-graph-row .transactions-graph-row-block:nth-child(3) {\n    margin: 0;\n    background-color: #F00;\n    height:15px;\n}\n\n\n.trans-graph-bar.request-timing.total:after{\n    /*margin: 3px 0;\n    border-bottom: solid 1px #AAAAAA;\n    height: 0px;*/\n\n    position: absolute;\n    left: 0;\n    top: 50%;\n    height: 1px;\n    background: #AAAAAA;\n    content: \"\";\n    width: 100%;\n    display: block;\n}\n\n.trans-graph-bar.request-timing.stamp-start {\n    min-width: 3px;\n    background-color: #03A9F4;\n    margin: 2px 0;\n    z-index: 1;\n}\n\n.trans-graph-bar.request-timing.start-end {\n    min-width: 3px;\n    background-color: #00C853;\n    z-index: 1;\n}\n\n.trans-graph-time-marker-container{\n    position: fixed;\n    pointer-events: none;\n    height: 91%;\n    width: inherit;\n    padding-right: .43rem;\n    display: table-cell;\n    z-index: 1;\n}\n\n.trans-graph-time-marker-container.invisible{\n    visibility: hidden;\n}\n\n.trans-graph-time-marker-timeline{\n    position: absolute;\n    width: 100%;\n    top: 18px;\n    height: 1px;\n    border-top: 1px solid black;\n}\n\n.trans-graph-time-number-mark span {\n    font-size: 11px;\n    text-transform: none;\n    padding: 3px;\n    bottom: 2px;\n}\n\n.trans-graph-time-marker1{\n    position: absolute;\n    top: 6px;\n    height: 100%;\n    width: 1px;\n    border-left: 1px dotted;\n}\n\n.trans-graph-time-marker2{\n    position: absolute;\n    top: 6px;\n    height: 100%;\n    left: calc(25%);\n    width: 1px;\n    border-left: 1px dotted;\n}\n\n.trans-graph-time-marker3{\n    position: absolute;\n    top: 6px;\n    height: 100%;\n    left: calc(50% - 9px);\n    width: 1px;\n    border-left: 1px dotted;\n}\n\n.trans-graph-time-marker4{\n    position: absolute;\n    top: 6px;\n    height: 100%;\n    left: calc(75% - 18.5px);\n    width: 1px;\n    border-left: 1px dotted;\n}\n\n.trans-graph-bar-info{\n    visibility: hidden;\n\n    border-style: hidden;\n    background-color: #f9f9f9;\n\n    text-align: left;\n    padding: 10px 0;\n\n    /* Position the tooltip */\n    position: absolute;\n    right: calc(100% + 20px);\n    bottom: -1200%;\n    z-index: 99 !important;\n\n    background-color: white;\n    box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.3), 0 2px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 4px 0 rgba(0, 0, 0, 0.37);\n    border-radius: 2px;\n    word-break:normal;\n}\n\ntable.trans-graph-bar-info-table{\n     width: 100%;\n}\n\n.trans-graph-bar-info .trans-graph-bar-info-table thead{\n     display: table-header-group;\n\n }\n\n.trans-graph-bar-info .trans-graph-bar-info-table tbody{\n     height: 100%;\n     display: table-row-group;\n }\n\n.trans-graph-bar-info .trans-graph-bar-info-table tr.info-row{\n    table-layout: auto;\n    display: table-row;\n}\n\n.trans-graph-bar.request-timing.stamp-start:hover .trans-graph-bar-info{\n    visibility: visible;\n}\n\n.trans-graph-bar-area:hover .trans-graph-bar-info{\n    visibility: visible;\n}\n\n.trans-graph-bar-info-left-column{\n    padding-left: 10px;\n}\n.trans-graph-bar-info-right-column{\n    padding-left: 28px;\n    padding-right: 10px;\n}\n\n\n/*\n  ChaosTab Start\n*/\n.chaosTab {\n  height: 100%;\n  /* .slds-grid  { */\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  position: relative;\n  /* } */\n  overflow: hidden;\n}\n.chaosRunOptions, .chaosRunResult {\n  -webkit-overflow-scrolling: touch;\n  max-height: 100%;\n  overflow-x: hidden;\n  overflow-y: auto;\n\n  -webkit-box-flex: 1;\n  -webkit-flex: 1 1 auto;\n  -ms-flex: 1 1 auto;\n  flex: 1 1 auto;\n\n  width: 50%;\n}\n.chaosRunOptions {\n  border-right: none;\n  margin-right: 0;\n  padding-right: 0;\n  background-color: #fff;\n\n  border-right:1px solid #d8dde6;\n  z-index: 1;\n}\n.stopAllChaosRun {\n  float: right;\n  margin-top: -.25rem;\n}\n\n.chaosRunResult {\n  border-bottom: 1px solid #d8dde6;\n  padding-bottom: .5rem;\n  background-color: #f4f6f9;\n}\n\n\n/*\n  ChaosTab End\n*/\n\n/* Actions List */\n.toolTipElement {\n  font-size: 10px;\n  position: absolute;\n}\n.drop-zone {\n    border: 1px dashed #d8dde6;\n    margin: .5rem;\n    min-height: 1rem;\n}\n.drop-zone::after{\n  content:\" \";\n  height:.25rem;\n  width:calc(100% - 1rem);\n  display:block;\n  margin:.5rem;\n  border-radius:.125rem;\n}\n.drop-zone.allow-drop{\n  border: 1px solid #0070D2;\n}\n.drop-zone.allow-drop::after{\n  background-color: #0070D2;\n }\n.actions-tab{\n  height: 100%;\n  /* .slds-grid  { */\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  position: relative;\n  /* } */\n  overflow: hidden;\n}\n.actions-list {\n  border-right:1px solid #d8dde6;\n  box-shadow: 0 -2px 4px rgba(0,0,0,.07);\n  order:-1;\n  z-index: 1;\n  /*padding-right: .5rem;\n  margin-right: .5rem;*/\n\n}\n.actions-list, .actionsToWatch-list {\n  /*.slds-scrollable--y {*/\n  -webkit-overflow-scrolling: touch;\n  max-height: 100%;\n  overflow: hidden;\n  overflow-y: auto;\n  /*}*/\n  /*.slds-col, .slds-col--padded {*/\n  -webkit-box-flex: 1;\n  -webkit-flex: 1 1 auto;\n  -ms-flex: 1 1 auto;\n  flex: 1 1 auto;\n  /*}*/\n  /*.slds-size--1-of-2 {*/\n  width: 50%;\n  /*}*/\n}\n.actionsToWatch-list {\n  background-color: #f4f6f9;\n}\n.action-card{\n  background-color: #fff;\n}\n\n@media (max-width: 800px) {\n  .actions-tab{\n    flex-wrap: wrap;\n    align-content: flex-start;\n  }\n  .actions-list, .actionsToWatch-list {\n    flex: 0 1 auto;\n    max-height: none;\n    overflow: auto;\n    width: 100%;\n  }\n  .actionsToWatch-list {\n    border-bottom: 1px solid #d8dde6;\n    padding-bottom: .5rem;\n    /*.slds-max-small-order--1 {*/\n    -webkit-box-ordinal-group: 2;\n    -webkit-order: 1;\n    -ms-flex-order: 1;\n    order: 1;\n    /*}*/\n  }\n  .actions-list {\n    border-right: none;\n    margin-right: 0;\n    padding-right: 0;\n    /*.slds-max-small-order--2 {*/\n    -webkit-box-ordinal-group: 3;\n    -webkit-order: 2;\n    -ms-flex-order: 2;\n    order: 2;\n    /*}*/\n  }\n}\n\n.actions-list section h1{\n  margin: .5rem 0 0 0;\n  padding: 0.75rem 1rem;\n}\n.actionsToWatch-list section h1{\n  margin: .5rem 0 0 0;\n  padding: 0.75rem 1rem;\n}\n.actionsToWatch-list section .description{\n  margin: .5rem;\n  display: block;\n  /*.slds-text-body--small {*/\n    font-size: 0.75rem;\n    color: #54698d;\n  /*}*/\n}\n.actions-list .action-card,\n.actionsToWatch-list .action-card {\n  border: 1px solid #e0e5ee;\n  border-radius: 4px;\n  display: block;\n  margin: .5rem;\n}\n.actions-list .action-card.has-error {\n  border: 1px solid #ea8288;\n\n}\n.action-card.draggable:hover {\n  background: #f4f6f9;\n  cursor: move;\n}\n.action-card.dropped:hover {\n  background-color: #fff;\n  cursor: default;\n}\n\n.action-card.responseModified_modify {\n  background-color: #BFEEA8;\n}\n.action-card.responseModified_error {\n  background-color: #F2E005;\n}\n.action-card.responseModified_drop {\n  background-color: #ECAB7C;\n}\n\n#tab-body-actions #filter-text { width: 150px; }\n.actionsToWatch-list {\n  margin: 0;\n}\n.actions-list .action-card.dropped, .action-card.dragging {\n  opacity: .6;\n}\n/* End transaction timeline styles */\n\n/* Storage Panel */\n#storage-viewer { padding: 10px; overflow:auto; height:100%; }\n\n/* Loading Indicator */\n#loading { display: none; position: absolute; top: 0; bottom: 0; left: 0;  right:0; z-index: 100;}\n#loading .dotsSpinner { width: 100px; height: 100px;}\n#loading .opaque { content: ' '; background: #fff; width: 100%; height: 100%; opacity: .6; z-index: 99; }\n\n#loading .dots { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(90deg); width: 32px; }\n#loading .dots, #loading .dots div { transform-origin: 50% 50%; }\n#loading .dots div { position: absolute; top: 0; left: 0; width: 100%; }\n\n#loading .dots:before, #loading .dots:after, #loading .dots div:before, #loading .dots div:after { animation-duration: 1000ms; animation-iteration-count: infinite; content: \"\"; background: rgb(21, 137, 238); border-radius: 100%; width: 8px; height: 8px; position: absolute; }\n#loading .dots:before, #loading .dots div:before { animation-name: dotsBounceBefore-medium; top: -4px; left: -4px; }\n#loading .dots:after, #loading .dots div:after { animation-name: dotsBounceAfter-medium; top: -4px; right: -4px; }\n\n#loading .a { transform: rotate(60deg) translateY(0); }\n#loading .b { transform: rotate(120deg) translateY(0); }\n\n#loading .dots:before { animation-delay: -83.33333ms; }\n#loading .a:before { animation-delay: 83.33333ms; }\n#loading .b:before { animation-delay: 250ms; }\n#loading .dots:after { animation-delay: 416.66667ms; }\n#loading .a:after { animation-delay: 583.33333ms; }\n#loading .b:after { animation-delay: 750.0ms; }\n\n/*** ACTION CARD ***/\n/* Last of the cruft */\naurainspector-actioncard .action-card-wrapper dl { display: flex; flex-wrap: wrap; margin: 0; }\naurainspector-actioncard .action-card-wrapper th, dt, h3 { font-weight: normal; text-align: left; font-size: 0.75rem; line-height: 1.25; letter-spacing: 0.0625em; color: #54698d; }\naurainspector-actioncard .action-card-wrapper td, dd { color: #16325c; font-size: .75rem; padding: 0 1rem 0 0; margin: 0; }\n/* End last of the cruft */\n\naurainspector-actioncard .action-card-wrapper dd { word-wrap: break-word; }\naurainspector-actioncard .action-card-wrapper code { margin: 5px; display: block; white-space: pre; }\naurainspector-actioncard .action-card-wrapper aurainspector-json { font-family: Menlo, monospace; display: flex; }\n\naurainspector-actioncard .action-card-wrapper .attributes.storable-false .storable-info { display:none; }\n\naurainspector-actioncard .action-card-wrapper .action-details .action-parameters aurainspector-label { color: #54698d; }\naurainspector-actioncard .action-card-wrapper .action-header h2 { overflow: hidden; overflow-wrap: break-word; }\n\naurainspector-actioncard .action-card-wrapper:focus .action-header .watch-icon,\naurainspector-actioncard .action-card-wrapper:hover .action-header .watch-icon { opacity: .6; }\naurainspector-actioncard .action-card-wrapper .action-header .watch-icon { opacity: 0; }\naurainspector-actioncard .action-card-wrapper .remove-card { display: none; }\naurainspector-actioncard .action-card-wrapper .action-name-method { color: #005fb2; }\naurainspector-actioncard .action-card-wrapper .action-modify { display:none; }\n\n/** Expand Collapse */\naurainspector-actioncard .action-card-wrapper  .expand-icon {  display:none; }\naurainspector-actioncard .action-card-wrapper  .action-toggle { display:none; }\naurainspector-actioncard .action-card-wrapper.is-collapsible .action-toggle { display: block; }\naurainspector-actioncard.is-collapsed .collapse-icon,\naurainspector-actioncard.is-collapsed .action-body { display:none; }\naurainspector-actioncard.is-collapsed .expand-icon { display: block; }\n\n/** If the aurainspector-actoncard has .has-error applied, style it red. Though the consumer can change this color by providing their own border color */\naurainspector-actioncard.has-error { border: 1px solid #ea8288; }\n\n/** Pending Overrides Stylings */\naurainspector-actioncard .action-card-wrapper.watch .action-details,\naurainspector-actioncard .action-card-wrapper.watch .watch-icon { display: none; }\n\naurainspector-actioncard .action-card-wrapper.watch .action-modify,\naurainspector-actioncard .action-card-wrapper.watch .remove-card { display: block; }\n/*** ACTION CARD ***/\n\n/* No Aura Available */\n#no-aura-available-container .slds-icon_container {\n  position: relative;\n  top: -5px;\n}\n\n\n@-webkit-keyframes dotsBounceBefore-medium {\n  60% { transform: translateX(0); animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53); }\n  80% { animation-timing-function: cubic-bezier(0, 1.11, 0.7, 1.43); transform: translateX(-8px); }\n  100% { transform: translateX(0); }\n}\n@keyframes dotsBounceBefore-medium {\n  60% { transform: translateX(0); animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53); }\n  80% { animation-timing-function: cubic-bezier(0, 1.11, 0.7, 1.43); transform: translateX(-8px); }\n  100% { transform: translateX(0); }\n}\n\n@-webkit-keyframes dotsBounceAfter-medium {\n  60% { animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53); transform: translateX(0); }\n  80% { animation-timing-function: cubic-bezier(0, 1.11, 0.7, 1.43); transform: translateX(8px); }\n  100% { transform: translateX(0); }\n}\n@keyframes dotsBounceAfter-medium {\n  60% { animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53); transform: translateX(0); }\n  80% { animation-timing-function: cubic-bezier(0, 1.11, 0.7, 1.43); transform: translateX(8px); }\n  100% { transform: translateX(0); }\n}\n", ""]);

// exports


/***/ }),

/***/ "./node_modules/css-loader/index.js!./src/sidebarPanel/sidebarPanel.css":
/*!*********************************************************************!*\
  !*** ./node_modules/css-loader!./src/sidebarPanel/sidebarPanel.css ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../../node_modules/css-loader/lib/css-base.js */ "./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "/**\n * This file is being used by the elements sidebar panel. \n * Not the Lightning Tab.\n */\nBODY .sidebar { display: block; }\nBODY .component-view {\n    width: 100%;\n    left: 0;\n}\nBODY .hidden,\n#sidebarContainer .hidden {\n    display: none;\n}\n\n#empty {\n    text-align: center;\n    padding: 2em;\n}", ""]);

// exports


/***/ }),

/***/ "./node_modules/css-loader/lib/css-base.js":
/*!*************************************************!*\
  !*** ./node_modules/css-loader/lib/css-base.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),

/***/ "./node_modules/style-loader/lib/addStyles.js":
/*!****************************************************!*\
  !*** ./node_modules/style-loader/lib/addStyles.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target) {
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(/*! ./urls */ "./node_modules/style-loader/lib/urls.js");

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ "./node_modules/style-loader/lib/urls.js":
/*!***********************************************!*\
  !*** ./node_modules/style-loader/lib/urls.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),

/***/ "./src/devtoolsPanel/AuraInspectorComponentView.js":
/*!*********************************************************!*\
  !*** ./src/devtoolsPanel/AuraInspectorComponentView.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = AuraInspectorComponentView;

var _treeview = __webpack_require__(/*! ./treeview */ "./src/devtoolsPanel/treeview.js");

var _DevToolsEncodedId = __webpack_require__(/*! ./DevToolsEncodedId */ "./src/devtoolsPanel/DevToolsEncodedId.js");

var _DevToolsEncodedId2 = _interopRequireDefault(_DevToolsEncodedId);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function AuraInspectorComponentView(devtoolsPanel) {
    var container;
    // Generic properties to show for the concrete component
    var concretePropertyMap = {
        "globalId": chrome.i18n.getMessage("componentview_globalid"),
        "rendered": chrome.i18n.getMessage("componentview_isrendered"),
        "valid": chrome.i18n.getMessage("componentview_isvalid"),
        "localId": "aura:id",
        "descriptor": chrome.i18n.getMessage("componentview_descriptor"),
        "elementCount": chrome.i18n.getMessage("componentview_elements"),
        "rerender_count": chrome.i18n.getMessage("componentview_rerendered")
    };
    // When we render the super, show these properties instead of the ones above.
    var superPropertyMap = {
        "globalId": chrome.i18n.getMessage("componentview_globalid"),
        "localId": "aura:id",
        "descriptor": chrome.i18n.getMessage("componentview_descriptor")
    };
    var treeComponent;
    var _componentId = null;
    var _isDirty = false;

    this.init = function (tabBody) {
        container = document.createElement("DIV");
        container.className = "component-view";
        container.id = "component-view";
        tabBody.appendChild(container);

        tabBody.classList.add("sidebar");

        treeComponent = new _treeview.AuraInspectorTreeView(container);
        treeComponent.attach("onselect", ComponentView_OnSelect.bind(this));
    };

    this.setData = function (globalId) {
        _isDirty = true;
        _componentId = globalId;
        this.render();
    };

    this.render = function () {
        if (_isDirty && _componentId) {
            container.innerHTML = "";
            treeComponent.clearChildren();

            devtoolsPanel.getComponent(_componentId, function (component) {
                devtoolsPanel.getCount(_componentId + "_rerendered", function (rerenderCount) {
                    component["rerender_count"] = rerenderCount;
                    renderForComponent(component);
                    renderForComponentSuper(component, function () {
                        treeComponent.render();
                    });
                });
            }, {
                body: true,
                elementCount: true,
                model: true,
                valueProviders: true,
                handlers: true
            });
        }
    };

    /** Event Handlers **/

    function ComponentView_OnSelect(event) {
        if (event && event.data) {
            var domNode = event.data.domNode;
            var treeNode = event.data.treeNode;
            var data = treeNode.getRawLabel();

            if (data && data.key === "Descriptor") {
                devtoolsPanel.publish("AuraInspector:OnDescriptorSelect", data.value);
            }
        }
    }

    /** Private Methods **/

    function renderForComponent(current) {

        var componentId;
        var parentNode;

        treeComponent.addChildren(generateGeneralNodes(current));

        // Should probably use a FacetFormatter, but how do I easily specify that info to TreeNode.create()
        // that is compatible with every other TreeNode.create() call.
        if (current.attributeValueProvider == current.facetValueProvider) {
            var attributeValueProvider = _treeview.TreeNode.create(chrome.i18n.getMessage("componentview_avpfvp"), "attributeValueProvider", "property");
            treeComponent.addChild(attributeValueProvider);

            componentId = _DevToolsEncodedId2.default.getCleanId(typeof current.attributeValueProvider == "string" ? current.attributeValueProvider : current.attributeValueProvider.globalId);

            attributeValueProvider.addChild(_treeview.TreeNode.create(componentId, "attributeValueProvider_" + current.globalId, "globalId"));
        } else {
            var attributeValueProvider = _treeview.TreeNode.create(chrome.i18n.getMessage("componentview_avp"), "attributeValueProvider", "property");
            treeComponent.addChild(attributeValueProvider);

            componentId = _DevToolsEncodedId2.default.getCleanId(typeof current.attributeValueProvider == "string" ? current.attributeValueProvider : current.attributeValueProvider.globalId);

            attributeValueProvider.addChild(_treeview.TreeNode.create(componentId, "attributeValueProvider_" + current.globalId, "globalId", "property"));

            // Show passthroughs keys and values
            if (current.attributeValueProvider.$type$ === "passthrough" && current.attributeValueProvider.values) {
                generateNodes(current.attributeValueProvider.values, attributeValueProvider);
            }

            var facetValueProvider = _treeview.TreeNode.create(chrome.i18n.getMessage("componentview_fvp"), "facetValueProvider", "property");
            treeComponent.addChild(facetValueProvider);

            componentId = _DevToolsEncodedId2.default.getCleanId(typeof current.facetValueProvider == "string" ? current.facetValueProvider : current.facetValueProvider.globalId);
            facetValueProvider.addChild(_treeview.TreeNode.create(componentId, "facetValueProvider_" + current.globalId, "globalId", "property"));

            // Show passthroughs keys and values
            if (current.facetValueProvider.$type$ === "passthrough" && current.facetValueProvider.values) {
                generateNodes(current.facetValueProvider.values, facetValueProvider);
            }
        }

        var bodies = current.attributes.body || {};
        // Do attributes only at the concrete level
        if (current.isConcrete) {
            treeComponent.addChild(_treeview.TreeNode.create(chrome.i18n.getMessage("componentview_attributes"), "Attributes", "header"));

            current.attributes.body = bodies[current.globalId] || [];
            parentNode = _treeview.TreeNode.create();
            generateAttributeNodes(current, parentNode);
            treeComponent.addChildren(parentNode.getChildren());
        } else {
            treeComponent.addChild(_treeview.TreeNode.create(chrome.i18n.getMessage("componentview_attributes"), "Attributes", "header"));
            // We still want to inspect the body at the super levels,
            // since they get composted together and output.
            var body = bodies[current.globalId] || [];
            parentNode = _treeview.TreeNode.create({ key: "body", value: body }, "", "keyvalue");
            generateNodes(body, parentNode);
            treeComponent.addChild(parentNode);
        }

        if (current.model) {
            treeComponent.addChild(_treeview.TreeNode.create(chrome.i18n.getMessage("componentview_model"), "Model", "header"));
            parentNode = _treeview.TreeNode.create();
            generateNodes(current.model, parentNode);
            treeComponent.addChildren(parentNode.getChildren());
        }

        if (current.handlers && Object.keys(current.handlers).length) {
            treeComponent.addChild(_treeview.TreeNode.create(chrome.i18n.getMessage("componentview_handlers"), "Handlers", "header"));
            var handlers = current.handlers;
            var handlerNode;
            var current;
            var controllerRef;
            for (var eventName in handlers) {
                current = handlers[eventName];
                handlerNode = _treeview.TreeNode.create({ "key": eventName, "value": current }, "", "keyvalue");
                for (var c = 0; c < current.length; c++) {
                    controllerRef = {
                        "expression": current[c].expression,
                        "component": _DevToolsEncodedId2.default.getCleanId(current[c].valueProvider)
                    };
                    handlerNode.addChild(_treeview.TreeNode.create(controllerRef, "", "controllerref"));
                }
                treeComponent.addChild(handlerNode);
            }
        }
    }

    function renderForComponentSuper(component, callback) {
        if (component.supers && component.supers.length) {
            devtoolsPanel.getComponent(component.supers[0], function (superComponent) {
                treeComponent.addChild(_treeview.TreeNode.create("[[" + chrome.i18n.getMessage("componentview_super") + "]]", "Super" + superComponent.globalId, "header"));
                renderForComponent(superComponent);
                renderForComponentSuper(superComponent, function () {
                    if (callback) {
                        callback();
                    }
                });
            }, {
                attributes: false,
                body: true,
                elementCount: false,
                model: true,
                valueProviders: true,
                handlers: true
            });
        } else if (callback) {
            callback();
        }
    }

    function generateAttributeNodes(component, parentNode) {
        var node;
        var value;
        var attributes = component.attributes;
        var expressions = component.expressions;
        var encodedId;
        for (var prop in attributes) {
            value = attributes[prop];
            encodedId = new _DevToolsEncodedId2.default(value);
            if (expressions.hasOwnProperty(prop)) {
                node = _treeview.TreeNode.create({ key: prop, value: expressions[prop] }, "", "keyvalue");
                if (typeof value === "object") {
                    generateNodes(attributes[prop], node);
                } else if (encodedId.isComponentId()) {
                    node.addChild(_treeview.TreeNode.create(encodedId.getCleanId(), parentNode.getId() + "_" + prop, "globalId"));
                } else if (encodedId.isActionId()) {
                    node.addChild(_treeview.TreeNode.create(encodedId.getCleanId(), parentNode.getId() + "_" + prop, "controllerref"));
                } else if (typeof value === "string" && value.trim().length === 0) {
                    node.addChild(_treeview.TreeNode.create('""', parentNode.getId() + "_" + prop));
                } else {
                    node.addChild(_treeview.TreeNode.create(value, parentNode.getId() + "_" + prop));
                }
                parentNode.addChild(node);
                continue;
            }
            if (attributes.hasOwnProperty(prop)) {
                if (typeof value === "object") {
                    if (prop === "body") {
                        node = _treeview.TreeNode.create({ key: "body", value: value }, "", "keyvalue");
                        for (var c = 0; c < value.length; c++) {
                            node.addChild(_treeview.TreeNode.parse(value[c]));
                        }
                    } else if (attributes[prop] && ('descriptor' in value || 'componentDef' in value)) {
                        node = _treeview.TreeNode.parse(value);
                    } else {
                        node = _treeview.TreeNode.create({ key: prop, value: value }, parentNode.getId() + "_" + prop, "keyvalue");
                        generateNodes(value, node);
                    }
                } else if (encodedId.isComponentId()) {
                    node = _treeview.TreeNode.create(encodedId.getCleanId(), parentNode.getId() + "_" + prop, "globalId");
                } else {
                    node = _treeview.TreeNode.create({ key: prop, value: value }, parentNode.getId() + "_" + prop, "keyvalue");
                }

                parentNode.addChild(node);
            }
        }
        return parentNode;
    }

    function generateNodes(json, parentNode) {
        var node;
        var value;
        for (var prop in json) {
            if (json.hasOwnProperty(prop)) {
                value = json[prop];
                if (typeof value === "object") {
                    if (prop === "body") {
                        node = _treeview.TreeNode.create({ key: "body", value: value }, "", "keyvalue");
                        for (var c = 0; c < value.length; c++) {
                            node.addChild(_treeview.TreeNode.parse(value[c]));
                        }
                    } else if (json[prop] && ('descriptor' in value || 'componentDef' in value)) {
                        node = _treeview.TreeNode.parse(value);
                    } else {
                        node = _treeview.TreeNode.create({ key: prop, value: value }, parentNode.getId() + "_" + prop, "keyvalue");
                        generateNodes(value, node);
                    }
                } else if (_DevToolsEncodedId2.default.isComponentId(value)) {
                    node = _treeview.TreeNode.create(_DevToolsEncodedId2.default.getCleanId(value), parentNode.getId() + "_" + prop, "globalId");
                } else {
                    node = _treeview.TreeNode.create({ key: prop, value: value }, parentNode.getId() + "_" + prop, "keyvalue");
                }

                parentNode.addChild(node);
            }
        }
        return parentNode;
    }

    function generateGeneralNodes(json) {
        var propertyMap = json.isConcrete ? concretePropertyMap : superPropertyMap;
        var nodes = [];
        for (var prop in json) {
            if (propertyMap.hasOwnProperty(prop)) {
                nodes.push(_treeview.TreeNode.create({ key: propertyMap[prop], value: json[prop] }, prop, "keyvalue"));
            }
        }

        return nodes;
    }
}

/***/ }),

/***/ "./src/devtoolsPanel/DevToolsEncodedId.js":
/*!************************************************!*\
  !*** ./src/devtoolsPanel/DevToolsEncodedId.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = DevToolsEncodedId;
function DevToolsEncodedId(id) {

	this.isComponentId = function () {
		return DevToolsEncodedId.isComponentId(id);
	};

	this.isActionId = function () {
		return DevToolsEncodedId.isActionId(id);
	};

	this.getCleanId = function () {
		return DevToolsEncodedId.getCleanId(id);
	};

	this.toString = function () {
		return this.getCleanId();
	};

	this.getRawId = function () {
		return id;
	};
};

DevToolsEncodedId.isComponentId = function (id) {
	return typeof id === "string" && id.startsWith(DevToolsEncodedId.COMPONENT_CONTROL_CHAR);
};

DevToolsEncodedId.isActionId = function (id) {
	return typeof id === "string" && id.startsWith(DevToolsEncodedId.ACTION_CONTROL_CHAR);
};

DevToolsEncodedId.getCleanId = function (id) {
	return typeof id === "string" && (id.startsWith(DevToolsEncodedId.COMPONENT_CONTROL_CHAR) || id.startsWith(DevToolsEncodedId.ACTION_CONTROL_CHAR)) ? id.substr(1) : id;
};

Object.defineProperty(DevToolsEncodedId, "COMPONENT_CONTROL_CHAR", {
	"value": "\u263A", // This value is a component Global Id
	"configurable": false,
	"writable": false
});

Object.defineProperty(DevToolsEncodedId, "ACTION_CONTROL_CHAR", {
	"value": "\u2744", // ❄ - This is an action
	"configurable": false,
	"writable": false
});

Object.defineProperty(DevToolsEncodedId, "ESCAPE_CHAR", {
	"value": "\u2353", // This value was escaped, unescape before using.
	"configurable": false,
	"writable": false
});

/***/ }),

/***/ "./src/devtoolsPanel/WebExtensionsRuntime.js":
/*!***************************************************!*\
  !*** ./src/devtoolsPanel/WebExtensionsRuntime.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = WebExtensionsRuntime;
function WebExtensionsRuntime(name) {
    const onConnectListeners = [];
    const _subscribers = new Map();

    this.connect = function (callback) {
        const tabId = this.getTabId();
        const runtime = chrome.runtime.connect({ "name": name });

        if (callback) {
            onConnectListeners.push(callback);
        }

        runtime.postMessage({ "action": "BackgroundPage:publish", "key": "BackgroundPage:InjectContentScript", "data": tabId });
        runtime.onMessage.addListener(BackgroundScript_OnMessage.bind(this));
        runtime.postMessage({ subscribe: ["AuraInspector:bootstrap"], port: runtime.name, tabId: tabId });
        this.publish("AuraInspector:OnPanelConnect", "Chrome Runtime: Panel " + name + " connected to the page.");
    };

    /**
     * Listen for a published message through the system.
     *
     * @param  {String} key Unique MessageId that would be broadcast through the system.
     * @param  {Function} callback function to be executed when the message is published.
     */
    this.subscribe = function (key, callback) {
        if (!_subscribers.has(key)) {
            _subscribers.set(key, []);
        }

        _subscribers.get(key).push(callback);
    };

    /**
     * Broadcast a message to a listener at any (Non Background) level in the inspector. Including, the InjectedScript, the ContentScript or the DevToolsPanel object.
     *
     * @param  {String} key MessageID to broadcast.
     * @param  {Object} data any type of data to pass to the subscribe method.
     */
    this.publish = function (key, data) {
        if (!key) {
            return;
        }

        const jsonData = JSON.stringify(data);
        const command = `
            window.postMessage({
                "action": "AuraInspector:publish",
                "key": "${key}",
                "data": ${jsonData}
            }, window.location.origin);
        `;

        chrome.devtools.inspectedWindow.eval(command, function () {
            if (_subscribers.has(key)) {
                //console.log(key, _subscribers.get(key).length)
                _subscribers.get(key).forEach(function (callback) {
                    callback(data);
                });
            }
        });

        chromeEval(command);
    };

    // Aren't doing yet.
    // We'll probably want two, sendMessageToBackgroundScript(), sendMessageToContentScript()
    this.sendMessage = function () {};

    // Usually happens with a page refresh.
    this.disconnect = function () {};

    this.getTabId = function () {
        return chrome.devtools.inspectedWindow.tabId;
    };

    this.onSelectionChanged = function (callback) {
        chrome.devtools.panels.elements.onSelectionChanged.addListener(callback);
    };

    this.eval = function (code, callback) {
        chromeEval(code, callback);
    };

    // Injected Script Proxy
    this.InjectedScript = {
        "getComponent": function (globalId, callback, config) {
            const configuration = config ? JSON.stringify(config) : "{}";
            const code = `window[Symbol.for('AuraDevTools')].Inspector.getComponent('${globalId}', ${configuration});`;

            chromeEval(code, (response, exceptionInfo) => {
                if (exceptionInfo) {
                    console.error(code, " resulted in exception ", exceptionInfo);
                }

                if (!response) {
                    return;
                }

                const component = ResolveJSONReferences(JSON.parse(response));

                if (callback) {
                    callback(component);
                }
            });
        }
    };

    /** EVENT HANDLERS **/

    function BackgroundScript_OnMessage(message) {
        if (!message) {
            return;
        }
        if (message.action === "AuraInspector:bootstrap") {
            onConnectListeners.forEach(function (callback) {
                if (typeof callback == "function") {
                    callback();
                }
            });
        }
        //  else if(message.action === PUBLISH_KEY) {
        //     callSubscribers(message.key, message.data);
        // } else if(message.action === PUBLISH_BATCH_KEY) {
        //     var data = message.data || [];
        //     for(var c=0,length=data.length;c<length;c++) {
        //         callSubscribers(data[c].key, data[c].data);
        //     }
        // }
    }

    /** HELPERS **/

    function chromeEval(code, callback) {
        chrome.devtools.inspectedWindow.eval(code, callback);
    }

    function ResolveJSONReferences(object) {
        if (!object) {
            return object;
        }

        //var count = 0;
        const serializationMap = new Map();
        const unresolvedReferences = [];

        function resolve(current, parent, property) {
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

                for (let property in current) {
                    if (current.hasOwnProperty(property)) {
                        if (typeof current[property] === "object") {
                            current[property] = resolve(current[property], current, property);
                        }
                    }
                }
            }
            return current;
        }

        object = resolve(object);

        // If we had some resolutions out of order, lets clean those up now that we've parsed everything that is serialized.
        let unresolved;
        for (let c = 0, length = unresolvedReferences.length; c < length; c++) {
            unresolved = unresolvedReferences[c];
            unresolved.parent[unresolved.property] = serializationMap.get(unresolved["$serRefId$"]);
        }

        return object;
    }
}

/***/ }),

/***/ "./src/devtoolsPanel/devtoolsPanel.css":
/*!*********************************************!*\
  !*** ./src/devtoolsPanel/devtoolsPanel.css ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(/*! !../../node_modules/css-loader!./devtoolsPanel.css */ "./node_modules/css-loader/index.js!./src/devtoolsPanel/devtoolsPanel.css");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(/*! ../../node_modules/style-loader/lib/addStyles.js */ "./node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),

/***/ "./src/devtoolsPanel/optionsProxy.js":
/*!*******************************************!*\
  !*** ./src/devtoolsPanel/optionsProxy.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 *
 * Don't feel like implementing the google.settings stuff yet, so just faking it out.
 * We'll NEED this soon though. 
 */

/* Because this is how Google DevTools Settings work */
const AuraInspectorOptions = {
	getAll: function (defaults, callback) {
		defaults = defaults || {};
		var isDirty = false;
		for (let key in defaults) {
			if (!_map.hasOwnProperty(key)) {
				_map[key] = defaults[key];
				isDirty = true;
			}
		}
		if (isDirty) {
			_clonedMap = cloneObject(_map);
		}
		if (typeof callback === "function") {
			callback(_clonedMap);
		}
	},

	set: function (key, value, callback) {
		if (_map[key] !== value) {
			_map[key] = value;

			setStorage("AuraInspectorOptions", _map);
			_clonedMap = cloneObject(_map);
		}
		if (typeof callback == "function") {
			callback(_clonedMap);
		}
	}
};

exports.default = AuraInspectorOptions;


const _persistedOptions = getStorage("AuraInspectorOptions") || "{}";
const _map = JSON.parse(_persistedOptions);
var _clonedMap = cloneObject(_map);

function cloneObject(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function getStorage(key) {
	// Local storage could be prohibited from being used because of security settings.
	var map;
	try {
		map = localStorage.getItem(key);
	} catch (e) {}
	return map;
}

function setStorage(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (e) {
		return false;
	}
	return true;
}

/***/ }),

/***/ "./src/devtoolsPanel/treeview.js":
/*!***************************************!*\
  !*** ./src/devtoolsPanel/treeview.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TreeNode = TreeNode;
exports.AuraInspectorTreeView = AuraInspectorTreeView;

var _optionsProxy = __webpack_require__(/*! ./optionsProxy */ "./src/devtoolsPanel/optionsProxy.js");

var _optionsProxy2 = _interopRequireDefault(_optionsProxy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function TreeNode(text, id) {
    var _children = [];
    var _formatter = null;

    // ?
    this.addChild = function (node) {
        if (Array.isArray(node)) {
            _children = _children.concat(node);
        } else {
            _children.push(node);
        }
    };

    this.getId = function () {
        return id;
    };

    this.getChildren = function () {
        return _children;
    };

    this.getLabel = function () {
        if (this.getFormatter()) {
            return this.getFormatter()(this.getRawLabel());
        }
        return this.getRawLabel();
    };

    this.getRawLabel = function () {
        return text;
    };

    this.hasChildren = function () {
        return _children.length > 0;
    };

    this.hasFormatter = function () {
        return !!_formatter;
    };

    this.getFormatter = function () {
        return _formatter;
    };

    this.setFormatter = function (formatter) {
        _formatter = formatter;
    };

    this.toString = function () {
        return JSON.stringify(text) + " [" + this.getLabel() + "]";
    };
}

(function () {

    var formatters = {
        ComponentDefFormatter: function (value) {
            // Needs Improvement
            // Just not doing now, because component defs are messed in the head.
            var text_node = document.createTextNode("[[ComponentDef]]");
            var fragment = formatters.ComponentFormatter(value);
            fragment.insertBefore(text_node, fragment.firstElementChild);
            return fragment;
        },
        ComponentFormatter: function (value) {
            value.tagName = value.tagName.split("://")[1] || value.tagName;

            var fragment = document.createDocumentFragment();

            var tagname = document.createElement("span");
            tagname.className = "component-tagname";
            tagname.appendChild(document.createTextNode("<" + value.tagName));

            fragment.appendChild(tagname);

            // var pattern = [
            //     '<span class="component-tagname">&lt;{tagName}</span>'
            // ];

            // I doubt this will work once I switch over to google settings, so...
            var defaultOptions = { showGlobalIds: false };
            _optionsProxy2.default.getAll(defaultOptions, function (options) {
                if (options.showGlobalIds) {
                    //pattern.push(' <span class="component-attribute">globalId</span>="{globalId}"');
                    var globalid = document.createElement("span");
                    globalid.className = "component-attribute";
                    globalid.appendChild(document.createTextNode(" globalId"));

                    fragment.appendChild(globalid);
                    fragment.appendChild(document.createTextNode('="'));
                    fragment.appendChild(document.createTextNode(value.globalId));
                    fragment.appendChild(document.createTextNode('"'));
                }
            });

            if (value.attributes) {
                var current;
                var count_element;
                var attribute_element;
                for (var attr in value.attributes) {
                    if (attr != "body") {
                        current = value.attributes[attr];

                        attribute_element = document.createElement("span");
                        attribute_element.className = "component-attribute";
                        attribute_element.appendChild(document.createTextNode(attr));

                        fragment.appendChild(document.createTextNode(" "));
                        fragment.appendChild(attribute_element);
                        fragment.appendChild(document.createTextNode('="'));

                        if (current && Array.isArray(current)) {

                            if (current.lenght) {
                                fragment.appendChild(document.createTextNode("["));
                                count_element = document.createElement("i");
                                count_element.className = "component-array-length";
                                count_element.appendChild(document.createTextNode(count.length));
                                fragment.appendChild(count_element);
                                fragment.appendChild(document.createTextNode("]"));
                            } else {
                                fragment.appendChild(document.createTextNode("[]"));
                            }
                        } else if (current && typeof current === "object") {
                            fragment.appendChild(document.createTextNode(Object.keys(current).length ? "{...}" : "{}"));
                        } else if (isFCV(current)) {
                            fragment.appendChild(document.createTextNode(formatFCV(current)));
                        } else {
                            fragment.appendChild(document.createTextNode(current + ""));
                        }
                        fragment.appendChild(document.createTextNode('"'));
                    }
                }
            }

            fragment.appendChild(document.createTextNode(">"));
            return fragment;
        },
        HtmlComponentFormatter: function (value) {
            value.tagName = value.attributes.tag;
            delete value.attributes.tag;
            var pattern = ['<span class="component-tagname">&lt;{tagName}</span>'];

            var defaultOptions = { showGlobalIds: false };
            _optionsProxy2.default.getAll(defaultOptions, function (options) {
                if (options.showGlobalIds) {
                    pattern.push(' <span class="component-attribute">globalId</span>="{globalId}"');
                }
            });

            if (value.attributes["aura:id"]) {
                pattern.push(' <span class="component-attribute">aura:id</span>="' + value.attributes["aura:id"] + '"');
                for (var attr in value.attributes.HTMLAttributes) {
                    if (isFCV(value.attributes.HTMLAttributes[attr])) {
                        pattern.push(' <span class="component-attribute">' + attr + '</span>="' + String$escape(formatFCV(value.attributes.HTMLAttributes[attr])) + '"');
                    } else {
                        pattern.push(' <span class="component-attribute">' + attr + '</span>="' + String$escape(value.attributes.HTMLAttributes[attr]) + '"');
                    }
                }
            }

            pattern.push("&gt;");
            return String$format(pattern.join(''), value);
        },
        TextComponentFormatter: function (value) {
            var text = value.attributes.value;
            // Whats the point of returning empty text nodes anyway?
            // Should probably show /n for carriage returns
            if (!text || text.trim().length == 0) {
                text = '&quot;&quot;';
            } else {
                text = "&quot;" + text + "&quot;";
            }
            return text;
        },
        ExpressionComponentFormatter: function (value) {
            var expression = value.attributes.expression;

            // ByReference {!...}
            if (expression) {
                if (isFCV(expression)) {
                    return formatFCV(expression);
                }
                return expression;
            }

            var attributeValue = value.attributes.value;

            // ByValue {#...}
            return attributeValue;
        },
        KeyValueFormatter: function (config) {
            var value = config.value;
            var key = config.key;

            // Function
            if (value && typeof value == "string" && value.toString().indexOf("function (") === 0 || typeof value === "function") {
                value = formatters.FunctionFormatter(value);
            }
            // Empty String
            else if (typeof value === "string" && value.trim().length === 0) {
                    value = '"' + value + '"';
                }
                // Array
                else if (value && Array.isArray(value)) {
                        if (value.length) {
                            var element = document.createElement("span");
                            element.appendChild(document.createTextNode("["));

                            var count = document.createElement("i");
                            count.className = "component-array-length";
                            count.appendChild(document.createTextNode(value.length));

                            element.appendChild(count);
                            element.appendChild(document.createTextNode("]"));
                            value = element;
                        } else {
                            value = "[]";
                        }
                    }
                    // Non Dom object
                    else if (value && typeof value === "object" && !("nodeType" in value)) {
                            // {...} if it has content
                            // {} if it is empty
                            value = Object.keys(value).length ? "{...}" : "{}";
                        }

            var propertyelement = document.createElement("span");
            propertyelement.className = "component-property";
            propertyelement.appendChild(document.createTextNode(key));

            var valueelement = document.createElement("span");
            valueelement.className = "component-property-value";
            valueelement.appendChild(value && value.nodeType ? value : document.createTextNode(value + ""));

            var fragment = document.createDocumentFragment();
            fragment.appendChild(propertyelement);
            fragment.appendChild(document.createTextNode(":"));
            fragment.appendChild(valueelement);

            return fragment;
        },
        PropertyFormatter: function (value) {
            return '<span class="component-property">' + value + '</span>';
        },
        FunctionFormatter: function (value) {
            var span = document.createElement("span");
            span.appendChild(document.createTextNode("function(){...}"));
            span.setAttribute("title", value + "");
            return span;
        },
        FacetFormatter: function (value) {
            var property_element = document.element("span");
            property_element.className = "component-property";
            property_element.appendChild(document.createTextNode(value.property));

            var fragment = formatters.ComponentFormatter(value);

            fragment.insertBefore(document.createTextNode(": "), fragment.firstElementChild);
            fragment.insertBefore(property_element, fragment.firstElementChild);
            return fragment;

            //return '<span class="component-property">' + value.property + '</span>:' + formatters.ComponentFormatter(value);
        },
        Header: function (value) {
            return '<h3>' + value + '</h3>';
        },
        DescriptorFormatter: function (value) {
            return value.replace(/markup:\/\/(\w+):(\w+)/, '<span class="component-prefix">$1</span>:<span class="component-tagname">$2</span>');
        },
        GlobalIdFormatter: function (value) {
            return `<aurainspector-auracomponent globalId='${value}'></aurainspector-auracomponent>`;
        },
        ControllerReference: function (value) {
            if (typeof value === "object") {
                return `<aurainspector-controllerreference expression="${value.expression}" component="${value.component}"></aurainspector-controllerreference>`;
            }
            return `<aurainspector-controllerreference>${value}</aurainspector-controllerreference>`;
        }
    };

    // Factory for creating known types of TreeNodes with their known formatters.
    TreeNode.create = function (data, id, format) {
        var node = new TreeNode(data, id);

        switch (format) {
            case "aura:html":
                node.setFormatter(formatters.HtmlComponentFormatter);
                break;
            case "aura:text":
                node.setFormatter(formatters.TextComponentFormatter);
                break;
            case "aura:expression":
                node.setFormatter(formatters.ExpressionComponentFormatter);
                break;
            case "component":
                node.setFormatter(formatters.ComponentFormatter);
                break;
            case "componentdef":
                node.setFormatter(formatters.ComponentDefFormatter);
                break;
            case "header":
                node.setFormatter(formatters.Header);
                break;
            case "keyvalue":
                node.setFormatter(formatters.KeyValueFormatter);
                break;
            case "descriptor":
                node.setFormatter(formatters.DescriptorFormatter);
                break;
            case "globalId":
                node.setFormatter(formatters.GlobalIdFormatter);
                break;
            case "controllerref":
                node.setFormatter(formatters.ControllerReference);
                break;
            case "property":
                node.setFormatter(formatters.PropertyFormatter);
                break;
        }

        return node;
    };

    /* 
     * Very SFDC specific. Takes a config def, and returns simply the node with the proper formatting.
     */
    TreeNode.parse = function (config) {
        var COMPONENT_CONTROL_CHAR = "\u263A"; // ☺ - This value is a component Global Id
        var ACTION_CONTROL_CHAR = "\u2744"; // ❄ - This is an action

        if (!config) {
            return new TreeNode();
        }

        if (typeof config === "string" && config.startsWith(COMPONENT_CONTROL_CHAR)) {
            return TreeNode.create(config.substr(1), config, "globalId");
        }

        if (typeof config === "string" && config.startsWith(ACTION_CONTROL_CHAR)) {
            return TreeNode.create(config.substr(1), config, "controllerref");
        }

        var id = config.globalId || "";
        var attributes = {
            globalId: id,
            attributes: {}
        };

        if (config.localId) {
            attributes.attributes["aura:id"] = config.localId;
        }

        var body = [];

        if (config.attributes) {
            for (var property in config.attributes) {
                if (!config.attributes.hasOwnProperty(property)) {
                    continue;
                }

                if (config.expressions && config.expressions.hasOwnProperty(property)) {
                    attributes.attributes[property] = config.expressions[property];
                } else {
                    attributes.attributes[property] = config.attributes[property];
                }
            }
        }

        var node;

        // is Html?
        if (config.descriptor === "markup://aura:html") {
            attributes.tagName = config.descriptor;
            node = TreeNode.create(attributes, id, "aura:html");
        } else if (config.descriptor === "markup://aura:text") {
            attributes.tagName = config.descriptor;
            node = TreeNode.create(attributes, id, "aura:text");
        } else if (config.descriptor === "markup://aura:expression") {
            attributes.tagName = config.descriptor;
            node = TreeNode.create(attributes, id, "aura:expression");
        } else if (config.globalId) {
            attributes.tagName = config.descriptor;
            node = TreeNode.create(attributes, id, "component");
        } else if (config.componentDef && config.componentDef.descriptor) {
            // TODO: Component Defs are broken
            attributes.tagName = config.componentDef.descriptor;
            node = TreeNode.create(attributes, id, "componentdef");
        }

        return node;
    };

    function String$format(str, o) {
        if (typeof str != "string") {
            throw new Error("String$format(str, o), you pass an invalid value as the str parameter, must be of type string.");
        }
        return str.replace(/\{([^{}]*)\}/g, function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        });
    };

    function String$escape(string) {
        if (typeof string != "string") {
            return string;
        }
        return string.replace("<", "&lt;").replace(">", "&gt;");
    }

    function isFCV(compiledFcv) {
        var devFcvPrefix = "function (cmp, fn) { return ";
        var prodFcvPrefix = "function (a,b){return";

        return typeof compiledFcv === "string" && (compiledFcv.startsWith(devFcvPrefix) || compiledFcv.startsWith(prodFcvPrefix));
    }

    function formatFCV(compiledFcv) {
        var devFcvPrefix = "function (cmp, fn) { return ";
        var prodFcvPrefix = "function (a,b){return";

        // FCV in Dev Mode, code will be different in Prod Mode so we'll do a separate block for that.
        if (compiledFcv.startsWith(devFcvPrefix)) {
            // Lets try to clean up the Function a bit to make it easier to read.
            compiledFcv = "{! " +
            // remove the initial function() { portion and the ending }
            compiledFcv.substr(devFcvPrefix.length, compiledFcv.length - devFcvPrefix.length - 1)
            // change fn.method, to just method
            .replace(/fn\.([a-zA-Z]+)\(/g, "$1(")
            // Change cmp.get("v.val") to just v.val
            .replace(/cmp\.get\(\"([a-zA-Z\._]+)\"\)/g, "$1")
            // ensure consistent ending
            .trim() + " }";
        } else if (compiledFcv.startsWith(prodFcvPrefix)) {
            compiledFcv = "{! " +
            // Strip beginning function() { and ending }
            compiledFcv.substr(prodFcvPrefix.length, compiledFcv.length - prodFcvPrefix.length - 1)
            // In prod, it's not fn.method its b.method, so change it to just method
            .replace(/b\.([a-zA-Z]+)\(/g, "$1(")
            // Again in Prod, it's a.get, not cmp.get, so remove a.get and end up with just v.property
            .replace(/a\.get\(\"([a-zA-Z\._]+)\"\)/g, "$1")
            // consistent ending
            .trim() + " }";
        }

        return compiledFcv;
    }
})();

function AuraInspectorTreeView(treeContainer) {
    var _children = [];
    var nodeIdToHtml;
    var events = new Map();
    var htmlToTreeNode = new WeakMap();
    var container;
    var isRendered = false;
    var isCollapsable = false;

    // Constants
    var AUTO_EXPAND_LEVEL = 3;
    var AUTO_EXPAND_CHILD_COUNT = 2;

    this.addChild = function (child) {
        _children.push(child);
    };

    this.addChildren = function (children) {
        if (!Array.isArray(children)) {
            children = [children];
        }
        _children = _children.concat(children);
    };

    this.getChildren = function () {
        return _children;
    };

    this.clearChildren = function () {
        _children = [];
    };

    this.render = function (options) {
        if (!container) {
            container = document.createElement("ul");
            container.className = "tree-view";

            // Events
            container.addEventListener("mouseout", Container_MouseOut.bind(this));
            container.addEventListener("mouseover", Container_MouseOver.bind(this));
            container.addEventListener("click", Container_Click.bind(this));
            container.addEventListener("dblclick", Container_DblClick.bind(this));
        } else {
            container.innerHTML = "";
        }
        treeContainer.innerHTML = "";
        nodeIdToHtml = new Map();

        // Configurable rendering options
        options = Object.assign({
            "collapsable": false,
            "selectedNodeId": undefined
        }, options);

        try {
            for (var c = 0; c < _children.length; c++) {
                if (_children[c]) {
                    container.appendChild(renderNode(_children[c]));
                }
            }

            treeContainer.appendChild(container);
        } catch (e) {
            alert([e.message, e.stack]);
        }

        if (options.collapsable === true) {
            container.classList.add("collapsable");
            isCollapsable = true;
        }

        isRendered = true;

        if (options.hasOwnProperty("selectedNodeId")) {
            this.selectById(options.selectedNodeId);
        }
    };

    this.attach = function (eventName, eventHandler) {
        if (!events.has(eventName)) {
            events.set(eventName, new Set());
        }
        events.get(eventName).add(eventHandler);
    };

    this.notify = function (eventName, data) {
        if (events.has(eventName)) {
            var eventInfo = { "data": data };
            events.get(eventName).forEach(function (item) {
                item(eventInfo);
            });
        }
    };

    this.expandAll = function () {
        var nodes = container.querySelectorAll("li.tree-view-parent");
        for (var c = 0, length = nodes.length; c < length; c++) {
            expandNode(nodes[c]);
        }
    };

    this.selectById = function (nodeId) {
        if (!this.isRendered()) {
            return;
        }

        if (nodeIdToHtml.has(nodeId)) {
            var node = nodeIdToHtml.get(nodeId);
            if (node) {
                var current = node;
                while (current && !current.matches("ul.tree-view")) {
                    if (current.tagName === "LI") {
                        expandNode(current);
                    }
                    current = current.parentNode;
                }

                selectNode(node);
                this.notify("onselect", { domNode: node, treeNode: htmlToTreeNode.get(node) });
            }
        }
    };

    this.isRendered = function () {
        return isRendered;
    };

    this.isCollapsable = function () {
        return isCollapsable;
    };

    /* Event Handlers */
    function Container_MouseOut(event) {
        if (event.target == event.srcElement) {
            this.notify("onhoverout", { domNode: event.target });
        }
    }

    function Container_MouseOver(event) {
        // SPAN?
        var nodeClass = "tree-view-node";
        var target = event.target;
        while (target && target.parentNode && !target.classList.contains(nodeClass)) {
            target = target.parentNode;
        }
        // We hovered a list item
        if (target && target.parentNode && target.classList.contains(nodeClass)) {
            var li = target.parentNode;
            this.notify("onhover", { domNode: li, treeNode: htmlToTreeNode.get(li) });
        }
    }

    function Container_Click(event) {
        var spanClass = "tree-view-node";
        var target = event.target;

        // Did we click the expand/collapse arrow?
        toggleExpandCollapse(event);

        while (target && target.parentNode) {
            // Did we click on the span?
            if (target.classList.contains(spanClass)) {
                var li = target.parentNode;
                selectNode(li);
                this.notify("onselect", { domNode: li, treeNode: htmlToTreeNode.get(li) });
                return;
            }
            target = target.parentNode;
        }
    }

    function Container_DblClick(event) {
        var nodeClass = "tree-view-node";
        var parentClass = "tree-view-parent";
        var expanded = "tree-view-expanded";
        var target = event.target;
        while (target && target.parentNode && !target.classList.contains(nodeClass)) {
            target = target.parentNode;
        }
        // We hovered a list item
        if (target && target.parentNode && target.classList.contains(nodeClass)) {
            var li = target.parentNode;
            selectNode(li);
            if (li.classList.contains(parentClass)) {
                li.classList.toggle(expanded);
            }
            this.notify("ondblselect", { domNode: li, treeNode: htmlToTreeNode.get(li) });
        }
    }

    /* Private Methods */
    function renderNode(node, autoExpandCounter) {
        autoExpandCounter = autoExpandCounter || 1;
        var span = document.createElement("span");
        span.className = "tree-view-node";
        var li = document.createElement("li");
        li.appendChild(span);
        var isAutoExpanded = autoExpandCounter < AUTO_EXPAND_LEVEL;
        var label = node.getLabel();

        if (node.hasFormatter()) {
            if (label && typeof label === "object" && "nodeType" in label) {
                span.appendChild(label);
            } else {
                span.innerHTML = label;
            }
        } else {
            span.appendChild(document.createTextNode(label));
        }

        if (autoExpandCounter === AUTO_EXPAND_LEVEL && node.getChildren().length <= AUTO_EXPAND_CHILD_COUNT) {
            autoExpandCounter--;
            isAutoExpanded = true;
        }
        nodeIdToHtml.set(node.getId(), li);

        if (node.hasChildren()) {
            // Add Expand box
            li.classList.add("tree-view-parent");
            if (isAutoExpanded) {
                li.classList.add("tree-view-expanded");
            }

            var ul = document.createElement("ul");

            var children = node.getChildren();
            for (var c = 0; c < children.length; c++) {
                if (children[c]) {
                    ul.appendChild(renderNode(children[c], autoExpandCounter + 1));
                }
            }

            li.appendChild(ul);
        }

        htmlToTreeNode.set(li, node);
        return li;
    }

    function toggleExpandCollapse(event) {
        var liClass = "tree-view-parent";
        var expanded = "tree-view-expanded";

        // Are we on the LI     
        if (event.target.classList.contains(liClass)) {
            // Inside the ::before boundry box?
            if (event.offsetX < 14 && event.offsetY < 14) {
                event.target.classList.toggle(expanded);
            }
        }
    }

    function expandNode(li) {
        if (!li.classList.contains("tree-view-expanded")) {
            li.classList.add("tree-view-expanded");
        }
    }

    function selectNode(node) {
        var previous = container.querySelector("li.tree-node-selected");
        if (previous) {
            previous.classList.remove("tree-node-selected");
        }
        if (node) {
            node.classList.add("tree-node-selected");
        }
    }
}

/***/ }),

/***/ "./src/sidebarPanel/sidebarPanel.css":
/*!*******************************************!*\
  !*** ./src/sidebarPanel/sidebarPanel.css ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(/*! !../../node_modules/css-loader!./sidebarPanel.css */ "./node_modules/css-loader/index.js!./src/sidebarPanel/sidebarPanel.css");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(/*! ../../node_modules/style-loader/lib/addStyles.js */ "./node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),

/***/ "./src/sidebarPanel/sidebarPanel.js":
/*!******************************************!*\
  !*** ./src/sidebarPanel/sidebarPanel.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(/*! ../devtoolsPanel/devtoolsPanel.css */ "./src/devtoolsPanel/devtoolsPanel.css");

__webpack_require__(/*! ./sidebarPanel.css */ "./src/sidebarPanel/sidebarPanel.css");

var _AuraInspectorComponentView = __webpack_require__(/*! ../devtoolsPanel/AuraInspectorComponentView */ "./src/devtoolsPanel/AuraInspectorComponentView.js");

var _AuraInspectorComponentView2 = _interopRequireDefault(_AuraInspectorComponentView);

var _DevToolsEncodedId = __webpack_require__(/*! ../devtoolsPanel/DevToolsEncodedId */ "./src/devtoolsPanel/DevToolsEncodedId.js");

var _DevToolsEncodedId2 = _interopRequireDefault(_DevToolsEncodedId);

var _WebExtensionsRuntime = __webpack_require__(/*! ../devtoolsPanel/WebExtensionsRuntime */ "./src/devtoolsPanel/WebExtensionsRuntime.js");

var _WebExtensionsRuntime2 = _interopRequireDefault(_WebExtensionsRuntime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// get Id From URL
document.addEventListener("DOMContentLoaded", () => {
    var sidebarPanel = new AuraInspectorSideBarPanel();
    sidebarPanel.init(document.getElementById("sidebarContainer"));
});

function AuraInspectorSideBarPanel() {
    var _container;
    var _componentView;
    var _runtime;

    this.init = function (container) {
        _container = container;
        _runtime = new _WebExtensionsRuntime2.default("AuraInspectorSideBarPanel");

        _runtime.connect(() => {
            _componentView = new _AuraInspectorComponentView2.default(this);
            _componentView.init(_container);

            // Attach the listener
            //chrome.devtools.panels.elements.onSelectionChanged.addListener(ElementsPanel_OnSelectionChanged.bind(this));
            _runtime.onSelectionChanged(ElementsPanel_OnSelectionChanged.bind(this));

            // Call it initially for the first time
            // Detect if the content script is injected, if so, update, otherwise inject content script then update.
            this.update();
        });
    };

    this.update = function () {
        _runtime.eval("this.$0 && $0.getAttribute && $0.getAttribute('data-aura-rendered-by')", function (globalId) {
            if (globalId) {
                _container.classList.remove("hidden");
                _componentView.setData(globalId);
            } else {
                _container.classList.add("hidden");
            }
        });
    };

    this.getComponent = function (globalId, callback, configuration) {
        if (typeof callback !== "function") {
            throw new Error("callback is required for - getComponent(globalId, callback)");
        }
        globalId = _DevToolsEncodedId2.default.getCleanId(globalId);

        _runtime.InjectedScript.getComponent(globalId, callback, configuration);
    };

    this.getCount = function (key, callback) {
        if (typeof callback !== "function") {
            throw new Error("callback is required for - getCount(key, callback)");
        }
        const command = `window[Symbol.for('AuraDevTools')].Inspector.getCount('${key}');`;

        chrome.devtools.inspectedWindow.eval(command, function (response, exceptionInfo) {
            if (exceptionInfo) {
                console.error(command, " resulted in ", exceptionInfo);
            }

            const count = parseInt(response, 10);

            callback(count);
        });
    };

    /**
     * Broadcast a message to a listener at any level in the inspector. Including, the InjectedScript, the ContentScript or the DevToolsPanel object.
     *
     * @param  {String} key MessageID to broadcast.
     * @param  {Object} data any type of data to pass to the subscribe method.
     */
    this.publish = function (key, data) {
        if (!key) {
            return;
        }

        const jsonData = JSON.stringify(data);
        const command = `
            window.postMessage({
                "action": "AuraInspector:publish",
                "key": "${key}",
                "data": ${jsonData}
            }, window.location.href);
        `;

        _runtime.eval(command);
    };

    function ElementsPanel_OnSelectionChanged() {
        this.update();
    }
}

/***/ }),

/***/ 2:
/*!************************************************!*\
  !*** multi ./src/sidebarPanel/sidebarPanel.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./src/sidebarPanel/sidebarPanel.js */"./src/sidebarPanel/sidebarPanel.js");


/***/ })

/******/ });
//# sourceMappingURL=viewerSidebar.js.map