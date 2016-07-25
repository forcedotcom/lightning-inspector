function AuraInspectorTransactionGrid() {
    var tableBody;
    var tab;  // HTML for the area we are working with (parents of tableBody)
    var labels;
    var graphData = {}; // Current data we are working with
    var startTime;
    var latestEndTime = 0;

    this.init = function (tabBody, initLabels) {
        var markup;
        var tableMarkup;
        labels = initLabels;

        markup = `
                <table>
                    <thead>
                        <th width="33%">${labels.context}</th>
                        <th width="5%">${labels.id}</th>
                        <th width="8%">${labels.duration}</th>
                        <th width="9%">${labels.starttime}</th>
                        Don't forget to make label for timeline
                        <th width="45%">Timeline</th>
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

    this.setLoadTime = function(time){
        startTime = time;
    };

    this.clear = function(){
        tableBody.innerHTML = '';
        graphData = {};
        latestEndTime = 0;
    };

    this.updateTable = function (data){
        //console.log(startTime);
        this.clear();
        this.getUniqueIDs(data);
        this.updateTimes(data);

        var sortedData = this.sortGraphData();
        this.setLatestEndTime(sortedData);

        for(var x = 0; x < sortedData.length; x++) {
            this.addActionToTable(sortedData[x]);
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

    this.setLatestEndTime = function(sortedGraphData){
      for(var x = 0; x < sortedGraphData.length; x++){
          if(sortedGraphData[x].end && sortedGraphData[x].end > latestEndTime){
              latestEndTime = sortedGraphData[x].end;
              console.log(latestEndTime);
          }
      }
    };

    this.addActionToTable = function(rowData){
        var markup;
        var duration;
        var stamp;
        var timelineMarkup;
        var row = document.createElement('tr');

        if(rowData.stamp == null) {
            duration = "N/a";
            stamp = "N/a";
        } else {
            stamp = rowData.stamp.toLocaleString() + " ms";
            if(rowData.end) {
                duration = Math.round(rowData.end - rowData.stamp).toLocaleString();
                duration = duration + " ms";
            } else {
                duration = "N/a"
            }
        }

        timelineMarkup = this.createIndividualTimeline(rowData.stamp, rowData.start, rowData.end);
        console.log(rowData);

        markup = `<td>${rowData.context}</td>
                  <td>${rowData.id}</td>
                  <td>${duration}</td>
                  <td>${stamp}</td>
                  <td>${timelineMarkup}</td>`;


        row.innerHTML = markup;
        tableBody.appendChild(row);
    };

    this.createIndividualTimeline = function(stamp, start, end){
        console.log(latestEndTime);
        var markup;
        var stampToStart = start - stamp;
        var startToEnd = end - start;
        var minPercent = .23;

        var stampLeft = (stamp/latestEndTime)*100;
        var stampRight = (1 - start/latestEndTime)*100-minPercent;

        var startLeft = 100-stampRight;
        var startRight = (1 - end/latestEndTime)*100-minPercent;
        console.log(stampLeft);
        console.log(stampRight);

        if(stamp && start && end) {
            markup = `
                <div class="trans-graph-side">
                    <div class="trans-graph-bar-area">
                        <div class="trans-graph-bar request-timing total" style="left: 0%; right: 0%;"></div>
                        
                        <div class="trans-graph-bar request-timing stamp-start" style="left: ${stampLeft}%; right: ${stampRight}%">
                            <span class="trans-graph-bar-info">
                                <table>
                                    <thead>
                                        <tr>
                                            <th class="trans-graph-bar-info-left-column">Timestamp:</th>
                                            <th class="trans-graph-bar-info-right-column">Duration</th>
                                        </tr>
                                     </thead>
                                    <tr>
                                        <td class="trans-graph-bar-info-left-column">STAMP:</td>
                                        <td class="trans-graph-bar-info-right-column">${stampToStart.toLocaleString()} ms</td>
                                    </tr>
                                    <tr>
                                        <td class="trans-graph-bar-info-left-column">START:</td>
                                        <td class="trans-graph-bar-info-right-column">${startToEnd.toLocaleString()} ms</td>
                                    </tr>
                                </table>
                            </span>
                        </div>
                        
                        <div class="trans-graph-bar request-timing start-end" style="left:${startLeft}%; right: ${startRight}%;"></div>
                    </div>
                </div>
                `;
        } else {
            markup = '';
        }

        return markup;
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