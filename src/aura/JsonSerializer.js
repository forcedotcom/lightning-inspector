import ControlCharacters from './ControlCharacters.js';
import isEmpty from 'is-empty';

export default class JsonSerializer {
    static increment = 1;

    /**
     * Safe because it handles circular references in the data structure.
     *
     * Will add control characters and shorten components to just their global ids.
     * Formats DOM elements in a pretty manner.
     */
    static stringify(originalValue) {
        // For circular dependency checks
        const doNotSerialize = {
            '[object Window]': true,
            '[object global]': true,
            __proto__: null
        };
        const visited = new Set();
        const hasAura = !!globalThis.$A;
        const toJSONCmp = hasAura ? $A.Component.prototype.toJSON : null;
        // If we can store the Component toJSON method, do so then remove it so we can control
        // how it gets serialized.
        if (toJSONCmp) {
            delete $A.Component.prototype.toJSON;
        }
        var result = '{}';
        try {
            result = JSON.stringify(originalValue, function(key, value) {
                if (value === document) {
                    return {};
                }
                if (Array.isArray(this) || key) {
                    value = this[key];
                }
                if (!value) {
                    return value;
                }

                if (
                    typeof value === 'string' &&
                    (value.startsWith(ControlCharacters.COMPONENT_CONTROL_CHAR) ||
                        value.startsWith(ControlCharacters.ACTION_CONTROL_CHAR))
                ) {
                    return ControlCharacters.ESCAPE_CHAR + escape(value);
                }

                if (value instanceof Error) {
                    return value + '';
                }

                if (value instanceof HTMLElement) {
                    var attributes = value.attributes;
                    var domOutput = [];
                    for (var c = 0, length = attributes.length, attribute; c < length; c++) {
                        attribute = attributes.item(c);
                        domOutput.push(attribute.name + '="' + attribute.value + '"');
                    }
                    return `<${value.tagName} ${domOutput.join(' ')}>`; // Serialize it specially.
                }

                if (value instanceof Text) {
                    return value.nodeValue;
                }

                // TODO: Consider handling invalid components differently.
                if (hasAura && $A.util.isComponent(value)) {
                    if (value.isValid()) {
                        return ControlCharacters.COMPONENT_CONTROL_CHAR + value.getGlobalId();
                    } else {
                        return value.toString();
                    }
                }

                if (hasAura && $A.util.isExpression(value)) {
                    return value.toString();
                }

                if (hasAura && $A.util.isAction(value)) {
                    return ControlCharacters.ACTION_CONTROL_CHAR + value.getDef().toString();
                }

                if (Array.isArray(value)) {
                    return value.slice();
                }

                if (typeof value === 'object') {
                    if ('$serId$' in value && visited.has(value)) {
                        return {
                            $serRefId$: value['$serId$'],
                            __proto__: null
                        };
                    } else if (doNotSerialize[Object.prototype.toString.call(value)]) {
                        value = {};
                    } else if (!Object.isSealed(value) && !isEmpty(value)) {
                        visited.add(value);
                        value.$serId$ = JsonSerializer.increment++;
                    }
                }

                if (typeof value === 'function') {
                    return value.toString();
                }

                return value;
            });
        } catch (e) {
            console.error('AuraInspector: Error serializing object to json.', e);
        }

        visited.forEach(function(item) {
            if ('$serId$' in item) {
                delete item['$serId$'];
            }
        });

        if (toJSONCmp) {
            $A.Component.prototype.toJSON = toJSONCmp;
        }

        return result;
    }

    /**
     *
     */
    static parse(json) {
        if (json === undefined || json === null) {
            return json;
        }

        return resolve(JSON.parse(json));
    }
}

/**
 * We use this when resolving the JsonSerializer.parse() content.
 * It handles stiching back together objects with resursive references.
 */
function resolve(object) {
    if (!object) {
        return object;
    }

    var serializationMap = new Map();
    var unresolvedReferences = [];

    function innerResolve(current, parent, property) {
        if (!current) {
            return current;
        }
        if (typeof current === 'object') {
            if (current.hasOwnProperty('$serRefId$')) {
                if (serializationMap.has(current['$serRefId$'])) {
                    return serializationMap.get(current['$serRefId$']);
                } else {
                    // Probably Out of order, so we'll do it after scanning the entire tree
                    unresolvedReferences.push({
                        parent: parent,
                        property: property,
                        $serRefId$: current['$serRefId$']
                    });
                    return current;
                }
            }

            if (current.hasOwnProperty('$serId$')) {
                serializationMap.set(current['$serId$'], current);
                delete current['$serId$'];
            }

            for (var property in current) {
                if (current.hasOwnProperty(property)) {
                    if (typeof current[property] === 'object') {
                        current[property] = innerResolve(current[property], current, property);
                    }
                }
            }
        }
        return current;
    }

    object = innerResolve(object);

    // If we had some resolutions out of order, lets clean those up now that we've parsed everything that is serialized.
    var unresolved;
    for (var c = 0, length = unresolvedReferences.length; c < length; c++) {
        unresolved = unresolvedReferences[c];
        unresolved.parent[unresolved.property] = serializationMap.get(unresolved['$serRefId$']);
    }

    return object;
}
