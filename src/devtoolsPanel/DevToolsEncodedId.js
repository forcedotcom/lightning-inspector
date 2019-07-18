export default function DevToolsEncodedId(id) {
    this.isComponentId = function() {
        return DevToolsEncodedId.isComponentId(id);
    };

    this.isActionId = function() {
        return DevToolsEncodedId.isActionId(id);
    };

    this.getCleanId = function() {
        return DevToolsEncodedId.getCleanId(id);
    };

    this.toString = function() {
        return this.getCleanId();
    };

    this.getRawId = function() {
        return id;
    };
}

DevToolsEncodedId.isComponentId = function(id) {
    return typeof id === 'string' && id.startsWith(DevToolsEncodedId.COMPONENT_CONTROL_CHAR);
};

DevToolsEncodedId.isActionId = function(id) {
    return typeof id === 'string' && id.startsWith(DevToolsEncodedId.ACTION_CONTROL_CHAR);
};

DevToolsEncodedId.getCleanId = function(id) {
    return typeof id === 'string' &&
        (id.startsWith(DevToolsEncodedId.COMPONENT_CONTROL_CHAR) ||
            id.startsWith(DevToolsEncodedId.ACTION_CONTROL_CHAR))
        ? id.substr(1)
        : id;
};

Object.defineProperty(DevToolsEncodedId, 'COMPONENT_CONTROL_CHAR', {
    value: '\u263A', // This value is a component Global Id
    configurable: false,
    writable: false
});

Object.defineProperty(DevToolsEncodedId, 'ACTION_CONTROL_CHAR', {
    value: '\u2744', // ❄ - This is an action
    configurable: false,
    writable: false
});

Object.defineProperty(DevToolsEncodedId, 'ESCAPE_CHAR', {
    value: '\u2353', // This value was escaped, unescape before using.
    configurable: false,
    writable: false
});
