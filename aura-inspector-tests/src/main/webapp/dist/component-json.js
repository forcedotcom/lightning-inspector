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
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ({

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

/***/ "./src/devtoolsPanel/components/json/json.js":
/*!***************************************************!*\
  !*** ./src/devtoolsPanel/components/json/json.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _renderjson = __webpack_require__(/*! ../../external/renderjson */ "./src/devtoolsPanel/external/renderjson.js");

var _renderjson2 = _interopRequireDefault(_renderjson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ownerDocument = document.currentScript.ownerDocument;

var jsonPrototype = Object.create(HTMLDivElement.prototype);

jsonPrototype.createdCallback = function () {
	var template = ownerDocument.querySelector("template");

	var clone = document.importNode(template.content, true);

	var shadowRoot = this.shadowRoot || this.createShadowRoot();
	shadowRoot.appendChild(clone);

	var oldValue = this.textContent;
	var observer = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			var target = mutation.target;
			var newValue = target.textContent;
			if (oldValue !== newValue) {
				target.update();
			}
			oldValue = newValue;
		});
	});

	observer.observe(this, {
		attributes: false,
		childList: true,
		characterData: true
	});

	if (oldValue != "") {
		this.update();
	}
};

jsonPrototype.update = function () {
	var shadowRoot = this.shadowRoot || this.createShadowRoot();

	var output = shadowRoot.querySelector(".renderjson");
	if (output) {
		shadowRoot.removeChild(output);
	}

	output = shadowRoot.querySelector(".returnValue");
	if (output) {
		shadowRoot.removeChild(output);
	}

	var text = this.textContent;
	var json;
	var worthTrying = { "{": true, "[": true, "(": true, "/": true };
	if (text && text.trim() && worthTrying[text.charAt(0)]) {
		try {
			json = JSON.parse(text);
		} catch (e) {};
	}
	if (json) {
		shadowRoot.appendChild(formatJSON(json, { expandTo: this.getAttribute("expandTo") }));
	} else if (text !== undefined && text !== "undefined") {
		var textNode = document.createElement("span");
		textNode.className = "returnValue";
		textNode.appendChild(document.createTextNode(text));
		shadowRoot.appendChild(textNode);
	}
};

document.registerElement('aurainspector-json', {
	prototype: jsonPrototype
});

function formatJSON(object, options) {
	var defaults = {
		expandTo: 0
	};
	options = options || defaults;
	if (options.expandTo === undefined || options.expandTo === null) {
		expandTo = defaults.expandTo;
	}

	// Shared state, so store the old, so we can reset it when we are done.
	var showlevel = _renderjson2.default.show_to_level;

	_renderjson2.default.set_icons('+', '-');
	_renderjson2.default.set_show_to_level(options.expandTo);

	var result = (0, _renderjson2.default)(object);

	_renderjson2.default.set_show_to_level(showlevel);

	return result;
}

/***/ }),

/***/ "./src/devtoolsPanel/external/renderjson.js":
/*!**************************************************!*\
  !*** ./src/devtoolsPanel/external/renderjson.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _DevToolsEncodedId = __webpack_require__(/*! ../DevToolsEncodedId */ "./src/devtoolsPanel/DevToolsEncodedId.js");

var _DevToolsEncodedId2 = _interopRequireDefault(_DevToolsEncodedId);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Copyright © 2013-2014 David Caldwell <david@porkrind.org>
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
// SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
// OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
// CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

// Usage
// -----
// The module exports one entry point, the `renderjson()` function. It takes in
// the JSON you want to render as a single argument and returns an HTML
// element.
//
// Options
// -------
// renderjson.set_icons("+", "-")
//   This Allows you to override the disclosure icons.
//
// renderjson.set_show_to_level(level)
//   Pass the number of levels to expand when rendering. The default is 0, which
//   starts with everything collapsed. As a special case, if level is the string
//   "all" then it will start with everything expanded.
//
// renderjson.set_max_string_length(length)
//   Strings will be truncated and made expandable if they are longer than
//   `length`. As a special case, if `length` is the string "none" then
//   there will be no truncation. The default is "none".
//
// renderjson.set_sort_objects(sort_bool)
//   Sort objects by key (default: false)
//
// Theming
// -------
// The HTML output uses a number of classes so that you can theme it the way
// you'd like:
//     .disclosure    ("⊕", "⊖")
//     .syntax        (",", ":", "{", "}", "[", "]")
//     .string        (includes quotes)
//     .number
//     .boolean
//     .key           (object key)
//     .keyword       ("null", "undefined")
//     .object.syntax ("{", "}")
//     .array.syntax  ("[", "]")

