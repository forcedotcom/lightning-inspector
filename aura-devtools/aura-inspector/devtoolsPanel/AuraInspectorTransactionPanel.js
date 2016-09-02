/* TransactionPanel.js wraps TransactionView.js and TransactionGrid.js
    TransactionPanel =>Aall interaction with Chrome Extension API and devtoolsPanel.js
    TransactionView => Tells transPanel what data it needs and recieves data from transPanel + manipulates TransactionGrid.js
    TransactionGrid => Draws
 */

function AuraInspectorTransactionPanel(devtoolsPanel) {
    var transactionView;

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

        transactionView = new AuraInspectorTransactionView(this);
        transactionView.init(tabBody, labels);
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
}