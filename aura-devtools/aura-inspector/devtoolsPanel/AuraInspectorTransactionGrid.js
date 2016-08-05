function AuraInspectorTransactionGrid() {
    var tableBody;
    var tab;  // HTML for the area we are working with (parents of tableBody)
    var labels;
    var graphData = {}; // Current data we are working with
    var startTime;     // Timestamp of when Aura was created
    var latestEndTime = 0;

    /* -- API --
        * this.init:            Should be called when transaction grid is invoked.
        * 
        * this.setLoadTime:     Sets the start time to be used to calculate times for live recording
        * 
        * this.liveUpdateTable: Data that is constantly updated should be passed into this method
        *                       for live redrawing of the visualization and ignores previously
        *                       recorded data
        * 
        * this.updateTable:     Should be used for static data that isn't updating live
        *
        * this.clear:           resets everything by clearing the data structures and visualization
        *
     */
    
    /* @parameters: tabBody -   The html element of which we will visualize transactions
                    initLabel - Of type Object where we set our front facing labels as its attributes
                                (labels.starttime, labels.id, etc)
     */
    this.init = function (tabBody, initLabels) {
        var markup;
        var tableMarkup;
        var timeline;
        labels = initLabels;

        markup = `
                <table>
                    <thead>
                        <th width="33%">${labels.context}</th>
                        <th width="5%">${labels.id}</th>
                        <th width="8%">${labels.duration}</th>
                        <th width="9%">${labels.starttime}</th>
                        Don't forget to make label for timeline
                        <th width="45%">Timeline
<div class ="trans-graph-time-marker-container" id = "timeline-marker-container">
   <div class="trans-graph-time-marker-timeline"></div>
   
   <div class="trans-graph-time-marker1">
      <div class="trans-graph-time-number-mark"><span class="timeline-number-text" id="marker-number-1">0s</span></div>
      <div class="trans-graph-time-marker-line"></div>
   </div>
   
   <div class="trans-graph-time-marker2">
      <div class="trans-graph-time-number-mark"><span class="timeline-number-text" id="marker-number-2">0s</span></div>
      <div class="trans-graph-time-marker-line"></div>
   </div>
   
   <div class="trans-graph-time-marker3">
      <div class="trans-graph-time-number-mark"><span class="timeline-number-text" id="marker-number-3">0s</span></div>
      <div class="trans-graph-time-marker-line"></div>
   </div>
   
   <div class="trans-graph-time-marker4">
      <div class="trans-graph-time-number-mark"><span class="timeline-number-text" id="marker-number-4">0s</span></div>
      <div class="trans-graph-time-marker-line"></div>
   </div>
</div>
                        <br><br></th>
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

    // Sets timestamp of when Aura was loaded
    this.setLoadTime = function(time){
        startTime = time;
    };

    // Only update the table with new (LIVE) data not already displayed (used in recording)
    this.liveUpdateTable = function(data, recordTimeStamp){
        var marks = {};
        this.clear();

        getUniqueIDs(data, marks);
        updateTimes(data, marks);
        marks = sortGraphData(marks);
        setLatestEndTime(marks);

        latestEndTime = Date.now() - recordTimeStamp;
        updateTimeMarkers(Date.now() - recordTimeStamp);

        transposeTimesForLiveView(marks, recordTimeStamp);

        for(var x = 0; x < marks.length; x++){
            if(isLiveData(marks[x].stamp) && !graphData[marks[x]]) {
                graphData[marks[x]] = graphData[marks[x]];
                addActionToTable(marks[x]);
            }
        }
        
    };

    // Update table with all data regardless if its old or new
    this.updateTable = function (data){

        this.clear();
        getUniqueIDs(data, graphData);
        updateTimes(data, graphData);

        var sortedData = sortGraphData(graphData);
        setLatestEndTime(sortedData);

        updateTimeMarkers(latestEndTime);

        for(var x = 0; x < sortedData.length; x++) {
            addActionToTable(sortedData[x]);
        }
    };

    this.clear = function(){
        tableBody.innerHTML = '';
        graphData = {};
        latestEndTime = 0;

        var timeline = document.getElementById("timeline-marker-container");
        timeline.style.visibility = "hidden";
    };

    /* ---------------- START OF DATA PROCESSING METHODS ------------------------------ */

    // Returns an array of the unique IDs given data;
    function getUniqueIDs(data, map){
        var currAction;
        var examinedID;

        for (var x = 0; x < data.actions.length; x++){
            currAction = data.actions[x];
            examinedID = currAction.context.id;

            if (map[examinedID]){
                if(!map[examinedID].context && currAction.context.def)
                    map[examinedID].context = currAction.context.def;
                else
                    continue;

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

    // Sorts the graphData by its "start" timestamp attribute
    function sortGraphData(map){
        var array = [];

        for(var dataPoint in map){
            array.push(map[dataPoint]);
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

    // Sets timestamp of the latest time to be used proportionally with drawn timelines
    function setLatestEndTime(sortedGraphData){

        for(var x = 0; x < sortedGraphData.length; x++){
            if(sortedGraphData[x].end && sortedGraphData[x].stamp && sortedGraphData[x].start
                && sortedGraphData[x].end > latestEndTime){

                latestEndTime = sortedGraphData[x].end;
            }
        }
    }

    // Checks if this time is a point that is within the "live data" range
    function isLiveData(timestamp){
        return timestamp > 0;
    }

    // Finds and sets the latest end time of all transactions for graphing
    function transposeTimesForLiveView(dataArray, recordStartTime){
        var transposeTime = recordStartTime - startTime;


        for(var x = 0; x < dataArray.length; x++){
            currMark = dataArray[x];
            if(currMark.stamp)
                currMark.stamp = currMark.stamp - transposeTime;

            if(currMark.start)
                currMark.start = currMark.start - transposeTime;

            if(currMark.end)
                currMark.end = currMark.end - transposeTime;

        }
    }

    /* ---------------- START OF VISUALIZATION METHODS ------------------------------ */

    // Graphically adds to the table
    function addActionToTable(rowData){
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

        timelineMarkup = createIndividualTimeline(rowData.stamp, rowData.start, rowData.end);

        markup = `<td>${rowData.context}</td>
                  <td>${rowData.id}</td>
                  <td>${duration}</td>
                  <td>${stamp}</td>
                  <td>${timelineMarkup}</td>`;


        row.innerHTML = markup;
        tableBody.appendChild(row);
    }

    // Create a small timeline for each "complete" transaction
    function createIndividualTimeline(stamp, start, end){
        var markup;
        var stampToStart = start - stamp;
        var startToEnd = end - start;
        var minPercent = .23; // So you can actualy see a the small part on the timeline even when really short duration

        var stampLeft = (stamp/latestEndTime)*100;
        var stampRight = (1 - start/latestEndTime)*100-minPercent;

        var startLeft = 100-stampRight;
        var startRight = (1 - end/latestEndTime)*100-minPercent;


        if(stamp && start && end) {
            markup = `
                <div class="trans-graph-side">
                    <div class="trans-graph-bar-area">
                        <div class="trans-graph-bar request-timing total" style="left: 0%; right: 0%;"></div>
                        
                        <div class="trans-graph-bar request-timing stamp-start" style="left: ${stampLeft}%; right: ${stampRight}%">
                            <div class="trans-graph-bar-info">
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
                            </div>
                        </div>
                        
                        <div class="trans-graph-bar request-timing start-end" style="left:${startLeft}%; right: ${startRight}%;"></div>
                    </div>
                </div>
                `;
        } else {
            markup = '';
        }

        return markup;
    }

    // Updates the number markers on the timeline ruler
    function updateTimeMarkers(endTime){
        var marker2 = document.getElementById("marker-number-2");
        var marker3 = document.getElementById("marker-number-3");
        var marker4 = document.getElementById("marker-number-4");
        var interval = (endTime/10000)/4;

        marker2.innerHTML = Math.round(interval*100)/10 + "s";
        marker3.innerHTML = Math.round(interval*100*2)/10 + "s";
        marker4.innerHTML = Math.round(interval*100*3)/10 + "s";

        var timeline = document.getElementById("timeline-marker-container");
        timeline.style.visibility = "visible";
    }
}