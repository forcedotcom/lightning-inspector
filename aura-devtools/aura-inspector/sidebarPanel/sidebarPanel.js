// get Id From URL
document.addEventListener("DOMContentLoaded", () => {
	var sidebarPanel = new AuraInspectorSideBarPanel();
	sidebarPanel.init(document.getElementById("sidebarContainer"));	
});


function AuraInspectorSideBarPanel() {
	var _container;
	var _componentView;
    var _runtime;

	this.init = function(container) {
        _container = container;
        _runtime = new ChromeRuntime("AuraInspectorSideBarPanel");

        _runtime.connect(()=>{
            _componentView = new AuraInspectorComponentView(this);
            _componentView.init(_container);

            // Attach the listener
            //chrome.devtools.panels.elements.onSelectionChanged.addListener(ElementsPanel_OnSelectionChanged.bind(this));
            _runtime.onSelectionChanged(ElementsPanel_OnSelectionChanged.bind(this));

            // Call it initially for the first time
            // Detect if the content script is injected, if so, update, otherwise inject content script then update.
            this.update();
        });
	};

	this.update = function() {
        _runtime.eval("this.$0 && $0.getAttribute && $0.getAttribute('data-aura-rendered-by')", function(globalId){
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
        globalId = DevToolsEncodedId.getCleanId(globalId);
       
        _runtime.InjectedScript.getComponent(globalId, callback, configuration);
    };

    /**
     * Broadcast a message to a listener at any level in the inspector. Including, the InjectedScript, the ContentScript or the DevToolsPanel object.
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
            }, window.location.href);
        `;

        _runtime.eval(command);
    };

    function ElementsPanel_OnSelectionChanged() {
		this.update();
	}

}