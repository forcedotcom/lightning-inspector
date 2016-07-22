function AuraInspectorTransactionGrid(devtoolsPanel) {
    var tableBody;
    var tab;  // HTML for the area we are working with (parents of tableBody)
    var labels;
    var graphData = {}; // Current data we are working with

    this.init = function (tabBody, initLabels) {
        var markup;
        var tableMarkup;
        labels = initLabels;

        markup = `
                <table>
                    <thead>
                        <th>${labels.context}</th>
                        <th>${labels.id}</th>
                        <th>${labels.duration}</th>
                        <th>${labels.starttime}</th>
                        <th>Timeline</th>
                     </thead>
                    
                    <tbody id="table-body"></tbody> 
                </table>
         `;

        tableMarkup = document.createElement('div');
        tableMarkup.classList.add("transactions");
        tableMarkup.id = "trs";
        tableMarkup.innerHTML = markup;

        tabBody.appendChild(tableMarkup);
        tableBody = tabBody.querySelector("#table-body");
        tab = tabBody;
    };

    this.clear = function(){
        tableBody.innerHTML = '';
        graphData = {};
    };

    this.updateTable = function (data) {
        this.getUniqueIDs(data);
        this.updateTimes(data);
        var sortedIndexes = this.sortGraphData();

        for(var x = 0; x < sortedIndexes.length; x++) {
            this.addActionToTable(sortedIndexes[x]);
        }
    };

    // Sorts the graphData by its "start" timestamp attribute
    this.sortGraphData = function(){
        array = [];

        for(var dataPoint in graphData){
            array.push(graphData[dataPoint]);
        }

        array.sort(function(dataPointA, dataPointB){
            if(dataPointA.stamp > dataPointB.stamp){
                return 1;
            } else {
                return -1;
            }
        });

        return array;
    };

    // Returns an array of the unique IDs given data;
    this.getUniqueIDs = function (data) {
        var currAction;
        var examinedID;

        for (var x = 0; x < data.actions.length; x++){
            currAction = data.actions[x];
            examinedID = currAction.context.id;

            if (graphData[examinedID]){
                if(!graphData[examinedID].context && currAction.context.def)
                    graphData[examinedID].context = currAction.context.def;
                else
                    continue;

            } else {
                this.insertNewActionData(currAction);
            }
        }
    };

    this.insertNewActionData = function(actionData){
        var insert = {};

        insert.id = actionData.context.id;
        if(actionData.context.def){
            insert.context = actionData.context.def;
        }
        graphData[insert.id] = insert;
    };

    // updates the stamp, start, and end times of the graphData
    this.updateTimes = function(data){

        for (var x = 0; x < data.actions.length; x++) {
            var currAction = data.actions[x];

            if(graphData[currAction.context.id]) {
                graphData[currAction.context.id][currAction.phase] = currAction.ts;
            }
        }
    };

    this.addActionToTable = function(rowData){
        var markup;
        var duration;
        var stamp;
        var row = document.createElement('tr');

        if(rowData.stamp == null) {
            duration = "N/a";
            stamp = "N/a";
        } else {
            stamp = rowData.stamp.toLocaleString() + " ms";
            if(rowData.end) {
                duration = Math.round(rowData.end - rowData.start).toLocaleString();
                duration = duration + " ms";
            } else {
                duration = "N/a"
            }
        }

        markup = `<td>${rowData.context}</td>
                  <td>${rowData.id}</td>
                  <td>${duration}</td>
                  <td>${stamp}</td>`;

        row.innerHTML = markup;
        tableBody.appendChild(row);
    };

    this.render = function (e) {
        return 1;
    };

    this.addMasterRow = function(rowData){

    };
/*
    this.subscribeToMarks = function(){
        var _this2 = this;

        // assuming is 2.0.0 or higher at this point (mid-202, 204, ...)
        this.metricsServiceHandler = this._onTransactionEndCallback_2_0_0; // assign handler

        if (!$A.metricsService.getCurrentPageTransaction()) {
            // starting EPT tracker because no PageView (and therefore not free EPT)
            this.model.initEPTTracker();
        }

        if (start === true) {
            this._marksInterval = setInterval(function () {
                return _this2.addEntries(_this2.page.addMarks($A.metricsService.getCurrentMarks()));
            }, MARKS_POLLING_MS);

            $A.metricsService.onTransactionEnd(this.metricsServiceHandler);

        } else {
            $A.metricsService.detachOnTransactionEnd(this.metricsServiceHandler);

            if (this._marksInterval) {
                clearInterval(this._marksInterval);
            }
        }
    }*/

}