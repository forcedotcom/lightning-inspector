export default class Template {
    static templates = {};
    _templateHtml = '';
    /**
     * The id='' from the template.html file.
     */
    constructor(templateId) {
        if (!Template.templates) {
            throw new Error('No templates defined. Call await fetchTemplates() before creating any Template objects.');
        }

        if (!Template.templates.hasOwnProperty(templateId)) {
            throw new Error(`No template of id '${tempalteId}' defined. Check template.html to ensure you have the correct id.`);
        }

        this._templateHtml = Template.templates[templateId];
    }

    renderTo(target, model) {
        const fragment = this.render(model);
        target.appendChild(fragment);
    }

    /**
     * Convert the contents of the template to HTML.
     * Returns a DocumentFragment
     * @param {Map} model Key value pairs. Any patterns of {{value}} in the HTML will be replaced with the value in the model.
     */
    render(model = {}) {
        const mergedHtml = supplant(this._templateHtml, model);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = mergedHtml;

        const fragment = document.createDocumentFragment();
        for (var child of tempDiv.childNodes) {
            fragment.appendChild(child);
        }

        return fragment;
    }
}


/**
* supplant() does variable substitution on the string. It scans through the string looking for 
* expressions enclosed in {{}} braces. If an expression is found, use it as a key on the object, 
* and if the key has a string value or number value, it is substituted for the bracket expression 
* and it repeats.
*
* Written by Douglas Crockford
* http://www.crockford.com/
*/
const supplant = function (string, values) {
    return string.replace(
        /{{([^{}]*)}}/g, 
        function (a, b) {
            var r = values[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
}

