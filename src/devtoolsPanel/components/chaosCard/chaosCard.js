const template = document.createElement('template');
template.innerHTML = `	<style>
    .hidden {
            display: none;
    }
    </style>
    
    <div class="card">
        <div class='chaos_action hidden'></div>
        <div class='element_textContent' id='element_textContent'></div>
        <div class='stepCount' id='stepCount'></div>
        <div class='element_locator'>
            <div class='element_locator_root' id='element_locator_root'></div>
            <div class='element_locator_parent' id='element_locator_parent'></div>
            <div class='element_locator_context' id='element_locator_context'></div>
        </div>
    </div>`;
class ChaosCardElement extends HTMLElement {
    /*
        New Chaos Card created, update it's body
     */
    connectedCallback() {
        const clone = document.importNode(template.content, true);

        const shadowRoot = this.createShadowRoot();
        shadowRoot.appendChild(clone);
        this.shadowRoot.querySelector('#element_textContent').textContent = this.getAttribute(
            'textContent'
        );
        if (this.getAttribute('stepCount') && this.getAttribute('stepCount') != 'undefined') {
            this.shadowRoot.querySelector('#stepCount').textContent =
                'Step# ' + this.getAttribute('stepCount');
        }
        if (this.getAttribute('locatorRoot')) {
            this.shadowRoot.querySelector('#element_locator_root').textContent =
                'Root:' + this.getAttribute('locatorRoot');
        }
        if (this.getAttribute('locatorParent')) {
            this.shadowRoot.querySelector('#element_locator_parent').textContent =
                'Parent:' + this.getAttribute('locatorParent');
        }
    }
}

customElements.define('aurainspector-chaoscard', ChaosCardElement);
