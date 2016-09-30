/* TransactionPanel.js wraps TransactionView.js and TransactionGrid.js
    TransactionPanel =>Aall interaction with Chrome Extension API and devtoolsPanel.js
    TransactionView => Tells transPanel what data it needs and recieves data from transPanel + manipulates TransactionGrid.js
    TransactionGrid => Draws
 */

function AuraInspectorTransactionPanel(devtoolsPanel) {
    var transactionView;
    var _eventManager;
    var _isRendered = false;
    var _tabBody;
    var _markup;
    var _recording = false;

    this.init = function(tabBody) {
        var labels = {
            "id": chrome.i18n.getMessage("transactions_id"),
            "starttime": chrome.i18n.getMessage("transactions_starttime"),
            "starttime_info": chrome.i18n.getMessage("transactions_starttime_info"),
            "duration": chrome.i18n.getMessage("transactions_duration"),
            "duration_info": chrome.i18n.getMessage("transactions_duration_info"),
            "context": chrome.i18n.getMessage("transactions_context"),
            "actions": chrome.i18n.getMessage("transactions_actions"),
            "timeline": chrome.i18n.getMessage("transactions_timeline"),
            "not_available": chrome.i18n.getMessage("not_available"),
            "ms": chrome.i18n.getMessage("ms"),
            "toggle_recording": chrome.i18n.getMessage("actions_menu_record_tooltip"),
            "clear": "[Clear]",
            "refresh": "[Refresh]"
        };

        _markup = `
            <div class="">
            <menu type="toolbar no-flex">
                <li class="record-button"><aurainspector-onOffButton class="circle on" data-filter="all" title="${labels.toggle_recording}"><span>${labels.toggle_recording}</span></aurainspector-onOffButton></li>
                <li><button class="refresh-transactions-bar-item status-bar-item" title="${labels.refresh}"><div class="glyph"></div><div class="glyph shadow"></div></button></li>
                <li><button id="clear-button" class="clear-status-bar-item status-bar-item" title="${labels.clear}"><div class="glyph"></div><div class="glyph shadow"></div></button></li>
                <li class="divider" style="margin-left: -3px;"></li>
               <li><button id="marks-button" class="transaction-tabs-button selected" title="[Marks]">[Marks]</button></li>
               <li><button id="custom-transactions-button" class="transaction-tabs-button" title="[Custom Transactions]">[Custom Transactions]</button></li>
            </menu>

            <div id="transaction-view"></div>
        </div>
        `;

        _eventManager = createEventManager();

        transactionView = new AuraInspectorTransactionView();
        transactionView.init(labels);
        
        // Bootstrap metrics include things like page start time
        chrome.devtools.inspectedWindow.eval("$A.metricsService.getBootstrapMetrics()", (metrics) => {
            transactionView.setBootstrapMetrics(metrics);
        });


        // TODO: Event Handlers, name appropriately.
        //transactionView.attach("inspect", this.printToConsole.bind(this));
        //transactionView.attach("onSubscribeToTransactionEnd", this.subscribeToOnTransactionEnd.bind(this));
        //transactionView.attach("getCurrentMarks", this.getCurrentMarks.bind(this));

        // Starts listening for custom transactions
        //transactionView.notify("initEventHandlers");

        // Enable Transaction Plugins (would not be auto enabled in prod mode)
        devtoolsPanel.subscribe("AuraInspector:OnPanelConnect", AuraInspector_OnPanelConnect);

        // When we OnPanelConnect, enable the plugins again. 
        // This is if we reload the page while the devtools are open.
        devtoolsPanel.subscribe("AuraInspector:OnBootstrapEnd", AuraInspector_OnBootstrapEnd);

        devtoolsPanel.subscribe("AuraInspector:OnActionStateChange", AuraInspector_OnActionStateChange.bind(this));

        
        _tabBody = tabBody;
    };
    
    this.render = function(){

        devtoolsPanel.hideSidebar();

        // Don't redraw everything each time we come to the panel.
        if(_isRendered) {
            return;
        }
        _recording = true;
        _isRendered = true;

        _tabBody.innerHTML = _markup;
        _tabBody.classList.add("trans-panel");

        var clearButton = _tabBody.querySelector('.clear-status-bar-item');
        clearButton.addEventListener('click', ClearTable_OnClick.bind(this), false);

        var refreshButton = _tabBody.querySelector('.refresh-transactions-bar-item');
        refreshButton.addEventListener('click', RefreshTransactions_OnClick.bind(this), false);


        var recordButton = _tabBody.querySelector('.record-button');
        recordButton.addEventListener('click', RecordButton_OnClick.bind(this), false);

        var marksButton = _tabBody.querySelector('#marks-button');
        //marksButton.addEventListener('click', MarksButton_OnClick.bind(this), false);
        marksButton.style.display="none"; // Disable for the moment till we get stuff working right.

        var customTransButton = _tabBody.querySelector('#custom-transactions-button');
        //customTransButton.addEventListener('click', CustomTransactionsButton_OnClick.bind(this), false);
        customTransButton.style.display="none";

        transactionView.render(_tabBody.querySelector("#transaction-view"));

        chrome.devtools.inspectedWindow.eval("$A.metricsService.getCurrentMarks()", function(data) {
            transactionView.setMarksData(data);
        });
    };

    /* ------------------- Event related functions ---------------------*/

    function AuraInspector_OnActionStateChange(event) {
        if(!_recording) {
            return;
        }

        chrome.devtools.inspectedWindow.eval("$A.metricsService.getCurrentMarks()", function(data) {
            transactionView.setMarksData(data);
        });
    }

    function AuraInspector_OnBootstrapEnd() {
        chrome.devtools.inspectedWindow.eval("$A.metricsService.enablePlugins();");

        // Bootstrap metrics include things like page start time
        chrome.devtools.inspectedWindow.eval("$A.metricsService.getBootstrapMetrics()", (metrics) => {
            transactionView.setBootstrapMetrics(metrics);
        });
    }

    function AuraInspector_OnPanelConnect() {
        chrome.devtools.inspectedWindow.eval("$A.metricsService.enablePlugins();");
    }

    function ClearTable_OnClick(event) {

        // Reset everything
        chrome.devtools.inspectedWindow.eval("$A.metricsService.clearMarks();", function(){
            transactionView.clear();
        });
    }

    // Purpose?
    function RefreshTransactions_OnClick(event) {

        // Will cause a redraw
        chrome.devtools.inspectedWindow.eval("$A.metricsService.getCurrentMarks()", function(data) {
            transactionView.setMarksData(data);
        });
    }

    // Automatic updates of transaction marks
    function RecordButton_OnClick(event){
        //var recordTimeStamp = Date.now();

        // Only works if user presses on the actual circle
        if(event.target.classList.contains("circle")){
            _recording = event.target.classList.contains("on");
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
}