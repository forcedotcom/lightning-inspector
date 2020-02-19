import js_beautify from '../../external/jsbeautify.js';

class OutputFunctionElement extends HTMLElement {
    connectedCallback() {
        const style = document.createElement('style');
        style.innerHTML = `
            pre {
                display: inline-block;
                margin: 0;
            font-family: Menlo, monospace;
            font-size: 11px;
            -webkit-font-smoothing: antialiased;
            }
        `;

        const shadowRoot = this.shadowRoot || this.createShadowRoot();
        shadowRoot.appendChild(style);

        const oldValue = this.textContent;
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                const target = mutation.target;
                const newValue = target.textContent;
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
    }

    update() {
        const shadowRoot = this.shadowRoot || this.createShadowRoot();
        const text = this.textContent;

        const pre = document.createElement('pre');
        pre.innerHTML = js_beautify(text);

        shadowRoot.appendChild(pre);
    }
}

customElements.define('aurainspector-outputFunction', OutputFunctionElement);
