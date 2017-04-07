const ControlCharacters = {
    "COMPONENT_CONTROL_CHAR" : "\u263A", // ☺ - This value is a component Global Id
    "ACTION_CONTROL_CHAR" : "\u2744", // ❄ - This is an action
    "ESCAPE_CHAR" : "\u2353" // This value was escaped, unescape before using.    
};

Object.freeze(ControlCharacters);

export default ControlCharacters;
