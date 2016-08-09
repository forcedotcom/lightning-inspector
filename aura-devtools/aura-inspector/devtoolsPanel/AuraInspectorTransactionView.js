function AuraInspectorTransactionView(devtoolsPanel) {
	var clearButton;
	var transactions = {};
	var transactionGrid;
	var recording = false;

	var labels = {
		"clear" : chrome.i18n.getMessage("menu_clear"),
		"id" : chrome.i18n.getMessage("transactions_id"),
		"starttime" : chrome.i18n.getMessage("transactions_starttime"),
		"starttime_info" : chrome.i18n.getMessage("transactions_starttime_info"),
		"duration" : chrome.i18n.getMessage("transactions_duration"),
		"duration_info" : chrome.i18n.getMessage("transactions_duration_info"),
		"context" : chrome.i18n.getMessage("transactions_context"),
		"actions" : chrome.i18n.getMessage("transactions_actions"),
		"record": chrome.i18n.getMessage("menu_record")
	};

	var markup = `
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
		</div>
	`;

	this.init = function(tabBody) {
		var labels = {
			"id": chrome.i18n.getMessage("transactions_id"),
			"starttime": chrome.i18n.getMessage("transactions_starttime"),
			"starttime_info": chrome.i18n.getMessage("transactions_starttime_info"),
			"duration": chrome.i18n.getMessage("transactions_duration"),
			"duration_info": chrome.i18n.getMessage("transactions_duration_info"),
			"context": chrome.i18n.getMessage("transactions_context"),
			"actions": chrome.i18n.getMessage("transactions_actions"),
			"timeline": chrome.i18n.getMessage("transactions_timeline")
		};
		
		tabBody.innerHTML = markup;
		tabBody.classList.add("trans-panel");


		transactionGrid = new AuraInspectorTransactionGrid(devtoolsPanel);
		transactionGrid.init(tabBody, labels);
		
		this.requestLoadTime();
	};

	this.setLoadTime = function(time){
		transactionGrid.setLoadTime(time);
	};

	this.requestLoadTime = function(){
		devtoolsPanel.publish("AuraInspector:GetLoadTimeStamp", {});
	};

	this.render = function() {
		clearButton = document.querySelector('#tab-body-transaction .clear-status-bar-item');
		clearButton.addEventListener('click', ClearTable_OnClick.bind(this), false);

		refreshButton = document.querySelector('#tab-body-transaction .refresh-transactions-bar-item');
		refreshButton.addEventListener('click', RefreshTransactions_OnClick.bind(this), false);

		recordButton = document.querySelector('#tab-body-transaction #record-button');
		recordButton.addEventListener('click', RecordButton_OnClick.bind(this), false);

		devtoolsPanel.hideSidebar();


		var recordTimeStamp = Date.now();
		recording = true;
		subscribeToMarks(function(data){
			transactionGrid.liveUpdateTable(data, recordTimeStamp);
		});
	};

	this.getActions = function (callback) {
		var command = "$A.metricsService.getCurrentMarks()";

		chrome.devtools.inspectedWindow.eval(command, function (data) {
			callback(data);
		});
	};

	function ClearTable_OnClick(event) {
		if(recording) {
			recording = false;
			recordButton.classList.remove("on");
			recordButton.children[0].classList.remove("on");

			setTimeout(function () {
				transactionGrid.clear();
			}, 500);

		} else {
			transactionGrid.clear();
		}
	}

	function RefreshTransactions_OnClick(event) {
		if (recording) {
			recording = false;
			recordButton.classList.remove("on");
			recordButton.children[0].classList.remove("on");

			setTimeout(function () {
				transactionGrid.clear();
				this.getActions(function (data) {
					transactionGrid.updateTable(data);
					console.log(data);
				});
			}.bind(this), 500);

		} else {
			transactionGrid.clear();
			this.getActions(function (data) {
				transactionGrid.updateTable(data);
				console.log(data);
			});
		}
	}

	// Automatic updates of transaction marks
	function RecordButton_OnClick(event){
		var recordTimeStamp = Date.now();

		// Only works if user presses on the actual circle
		if(event.target.classList.contains("circle")){
			if(event.target.classList.contains("on")){

				recording = true;
				subscribeToMarks(function(data){
					transactionGrid.liveUpdateTable(data, recordTimeStamp);
				});

			} else {
				recording = false;
			}
		}
	}

	
	function subscribeToMarks(callback_function){
		transactionGrid.clear();
		var command = "$A.metricsService.getCurrentMarks()";

		var refreshingTimer = setInterval(

			function() {
				chrome.devtools.inspectedWindow.eval(command, function (data) {
					callback_function(data);
				});

				if(recording == false){
					clearInterval(refreshingTimer);
				}

			}.bind(this), 500);
	}
}
