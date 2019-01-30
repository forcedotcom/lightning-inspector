export default function WebExtensionsRuntime(name) {
	const onConnectListeners = [];
    const _subscribers = new Map();
    let currentTabId = null;

	this.connect = function(callback, tabId) {
        if (tabId) {
            currentTabId = tabId;
        } else {
            currentTabId = this.getTabId();
        }
        const runtime = chrome.runtime.connect({"name": name });

        if(callback) {
        	onConnectListeners.push(callback);
        }

        runtime.postMessage( { "action": "BackgroundPage:publish", "key": "BackgroundPage:InjectContentScript", "data": currentTabId } );
        runtime.onMessage.addListener(BackgroundScript_OnMessage.bind(this));
        runtime.postMessage({subscribe: ["AuraInspector:bootstrap"], port: runtime.name, tabId: currentTabId});
        this.publish("AuraInspector:OnPanelConnect", "Chrome Runtime: Panel " + name + " connected to the page.");
	};

    /**
     * Listen for a published message through the system.
     *
     * @param  {String} key Unique MessageId that would be broadcast through the system.
     * @param  {Function} callback function to be executed when the message is published.
     */
    this.subscribe = function(key, callback) {
        if(!_subscribers.has(key)) {
            _subscribers.set(key, []);
        }

        _subscribers.get(key).push(callback);
    };

    /**
     * Broadcast a message to a listener at any (Non Background) level in the inspector. Including, the InjectedScript, the ContentScript or the DevToolsPanel object.
     *
     * @param  {String} key MessageID to broadcast.
     * @param  {Object} data any type of data to pass to the subscribe method.
     */
    this.publish = function(key, data) {
        if(!key) { return; }

        const jsonData = JSON.stringify(data);
        const command = `
            window.postMessage({
                "action": "AuraInspector:publish",
                "key": "${key}",
                "data": ${jsonData}
            }, window.location.origin);
        `;

        chrome.tabs.executeScript(this.getTabId(), {
            code: command
        }, function() {
            if(_subscribers.has(key)) {
                //console.log(key, _subscribers.get(key).length)
                _subscribers.get(key).forEach(function(callback){
                    callback(data);
                });
            }
        });

        // chrome.devtools.inspectedWindow.eval(command, function() {
        //     if(_subscribers.has(key)) {
        //         //console.log(key, _subscribers.get(key).length)
        //         _subscribers.get(key).forEach(function(callback){
        //             callback(data);
        //         });
        //     }
        // });

        // chromeEval(command);
    };

	// Aren't doing yet.
	// We'll probably want two, sendMessageToBackgroundScript(), sendMessageToContentScript()
	this.sendMessage = function() {};

	// Usually happens with a page refresh.
	this.disconnect = function() {};

	this.getTabId = function() {
		return currentTabId || chrome.devtools.inspectedWindow.tabId;
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

				const component = ResolveJSONReferences(JSON.parse(response));

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

        //var count = 0;
        const serializationMap = new Map();
        const unresolvedReferences = [];

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

                for(let property in current) {
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
        let unresolved;
        for(let c=0,length=unresolvedReferences.length;c<length;c++) {
            unresolved = unresolvedReferences[c];
            unresolved.parent[unresolved.property] = serializationMap.get(unresolved["$serRefId$"]);
        }

        return object;
    }
}