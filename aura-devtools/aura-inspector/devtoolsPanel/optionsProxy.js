/**
 *
 * Don't feel like implementing the google.settings stuff yet, so just faking it out. 
 */
(function(global){

	var _persistedOptions = getStorage("AuraInspectorOptions") || "{}";
	var _map = JSON.parse(_persistedOptions);
	var _clonedMap = cloneObject(_map);

	function cloneObject(obj) { 
		return JSON.parse(JSON.stringify(obj));
	}

	/* Because this is how Google DevTools Settings work */
	global.AuraInspectorOptions = {
		getAll: function(defaults, callback) {
			defaults = defaults || {};
			var isDirty = false;
			for(var key in defaults) {
				if(!_map.hasOwnProperty(key)){
					_map[key] = defaults[key];
					isDirty = true;
				}
			}
			if(isDirty) {
				_clonedMap = cloneObject(_map);
			}
			if(typeof callback === "function") {
				callback(_clonedMap);
			}
		},

		set: function(key, value, callback) {
			if(_map[key] !== value) {
				_map[key] = value;

				setStorage("AuraInspectorOptions", _map);
				_clonedMap = cloneObject(_map);
			}
			if(typeof callback == "function") {
				callback(_clonedMap);
			}
		}
	};

	function getStorage(key) {
		// Local storage could be prohibited from being used because of security settings.
		var map;
		try {
			map = localStorage.getItem(key);
		} catch(e) {}
		return map;
	}

	function setStorage(key, value) {
		try {
			localStorage.setItem(key, JSON.stringify(value))
		} catch(e) {
			return false;
		}
		return true;
	}

})(this);