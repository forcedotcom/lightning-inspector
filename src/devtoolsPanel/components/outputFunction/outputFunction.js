import js_beautify from '../../external/jsbeautify.js';

class OutputFunctionElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        if (this.shadowRoot.hasChildNodes()) {
            return;
        }

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

        this.shadowRoot.appendChild(style);

        let oldValue = this.textContent;
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
        const text = this.textContent;

        const pre = document.createElement('pre');
        pre.innerHTML = js_beautify(text);

        this.shadowRoot.appendChild(pre);
    }
}

customElements.define('aurainspector-outputfunction', OutputFunctionElement);
