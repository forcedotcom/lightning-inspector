export default class DevToolsEncodedId {
	id;

	constructor(id) {
		this.id = id;
	}
	
    isComponentId() {
        return DevToolsEncodedId.isComponentId(this.id);
    };

    isActionId() {
        return DevToolsEncodedId.isActionId(this.id);
    }

    getCleanId() {
        return DevToolsEncodedId.getCleanId(this.id);
    }

	toString() {
		return this.getCleanId();
	}

	getRawId() {
		return this.id;
	}

	static isComponentId(id) {
		return typeof id === "string" && id.startsWith(DevToolsEncodedId.COMPONENT_CONTROL_CHAR);
	};
	
	static isActionId(id) {
		return typeof id === "string" && id.startsWith(DevToolsEncodedId.ACTION_CONTROL_CHAR);
	};
	
	static getCleanId(id) {
		if(typeof id === "string") {
			for(let CONTROL_CHAR of TO_CLEAN_CONTROL_CHARACTERS) {
				if(id.startsWith(CONTROL_CHAR)) {
					return id.substr(1);
				}
			}
		}
		return id;
	};

};


const TO_CLEAN_CONTROL_CHARACTERS = [
	DevToolsEncodedId.COMPONENT_CONTROL_CHAR,
	DevToolsEncodedId.ACTION_CONTROL_CHAR
];


Object.defineProperty(DevToolsEncodedId, "COMPONENT_CONTROL_CHAR", {
	"value": "\u263A", // This value is a component Global Id
	"configurable": false,
	"writable": false
});

Object.defineProperty(DevToolsEncodedId, "ACTION_CONTROL_CHAR", {
	"value": "\u2744", // ❄ - This is an action
	"configurable": false,
	"writable": false
});

Object.defineProperty(DevToolsEncodedId, "ESCAPE_CHAR", {
	"value": "\u2353", // This value was escaped, unescape before using.
	"configurable": false,
	"writable": false
});