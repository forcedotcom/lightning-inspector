import BrowserApi from './BrowserApi.js';
import ControlCharacters from '../ControlCharacters.js';
import JsonSerializer from '../JsonSerializer.js';

export default class ComponentTreeSerializer {
    static getRootComponents() {
        return new Promise((resolve, reject) => {
            const command =
                "window.$A && $A.getRoot() && window[Symbol.for('AuraDevTools')].Inspector.getRootComponents();";

            BrowserApi.eval(command)
                .then(rootNodes => {
                    resolve(JsonSerializer.parse(rootNodes));
                })
                .catch(reject);
        });
    }

    static getComponentWithChildren(globalId) {
        return new Promise((resolve, reject) => {
            getComponent(globalId, function(component) {
                getBodyFromComponent(component, function(children) {
                    //console.log("getComponentChildren", nodes);
                    resolve({ component, children });
                });
            });
        });

        // Implement Me!
        //
        // Already implemented pretty much as generateTree()
        // Just need to convert it to async api, and clean it up.
        // Oh yea, and make it non-recursive. :)
    }

    static getComponentChildren(globalId) {
        return new Promise((resolve, reject) => {
            getComponent(globalId, function(component) {
                getBodyFromComponent(component, function(nodes) {
                    //console.log("getComponentChildren", nodes);
                    resolve(nodes);
                });
            });
        });

        // Implement Me!
        //
        // Already implemented pretty much as generateTree()
        // Just need to convert it to async api, and clean it up.
        // Oh yea, and make it non-recursive. :)
    }

    static getComponentChildrenRecursively(globalId) {
        // Implement Me!
    }
}

function getComponent(globalId, callback, configuration) {
    if (typeof callback !== 'function') {
        throw new Error('callback is required for - getComponent(globalId, callback)');
    }

    var command;

    globalId = ControlCharacters.getCleanId(globalId);

    if (configuration && typeof configuration === 'object') {
        const configParameter = JSON.stringify(configuration);
        command = `window[Symbol.for('AuraDevTools')].Inspector.getComponent('${globalId}', ${configParameter});`;
    } else {
        command = `window[Symbol.for('AuraDevTools')].Inspector.getComponent('${globalId}');`;
    }

    BrowserApi.eval(command).then(function(response, exceptionInfo) {
        if (exceptionInfo) {
            console.error(command, ' resulted in ', exceptionInfo);
        }
        if (!response) {
            return;
        }

        const component = JsonSerializer.parse(response);

        callback(component);
    });
}

function getComponents(globalIds, callback) {
    if (!Array.isArray(globalIds)) {
        throw new Error('globalIds was not an array - getComponents(globalIds, callback)');
    }
    var count = globalIds.length;
    var processed = 0;
    var returnValue = [];
    for (var c = 0; c < count; c++) {
        getComponent(
            globalIds[c],
            function(index, component) {
                returnValue[index] = component;
                if (++processed == count) {
                    callback(returnValue);
                }
            }.bind(this, c)
        );
    }
}

function getBodyFromComponent(component, callback = () => {}) {
    var body = component.attributes.body;
    var globalId = component.globalId;
    var returnValue = [];
    if (body) {
        var count;
        var processed = 0;
        var id;

        // Start body building at the base component level and work your way up to the concrete.
        var currentId = component.supers ? component.supers.reverse()[0] : component.globalId;
        var currentBody = body[currentId];

        getBodyFromIds(currentBody, function(bodyNodes) {
            callback(flattenArray(bodyNodes));
        });
    } else if (isExpression(component) && isFacets(component.attributes.value)) {
        var facets = Array.isArray(component.attributes.value)
            ? component.attributes.value
            : [component.attributes.value];
        // Is an expression and a facet.
        getBodyFromIds(facets, function(bodyNodes) {
            callback(flattenArray(bodyNodes));
        });
    } else {
        callback(returnValue);
    }
}

function getBodyFromIds(ids, callback) {
    var bodies = [];
    var processed = 0;
    var count = ids && ids.length;

    if (!count) {
        return callback([]);
    }

    getComponents(ids, function(components) {
        for (var c = 0; c < components.length; c++) {
            bodies[c] = components[c];
            if (++processed === count) {
                callback(bodies);
            }
        }
    });
}

function isFacets(value) {
    if (!Array.isArray(value)) {
        return ControlCharacters.isComponentId(value);
    }
    for (var c = 0; c < value.length; c++) {
        if (!ControlCharacters.isComponentId(value[c])) {
            return false;
        }
    }
    return true;
}

function flattenArray(array) {
    var returnValue = [];
    for (var c = 0, length = array.length; c < length; c++) {
        if (Array.isArray(array[c])) {
            returnValue = returnValue.concat(flattenArray(array[c]));
        } else {
            returnValue.push(array[c]);
        }
    }
    return returnValue;
}

function isExpression(cmp) {
    return cmp && cmp.descriptor === 'markup://aura:expression';
}
