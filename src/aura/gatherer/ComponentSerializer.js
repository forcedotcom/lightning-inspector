import JsonSerializer from '../JsonSerializer.js';
import fastDeepEqual from 'fast-deep-equal';

export default class ComponentSerializer {
    'use strict';

    /**
     * Get all the top level elements.
     * This obviously includes $A.getRoot(), but for Lightning Out that is empty.
     * So we also include all the Disconnected components attached to dom elements.
     */
    static getRootComponents() {
        var topLevelDomNodes = null;
        var rootNodes = [];
        try {
            var app = $A.getRoot();
            rootNodes.push({
                id: app.getGlobalId(),
                components: [this.getComponent(app.getGlobalId())]
            });

            if (app.isInstanceOf('ltng:outApp')) {
                topLevelDomNodes = document.querySelectorAll('[data-ltngout-rendered-by]');

                var map = {};
                var parentNodes = [];

                topLevelDomNodes.forEach(node => {
                    const id = node.getAttribute('data-ltngout-rendered-by');
                    const component = $A.getComponent(id);

                    rootNodes.push({
                        dom: node,
                        id: 'data-ltngout-rendered-by$' + id,
                        components: [this.getComponent(id, { body: false })]
                    });
                });
            }
        } catch (e) {}

        return JsonSerializer.stringify(rootNodes);
    }

    static bootStrapInjectedAPI() {
        // This api is added by us in an override to accomodate the changes made in Aura
        // which are changing the _$getSelfGlobalId$ and _$getRawValue$ to $A.componentService.getSelfGlobalId and  $A.componentService.getAttributeExpression
        // If the changes to the functions are not there when we try to serialize a component, just run the bootstrap code.
        if ($A.componentService.getSelfGlobalId) {
            return;
        }

        // Will exist in one scenario (when running the old version)
        if (!('_$getSelfGlobalId$' in component)) {
            // Adds the _$getSelfGlobalId$ to Component prototype
            try {
                $A.installOverride('outputComponent', function() {});
                $A.componentService.getSelfGlobalId = function(component) {
                    if (component == null) {
                        return null;
                    }
                    if (component._$getSelfGlobalId$) {
                        return component._$getSelfGlobalId$();
                    }
                };
                $A.componentService.getAttributeExpression = function(component, key) {
                    if (component !== undefined && $A.util.isComponent(component)) {
                        var value = component._$getRawValue$(key);
                        if ($A.util.isExpression(value)) {
                            return value.toString();
                        }
                    }
                    return null;
                };
            } catch (e) {}
        }
    }

