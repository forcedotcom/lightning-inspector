function AuraInspectorTransactionView(devtoolsPanel) {
	var outputList;
	var clearButton;
	var queuedData = [];
	var transactions = {};
	var transactionGrid;


	var labels = {
		"clear" : chrome.i18n.getMessage("menu_clear"),
		"id" : chrome.i18n.getMessage("transactions_id"),
		"starttime" : chrome.i18n.getMessage("transactions_starttime"),
		"starttime_info" : chrome.i18n.getMessage("transactions_starttime_info"),
		"duration" : chrome.i18n.getMessage("transactions_duration"),
		"duration_info" : chrome.i18n.getMessage("transactions_duration_info"),
		"context" : chrome.i18n.getMessage("transactions_context"),
		"actions" : chrome.i18n.getMessage("transactions_actions"),
		"XHRs" : chrome.i18n.getMessage("transactions_xhrs")
	};

	var markup = `
		<div class="aura-panel panel-status-bar">
			<button class="clear-status-bar-item status-bar-item" title="${labels.clear}">
				<div class="glyph"></div><div class="glyph shadow"></div>
			</button>			
			<button class="refresh-transactions-bar-item status-bar-item" title="${labels.clear}">
				<div class="glyph"></div><div class="glyph shadow"></div>
			</button>
		</div>
	`;

/*
	function OutputListTable_OnClick(event) {
		var id = event.target.dataset.id;
		if(id!==undefined) {
			var command = "console.log(" + JSON.stringify(transactions[id]) + ")";
	        chrome.devtools.inspectedWindow.eval(command, function (payload, exception) {
	            if (exception) {
	            	console.log('ERROR, CMD:', command, exception);
	            }
	        });
	    }
	}
*/
	function ClearTable_OnClick(event) {
		transactionGrid.clear();
	}

	// Aaron
	function RefreshTransactions_OnClick(event){
		transactionGrid.clear();
		this.getActions(function(data){
			transactionGrid.updateTable(data);
		});
		this.subscribeToMarks();
	}

/*
	this.addTableRow = function (t) {
		var container = outputList;
		var tbody = container.querySelector('tbody');
		var tr = document.createElement('tr');
		var tid = t.id + ':' + Math.floor(t.ts);

		transactions[tid] = t;

		tr.innerHTML = [
			'<td class="id"><a href="javascript:void(0)" data-id="'+ tid +'">' + t.id + '</a></td>',
			'<td class="ts">' + this.contextualizeTime(t) +'</td>',
			'<td class="dur">' + Math.floor(t.duration * 1000) / 1000 +'</td>',
			'<td class="ctx"><aurainspector-json>' + JSON.stringify(t.context, null, '\t') + '</aurainspector-json></td>',
			'<td class="actions">' + this.summarizeActions(t) + '</td>',
			'<td class="xhr">' + this.summarizeXHR(t) + '</td>',
		].join('');

		tbody.appendChild(tr);
	};
*/
	this.init = function(tabBody) {
		var labels = {
			"id": chrome.i18n.getMessage("transactions_id"),
			"starttime": chrome.i18n.getMessage("transactions_starttime"),
			"starttime_info": chrome.i18n.getMessage("transactions_starttime_info"),
			"duration": chrome.i18n.getMessage("transactions_duration"),
			"duration_info": chrome.i18n.getMessage("transactions_duration_info"),
			"context": chrome.i18n.getMessage("transactions_context"),
			"actions": chrome.i18n.getMessage("transactions_actions")
		};
		
		tabBody.innerHTML = markup;
		tabBody.classList.add("trans-panel");

		devtoolsPanel.subscribe("Transactions:OnTransactionEnd", function(transactions){
			console.log("transaction!");
			console.log(transactions);
		}.bind(this));

		// Aaron
		transactionGrid = new AuraInspectorTransactionGrid(devtoolsPanel);
		transactionGrid.init(tabBody, labels);
	};
/*
	this.summarizeActions = function (t) {
		var serverActions = t.marks && Array.isArray(t.marks.serverActions) ? t.marks.serverActions : [];
		// Should be this, but it has issues too such as m.context.ids being null.
		//var serverActions = t.marks.serverActions || t.marks.queuedActions || t.marks.actions || [];
		return (serverActions.filter(function (m) {
			return m.phase === 'stamp';
		})).reduce(function (r, m) {
			return m.context.ids.length + r;
		}, 0);
	};
	this.summarizeXHR = function (t) {
		var transportMarks = t.marks.transport || [];
		var counter = 0;
        var queue = {};
        for (var i = 0; i < transportMarks.length; i++) {
            var id = transportMarks[i].context["auraXHRId"];
            var phase = transportMarks[i].phase;
            if (phase === 'processed') {
                ++counter;
            } else if (phase === 'start') {
                queue[id] = transportMarks[i];
            } else if (phase === 'end' && queue[id]){
                ++counter;
                delete queue[id];
            }
        }
        return counter;
	};

	this.contextualizeTime = function (t) {
		return Math.floor(t.ts / 10) / 100;
	};
*/
	this.render = function() {
		// Already rendered
		if (outputList) {
			return;
		}

		clearButton = document.querySelector('#tab-body-transaction .clear-status-bar-item');
		refreshButton = document.querySelector('#tab-body-transaction .refresh-transactions-bar-item');

        clearButton.addEventListener('click', ClearTable_OnClick.bind(this), false);
		// Aaron
		refreshButton.addEventListener('click', RefreshTransactions_OnClick.bind(this), false);
		devtoolsPanel.hideSidebar();
	};

	this.addTransactions = function (rowData) {/*
		if (!outputList) {
			queuedData.push(rowData);
			return;
		}*/

		//this.addTableRow(rowData);
	};

	this.getActions = function (callback) {
		var command = "$A.metricsService.getCurrentMarks()";

		chrome.devtools.inspectedWindow.eval(command, function (data) {
			callback(data);
		});
	};

	this.subscribeToMarks = function(){
		//var command = `$A.metricsService.onTransactionEnd(function(e){console.log(e);})`;
		var string = '$A.metricService';

		chrome.devtools.inspectedWindow.eval(string, function(Aura) {
			//console.log(Aura);
		});
		//$A.metricsService.onTransactionEnd(this.metricsServiceHandler);
	};

	function MetricsServiceHandler(data){
		console.log(data);
	}
}
