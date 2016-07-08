(function() {
	var EVENT_INDEX = 0;
	var ownerDocument = document.currentScript.ownerDocument;

	var eventCard = Object.create(HTMLElement.prototype);

	/**
	 * The element has been attached to the DOM, update the structure.
	 *
	 * Kris: This probably wouldn't even be necessary if we configured the
	 * attributeChangedCallback correctly.
	 * 
	 * @return {[type]} [description]
	 */
	eventCard.attachedCallback = function() {
		var model = {
			eventName: 		this.getAttribute("name"),
			eventSourceId: 	this.getAttribute("sourceId"),
			eventDuration: 	this.getAttribute("duration"),
			eventType: 		this.getAttribute("type") === "APPLICATION" ? "APP" : "CMP",
			eventCaller: 	this.getAttribute("caller"),
			parameters: 	this.getAttribute("parameters")//,
			// handledBy: 		this.getAttribute("handledBy"),
			// handledByTree: 	this.getAttribute("handledByTree")
		};

		// remove markup:// from the event name if present
		if(model.eventName.startsWith("markup://")) {
			model.eventName = model.eventName.substr(9);
		}

		// I'm still working on what the best pattern is here
		// This seems sloppy    	
    	this.shadowRoot.querySelector("h1").textContent 			= model.eventName;
		this.shadowRoot.querySelector("h6").textContent				= model.eventType;
    	this.shadowRoot.querySelector(".caller").textContent 		= model.eventCaller;
    	this.shadowRoot.querySelector("#eventDuration").textContent = model.eventDuration+"ms";
    	this.shadowRoot.querySelector(".parameters").textContent 	= model.parameters;

		// hide when clicked (does not detect click)
		var collapsed = this.getAttribute("collapsed");
		if(collapsed === "true" || collapsed === "collapsed") {
			var section = this.shadowRoot.querySelector("section");
			section.classList.add("hidden");
		}

		var source = this.shadowRoot.querySelector("#eventSource");
		if(model.eventSourceId) {
			var auracomponent = document.createElement("aurainspector-auracomponent");
			auracomponent.setAttribute("globalId", model.eventSourceId);
			source.appendChild(auracomponent);
		} else {
			source.classList.add("hidden");
		}

	};

	/*
		New Action Card created, update it's body
	 */
	eventCard.createdCallback = function(){
    	var template = ownerDocument.querySelector("template");

    	var clone = document.importNode(template.content, true);

    	var shadowRoot = this.createShadowRoot();
    		shadowRoot.appendChild(clone);

    	var toggleButton = shadowRoot.querySelector("#gridToggle");
    	toggleButton.addEventListener("click", ToggleButton_OnClick.bind(this));

		var section = this.shadowRoot.querySelector("section");
    	section.addEventListener("transitionend", function(event) {
			var element = event.target;
			element.classList.remove("highlight");
		});
	};

	eventCard.attributeChangedCallback = function(attr, oldValue, newValue) {
		if(attr === "collapsed") {
			var section = this.shadowRoot.querySelector("section");
			var isCollapsed = this.isCollapsed();
			if(newValue === "true" || newValue === "collapsed" && !isCollapsed) {
				section.classList.add("hidden");
			} else if(newValue !== "true" && newValue !== "collapsed" && isCollapsed) {
				section.classList.remove("hidden");
				renderHandledBy(this);
				renderCallStack(this);
				//this.addEventListener("highlightCard", highlightCard);
				//this.highlight();
				if(this.getAttribute("showGrid") === "true") {
					renderHandledByTree(this);
				}
			}
		}
		if(attr === "showgrid" || attr === "showGrid") {
			if(newValue === "true") {
				renderHandledByTree(this);
			} else {
				this.shadowRoot.querySelector("#eventHandledByGrid").classList.add("hidden");
			}
		}
	};

	eventCard.isCollapsed = function() {
		return this.shadowRoot.querySelector("section").classList.contains("hidden");
	};

	eventCard.highlight = function(){
		var section = this.shadowRoot.querySelector("section") ;
		section.classList.add("highlight");
	};

	var eventCardConstructor = document.registerElement('aurainspector-eventCard', {
		prototype: eventCard
	});

	function renderCallStack(element) {
		var events;
		var EVENT_INDEX = 0;
		var data = getData(element.getAttribute("handledByTree")) || [];
		var handledContainer = element.shadowRoot.querySelector("#callStack");
		handledContainer.removeChildren();

		if(!data || data.length === 0) {
			handledContainer.appendChild(createEmptyMessageRow());
			return;
		}

		events = getCallStackData(element, data);
		
		handledContainer.appendChild(createHeaderRow());

		// Write to the table for every event
		for(var c = events.length-1; c >= 0; c--){
			var tr;
			var scope;
			var event = events[c];
			//var eventInfo = event[EVENT_INDEX];

			// Create the list of actions that were fired by each event
			tr = document.createElement("tr");

			tr.appendChild(createEventLabel(event));
			tr.appendChild(createActionData(event));

			handledContainer.appendChild(tr);
		}

		function createEventLabel(event){
			//var eventIndex = 0;
			var eventInfo = event[0]; // Not sure why only the first event
			var eventLabel;
			var td;
			var scope;

			if(eventInfo.data.sourceId) {
				scope = document.createElement("aurainspector-auracomponent");
				scope.setAttribute("summary", "true");
				scope.setAttribute("globalId", eventInfo.data.sourceId);
			} else {
				scope = document.createTextNode("{" + eventInfo.data.sourceId + "}");
			}
			td = document.createElement("td");
			
			eventLabel = document.createElement("a");
			eventLabel.textContent = (eventInfo.data.sourceId ? eventInfo.data.name : eventInfo.data.name);
			eventLabel.href = "";
			eventLabel.setAttribute("data-globalid", eventInfo.id);
			eventLabel.setAttribute("data-controller-name", eventInfo.data.name);
			eventLabel.addEventListener("click", EventCallStackEvent_OnClick);

			td.appendChild(eventLabel);
			td.appendChild(scope);

			return td;
		}

		function createActionData(event){
			var td = document.createElement("td");
			var controller;
			var scope;

			for(var a = 1; a < event.length; a++) {
				var handled = event[a];

				scope = document.createElement("aurainspector-auracomponent");
				scope.setAttribute("summary", "true");
				scope.setAttribute("globalId", handled.data.scope);

				controller = document.createElement("aurainspector-controllerreference");
				controller.setAttribute("expression", "{!c." + handled.data.name + "}");
				controller.setAttribute("component", handled.data.scope);
				controller.textContent = "c." + handled.data.name;

				if (a > 1) {
					td.appendChild(document.createElement("br"));
				}

				td.appendChild(controller);
				td.appendChild(scope);

			}
			return td;
		}

		function createHeaderRow(){
			var tr;
			var th;

			tr = document.createElement("tr");

			th = document.createElement("th");
			th.appendChild(document.createTextNode(chrome.i18n.getMessage("eventcard_event")));
			tr.appendChild(th);

			th = document.createElement("th");
			th.appendChild(document.createTextNode(chrome.i18n.getMessage("eventcard_actions")));
			tr.appendChild(th);

			return tr;
		}

		function createEmptyMessageRow(){
			var td;
			var tr;

			td = document.createElement("td");
			td.appendChild(document.createTextNode(chrome.i18n.getMessage("eventcard_none")));

			tr = document.createElement("tr");
			tr.appendChild(td);

			return tr;
		}

	}

	function renderHandledBy(element) {
		var data = getData(element.getAttribute("handledBy"));
		var handledContainer = element.shadowRoot.querySelector("#eventHandledBy");
		handledContainer.removeChildren();

		if(!data || data.length === 0) { 
			var span = document.createElement("span");
			span.textContent = "None";
			handledContainer.appendChild(span);
			return;
		}

		var dl = document.createElement("dl");
		var dt;
		var auracomponent;
		var dd;
		var controller;
		var handlers;
		for(var c=0;c<data.length;c++) {
			handlers = "handledBy" in data[c] ? data[c].handledBy : [data[c]];
			for(var d=0;d<handlers.length;d++) {
				auracomponent = document.createElement("aurainspector-auracomponent");
				auracomponent.setAttribute("globalId", handlers[d].scope);
				
				dt = document.createElement("dt");
				dt.appendChild(auracomponent);

				controller = document.createElement("aurainspector-controllerreference");
				controller.setAttribute("expression", "{!c." + handlers[d].name + "}");
				controller.setAttribute("component", handlers[c].scope);
				controller.textContent = "c." + handlers[d].name;

				dd = document.createElement("dd");
				dd.appendChild(controller);

				dl.appendChild(dt);
				dl.appendChild(dd);
			}
		}

		// build the handled collection
		handledContainer.appendChild(dl);

		// Show Toggle Button
		var gridToggle = element.shadowRoot.querySelector("#gridToggle");
		gridToggle.classList.remove("hidden");

	}

	function renderHandledByTree(element) {
		var handledByTree = getData(element.getAttribute("handledByTree")) || [];

		// Empty, or just itself? Don't draw
		if(handledByTree.length < 2) {
			return;
		}

		var gridContainer = element.shadowRoot.querySelector("#eventHandledByGrid");
		gridContainer.removeChildren();
		gridContainer.classList.remove("hidden");

		var eventId = element.id;
		var rawEdges = [];
		var rawNodes = [];

		for(var c = 0; c < handledByTree.length;c++) {
			var handled = handledByTree[c];
			if(handled.type === "action") {
			  	rawNodes.push({ "id": handled.id, "label": `{${handled.data.scope}} c.${handled.data.name}`, "color": "maroon" });
			} else {
				var label = handled.data.sourceId ? `{${handled.data.sourceId}} ${handled.data.name}` : handled.data.name;
			  	var data = { "id": handled.id, "label": label, "color": "steelblue" };
			  	if(handled.id === eventId) {
			  		data.size = 60;
			  		data.color = "#333";
			  	}
			  	rawNodes.push(data);
			}
			if(handled.parent) {
			  	rawEdges.push( { "from": handled.id, "to": handled.parent, arrows: "from" } );
			}
		}

		  var nodes = new vis.DataSet(rawNodes);
		  var edges = new vis.DataSet(rawEdges);
		  var options = {
		  	nodes: {
		  		borderWidth: 1,
		  		shape: "box",
		  		size: 50,
		  		font: {
		  			color: "#fff"
		  		},
		  		color: {
		  			border: "#222"
		  		}
		  	},
		  	layout: {
		  		hierarchical: {
			      enabled: true,
			      //levelSeparation: 70,
			      direction: 'DU',   // UD, DU, LR, RL
			      sortMethod: 'directed' // hubsize, directed
			    }
		  	},
		  	interaction: {
		  		dragNodes: true
		  	}
		  };

		  var network = new vis.Network(gridContainer, { "nodes": nodes, "edges": edges }, options);
	}

	function getData(data) {
		if(!data) { return data; }
		if(data.length === 0) { return data; }
		if(typeof data === "string") { 
			return JSON.parse(data);
		} 
		return data;
	}


	function getCallStackData(element, data){

		// id of the current element we are examining in call stack
		var currentId = element.id;
		var events = [];
		var actions = [];

		// Get list of all events in chronological order in call stack
		while(currentId != null){ // If null, that means there is no parent of previous
			//search every element in data to find
			for(var c = 0; c < data.length; c++){
				var handled = data[c];

				if(handled.id === currentId){
					if(handled.type === "event"){
						events.push([handled]);
					} else {
						actions.push(handled)
					}

					if(handled.parent){
						currentId = handled.parent;
					} else {
						currentId = null;
					}
				}
			}
		}

		// Get action children for current event
		for(var c = 0; c < data.length; c++){
			if(data[c].parent && data[c].parent === element.id && data[c].type === "action"){
				actions.push(data[c])
			}
		}

		// For each action append to return events array so it looks like:
		// [ (event), (action), (action), (action) ]
		for(var count = 0; count < actions.length; count++){
			var handled = actions[count];

			for(var c = 0; c < events.length; c++){
				var event = events[c][EVENT_INDEX];
				if(handled.parent === event.id){
					events[c].push(handled)
				}
			}
		}

		return events;
	}


	function ControllerLink_OnClick(event) {
		var globalId = this.getAttribute("data-globalid");
		var name = this.getAttribute("data-controller-name");

		var inspectMethod = `$A.getComponent('${globalId}') && inspect($A.getComponent('${globalId}').controller['${name}'])`;

		chrome.devtools.inspectedWindow.eval(inspectMethod);

		event.preventDefault();
		event.stopPropagation();
	}

	function EventCallStackEvent_OnClick(e){
		this.dispatchEvent(new Event('navigateToEvent'));

		e.preventDefault();
	}

	function ToggleButton_OnClick(event) {
		var showGrid = this.getAttribute("showGrid");
		this.setAttribute("showGrid", (!showGrid || showGrid !== "true") ? "true" : "false");
	}
})();
