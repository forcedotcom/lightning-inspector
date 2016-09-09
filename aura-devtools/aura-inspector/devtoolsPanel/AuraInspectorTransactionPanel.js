/* TransactionPanel.js wraps TransactionView.js and TransactionGrid.js
    TransactionPanel =>Aall interaction with Chrome Extension API and devtoolsPanel.js
    TransactionView => Tells transPanel what data it needs and recieves data from transPanel + manipulates TransactionGrid.js
    TransactionGrid => Draws
 */

function AuraInspectorTransactionPanel(devtoolsPanel) {
    var transactionView;
    var _eventManager;

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
            "record_tooltip": chrome.i18n.getMessage("actions_menu_record_tooltip")
        };

        _eventManager = createEventManager();

        transactionView = new AuraInspectorTransactionView();
        transactionView.init(tabBody, labels);

        transactionView.attach("initView", this.requestLoadTime.bind(this));
        transactionView.attach("hideMisc", this.hideMisc.bind(this));
        transactionView.attach("inspect", this.printToConsole.bind(this));
        transactionView.attach("onSubscribeToTransactionEnd", this.subscribeToOnTransactionEnd.bind(this));
        transactionView.attach("getCurrentMarks", this.getCurrentMarks.bind(this));

        transactionView.notify("initEventHandlers");
    };
    
    this.render = function(){
        transactionView.render();
    };

    this.printToConsole = function (obj) {
        var objString = JSON.stringify(obj);

        var command = "console.log(" + objString + ")";
        chrome.devtools.inspectedWindow.eval(command);
    };

    this.getCurrentMarks = function (callback) {
        var command = "$A.metricsService.getCurrentMarks()";

        chrome.devtools.inspectedWindow.eval(command, function (data) {
            callback(data);
        });
    };

    this.setLoadTime = function(time){
        transactionView.setLoadTime(time);
    };

    this.requestLoadTime = function () {
        devtoolsPanel.publish("AuraInspector:GetLoadTimeStamp", {});
    };

    this.hideMisc = function(){
        devtoolsPanel.hideSidebar();
    };
    
    this.subscribeToOnTransactionEnd = function(callback){
        devtoolsPanel.subscribe("Transactions:OnTransactionEnd", callback);
    };

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