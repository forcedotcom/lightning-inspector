class OnOffButtonElement extends HTMLElement {
    connectedCallback() {
        this.addEventListener('click', OnOffButton_Click);
    }

    disconnectedCallback() {
        this.removeEventListener('click', OnOffButton_Click);
    }
}

customElements.define('aurainspector-onoffbutton', OnOffButtonElement);

function OnOffButton_Click(event) {
    this.classList.toggle('on');
}
