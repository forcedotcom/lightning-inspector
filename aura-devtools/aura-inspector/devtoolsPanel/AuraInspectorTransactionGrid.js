function AuraInspectorTransactionGrid(controller) {
    var tableBody;
    var tab;  // HTML for the area we are working with (parents of tableBody)
    var labels;
    var graphData = []; // Current data we are working with
    var startTime;     // Timestamp of when Aura was created
    var latestEndTime = 0;
    var dataType; //either "marks" or "customTrans"
    var self = this;

    var MARKS = "marks";
    var CUSTOM_TRANS = "customTrans";

    var eventManager;
    
    /* @parameters: tabBody -   The html element of which we will visualize transactions
                    initLabel - Of type Object where we set our front facing labels as its attributes
                                (labels.starttime, labels.id, etc)
     */
    this.init = function (tabBody, initLabels) {
        tab = tabBody;
        dataType = "marks";
        labels = initLabels;
        this.createTableHeader("marks");

        eventManager = new createEventManager();
    };

    // Sets timestamp of when Aura was loaded
    this.setLoadTime = function(time){
        startTime = time;
    };

    this.clear = function(){
        if(tableBody) {
            tableBody.innerHTML = '';
            graphData = [];
            //latestEndTime = 0;

            var timeline = document.getElementById("timeline-marker-container");
            timeline.classList.add("invisible");
        }
    };
    
    this.createTableHeader = function(typeOfData){
        var markup;
        var tableMarkup;
        var timeline;

        var entireTable = document.querySelector("#trs");
        if(entireTable){
            entireTable.parentNode.removeChild(entireTable);
        }

        if(typeOfData === MARKS){
            markup = `
                <table height="100%">
                    <thead>
                        <th width="33%">${labels.context}</th>
                        <th width="5%">${labels.id}</th>
                        <th width="8%">${labels.duration}</th>
                        <th width="9%">${labels.starttime}</th>
                        <th width="45%">${labels.timeline}
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
        } else if (typeOfData === CUSTOM_TRANS) { // is custom transactions
            markup = `
                <table height="100%">
                    <thead id="table-head">
                        <th width="18%">${labels.context}</th>
                        <th width="20%"><span class="th-text">${labels.id}</span></th>
                        <th width="8%">${labels.duration}</th>
                        <th width="9%">${labels.starttime}</th>
                        <th width="45%">${labels.timeline}
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
        }

        var sortIDButton = document.createElement("button");
        var sortStartButton = document.createElement("button");

        sortIDButton.classList.add("up-arrow-table-head-item");
        sortIDButton.classList.add("status-bar-item");
        //sortIDButton.title = labels.clear;
        sortIDButton.innerHTML = `<div class="glyph"></div><div class="glyph shadow"></div>`;

        sortStartButton.classList.add("down-arrow-table-head-item");
        sortStartButton.classList.add("status-bar-item");
        //sortStartButton.title = labels.clear;
        sortStartButton.innerHTML = `<div class="glyph"></div><div class="glyph shadow"></div>`;

        tableMarkup = document.createElement('div');
        tableMarkup.classList.add("transactions");
        tableMarkup.id = "trs";
        tableMarkup.innerHTML = markup;

        //tableHead = document.querySelector("#table-head");
        //tableHead.children[1].appendChild(sortIDButton);
        //tableHead.children[3].appendChild(sortStartTimeButton);

        tab.appendChild(tableMarkup);
        tableBody = tab.querySelector("#table-body");
    };

    // Updates the number markers on the timeline ruler
    this.updateTimeMarkers = function(endTime){
        latestEndTime = endTime;

        var marker2 = document.getElementById("marker-number-2");
        var marker3 = document.getElementById("marker-number-3");
        var marker4 = document.getElementById("marker-number-4");
        var interval = (endTime/10000)/4;

        marker2.innerHTML = Math.round(interval*100)/10 + "s";
        marker3.innerHTML = Math.round(interval*100*2)/10 + "s";
        marker4.innerHTML = Math.round(interval*100*3)/10 + "s";

        var timeline = document.getElementById("timeline-marker-container");
        timeline.classList.remove("invisible");
    };

    // Graphically adds to the table
    this.addRow = function(rowData){
        var markup;
        var duration;
        var stamp;
        var timelineMarkup;
        var row = document.createElement('tr');

        if(rowData.stamp == null) {
            duration = labels.not_available;
            stamp = labels.not_available;
        } else {
            stamp = rowData.stamp.toLocaleString() + " " + labels.ms;
            if(rowData.end) {
                duration = Math.round(rowData.end - rowData.stamp).toLocaleString();
                duration = duration + " " + labels.ms;
            } else {
                duration = labels.not_available;
            }
        }

        timelineMarkup = createIndividualTimeline(rowData.stamp, rowData.start, rowData.end);

        markup = `<td width="33%">${rowData.context}</td>
                  <td width="5%">${rowData.id}</td>
                  <td width="8%">${duration}</td>
                  <td width="9%">${stamp}</td>
                  <td width="45%">${timelineMarkup}</td>`;


        row.innerHTML = markup;
        tableBody.appendChild(row);
    };

    // Graphically adds to the table
    this.addMasterRow = function(rowData){
        var markup;
        var duration;
        var startTime;
        var timelineMarkup;
        var contextPrint;
        var row = document.createElement('tr');

        // TODO: create label
        startTime = (rowData.ts / 1000).toLocaleString() + " s";

        if(rowData.duration) {
            duration = (rowData.duration).toLocaleString() + " " + labels.ms;
        } else {
            duration = labels.not_available;
        }

        timelineMarkup = createIndividualTimeline(rowData.stamp, rowData.start, rowData.end);

        contextPrint = document.createElement("a");
        contextPrint.setAttribute("href", "#");
        contextPrint.addEventListener("click", function(){eventManager.notify("printToConsole", rowData.context);});
        contextPrint.innerHTML = 'Print to Console';

        markup = `<td width="13%"></td>
                  <td width="25%">${rowData.id}</td>
                  <td width="8%">${duration}</td>
                  <td width="9%">${startTime}</td>
                  <td width="45%">${timelineMarkup}</td>`;


        row.innerHTML = markup;
        if(rowData.context) {
            row.firstChild.appendChild(contextPrint);
        }
        tableBody.appendChild(row);
        graphData.push(row);
    };

    this.addDetailRow = function(rowData, index){
        var markup;
        var duration;
        var startTime;
        var timelineMarkup;
        var contextPrint;
        var row = document.createElement('tr');

        // TODO: create label
        startTime = (rowData.ts / 1000).toLocaleString() + " s";

        if(rowData.duration) {
            duration = (rowData.duration).toLocaleString() + " " + labels.ms;
        } else {
            duration = labels.not_available;
        }

        timelineMarkup = createIndividualTimeline(rowData.stamp, rowData.start, rowData.end);

        contextPrint = document.createElement("a");
        contextPrint.setAttribute("href", "#");
        contextPrint.addEventListener("click", function(){eventManager.notify("printToConsole", rowData.context);});
        contextPrint.innerHTML = 'Print to Console';

        var name = "   Mark: " + rowData.name;
        markup = `<td width="13%"></td>
                  <td width="25%">${name}</td>
                  <td width="8%">${duration}</td>
                  <td width="9%">${startTime}</td>
                  <td width="45%">${timelineMarkup}</td>`;


        row.innerHTML = markup;
        if(rowData.context) {
            row.firstChild.appendChild(contextPrint);
        }
        // Uncomment once you add in the click to show
        // row.classList.add("no-display");
        row.classList.add("custom-trans-mark");
        row.classList.add("red");

        if(graphData[index].nextSibling) {
            //console.log(graphData[index]);
            graphData[index].parentNode.insertBefore(row, graphData[index].nextSibling);
        } else {
            graphData[index].parentNode.appendChild(row);
        }
    };

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
                                <table class="trans-graph-bar-info-table">
                                    <thead>
                                        <tr class="info-row">
                                            <th class="trans-graph-bar-info-left-column">Timestamp:</th>
                                            <th class="trans-graph-bar-info-right-column">Duration</th>
                                        </tr>
                                     </thead>
                                    <tr class="info-row">
                                        <td >STAMP:</td>
                                        <td>${stampToStart.toLocaleString()} ms</td>
                                    </tr>
                                    <tr class="info-row">
                                        <td>START:</td>
                                        <td>${startToEnd.toLocaleString()} ms</td>
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


    /* ----------------------- Event Manager Methods ------------------------*/
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