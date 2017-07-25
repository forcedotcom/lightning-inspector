const ControlCharacters = {
    "COMPONENT_CONTROL_CHAR" : "\u263A", // ☺ - This value is a component Global Id
    "ACTION_CONTROL_CHAR" : "\u2744", // ❄ - This is an action
    "ESCAPE_CHAR" : "\u2353", // ⍓ This value was escaped, unescape before using.
    //"UNDEFINED_CHAR" : "\u2349", // ⍉ Was literally undefined,
    //"NULL_CHAR": "\u2400", // ␀Was literally null

    isComponentId(id) {
        return typeof id == "string" && id.startsWith(ControlCharacters.COMPONENT_CONTROL_CHAR);
    },

    isActionId(id) {
        return typeof id == "string" && id.startsWith(ControlCharacters.ACTION_CONTROL_CHAR);
    },

    getCleanId(id) {
        if(typeof id !== "string") { return id; }
        if(this.isComponentId(id) || this.isActionId(id) || id.substring(0, 1) == ControlCharacters.ESCAPE_CHAR) {
            return id.substring(1);
        }
        return id;
    }

};

Object.freeze(ControlCharacters);

export default ControlCharacters;