    static getComponent(componentId, options) {
        var component = $A.util.isComponent(componentId)
            ? componentId
            : $A.getComponent(componentId);
        var configuration = Object.assign(
            {
                attributes: true, // True to serialize the attributes, if you just want the body you can set this to false and body to true. (Good for serializing supers)
                body: true, // Serialize the Body? This can be expensive so you can turn it off.
                elementCount: false, // Count all child elements of all the elements associated to a component.
                model: false, // Serialize the model data as well
                valueProviders: false, // Should we serialize the attribute and facet value providers to the output? Could be a little slow now since we serialize passthrough value keys which could be big objects.
                handlers: false // Do we serialize the event handlers this component is subscribed to?
            },
            options
        );
        if (component) {
            // TODO: Consider removing this, will no longer gack.
            if (!component.isValid()) {
                return JSON.stringify({
                    valid: false,
                    __proto__: null // no inherited properties
                });
            } else {
                ComponentSerializer.bootStrapInjectedAPI();
                var isTypeModule = isModule(component);
                var output = {
                    descriptor: component
                        .getDef()
                        .getDescriptor()
                        .toString(),
                    globalId: $A.componentService.getSelfGlobalId(component),
                    rendered: component.isRendered(),
                    isConcrete: component.isConcrete(),
                    valid: component.isValid(),
                    expressions: {},
                    attributes: {},
                    __proto__: null, // no inherited properties
                    elementCount: 0,
                    // TODO: Implement properly or remove.
                    rerender_count: 0, //this.getCount($A.componentService.getSelfGlobalId(component) + "_rerendered")
                    isModule: isTypeModule,
                    supers: getSupers(component)

                    // Added Later
                    //,"super": ""
                    //,"model": null
                };

                if (!isTypeModule) {
                    // Throws an exception when used on an InteropComponent
                    output['localId'] = component.getLocalId();
                }

                // VALUE PROVIDERS
                if (configuration.valueProviders) {
                    output['attributeValueProvider'] = getValueProvider(
                        component.getAttributeValueProvider()
                    );
                    output['facetValueProvider'] = getValueProvider(
                        component.getComponentValueProvider()
                    );
                }

                // ATTRIBUTES
                if (!isTypeModule && configuration.attributes) {
                    var auraError = $A.error;
                    var attributes = component.getDef().getAttributeDefs();

                    try {
                        // The Aura Inspector isn't special, it doesn't
                        // have access to the value if the access check
                        // system prevents it. So we should notify we
                        // do not have access.
                        var accessCheckFailed;

                        // Track Access Check failure on attribute access
                        $A.error = function(message, error) {
                            const errorMessage = message || (error && error.message) || '';
                            if (errorMessage.indexOf('Access Check Failed!') === 0) {
                                accessCheckFailed = true;
                            }
                        };

                        attributes.each(
                            function(attributeDef) {
                                const key = attributeDef.getDescriptor().getName();
                                let value;
                                let expression;
                                accessCheckFailed = false;

                                try {
                                    // BODY
                                    // If we don't want the body serialized, skip it.
                                    // We would only want the body if we are going to show
                                    // the components children.
                                    if (key === 'body') {
                                        if (!configuration.body) {
                                            return;
                                        }
                                        const body = getBody(component);
                                        output.attributes['body'] = body.attributes;
                                        output.expressions['body'] = body.expressions;
                                        return;
                                    }

                                    expression = getAttributeExpression(component, key);
                                    value = component.get('v.' + key);
                                } catch (e) {
                                    value = undefined;
                                }
                                if (value === undefined || value === null) {
                                    value = value + '';
                                }
                                output.attributes[key] = accessCheckFailed
                                    ? '[ACCESS CHECK FAILED]'
                                    : value;

                                if (expression !== null) {
                                    output.expressions[key] = expression;
                                }
                            }.bind(this)
                        );
                    } catch (e) {
                        console.error(e);
                    } finally {
                        $A.error = auraError;
                    }
                }
                // BODY
                else if (configuration.body) {
                    const body = getBody(component);
                    output.attributes['body'] = body.attributes;
                    output.expressions['body'] = body.expressions;
                }

                // ELEMENT COUNT
                // Concrete is the only one with elements really, so doing it at the super
                // level is duplicate work.
                if (component.isConcrete() && configuration.elementCount) {
                    var elements = component.getElements() || [];
                    var elementCount = 0;
                    for (var c = 0, length = elements.length; c < length; c++) {
                        if (elements[c] instanceof HTMLElement) {
                            // Its child components, plus itself.
                            elementCount += elements[c].getElementsByTagName('*').length + 1;
                        }
                    }
                    output.elementCount = elementCount;
                }

                // MODEL
                if (!isTypeModule && configuration.model) {
                    var model = component.getModel();
                    if (model) {
                        output['model'] = model.data;
                    }
                }

                // HANDLERS
                if (configuration.handlers) {
                    var handlers = {};
                    var events = component.getEventDispatcher();
                    var current;
                    var apiSupported = true; // 204+ only. Don't want to error in 202. Should remove this little conditional in 204 after R2.
                    for (var eventName in events) {
                        current = events[eventName];
                        if (Array.isArray(current) && current.length && apiSupported) {
                            handlers[eventName] = [];
                            for (var c = 0; c < current.length; c++) {
                                if (!current[c].hasOwnProperty('actionExpression')) {
                                    apiSupported = false;
                                    break;
                                }
                                handlers[eventName][c] = {
                                    expression: current[c]['actionExpression'],
                                    valueProvider: getValueProvider(current[c]['valueProvider'])
                                };
                            }
                        }
                    }
                    if (apiSupported) {
                        output['handlers'] = handlers;
                    }
                }

                // Output to the dev tools
                return JsonSerializer.stringify(output);
            }
        }
        return '';
    }
}

