/**
 * 	Description:
	Output the localized version of a label. Wraps a chrome.i18n.getMessage() call.

	Usage:
	<aurainspector-label key="LABEL_KEY"></aurainspector-label>

	Notes:
	LABEL_KEY is defined in messages.json.

	If the LABEL_KEY does not exist in messages.json, you'll see [LABEL_KEY] instead.

	As convention, I've been doing AREA_term, so for event card its eventcard_parameters, for actions panel its actions_mylabel.
 */

class LabelElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        this.shadowRoot.appendChild(document.createTextNode(getLabel(this)));
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(document.createTextNode(getLabel(this)));
    }
}

customElements.define('aurainspector-label', LabelElement);

function getLabel(element) {
    const ATTRIBUTE_NAME = 'key';

    if (element.hasAttribute(ATTRIBUTE_NAME)) {
        var key = element.getAttribute(ATTRIBUTE_NAME);
        return chrome.i18n.getMessage(key) || '[' + key + ']';
    }
}
