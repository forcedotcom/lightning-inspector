const template = document.createElement('template');
template.innerHTML = `<style>
        aurainspector-auracomponent {
            margin-left:2em;
        }

        a { 
            display:block;
            color: #0070D2;
        }

        a:hover {
            color: #005fb2;
            text-decoration: underline;
        }
    </style>
    <a id="expression"></a>
    <aurainspector-auracomponent summarize="true" globalId=""></aurainspector-auracomponent>`;
/**
    # Renders a component controller reference as such
    <auracomponent>
        {!c.foo} 

    # To Use

    Mode 1: 
    <aurainspector-expression expression="{!c.foo}" component="[GlobalId]"/>
    - expression MUST contain the "{!}" characters. 
 */
class ControllerReferenceElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        if (this.shadowRoot.hasChildNodes()) {
            return;
        }
        // Had two different modes, one that works on textContent, the other that works on expression, componentid combination
        const expression = this.getAttribute('expression');
        const componentid = this.getAttribute('component');

        if (expression && componentid) {
            const clone = document.importNode(template.content, true);

            clone
                .querySelector('aurainspector-auracomponent')
                .setAttribute('globalId', componentid);

            const expression_element = clone.querySelector('#expression');
            expression_element.appendChild(document.createTextNode(expression));
            expression_element.addEventListener('click', ControllerReference_OnClick.bind(this));

            this.shadowRoot.appendChild(clone);
        } else {
            this.addEventListener('click', ControllerReference_OnClick.bind(this));
        }
    }
}

customElements.define('aurainspector-controllerreference', ControllerReferenceElement);

function parse(reference) {
    if (!reference) {
        return null;
    }
    const parts = reference.split('$');
    return {
        prefix: parts[0],
        component: parts[1],
        method: parts[3]
    };
}

function ControllerReference_OnClick(event) {
    let command;
    const reference = this.textContent;
    const expression = this.getAttribute('expression');
    if (reference && !expression) {
        const info = parse(reference);
        if (!info) {
            return;
        }

        command = `
                (function(definition) {
                    if(definition) {
                        inspect(definition.prototype.controller["${info.method}"]);
                    }
                })($A.componentService.getComponentClass("markup://${info.prefix}:${info.component}"))`;
        chrome.devtools.inspectedWindow.eval(command);
    } else if (expression) {
        // expression, component combination
        const expression = this.getAttribute('expression');
        const componentid = this.getAttribute('component');

        if (expression && componentid) {
            expression = expression.substring(4, expression.length - 1);
            command = `
                    (function(cmp){
                        if(!cmp){ return; }
                        const reference = cmp.controller["${expression}"];
                        if(reference) {
                            inspect(reference);
                        }
                    })($A.getComponent("${componentid}"));
                `;
            chrome.devtools.inspectedWindow.eval(command);
        }
    }
}
