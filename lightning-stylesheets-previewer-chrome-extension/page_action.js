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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ({

/***/ 3:
/*!****************************************!*\
  !*** ./src/page_action/page_action.js ***!
  \****************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

eval("const disableActivationButton = () => {\n\tdocument.querySelector(\".button-deactivate\").setAttribute(\"disabled\", true);\n}\n\nconst disablePanelToggle = () => {\n\tdocument.querySelector(\".button-panel-toggle\").setAttribute(\"disabled\", true);\n}\n\ndocument.querySelector(\".button-deactivate\").addEventListener(\"click\", () => {\n\tchrome.tabs.query({active: true, currentWindow: true}, tabs => {\n\t\tchrome.tabs.sendMessage(tabs[0].id, {msg: \"activateSlds4Vf\"}, response => {\n\t\t\tconsole.log(response);\n\t\t\tif(response.complete) disableActivationButton();\n\t\t});\n\t})\n});\n\ndocument.querySelector(\".button-panel-toggle\").addEventListener(\"click\", () => {\n\tchrome.tabs.query({active: true, currentWindow: true}, tabs => {\n\t\tchrome.tabs.sendMessage(tabs[0].id, {msg: \"openPanel\"}, response => {\n\t\t\tconsole.log(response);\n\t\t});\n\t})\n\tdisablePanelToggle();\n});\n\nchrome.runtime.onMessage.addListener((request, sender, sendResponse) => {\n  switch (request.msg) {\n\t\tcase \"lightningStylesheetsActivated\":\n\t\t\tif(request.value) disableActivationButton();\n\t\t\tbreak;\n\t}\n});\n\nchrome.tabs.query({active: true, currentWindow: true}, tabs => {\n\tchrome.tabs.sendMessage(tabs[0].id, {msg: \"isLightningStylesheetsActive\"}, response => {\n\t\tconsole.log(response);\n\t\tif(response.value) disableActivationButton();\n\t});\n\tchrome.tabs.sendMessage(tabs[0].id, {msg: \"isPanelOpen\"}, response => {\n\t\tconsole.log(response);\n\t\tif(response.value) disablePanelToggle();\n\t});\n})\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9wYWdlX2FjdGlvbi9wYWdlX2FjdGlvbi5qcz9mNWI3Il0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGRpc2FibGVBY3RpdmF0aW9uQnV0dG9uID0gKCkgPT4ge1xuXHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmJ1dHRvbi1kZWFjdGl2YXRlXCIpLnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIHRydWUpO1xufVxuXG5jb25zdCBkaXNhYmxlUGFuZWxUb2dnbGUgPSAoKSA9PiB7XG5cdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYnV0dG9uLXBhbmVsLXRvZ2dsZVwiKS5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbn1cblxuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5idXR0b24tZGVhY3RpdmF0ZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuXHRjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgdGFicyA9PiB7XG5cdFx0Y2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFic1swXS5pZCwge21zZzogXCJhY3RpdmF0ZVNsZHM0VmZcIn0sIHJlc3BvbnNlID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblx0XHRcdGlmKHJlc3BvbnNlLmNvbXBsZXRlKSBkaXNhYmxlQWN0aXZhdGlvbkJ1dHRvbigpO1xuXHRcdH0pO1xuXHR9KVxufSk7XG5cbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYnV0dG9uLXBhbmVsLXRvZ2dsZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuXHRjaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgdGFicyA9PiB7XG5cdFx0Y2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFic1swXS5pZCwge21zZzogXCJvcGVuUGFuZWxcIn0sIHJlc3BvbnNlID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblx0XHR9KTtcblx0fSlcblx0ZGlzYWJsZVBhbmVsVG9nZ2xlKCk7XG59KTtcblxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICBzd2l0Y2ggKHJlcXVlc3QubXNnKSB7XG5cdFx0Y2FzZSBcImxpZ2h0bmluZ1N0eWxlc2hlZXRzQWN0aXZhdGVkXCI6XG5cdFx0XHRpZihyZXF1ZXN0LnZhbHVlKSBkaXNhYmxlQWN0aXZhdGlvbkJ1dHRvbigpO1xuXHRcdFx0YnJlYWs7XG5cdH1cbn0pO1xuXG5jaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgdGFicyA9PiB7XG5cdGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYnNbMF0uaWQsIHttc2c6IFwiaXNMaWdodG5pbmdTdHlsZXNoZWV0c0FjdGl2ZVwifSwgcmVzcG9uc2UgPT4ge1xuXHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblx0XHRpZihyZXNwb25zZS52YWx1ZSkgZGlzYWJsZUFjdGl2YXRpb25CdXR0b24oKTtcblx0fSk7XG5cdGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYnNbMF0uaWQsIHttc2c6IFwiaXNQYW5lbE9wZW5cIn0sIHJlc3BvbnNlID0+IHtcblx0XHRjb25zb2xlLmxvZyhyZXNwb25zZSk7XG5cdFx0aWYocmVzcG9uc2UudmFsdWUpIGRpc2FibGVQYW5lbFRvZ2dsZSgpO1xuXHR9KTtcbn0pXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9wYWdlX2FjdGlvbi9wYWdlX2FjdGlvbi5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDEiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Iiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///3\n");

/***/ })

/******/ });