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