// get Id From URL
document.addEventListener("DOMContentLoaded", () => {
	var sidebarPanel = new AuraInspectorSideBarPanel();
	sidebarPanel.init(document.getElementById("sidebarContainer"));	
});


function AuraInspectorSideBarPanel() {
	var _container;
	var _componentView;

	this.init = function(container) {
		_container = container;

		_componentView = new AuraInspectorComponentView(this);
		_componentView.init(_container);

		// Attach the listener
		chrome.devtools.panels.elements.onSelectionChanged.addListener(ElementsPanel_OnSelectionChanged.bind(this));

		// Call it initially for the first time
		this.update();
	};

	this.update = function() {
		chrome.devtools.inspectedWindow.eval("this.$0 && $0.getAttribute && $0.getAttribute('data-aura-rendered-by')", function(globalId){
			if(globalId) {
				_container.classList.remove("hidden");
				_componentView.setData(globalId);
			} else {
				_container.classList.add("hidden");
			}
		});

	};

	this.getComponent = function(globalId, callback, configuration) {
        if(typeof callback !== "function") { throw new Error("callback is required for - getComponent(globalId, callback)"); }
        if(DevToolsEncodedId.isComponentId(globalId)) { globalId = DevToolsEncodedId.getCleanId(globalId); }
        var command;

        if(configuration && typeof configuration === "object") {
            var configParameter = JSON.stringify(configuration);
            command = `window[Symbol.for('AuraDevTools')].Inspector.getComponent('${globalId}', ${configParameter});`;
        } else {
            command = `window[Symbol.for('AuraDevTools')].Inspector.getComponent('${globalId}');`;
        }

        chrome.devtools.inspectedWindow.eval(command, function(response, exceptionInfo) {
            if(exceptionInfo) {
                console.error(command, " resulted in ", exceptionInfo);
            }
            if(!response) { return; }
            var component = JSON.parse(response);

            // RESOLVE REFERENCES
            component = ResolveJSONReferences(component);

            callback(component);
        });
    };

    /**
     * Broadcast a message to a listener at any level in the inspector. Including, the InjectedScript, the ContentScript or the DevToolsPanel object.
     *
     * @param  {String} key MessageID to broadcast.
     * @param  {Object} data any type of data to pass to the subscribe method.
     */
    this.publish = function(key, data) {
        if(!key) { return; }

        const PUBLISH_KEY = "AuraInspector:publish";
        var jsonData = JSON.stringify(data);
        var command = `
            window.postMessage({
                "action": "${PUBLISH_KEY}",
                "key": "${key}",
                "data": ${jsonData}
            }, window.location.href);
        `;

        chrome.devtools.inspectedWindow.eval(command);
    };

    function ElementsPanel_OnSelectionChanged() {
		this.update();
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