/** Serializing Passthrough Values as valueProviders is a bit complex, so we have this helper function to do it. */
function getValueProvider(valueProvider) {
    if ($A.componentService.getSelfGlobalId(valueProvider) !== null) {
        return $A.componentService.getSelfGlobalId(valueProvider);
    }

    // Probably a passthrough value
    const output = {
        // Can't do providers yet since we don't have a way to get access to them.
        // We should though, it would be great to see in the inspector.
        //"providers": safeStringify()
        $type$: 'passthrough'
    };

    if ('getPrimaryProviderKeys' in valueProvider) {
        const values = {};
        let value;
        let keys;
        let provider = valueProvider;
        while (provider && !('getGlobalId' in provider)) {
            keys = provider.getPrimaryProviderKeys();
            for (var c = 0; c < keys.length; c++) {
                let key = keys[c];
                if (!values.hasOwnProperty(key)) {
                    value = provider.get(key);
                    if ($A.util.isComponent(value)) {
                        values[key] = {
                            id: value
                        };
                    } else {
                        values[key] = value;
                    }
                }
            }
            provider = provider.getComponent();
        }
        if (provider && 'getGlobalId' in provider) {
            output['globalId'] = $A.componentService.getSelfGlobalId(provider);
        }
        output['values'] = values;
    } else {
        while (!('getGlobalId' in valueProvider)) {
            valueProvider = valueProvider.getComponent();
        }
        output['globalId'] = $A.componentService.getSelfGlobalId(valueProvider);
    }

    return output;
}

// This is temporary till we can add the data-ltngout-rendered-by attribute.
function getComponentForLtngOut(components) {
    if (!components.length) {
        return;
    }
    let owner = components[0].getOwner();
    while (!owner.getOwner().isInstanceOf('aura:application') && owner.getOwner() !== owner) {
        owner = owner.getOwner();
    }
    return owner;
}

function isModule(component) {
    if (!component) {
        return false;
    }

    const toString = component.toString();

    return toString === 'InteropComponent' || toString.startsWith('InteropComponent:');
}

function getSupers(component) {
    const supers = [];
    let currentComponent = component;
    while ((currentComponent = currentComponent.getSuper())) {
        supers.push($A.componentService.getSelfGlobalId(currentComponent));
    }
    return supers;
}

function getBody(component) {
    if (!component) {
        return {};
    }
    const bodyMapExpressions = {};
    const bodyMapValues = {};
    let value;
    const key = 'body';
    let currentComponent = component;

    try {
        do {
            let selfGlobalId = $A.componentService.getSelfGlobalId(currentComponent);
            bodyMapExpressions[selfGlobalId] = getAttributeExpression(currentComponent, 'body');

            bodyMapValues[selfGlobalId] = currentComponent.get('v.body');

            if (bodyMapValues === undefined || bodyMapValues === null) {
                bodyMapValues = bodyMapValues + '';
            }
        } while ((currentComponent = currentComponent.getSuper()));
    } catch (e) {
        console.error(`Error Serializing body for component ${component.getGlobalId()}`, e);
    }
    return {
        attributes: bodyMapValues,
        expressions: bodyMapExpressions
    };
}

function getAttributeExpression(component, attribute) {
    let expression = null;
    try {
        expression = $A.componentService.getAttributeExpression(component, attribute);
    } catch (e) {
        if (component && component.attributes) {
            if ($A.util.isExpression(component.attributes[attribute])) {
                return component.attributes[attribute].toString();
            }
        }
    }
    return expression;
}