const renderjson = function () {
    var themetext = function () /* [class, text]+ */{
        var spans = [];
        while (arguments.length) spans.push(append(span(Array.prototype.shift.call(arguments)), text(Array.prototype.shift.call(arguments))));
        return spans;
    };
    var append = function () /* el, ... */{
        var el = Array.prototype.shift.call(arguments);
        for (var a = 0; a < arguments.length; a++) if (arguments[a].constructor == Array) append.apply(this, [el].concat(arguments[a]));else el.appendChild(arguments[a]);
        return el;
    };
    var prepend = function (el, child) {
        el.insertBefore(child, el.firstChild);
        return el;
    };
    var isempty = function (obj) {
        for (var k in obj) if (obj.hasOwnProperty(k)) return false;
        return true;
    };
    var text = function (txt) {
        if (typeof txt === "object" && "nodeName" in txt) {
            return txt;
        }
        return document.createTextNode(txt);
    };
    var div = function () {
        return document.createElement("div");
    };
    var span = function (classname) {
        var s = document.createElement("span");
        if (classname) s.className = classname;
        return s;
    };
    var A = function A(txt, classname, callback) {
        var a = document.createElement("a");
        if (classname) a.className = classname;
        a.appendChild(text(txt));
        a.href = '#';
        a.onclick = function () {
            callback();return false;
        };
        return a;
    };

    function _renderjson(json, indent, dont_indent, show_level, max_string, sort_objects) {
        var my_indent = dont_indent ? "" : indent;
        // If we encounter a key with one of these ID's, we'll simply skip over it.
        var skipKeys = { "$serId$": true, "$serRefId$": true };

        var disclosure = function (open, placeholder, close, type, builder) {
            var content;
            var empty = span(type);
            var show = function () {
                if (!content) append(empty.parentNode, content = prepend(builder(), A(renderjson.hide, "disclosure", function () {
                    content.style.display = "none";
                    empty.style.display = "inline";
                })));
                content.style.display = "inline";
                empty.style.display = "none";
            };
            append(empty, A(renderjson.show, "disclosure", show), themetext(type + " syntax", open), A(placeholder, null, show), themetext(type + " syntax", close));

            var el = append(span(), text(my_indent.slice(0, -1)), empty);
            if (show_level > 0) show();
            return el;
        };

        if (json === null) return themetext(null, my_indent, "keyword", "null");
        if (json === void 0) return themetext(null, my_indent, "keyword", "undefined");

        if (typeof json == "string" && json.length > max_string) {
            return disclosure('"', json.substr(0, max_string) + " ...", '"', "string", function () {
                return append(span("string"), themetext(null, my_indent, "string", JSON.stringify(json)));
            });
        }

        // Strings, numbers and bools
        if (typeof json != "object") {
            if (typeof json === "string" && _DevToolsEncodedId2.default.isComponentId(json)) {
                var element = document.createElement("aurainspector-auracomponent");
                element.setAttribute("globalId", _DevToolsEncodedId2.default.getCleanId(json));
                //element.setAttribute("summarize", true);
                return themetext(null, my_indent, typeof json, element);
            }
            return themetext(null, my_indent, typeof json, JSON.stringify(json));
        }

        if (json.constructor == Array) {
            if (json.length == 0) return themetext(null, my_indent, "array syntax", "[]");

            return disclosure("[", " ... ", "]", "array", function () {
                var as = append(span("array"), themetext("array syntax", "[", null, "\n"));
                for (var i = 0; i < json.length; i++) append(as, _renderjson(json[i], indent + "    ", false, show_level - 1, max_string, sort_objects), i != json.length - 1 ? themetext("syntax", ",") : [], text("\n"));
                append(as, themetext(null, indent, "array syntax", "]"));
                return as;
            });
        }

        // object
        if (isempty(json)) return themetext(null, my_indent, "object syntax", "{}");

        return disclosure("{", "...", "}", "object", function () {
            var os = append(span("object"), themetext("object syntax", "{", null, "\n"));
            // This filters out $serId$ which may have snuck in during the serialization process.
            var keys = Object.keys(json).filter(function (key) {
                return !skipKeys.hasOwnProperty(key);
            });
            var length = keys.length;
            if (sort_objects) {
                keys = keys.sort();
            }
            var last = keys[length - 1];
            for (var i = 0; i < length; i++) {
                var k = keys[i];

                append(os, themetext(null, indent + "    ", "key", '"' + k + '"', "object syntax", ': '), _renderjson(json[k], indent + "    ", true, show_level - 1, max_string, sort_objects), k != last ? themetext("syntax", ",") : [], text("\n"));
            }
            append(os, themetext(null, indent, "object syntax", "}"));
            return os;
        });
    }

    var renderjson = function renderjson(json) {
        var pre = append(document.createElement("pre"), _renderjson(json, "", false, renderjson.show_to_level, renderjson.max_string_length, renderjson.sort_objects));
        pre.className = "renderjson";
        return pre;
    };
    renderjson.set_icons = function (show, hide) {
        renderjson.show = show;
        renderjson.hide = hide;
        return renderjson;
    };
    renderjson.set_show_to_level = function (level) {
        renderjson.show_to_level = typeof level == "string" && level.toLowerCase() === "all" ? Number.MAX_VALUE : level;
        return renderjson;
    };
    renderjson.set_max_string_length = function (length) {
        renderjson.max_string_length = typeof length == "string" && length.toLowerCase() === "none" ? Number.MAX_VALUE : length;
        return renderjson;
    };
    renderjson.set_sort_objects = function (sort_bool) {
        renderjson.sort_objects = sort_bool;
        return renderjson;
    };
    // Backwards compatiblity. Use set_show_to_level() for new code.
    renderjson.set_show_by_default = function (show) {
        renderjson.show_to_level = show ? Number.MAX_VALUE : 0;
        return renderjson;
    };

    renderjson.set_resolve_component_ids = function (resolve) {
        renderjson.resolve_component_ids = !!resolve;
        return renderjson;
    };

    renderjson.set_icons('⊕', '⊖');
    renderjson.set_show_by_default(false);
    renderjson.set_sort_objects(false);
    renderjson.set_max_string_length("none");
    renderjson.set_resolve_component_ids(true);

    return renderjson;
}();

exports.default = renderjson;

/***/ }),

/***/ 5:
/*!*********************************************************!*\
  !*** multi ./src/devtoolsPanel/components/json/json.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./src/devtoolsPanel/components/json/json.js */"./src/devtoolsPanel/components/json/json.js");


/***/ })

/******/ });
//# sourceMappingURL=component-json.js.map