function AuraInspectorTransactionGrid(controller) {
    var tableBody;
    var _container;  // HTML for the area we are working with (parents of tableBody)
    var labels;
    var graphData = []; // Current data we are working with
    var startTime;     // Timestamp of when Aura was created
    var _gridStartOffset = 0;
    var _gridRangeEndTime = 0; // Last thing that has happened to show on the grid.
    //var latestEndTime = 0;
    var dataType; //either "marks" or "customTrans"
    var self = this;

    var MARKS = "marks";
    var CUSTOM_TRANS = "customTrans";

    var eventManager;
    var _columnsLength = 5;
    var _rendered = false;

    
    /* @parameters: tabBody -   The html element of which we will visualize transactions
                    initLabel - Of type Object where we set our front facing labels as its attributes
                                (labels.starttime, labels.id, etc)
     */
    this.init = function (initLabels) {
        dataType = "marks";
        labels = initLabels;

        eventManager = new createEventManager("onitemclick");
    };

    this.render = function(container) {
        if(_rendered) {
            return;
        }
        _container = container;

        var table = renderGridTable(_container);
        table.addEventListener("click", Table_OnClick.bind(this));

        tableBody = table.querySelector("tbody");

        _rendered = true;
    }

    // Sets timestamp of when Aura was loaded
    this.setStartTime = function(time){
        startTime = time;
    };

    this.setStartOffsetTime = function(offset) {
        _gridStartOffset = offset;
    }

    this.setEndTime = function(time) {
        _gridRangeEndTime = time;
    };

    this.clear = function(){        
        if(tableBody) {
            tableBody.innerHTML = '';
            graphData = [];
            //latestEndTime = 0;

            //var timeline = document.getElementById("timeline-marker-container");
            //timeline.classList.add("invisible");
        }
    };

    this.setColumns = function(columns) {
        // This is how we should be configuring the header.
    };

    this.addRows = function(rowsData) {
        for(var c=0;c<rowsData.length;c++) {
            this.addRow(rowsData[c]);
        }
    };

    this.addRow = function(rowData) {

        // Column Data
        var columns = rowData.columns;

        // Account for Colspan, used for first column only.
        var colspan = _columnsLength -  columns.length ;

        var tr = document.createElement("tr");
        var td;
        var a;
        for(var c=0;c<columns.length;c++) {
            if(c == 0) {
                a = document.createElement("a");
                a.appendChild(document.createTextNode(columns[c]));
                a.setAttribute("data-id", rowData.id);
                if(rowData.styles && rowData.styles.row) {
                    a.setAttribute("data-row-type", rowData.styles.row);
                }
                td = document.createElement("td");
                td.appendChild(a);
                tr.appendChild(td);

                td.colSpan = colspan;
            } else {
                td = document.createElement("td");
                td.appendChild(document.createTextNode(columns[c]));
                tr.appendChild(td);
            }
        }

        // From the timeline data, generate elements and put them in the td.
        // Generates an empty TD for invalid timeline data.
        td = generateTimelineColumn(rowData.timeline)

        if(td.firstElementChild && rowData.styles && rowData.styles.timeline) {
            td.firstElementChild.classList.add(rowData.styles.timeline);
        }

        tr.appendChild(td);
        
        if(rowData.styles && rowData.styles.row) {
            tr.classList.add(rowData.styles.row);
        }

        tableBody.appendChild(tr);
    };

    function renderGridTable(container) {
        var markup;
        var tableMarkup;
        var timeline;

        // var entireTable = document.querySelector("#trs");
        // if(entireTable){
        //     entireTable.parentNode.removeChild(entireTable);
        // }

        var table = document.createElement("table");
        var thead = document.createElement("thead");
        var tbody = document.createElement("tbody");

        table.appendChild(thead);
        table.appendChild(tbody);

        container.appendChild(table);

        // Lame, fix.
            thead.innerHTML = `
                        <th width="33%">${labels.context}</th>
                        <th width="5%">${labels.id}</th>
                        <th width="8%">${labels.duration}</th>
                        <th width="9%">${labels.starttime}</th>
                        <th width="45%" class="transactions-graph-timeline-header-row">${labels.timeline}
                            <div class ="trans-graph-time-marker-container" id = "timeline-marker-container">
                                <div class="trans-graph-time-marker-timeline"></div>
   
                                <div class="trans-graph-time-marker1">
                                    <div class="trans-graph-time-number-mark"><span class="timeline-number-text-1">0s</span></div>
                                    <div class="trans-graph-time-marker-line"></div>
                                </div>
                           
                                <div class="trans-graph-time-marker2">
                                    <div class="trans-graph-time-number-mark"><span class="timeline-number-text-2">0s</span></div>
                                    <div class="trans-graph-time-marker-line"></div>
                                </div>
                           
                                <div class="trans-graph-time-marker3">
                                    <div class="trans-graph-time-number-mark"><span class="timeline-number-text-3">0s</span></div>
                                    <div class="trans-graph-time-marker-line"></div>
                                </div>
                           
                                <div class="trans-graph-time-marker4">
                                    <div class="trans-graph-time-number-mark"><span class="timeline-number-text-4">0s</span></div>
                                    <div class="trans-graph-time-marker-line"></div>
                                </div>
                            </div>
                            
                        <br><br></th>
            `;
        return table;
    }
    
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
                        <th width="45%" class="transactions-graph-timeline-header-row">${labels.timeline}
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
                    
                    <tbody></tbody> 
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
                    
                    <tbody></tbody> 
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

        _container.appendChild(tableMarkup);
        tableBody = _container.querySelector("tbody");
    };

    // Updates the number markers on the timeline ruler
    this.updateTimeMarkers = function(){
        //latestEndTime = endTime;
        var marker1 = _container.querySelector(".timeline-number-text-1");
        var marker2 = _container.querySelector(".timeline-number-text-2");
        var marker3 = _container.querySelector(".timeline-number-text-3");
        var marker4 = _container.querySelector(".timeline-number-text-4");
        var end = _gridRangeEndTime;
        var start = _gridStartOffset;
        var offset = Math.round(_gridStartOffset/1000);
        var interval = (end - start)/4;

        marker1.innerHTML = offset + "s";
        marker2.innerHTML = Math.round(interval/1000 + offset) + "s";
        marker3.innerHTML = Math.round((interval*2)/1000 + offset) + "s";
        marker4.innerHTML = Math.round((interval*3)/1000 + offset) + "s";

        var timeline = document.getElementById("timeline-marker-container");
        timeline.classList.remove("invisible");
    };

    // Graphically adds to the table
    this.addRowLegacy = function(rowData){
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
            row.firstElementChild.appendChild(contextPrint);
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
            row.firstElementChild.appendChild(contextPrint);
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

    function generateTimelineColumn(timeline) {
        var td = document.createElement("td");

        if(!timeline || timeline.length === 1) {
            // ?
            return td;
        }


        var div = document.createElement("div");
        div.className="transactions-graph-row";

        var block;
        var left;
        var width;
        var start;
        var end;
        for(var c=0;c<timeline.length;c++) {
            if(!timeline[c+1]) {
                break;
            }
            _gridRangeEndTime = Math.max(_gridRangeEndTime, timeline[c+1]);
            end = _gridRangeEndTime - _gridStartOffset;

            block = document.createElement("div");
            block.className = "transactions-graph-row-block";

            left = (((timeline[c] - _gridStartOffset) / end) * 100);
            width = Math.max((((timeline[c+1] - _gridStartOffset) / end) * 100) - left, .23);

            block.style.left = left + "%";
            block.style.width = width + "%";

            div.appendChild(block);
        }

        td.appendChild(div);

        return td;
    }


    // Create a small timeline for each "complete" transaction
    function createIndividualTimeline(stamp, start, end){
        var markup;
        var stampToStart = start - stamp;
        var startToEnd = end - start;
        var minPercent = .23; // So you can actualy see a the small part on the timeline even when really short duration
        var end = _gridRangeEndTime - _gridStartOffset;

        var stampLeft = (stamp/end)*100;
        var stampRight = (1 - start/end)*100-minPercent;

        var startLeft = 100-stampRight;
        var startRight = (1 - end/end)*100-minPercent;


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

    function Table_OnClick(event) {
        var a = event.srcElement;
        if(a.tagName !== "A") {
            return;
        }

        var id = a.getAttribute("data-id");
        var type = a.getAttribute("data-row-type");

        this.notify("onitemclick", { id: id, type: type });
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