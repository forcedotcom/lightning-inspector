function AuraInspectorTransactionView(controller) {
	var transactions = {};
	var recordButton;
	var marksButton;
	var customTransButton;

	var currentTypeOfData; //Either "marks" or "customTrans"
	var CUSTOM_TRANS = "customTrans";
	var MARKS = "marks";

	var transactionGrid;
	var recording = false;

	var graphData = {};
	var graphDataIndices = [];
	var latestEndTime = 0;
	var startTime = 0;

	var labels;
	var markup;

	/* --------- Controller and listener methods -------------- */

	this.init = function(tabBody, initLabels) {
		labels = initLabels;
		markup = `
			<div class="aura-panel panel-status-bar">
			
            <button id="record-button" class="record-button">
            	<aurainspector-onOffButton class="circle on" title="${labels.record_tooltip}">
            		<span>${labels.record}</span>
            	</aurainspector-onOffButton>
            </button>
            
            <button class="refresh-transactions-bar-item status-bar-item" title="${labels.clear}">
				<div class="glyph"></div><div class="glyph shadow"></div>
			</button>
			
			<button class="clear-status-bar-item status-bar-item" title="${labels.clear}">
				<div class="glyph"></div><div class="glyph shadow"></div>
			</button>			
			
			<button id="marks-button" class="transaction-tabs-button selected" title="Marks"> 
				Marks
			</button>
			
			<button id="custom-transactions-button" class="transaction-tabs-button" title="Custom Transactions"> 
				Custom Transactions
			</button>
			
		</div>
		`;
		
		tabBody.innerHTML = markup;
		tabBody.classList.add("trans-panel");

		transactionGrid = new AuraInspectorTransactionGrid(this);
		transactionGrid.init(tabBody, labels);

		currentTypeOfData = MARKS;
		controller.requestLoadTime();
		controller.subscribeToOnTransactionEnd(AuraInspectorTransactionView_OnTransactionEnd.bind(this));
	};

	/* 	Load time is unix timestamp of when the page successfully loaded
	   	This load time will be used in calculations to decide if a piece of data is "live" when we
	 	are recoding */
	this.setLoadTime = function(time){
		transactionGrid.setLoadTime(time);
		startTime = time;
	};

	this.render = function() {
		var clearButton = document.querySelector('#tab-body-transaction .clear-status-bar-item');
		clearButton.addEventListener('click', ClearTable_OnClick.bind(this), false);

		var refreshButton = document.querySelector('#tab-body-transaction .refresh-transactions-bar-item');
		refreshButton.addEventListener('click', RefreshTransactions_OnClick.bind(this), false);

		recordButton = document.querySelector('#tab-body-transaction #record-button');
		recordButton.addEventListener('click', RecordButton_OnClick.bind(this), false);

		marksButton = document.querySelector('#tab-body-transaction #marks-button');
		marksButton.addEventListener('click', MarksButton_OnClick.bind(this), false);

		customTransButton = document.querySelector('#tab-body-transaction #custom-transactions-button');
		customTransButton.addEventListener('click', CustomTransactionsButton_OnClick.bind(this), false);

		controller.hideMisc();

		// Start live recording marks
		var recordTimeStamp = Date.now();
		recording = true;
		subscribeToMarks(function(data){
			liveUpdateTable(data, recordTimeStamp);
		}.bind(this));
	};

	this.printToConsole = function(obj){
		controller.printToConsole(obj);
	};

	function getActions(callback) {
		controller.getCurrentMarks(callback);
	}

	function MarksButton_OnClick(event){
		if(currentTypeOfData === MARKS){
			return;
		} else {
			customTransButton.classList.remove("selected");
			marksButton.classList.add("selected");
			ClearTable_OnClick(event);

			setDataType(MARKS);
		}
	}

	function CustomTransactionsButton_OnClick(event){
		if(currentTypeOfData === CUSTOM_TRANS){
			return;
		} else {
			marksButton.classList.remove("selected");
			customTransButton.classList.add("selected");
			ClearTable_OnClick(event);

			setDataType(CUSTOM_TRANS);
		}
	}

	function ClearTable_OnClick(event) {
		if(recording) {
			recording = false;
			recordButton.classList.remove("on");
			recordButton.children[0].classList.remove("on");

			setTimeout(function(){clear()}, 500);
		} else {
			clear();
		}
	}

	function RefreshTransactions_OnClick(event) {
		if(currentTypeOfData === CUSTOM_TRANS){
			return;
		}

		if (recording) {
			recording = false;
			recordButton.classList.remove("on");
			recordButton.children[0].classList.remove("on");

			setTimeout(function () {
				clear();
				getActions(function (data) {
					updateTable(data);
				}.bind(this));
			}.bind(this), 500);

		} else {
			clear();
			getActions(function (data) {
				updateTable(data);
			}.bind(this));
		}
	}

	// Automatic updates of transaction marks
	function RecordButton_OnClick(event){
		var recordTimeStamp = Date.now();

		// Only works if user presses on the actual circle
		if(event.target.classList.contains("circle")){
			if(event.target.classList.contains("on")){
				recording = true;
				if(currentTypeOfData === MARKS) {
					subscribeToMarks(function (data) {
						liveUpdateTable(data, recordTimeStamp);
					});
				}

			} else {
				recording = false;
			}
		}
	}
	
	function subscribeToMarks(callback){
		clear();

		var refreshingTimer = setInterval(
			function() {
				getActions(callback);
				if(recording == false){
					clearInterval(refreshingTimer);
				}
			}.bind(this), 500);
	}

	function AuraInspectorTransactionView_OnTransactionEnd(data){
		if(recording && currentTypeOfData === CUSTOM_TRANS) {
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
			transactionGrid.addMarkToTable(sortedData[x]);
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
					transactionGrid.addMarkToTable(sortedData[x]);
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

		for(var x = 0; x < graphDataIndices.length; x++){
			var currID = graphDataIndices[x];
			var currCustomTransArray = graphData[currID];
			sortCustomTransDataByTime(currCustomTransArray);

			for(var y = 0; y < currCustomTransArray.length; y++){
				transactionGrid.addCustomTransToTable(currCustomTransArray[y]);
			}
		}

	};

	/* ----------- DATA PROCESSING ----------- */

	// Returns an array of the unique IDs given data;
	function getUniqueIDs(data, map){
		var currAction;
		var examinedID;

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

	// updates the stamp, start, and end times of the corresponding elements in map
	function updateTimes(data, map){

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
		var transposeTime = recordStartTime - startTime;
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

	function setDataType(type){
		if(currentTypeOfData != type){
			currentTypeOfData = type;
			transactionGrid.createTableHeader(type);
		}
	}
}
