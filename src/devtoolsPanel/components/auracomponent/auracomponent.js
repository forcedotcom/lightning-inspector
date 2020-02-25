import JsonSerializer from '../../../aura/JsonSerializer';
const template = document.createElement('template');
template.innerHTML = `	<style>
        .component-prefix { color: maroon; }
        .component-property { color: maroon;}
        .component-property-value { color: #333; margin: 0 0 0 3px; }
        .component-facet-property { color: maroon; }
        .component-tagname { color: blue; }
        .component-attribute { color: purple; }
        .component-array-length { color: teal; font-size: .9em; font-style: normal; }
    </style>
`;

/**	
 * Renders a colorized version of the aura component with handlers for click (populate $auraTemp) and double click (navigate to the component tree).
    Attributes
        globalId : the global id of the component you want to display. Gets the data and configures itself.
        summarize : Defaults false. If true will only show minimal information for the component.
    <aurainspector-auracomponent globalId='{globalId}' summarize="true|false"/>
 */
class AuraComponent extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.addEventListener('click', AuraComponent_OnClick.bind(this));
        this.addEventListener('dblclick', AuraComponent_OnDblClick.bind(this));

        var _data = this.getAttribute('componentData');
        if (!_data) {
            var summarize = this.getAttribute('summarize') || false;
            this.setAttribute('componentData', '{}');
            getComponentData(
                this.getAttribute('globalId'),
                {
                    summarize: summarize
                },
                AuraComponent_OnGetComponent.bind(this)
            );
        } else {
            // If we do a setAttribute("componentData", "JSONSTRING");
            // It would be nice if it just worked.
            try {
                if (typeof _data === 'string') {
                    _data = JsonSerializer.parse(_data);
                }
                if (Object.keys(_data).length) {
                    this.render(_data);
                }
            } catch (e) {
                // Something went wrong with the rendering or the parsing of the data?
                // Just show the globalId, at least its something.
                var globalId = this.getAttribute('globalId');

                if (globalId) {
                    getComponentData(
                        globalId,
                        {
                            summarize: this.getAttribute('summarize') || false
                        },
                        AuraComponent_OnGetComponent.bind(this)
                    );
                }
                //shadowRoot.appendChild(document.createTextNode("#error"));
            }
        }
    }

    render(data) {
        var descriptor;
        if (data.valid === false) {
            descriptor = 'INVALID';
        } else {
            descriptor = data.descriptor.split('://')[1] || data.descriptor;
        }

        var pattern = [
            `<style>
                    .component-prefix { color: maroon; }
                    .component-property { color: maroon;}
                    .component-property-value { color: #333; margin: 0 0 0 3px; }
                    .component-facet-property { color: maroon; }
                    .component-tagname { color: blue; }
                    .component-attribute { color: purple; }
                    .component-array-length { color: teal; font-size: .9em; font-style: normal; }
                </style>`,
            `&lt;<span class="component-tagname">${descriptor}</span>
                <span class="component-attribute">globalId</span>="${data.globalId}"`
        ];

        if (data.attributes) {
            var current;
            for (var attr in data.attributes) {
                if (attr !== 'body') {
                    current = data.attributes[attr];

                    if (current && Array.isArray(current)) {
                        current = current.length
                            ? '[<i class="component-array-length">' + current.length + '</i>]'
                            : '[]';
                    } else if (current && typeof current === 'object') {
                        current = Object.keys(current).length ? '{...}' : '{}';
                    }

                    pattern.push(
                        ' <span class="component-attribute">' + attr + '</span>="' + current + '"'
                    );
                }
            }
        }

        pattern.push('&gt;');

        var subTemplate = document.createElement('template');
        subTemplate.innerHTML = pattern.join('');

        // Import CSS
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(document.importNode(template.content, true));
        this.shadowRoot.appendChild(subTemplate.content);
    }

    disconnectedCallback() {
        this.removeEventListener('click', AuraComponent_OnClick.bind(this));
        this.removeEventListener('dblclick', AuraComponent_OnDblClick.bind(this));
    }
}

function getComponentData(globalId, configuration, callback) {
    const config = JSON.stringify({
        body: false,
        attributes: !configuration.summarize
    });
    const cmd = `window[Symbol.for('AuraDevTools')].Inspector.getComponent('${globalId}', ${config});`;

    chrome.devtools.inspectedWindow.eval(
        cmd,
        function(response, exceptionInfo) {
            if (exceptionInfo) {
                console.error('AuraInspector: ', exceptionInfo);
            }
            if (!response) {
                return;
            }
            const tree = JsonSerializer.parse(response);

            callback(tree);
        }.bind(this)
    );
}

function AuraComponent_OnGetComponent(data) {
    if (typeof data === 'object') {
        this.setAttribute('componentData', JsonSerializer.stringify(data));
    } else {
        this.setAttribute('componentData', data);
    }
    this.render(data);
}

function AuraComponent_OnClick(event) {
    var globalId = this.getAttribute('globalId');
    if (globalId) {
        var command = `
                $auraTemp = $A.getComponent('${globalId}'); undefined;
            `;
        chrome.devtools.inspectedWindow.eval(command);
    }
}

function AuraComponent_OnDblClick(event) {
    var globalId = this.getAttribute('globalId');
    if (globalId) {
        var command = `
                $auraTemp = $A.getComponent('${globalId}'); 
                window[Symbol.for('AuraDevTools')].Inspector.publish("AuraInspector:ShowComponentInTree", $auraTemp.getGlobalId());
            `;
        chrome.devtools.inspectedWindow.eval(command);
    }
}

customElements.define('aurainspector-auracomponent', AuraComponent);
