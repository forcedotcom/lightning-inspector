function AuraInspectorTransactionView() {
	var transactions = {};
	var currentTypeOfData; //Either "marks" or "customTrans"
	var CUSTOM_TRANS = "customTrans";
	var MARKS = "marks";

	var transactionGrid;
	var recording = false;

	var graphData = {};
	var graphDataIndices = [];
	var latestEndTime = 0;

	var labels;
	var markup;

    var eventManager;
    var _bootstrapMetrics = {};
    var _previousBootstrapMetrics = [];

	// Start live recording marks
	var _marks;
	var _processor;


	/* --------- Controller and listener methods -------------- */

	this.init = function(initLabels) {
		labels = initLabels;

        eventManager = new createEventManager();
        currentTypeOfData = MARKS;

        transactionGrid = new AuraInspectorTransactionGrid(this, eventManager);
		transactionGrid.init(labels);
		transactionGrid.attach("onitemclick", TransactionGrid_OnItemClick.bind(this));

		_processor = new MetricsServiceDataProcessor();

        //this.attach("initEventHandlers", initEventHandlers.bind(this));
    };

    this.clear = function() {
    	_processor = new MetricsServiceDataProcessor();

    	transactionGrid.setStartOffsetTime(Date.now() - _bootstrapMetrics.pageStartTime);
    	transactionGrid.setEndTime(Date.now() - _bootstrapMetrics.pageStartTime);
    	transactionGrid.clear();
    	transactionGrid.updateTimeMarkers();
    };

	/**
	 * Show all the metrics
	 */
    this.setBootstrapMetrics = function(metrics) {
    	var updatedMetrics = _bootstrapMetrics && _bootstrapMetrics.pageStartTime !== metrics.pageStartTime;
    	if(metrics) {
    		if(updatedMetrics) {
    			_previousBootstrapMetrics.push(_bootstrapMetrics);
    		}
    		_bootstrapMetrics = metrics;
    	}

	    transactionGrid.setStartTime(metrics.pageStartTime);
    };

    this.setMarksData = function(marks) {
    	_marks = marks;

    	_processor.addMarksData(_marks);

    	updateGrid();
    };

    this.addTransaction = function(transaction) {
    	_processor.addTransaction(transaction);

    	updateGrid()
    };

	this.render = function(container) {
		transactionGrid.render(container);
	};

	function updateGrid(){
		var marks = {};

		// TODO: Finish this.
		var items = _processor.getSortedItems();

		transactionGrid.setEndTime(_processor.getTimelineRange()[1]);
		transactionGrid.updateTimeMarkers();

		// Ideally we wouldn't do this either.
		transactionGrid.clear();

		var children;
		// Add a row for each Transport
		for(var c=0;c<items.length;c++) {
			 if(items[c] instanceof TransportDataRow) {
				transactionGrid.addRow(items[c]);
				children = _processor.getActions(items[c].id);

				for(var d=0;d<children.length;d++) {
					transactionGrid.addRow(children[d]);
				}
			} else {
				transactionGrid.addRow(items[c]);
			}
		}

	}

	function AuraInspectorTransactionView_OnTransactionEnd(data){
		if(recording && isCurrentTypeOfDataCustomTrans()) {
			customTransLiveUpdateTable(data, Date.now());
		}
	}

	/* ----------- DATA VISUALIZATION (interacts with transGrid) ----------- */

	function clear(){
		graphData = {};
		graphDataIndices = [];
		latestEndTime = 0;

		transactionGrid.clear();
	}

	/* Input: MARKS object from $A.metricsService.getCurrentMarks()
	 * Update table with all marks data regardless if its old or new
	 */
	function updateTable(data){
		clear();

		getUniqueIDs(data, graphData);
		updateTimes(data, graphData);

		var sortedData = sortGraphData(graphData);
		setLatestEndTime(sortedData);

		transactionGrid.updateTimeMarkers(latestEndTime);

		for(var x = 0; x < sortedData.length; x++) {
			transactionGrid.addRow(sortedData[x]);
		}
	}

	// Only update the table with new (LIVE) data not already displayed (used in recording)
	function liveUpdateTable(data, recordTimeStamp){
		var marks = {};
		var isNewData;
		var sortedData;

		getUniqueIDs(data, marks);
		updateTimes(data, marks);
		isNewData = retrieveNewData(graphData, marks);

		if(isNewData) {
			sortedData = sortGraphData(graphData);
			transposeTimesForLiveView(sortedData, recordTimeStamp);
			setLatestEndTime(sortedData);

			transactionGrid.clear();
			transactionGrid.updateTimeMarkers(latestEndTime);
			for (var x = 0; x < sortedData.length; x++) {
				if(isLiveData(sortedData[x].stamp)) {
					transactionGrid.addRow(sortedData[x]);
				}
			}
		}
	}

	function customTransLiveUpdateTable(data, recordTimeStamp){
		/* There are 2: data structures here. graphData, a map, will contain all the actual
		 data of the custom transactions.

		 graphDataIndices will contain all the UNIQUE ids of the custom transactions
		 we will use this array to sort.
		 */

		if(!graphData[data.id]){
			graphDataIndices.push(data.id);
			graphData[data.id] = [];
		}
		graphData[data.id].push(data);
		sortCustomTransGraphDataByName(graphDataIndices);
		transactionGrid.clear();

        var index = 0;
		for(var x = 0; x < graphDataIndices.length; x++){
			var currID = graphDataIndices[x];
			var currCustomTransArray = graphData[currID];
			sortCustomTransDataByTime(currCustomTransArray);

			for(var y = 0; y < currCustomTransArray.length; y++){
				transactionGrid.addMasterRow(currCustomTransArray[y]);
                index++;
                // add detail views. Should create new function for this
                if(currCustomTransArray[y].marks) {
                    addCustomTransMarksToTable(currCustomTransArray[y].marks, index-1);
                    //console.log("Custrom Trans: ",currCustomTransArray[y]);
                    //console.log("index: ", index);

                }
			}
		}
	}

    function addCustomTransMarksToTable(marks, index){
        // Different types of marks: actions, force:record, etc
        // each with their own array
        for (var k in marks) {

            currentMarks = marks[k];

            for(var z = 0; z < currentMarks.length; z++){
                transactionGrid.addDetailRow(currentMarks[z], index);
            }
        }
    }

	/* ----------- DATA PROCESSING ----------- */

	// Returns an array of the unique IDs given data;
	function getUniqueIDs(data, map){
		var currAction;
		var examinedID;

		if(!data || !data.actions || !data.actions.length) {
			return;
		}

		for (var x = 0; x < data.actions.length; x++){
			currAction = data.actions[x];
			examinedID = currAction.context.id;

			if (map[examinedID]){
				if(!map[examinedID].context && currAction.context.def) {
					map[examinedID].context = currAction.context.def;
				} else {
					continue;
				}

			} else {
				insertNewActionData(currAction, map);
			}
		}
	}

    function setCurrentTypeOfData(dataType){

    }

	// updates the stamp, start, and end times of the corresponding elements in map
	function updateTimes(data, map){
		if(!data.actions) {
			return;
		}

		for (var x = 0; x < data.actions.length; x++) {
			var currAction = data.actions[x];

			if(map[currAction.context.id]) {
				map[currAction.context.id][currAction.phase] = currAction.ts;
			}
		}
	}

	// Creates a new data entry in the map with specified context of the actionData
	function insertNewActionData(actionData, map){
		var insert = {};
		insert.id = actionData.context.id;

		if(actionData.context.def){
			insert.context = actionData.context.def;
		}

		map[insert.id] = insert;
	}

	// Sorts the graphData by its "stamp" timestamp attribute
	// Takes in a map and returns a sorted array of all the objects
	function sortGraphData(map){
		var array = [];

		for(var dataPoint in map){
			array.push(JSON.parse(JSON.stringify(map[dataPoint])));
		}

		array.sort(function(dataPointA, dataPointB){
			if(dataPointA.stamp > dataPointB.stamp){
				return 1;
			} else if (dataPointA.stamp == dataPointB.stamp) {
				return 0;
			} else {
				return -1;
			}
		});
		return array;
	}

	function sortCustomTransGraphDataByName(indices){
		indices.sort(function (a, b) {
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
	}

	// Input: an object created by $A.metricsService.onTransactionEnd()
	//        We will use object.ts to sort
	function sortCustomTransDataByTime(array){
		array.sort(function(dataPointA, dataPointB){
			if(dataPointA.ts > dataPointB.ts){
				return 1;
			} else if (dataPointA.stamp == dataPointB.stamp) {
				return 0;
			} else {
				return -1;
			}
		});
	}

	// Sets timestamp of the latest time to be used proportionally with drawn timelines
	function setLatestEndTime(sortedGraphData){
		for(var x = 0; x < sortedGraphData.length; x++){
			if(sortedGraphData[x].end && sortedGraphData[x].stamp && sortedGraphData[x].start
				&& sortedGraphData[x].end > latestEndTime){

				latestEndTime = sortedGraphData[x].end;
			}
		}
	}

	// Finds and sets the latest end time of all transactions for graphing
	function transposeTimesForLiveView(dataArray, recordStartTime){
		var transposeTime = recordStartTime - _bootstrapMetrics.pageStartTime;
		for(var x = 0; x < dataArray.length; x++){
			currMark = dataArray[x];

			if(currMark.stamp){
				currMark.stamp = currMark.stamp - transposeTime;
			}

			if(currMark.start){
				currMark.start = currMark.start - transposeTime;
			}

			if(currMark.end){
				currMark.end = currMark.end - transposeTime;
			}

		}
	}

	// Checks if this time is a point that is within the "live data" range
	function isLiveData(timestamp){
		return timestamp > 0;
	}

	// Given 2 maps, if the newMap contains data not already in storedMap, copy the data
	// over from newMap to storedMap.
	// Return: true if newData is found and copied into storedMap, otherwise false
	function retrieveNewData(storedMap, newMap){
		var newDataBool = false;
		var dataPoint;

		for(var index in newMap) {
			if (newMap.hasOwnProperty(index)) {
				dataPoint = newMap[index];

				// New datapoint!
				if(dataPoint.id && dataPoint.context && !storedMap[dataPoint.id]){
					storedMap[dataPoint.id] = JSON.parse(JSON.stringify(dataPoint));
					newDataBool = true;
				}

				// or update times (if they don't exist)
				if(storedMap[dataPoint.id]){
					if(!storedMap[dataPoint.id].start && dataPoint.start){
						storedMap[dataPoint.id].start = dataPoint.start;
						newDataBool = true;
					}
					if(!storedMap[dataPoint.id].stamp && dataPoint.stamp){
						storedMap[dataPoint.id].stamp = dataPoint.stamp;
						newDataBool = true;
					}
					if(!storedMap[dataPoint.id].end && dataPoint.end){
						storedMap[dataPoint.id].end = dataPoint.end;
						newDataBool = true;
					}
				}
			}
		}

		return newDataBool;
	}

    function outputActionServerData(action) {
    	if(!action) {
    		return;
    	}

    	if(!action.serverData) {
    		var name = action.stamp && action.stamp.context.def || "unknown action";
    		chrome.devtools.inspectedWindow.eval(`
    			console.log("Action: ${name} did not have any performance data.");
    		`);
    		return;
    	}

    	var data = action.serverData;
    	var name = data.attachment.actionName.replace(/^\d\$/g, "")
    	var callstack;
    	var overview = JSON.stringify([{
    		"name": name,
    		"startTime": new Date(data.startTime).toLocaleString(),
    		"totalTime": data.totalTime,
    		"ownTime": data.ownTime,
    		"childTime": data.childTime
    	}]);

    	if(data.children) {
	    	callstack = JSON.stringify(data.children.map(function(item) {
	    		return {
	    			"work": item.attachment[Object.keys(item.attachment)[0]],
	    			"startTime": new Date(item.startTime).toLocaleString(),
	    			"totalTime": item.totalTime,
	    			"childTime": item.childTime
	    		}
	    	}));
	    }

    	chrome.devtools.inspectedWindow.eval(`
    		console.group("Action: ${name}");
    		console.log("%cOverview", "font-size: 1.2em; font-weight: bold; color: #0070d2;");
	    	console.table(${overview}, ["totalTime", "ownTime", "childTime"]);
    		if(${callstack}) {
	    		console.log("%cCallstack", "font-size: 1.2em; font-weight: bold; color: #0070d2;");
		    	console.table(${callstack}, ["work", "totalTime", "childTime"]);
		    }
	    	console.groupEnd();
    	`);

    }

    function outputTransportServerData(transport) {
    	if(!transport) {
    		return;
    	}
    	if(!transport.serverData) {
    		var name = transport.name;
    		chrome.devtools.inspectedWindow.eval(`
    			console.log("Transport: ${name} did not have any performance data.");
    		`);
    		return;
    	}
    	var data = transport.serverData;
		var name = transport.name;
    	var overview = JSON.stringify([{
    		"name": name,
    		"startTime": new Date(data.startTime).toLocaleString(),
    		"totalTime": data.totalTime,
    		"ownTime": data.ownTime,
    		"childTime": data.childTime
    	}]);

    	var callstack = JSON.stringify(data.children.map(function(item) {
    		var type = item.name

    		return {
    			"type": item.name,
    			"info": item.attachment[Object.keys(item.attachment)[0]],
    			"startTime": new Date(item.startTime).toLocaleString(),
    			"totalTime": item.totalTime,
    			"childTime": item.childTime
    		}
    	}));

    	chrome.devtools.inspectedWindow.eval(`
    		console.group("${name}");
    		console.log("%cOverview", "font-size: 1.2em; font-weight: bold; color: #0070d2;");
	    	console.table(${overview}, ["startTime", "totalTime", "ownTime", "childTime"]);
    		console.log("%cCallstack", "font-size: 1.2em; font-weight: bold; color: #0070d2;");
	    	console.table(${callstack}, ["type",  "info", "totalTime", "childTime"]);
	    	console.groupEnd();
    	`);


    }

    function MetricsServiceDataProcessor() {
    	var _transports = new Map();
    	var _actions = new Map();
    	var _serverData = new Map();
    	var _startRange = Infinity;
    	var _endRange = 0;
    	var _transactions = [];
    	var _uid = 1;

    	this.getSortedItems = function() {
    		var transports = this.getTransports();
    		var items = _transactions.concat(transports);

    		// TODO: Move sort function decleration out of here.
    		return items.sort(function(a, b) {
    			var aTimestamp = a.getStartTime();
    			var bTimestamp = b.getStartTime();

    			if(aTimestamp === bTimestamp) { return 0; }
    			else if(aTimestamp < bTimestamp) { return -1; }
    			return 1;
    		});
    	};

    	this.addTransaction = function(transaction) {
    		_transactions.push(new TransactionDataRow(transaction));
    	};

    	this.addMarksData = function(data) {
    		// Process Marks
    		if(!data) {
    			return;
    		}

    		if(Array.isArray(data.transport)) {
	    		parseTransports(data.transport);
	    	}

	    	// Parse Actions
	    	if(Array.isArray(data.actions)) {
	    		parseActions(data.actions);
	    	}

	    	if(Array.isArray(data.server)) {
	    		parseServerData(data.server);
	    	}
    	};

    	this.getChildren = function(dataRow) {
    		if(dataRow.getChildren) {
    			return dataRow.getChildren();
    		}
    		return [];
    	};

    	this.getTransports = function() {
    		var transports = [];
    		return Array.from(_transports.values());
    	};

    	this.getTransportById = function(transportId) {
    		return getTransportById(parseInt(transportId));
    	};

    	this.getTransactionById = function(transactionId) {
    		for(var c=0;c<_transactions.length;c++) {
    			if(_transactions[c].id === transactionId) {
    				return _transactions[c];
    			}
    		}
    	};

    	this.getActions = function(transportId) {
    		var transport = getTransportById(transportId);

    		if(!transport) {
    			console.error("You provided an invalid transportId. The transport did not exist.")
    			return [];
    		}

    		var ret = [];
    		var actionIds = transport.getActions();
    		for(var actionId in actionIds) {
    			ret.push(getActionById(actionId));
    		}

    		return ret;
    	};

    	this.getActionById = function(actionId) {
    		return getActionById(actionId);
    	};

    	this.getServerData = function(actionId) {
    		var action = getActionById(actionId);
    		if(action) {
    			return action.serverData;
    		}
    	};

    	this.getTimelineRange = function() {
    		return [_startRange, _endRange];
    	};

    	this.getUid = function(prefix) {
    		_uid = _uid+1;
    		if(prefix) {
    			return prefix + _uid;
    		}
    		return _uid;
    	}

    	function getTransportById(id) {
    		return _transports.get(id);
    	}

    	function setTransportById(id, value) {
    		_transports.set(id, value);
    	}

    	function getActionById(id) {
    		return _actions.get(id);
    	}

    	function setActionById(id, value) {
    		_actions.set(id, value);
    	}

    	function parseTransports(transportMarks) {
    		var transport;
    		var current;
    		var id;
    		for(var c=0;c<transportMarks.length;c++) {
    			current = transportMarks[c];
    			id = transportMarks[c].context.auraXHRId;
    			transport = getTransportById(id);
    			if(!transport) {
    				transport = new TransportDataRow({ "id": id, "name": "http-request {" + id + "}" });
    				setTransportById(id, transport);
    			}

    			transport.mergeData(current);

    			_startRange = Math.min(transport.getStartTime(), _startRange);
    			_endRange = Math.max(transport.getStartTime(), _endRange);
    		}
    	}

    	function parseActions(actionMarks) {
    		var current;
    		var id;
    		var action;
    		for(var c=0;c<actionMarks.length;c++) {
    			current = actionMarks[c];
    			id = current.context.id;

    			action = getActionById(id);

    			if(!action) {
    				action = new ActionsDataRow({ "id": id });
    				setActionById(id, action);
    			}

    			action.mergeData(current);

    			_startRange = Math.min(action.getStartTime(), _startRange);
    			_endRange = Math.max(action.getStartTime(), _endRange);
    		}
    	}

    	function parseServerData(dataMarks) {

			var current;
    		var xhrId;
    		var calltree;
    		var transport;
    		for(var c=0;c<dataMarks.length;c++) {
    			current = dataMarks[c];
    			if(!current.context){
    				continue;
    			}
    			xhrId = current.context.id;

   				transport = getTransportById(xhrId);
   				if(!transport) {
   					continue; // Not sure why this would happen. Just being safe.
   				}

   				transport.mergeData(current);
    		}

    	}

    }

	function getActionFromTransport(transport, actionPath) {
		if(!transport || !actionPath) {
			throw new Error("Necessary arguments not specified. Expected (transport, actionName)");
		}
		// No Actions? No need doing any further logic.
		if(!transport.actions) {
			return null;
		}

		// Format: "1$apex://DreamforceData/ACTION$getFeatureList"
		var actionDef = actionPath.replace(/^\d\$/g, "");


		var action;
		for(var actionId in transport.actions) {
			action = _processor.getActionById(actionId);
			if(action && action.columns[0] === actionDef) {
				return action;
			}
		}

		return null;
	}

    function TransactionDataRow(transaction) {
    	this.columns = [transaction.id, "", transaction.duration, transaction.ts + "ms"];
    	this.id = _processor.getUid(transaction.id);
    	this.timeline = [transaction.start, transaction.start + transaction.duration];
    	this.styles = {
    		"timeline": "transaction",
    		"row": "transaction"
    	};

    	this.mergeData = function() {};

    	this.getStartTime = function() {
    		return transaction.ts;
    	};

    	// Used in temporary console.log
    	this.getData = function() {
    		return transaction;
    	};
    }

    // Transforms PROCESSED marks to a row that the grid expects.
    function TransportDataRow(marks) {
    	this.columns = [marks.name, marks.id];
    	this.id = marks.id;
    	this.timeline = [];
    	this.styles = {
    		"timeline": "transport",
    		"row": "transport"
    	};

    	this.mergeData = function(data) {
    		var calltree;

			if(!marks[data.phase]) {
				marks[data.phase] = data;
			}

			if(data.context && data.context.actionDefs) {
				if(!marks.actions) {
					marks.actions = {};
				}

				for(var d=0;d<data.context.actionDefs.length;d++) {
					// Format is actionName$actionId in 202, actionId in 204
					var pair = data.context.actionDefs[d].split("$");
					var actionId = pair[1] || pair[0];
					marks.actions[actionId] = pair[0];
				}
			}

			if(data.context && data.context.perf && data.context.perf.calltree) {
   				calltree = data.context.perf.calltree[0]
   				if(calltree) {
					marks.serverData = calltree;
	   				for(var d=0;d<calltree.children.length;d++) {
	   					if(calltree.children[d].name === "action") {
	   						var action = getActionFromTransport(marks, calltree.children[d].attachment.actionName);
	   						if(action) {
	   							action.serverData = calltree.children[d];
	   						}
	   					}
	   				}
	   			}
   			}

			if(marks.start) {
	    		this.timeline.push(marks.start.ts);

	    		// Start Time Column
	    		this.columns[3] = Math.round(marks.start.ts) + "ms";
	    	}

	    	if(marks.end && marks.start) {
	    		this.timeline.push(marks.end.ts);

	    		// Duration Column
	    		this.columns[2] = Math.round(marks.end.ts - marks.start.ts) + "ms";
	    	}
    	};

    	this.getChildren = function() {
    		return _processor.getActions(this.id);
    	};

    	this.getActions = function() {
    		return marks.actions || [];
    	};

    	this.getStartTime = function() {
    		return marks.start && marks.start.ts || 0;
    	};

    	this.mergeData(marks);
    }

    function ActionsDataRow(marks) {
    	this.columns = ["unknown action", marks.id];
    	this.id = marks.id;
    	this.timeline = [];
    	this.styles = {
    		"timeline": "action",
    		"row": "action"
    	};

    	this.mergeData = function(data) {
    		if(!data.hasOwnProperty("phase")) {
    			return;
    		}

			if(!marks[data.phase]) {
				marks[data.phase] = data;
			}

	    	if(marks.stamp) {
	    		this.columns[0] = marks.stamp.context.def;
	    		this.timeline[0] = marks.stamp.ts;
	    	}

	    	if(marks.start) {
	    		this.timeline[1] = marks.start.ts;
	    		this.columns[3] = Math.round(marks.start.ts) + "ms";

	    		if(marks.end) {
	    			this.columns[2] = Math.round(marks.end.ts - marks.start.ts) + "ms";
	    		}
	    	}

	    	if(marks.end) {
	    		this.timeline[2] = marks.end.ts;
	    		if(marks.start) {
	    			this.columns[2] = Math.round(marks.end.ts - marks.start.ts) + "ms";
	    		}
	    	}

		};

		this.getStartTime = function() {
			return marks.start && marks.start.ts || 0;
		};

    	this.mergeData(marks);
    }

    function TransactionGrid_OnItemClick(eventData) {
    	if(eventData.type === "action") {
    		outputActionServerData(_processor.getActionById(eventData.id));
    		// Lets print out the server Data
    	} else if(eventData.type === "transport") {
    		outputTransportServerData(_processor.getTransportById(eventData.id));
    		// Print out the server data.
    	} else if(eventData.type === "transaction") {
    		var transaction = _processor.getTransactionById(eventData.id);
    		if(transaction) {
    			var json = JSON.stringify(transaction.getData());
    			chrome.devtools.inspectedWindow.eval(`
	    			console.log(${json});
	    		`);
    		}
    	}

    }



    /* ------------------- Event related functions ---------------------*/

    function createEventManager(){
        var eventManager = {};

        eventManager.attach = function(eventName, func){
            if(!eventManager[eventName]){
                eventManager[eventName] = [];
            }
            eventManager[eventName].push(func);
        };

        eventManager.remove = function(eventName){
            if(eventManager[eventName] || eventManager[eventManager].length > 0){
                eventManager[eventName] = [];
            }
        };

        eventManager.notify = function(eventName, data){
            if(eventManager[eventName] && eventManager[eventName].length > 0){
                for(var x = 0; x < eventManager[eventName].length; x++){
                    eventManager[eventName][x](data);
                }
            }
        };

        return eventManager;
    }

    this.attach = function(eventName, callback){
        eventManager.attach(eventName, callback);
    };

    this.remove = function(eventName){
        eventManager.remove(eventName);
    };

    this.notify = function(eventName, data){
        eventManager.notify(eventName, data);
    };

}
