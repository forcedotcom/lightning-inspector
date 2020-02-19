import renderjson from '../../external/renderjson';

class JsonElement extends HTMLElement {
    connectedCallback() {
        const style = document.createElement('style');
        style.innerHTML = `a { text-decoration: none; }
		pre.renderjson {
			display: inline-block;
			margin: 0;
			font-family: Menlo, monospace;
			font-size: 11px;
			overflow-wrap: break-word;
    		width: 100%;
    		white-space: pre-wrap;
			-webkit-font-smoothing: antialiased;
		}
		a.disclosure { color: blue; padding-right: 3px; }
		span.object {}
		span.syntax {}
		span.key { color: purple; }
		
		pre.renderjson aurainspector-auracomponent {
			display: inline-block;
			white-space: nowrap;
		}`;

        var shadowRoot = this.shadowRoot || this.createShadowRoot();
        shadowRoot.appendChild(style);

        var oldValue = this.textContent;
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
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

        if (oldValue != '') {
            this.update();
        }
    }

    update() {
        var shadowRoot = this.shadowRoot || this.createShadowRoot();

        var output = shadowRoot.querySelector('.renderjson');
        if (output) {
            shadowRoot.removeChild(output);
        }

        output = shadowRoot.querySelector('.returnValue');
        if (output) {
            shadowRoot.removeChild(output);
        }

        var text = this.textContent;
        var json;
        var worthTrying = { '{': true, '[': true, '(': true, '/': true };
        if (text && text.trim() && worthTrying[text.charAt(0)]) {
            try {
                json = JSON.parse(text);
            } catch (e) {}
        }
        if (json) {
            shadowRoot.appendChild(formatJSON(json, { expandTo: this.getAttribute('expandTo') }));
        } else if (text !== undefined && text !== 'undefined') {
            var textNode = document.createElement('span');
            textNode.className = 'returnValue';
            textNode.appendChild(document.createTextNode(text));
            shadowRoot.appendChild(textNode);
        }
    }
}

customElements.define('aurainspector-json', JsonElement);

function formatJSON(object, options) {
    var defaults = {
        expandTo: 0
    };
    options = options || defaults;
    if (options.expandTo === undefined || options.expandTo === null) {
        expandTo = defaults.expandTo;
    }

    // Shared state, so store the old, so we can reset it when we are done.
    var showlevel = renderjson.show_to_level;

    renderjson.set_icons('+', '-');
    renderjson.set_show_to_level(options.expandTo);

    var result = renderjson(object);

    renderjson.set_show_to_level(showlevel);

    return result;
}
