function ChromeRuntime(name) {
	const onConnectListeners = [];
	const onMessageListeners = [];


	this.connect = function(callback) {
		const tabId = this.getTabId();
        const runtime = chrome.runtime.connect({"name": name });

        if(callback) {
        	onConnectListeners.push(callback);
        }

        runtime.postMessage( { "action": "BackgroundPage:publish", "key": "BackgroundPage:InjectContentScript", "data": tabId } );
        runtime.onMessage.addListener(BackgroundScript_OnMessage.bind(this));
        runtime.postMessage({subscribe: ["AuraInspector:bootstrap"], port: runtime.name, tabId: tabId});
	};

	this.subscribe = function(callback) {
		if(callback) {
			onMessageListeners.push(callback);
		}
	};

	// Aren't doing yet.
	// We'll probably want two, sendMessageToBackgroundScript(), sendMessageToContentScript()
	this.sendMessage = function() {};

	// Usually happens with a page refresh.
	this.disconnect = function() {};

	this.getTabId = function() {
		return chrome.devtools.inspectedWindow.tabId;
	};

	this.onSelectionChanged = function(callback) {
		chrome.devtools.panels.elements.onSelectionChanged.addListener(callback);
	}

	this.eval = function(code, callback) {
		chromeEval(code, callback);
	};

	// Injected Script Proxy
	this.InjectedScript = {
		"getComponent": function(globalId, callback, config) {
			const configuration = config ? JSON.stringify(config) : "{}";
			const code = `window[Symbol.for('AuraDevTools')].Inspector.getComponent('${globalId}', ${configuration});`;

			chromeEval(code, (response, exceptionInfo) => {
				if(exceptionInfo) {
					console.error(code, " resulted in exception ", exceptionInfo);
				}

				if(!response) {
					return;
				}

				var component = ResolveJSONReferences(JSON.parse(response));

				if(callback) {
					callback(component);
				}
			});
		}
	};

	/** EVENT HANDLERS **/

	function BackgroundScript_OnMessage(message) {
        if(!message) { return; }
        if(message.action === "AuraInspector:bootstrap") {
        	onConnectListeners.forEach(function(callback){
        		if(typeof callback =="function") {
        			callback();
        		}
        	});
        }
        //  else if(message.action === PUBLISH_KEY) {
        //     callSubscribers(message.key, message.data);
        // } else if(message.action === PUBLISH_BATCH_KEY) {
        //     var data = message.data || [];
        //     for(var c=0,length=data.length;c<length;c++) {
        //         callSubscribers(data[c].key, data[c].data);
        //     }
        // }
    }

    /** HELPERS **/

	function chromeEval(code, callback) {
		chrome.devtools.inspectedWindow.eval(code, callback);
	}

    function ResolveJSONReferences(object) {
        if(!object) { return object; }

        var count = 0;
        var serializationMap = new Map();
        var unresolvedReferences = [];

        function resolve(current, parent, property) {
            if(!current) { return current; }
            if(typeof current === "object") {
                if(current.hasOwnProperty("$serRefId$")) {
                    if(serializationMap.has(current["$serRefId$"])) {
                        return serializationMap.get(current["$serRefId$"]);
                    } else {
                        // Probably Out of order, so we'll do it after scanning the entire tree
                        unresolvedReferences.push({ parent: parent, property: property, $serRefId$: current["$serRefId$"] });
                        return current;
                    }
                }

                if(current.hasOwnProperty("$serId$")) {
                    serializationMap.set(current["$serId$"], current);
                    delete current["$serId$"];
                }

                for(var property in current) {
                    if(current.hasOwnProperty(property)) {
                        if(typeof current[property] === "object") {
                            current[property] = resolve(current[property], current, property);
                        }
                    }
                }
            }
            return current;
        }

        object = resolve(object);

        // If we had some resolutions out of order, lets clean those up now that we've parsed everything that is serialized.
        var unresolved;
        for(var c=0,length=unresolvedReferences.length;c<length;c++) {
            unresolved = unresolvedReferences[c];
            unresolved.parent[unresolved.property] = serializationMap.get(unresolved["$serRefId$"]);
        }


        return object;
    }
}