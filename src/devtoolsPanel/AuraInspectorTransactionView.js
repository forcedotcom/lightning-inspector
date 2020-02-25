import AuraInspectorTransactionGrid from './AuraInspectorTransactionGrid';

export default function AuraInspectorTransactionView() {
    var transactions = {};
    var currentTypeOfData; //Either "marks" or "customTrans"
    var CUSTOM_TRANS = 'customTrans';
    var MARKS = 'marks';

    var transactionGrid;
    var recording = false;

    var graphData = {};
    var graphDataIndices = [];
    var latestEndTime = 0;

    var labels;
    var markup;

    var eventManager;
    var _bootstrapMetrics = {};
    var _previousBootstrapMetrics = [];

    // Start live recording marks
    var _marks;
    var _processor;
    var _filterText;

    /* --------- Controller and listener methods -------------- */

    this.init = function(initLabels) {
        labels = initLabels;

        eventManager = new createEventManager();
        currentTypeOfData = MARKS;

        transactionGrid = new AuraInspectorTransactionGrid();
        transactionGrid.init(labels);
        // Nothing to output at the moment
        // transactionGrid.attach('onitemclick', TransactionGrid_OnItemClick.bind(this));

        _processor = new MetricsServiceDataProcessor(_bootstrapMetrics);
    };

    this.clear = function() {
        _processor = new MetricsServiceDataProcessor(_bootstrapMetrics);

        // TODO: This probably doesn't work right anymore.
        // Try this: transactionGrid.setStartOffsetTime(Date.now());
        //transactionGrid.setStartTimeOffset(Date.now() - _bootstrapMetrics.pageStartTime);
        chrome.devtools.inspectedWindow.eval('window.performance.now()', function(now) {
            transactionGrid.setStartTimeOffset(now);
            transactionGrid.setStartTime(_bootstrapMetrics.pageStartTime || Infinity);
            transactionGrid.setEndTime(0);
            transactionGrid.clear();
            transactionGrid.updateTimeMarkers();
        });
    };

    /**
     * Show all the metrics
     */
    this.setBootstrapMetrics = function(metrics) {
        // So our reference passed into the metrics processor stays live to the data.
        Object.assign(_bootstrapMetrics, metrics);

        var currentStartTime = transactionGrid.getStartTime();

        if (isNaN(currentStartTime)) {
            transactionGrid.setStartTime(metrics.pageStartTime);
        } else {
            transactionGrid.setStartTime(Math.min(metrics.pageStartTime, currentStartTime));
        }
    };

    this.setMarksData = function(marks) {
        _marks = marks;

        _processor.addMarksData(_marks);

        updateGrid();
    };

    this.addTransaction = function(transaction) {
        _processor.addTransaction(transaction);

        updateGrid();
    };

    this.render = function(container) {
        transactionGrid.render(container);
    };

    this.setFilter = function(filterText) {
        _filterText = filterText;
        updateGrid();
    };

    function updateGrid() {
        var marks = {};

        // TODO: Finish this.
        var items = _processor.getSortedItems();

        var range = _processor.getTimelineRange();
        transactionGrid.setStartTimeOffset(range[1] !== Infinity ? range[1] - range[0] : 0);
        transactionGrid.setStartTime(range[1]);
        transactionGrid.setEndTime(range[2]);
        transactionGrid.updateTimeMarkers();

        // Ideally we wouldn't do this either.
        transactionGrid.clear();

        var children;
        // Add a row for each Transport
        for (var c = 0, row, contextColumn; c < items.length; c++) {
            row = items[c];
            contextColumn = row.columns[0];

            if (_filterText && contextColumn.indexOf(_filterText) < 0) {
                continue;
            }

            if (row instanceof TransportDataRow) {
                transactionGrid.addRow(row);
                children = _processor.getActions(row.id);

                for (var d = 0; d < children.length; d++) {
                    transactionGrid.addRow(children[d]);
                }
            } else {
                transactionGrid.addRow(row);
            }
        }
    }

    function outputActionServerData(action) {
        if (!action) {
            return;
        }

        if (!action.serverData) {
            var name = (action.stamp && action.stamp.context.def) || 'unknown action';
            chrome.devtools.inspectedWindow.eval(`
                console.log("Action: ${name} did not have any performance data.");
            `);
            return;
        }

        var data = action.serverData;
        var name = data.attachment.actionName.replace(/^\d\$/g, '');
        var callstack;
        var overview = JSON.stringify([
            {
                name: name,
                startTime: new Date(data.startTime).toLocaleString(),
                totalTime: data.totalTime,
                ownTime: data.ownTime,
                childTime: data.childTime
            }
        ]);

        if (data.children) {
            callstack = JSON.stringify(
                data.children.map(function(item) {
                    return {
                        work: item.attachment[Object.keys(item.attachment)[0]],
                        startTime: new Date(item.startTime).toLocaleString(),
                        totalTime: item.totalTime,
                        childTime: item.childTime
                    };
                })
            );
        }

        chrome.devtools.inspectedWindow.eval(`
            console.group("Action: ${name}");
            console.log("%cOverview", "font-size: 1.2em; font-weight: bold; color: #0070d2;");
            console.table(${overview}, ["totalTime", "ownTime", "childTime"]);
            if(${callstack}) {
                console.log("%cCallstack", "font-size: 1.2em; font-weight: bold; color: #0070d2;");
                console.table(${callstack}, ["work", "totalTime", "childTime"]);
            }
            console.groupEnd();
        `);
    }

    function outputTransportServerData(transport) {
        if (!transport) {
            return;
        }
        if (!transport.serverData) {
            var name = transport.name;
            chrome.devtools.inspectedWindow.eval(`
                console.log("Transport: ${name} did not have any performance data.");
            `);
            return;
        }
        var data = transport.serverData;
        var name = transport.name;
        var overview = JSON.stringify([
            {
                name: name,
                startTime: new Date(data.startTime).toLocaleString(),
                totalTime: data.totalTime,
                ownTime: data.ownTime,
                childTime: data.childTime
            }
        ]);

        var callstack = JSON.stringify(
            data.children.map(function(item) {
                var type = item.name;

                return {
                    type: item.name,
                    info: item.attachment[Object.keys(item.attachment)[0]],
                    startTime: new Date(item.startTime).toLocaleString(),
                    totalTime: item.totalTime,
                    childTime: item.childTime
                };
            })
        );

        chrome.devtools.inspectedWindow.eval(`
            console.group("${name}");
            console.log("%cOverview", "font-size: 1.2em; font-weight: bold; color: #0070d2;");
            console.table(${overview}, ["startTime", "totalTime", "ownTime", "childTime"]);
            console.log("%cCallstack", "font-size: 1.2em; font-weight: bold; color: #0070d2;");
            console.table(${callstack}, ["type",  "info", "totalTime", "childTime"]);
            console.groupEnd();
        `);
    }

    function MetricsServiceDataProcessor(context) {
        var _transports = new Map();
        var _actions = new Map();
        var _serverData = new Map();
        var _startRange = Infinity;
        var _endRange = 0;
        var _transactions = [];
        var _uid = 1;

        this.getSortedItems = function() {
            var transports = this.getTransports();
            var items = _transactions.concat(transports);

            // TODO: Move sort function decleration out of here.
            return items.sort(function(a, b) {
                var aTimestamp = a.getStartTime();
                var bTimestamp = b.getStartTime();

                if (aTimestamp === bTimestamp) {
                    return 0;
                } else if (aTimestamp < bTimestamp) {
                    return -1;
                }
                return 1;
            });
        };

        this.addTransaction = function(transaction) {
            var transactionDataRow = new TransactionDataRow(transaction, context.pageStartTime);
            _transactions.push(transactionDataRow);

            _startRange = Math.min(transactionDataRow.getStartTime(), _startRange);
            _endRange = Math.max(transactionDataRow.getEndTime(), _endRange);
        };

        this.addMarksData = function(data) {
            // Process Marks
            if (!data) {
                return;
            }

            if (Array.isArray(data.transport)) {
                parseTransports(data.transport);
            }

            // Parse Actions
            if (Array.isArray(data.actions)) {
                parseActions(data.actions);
            }

            // TEMP:
            return;

            if (Array.isArray(data.server)) {
                parseServerData(data.server);
            }
        };

        this.getChildren = function(dataRow) {
            if (dataRow.getChildren) {
                return dataRow.getChildren();
            }
            return [];
        };

        this.getTransports = function() {
            var transports = [];
            return Array.from(_transports.values());
        };

        this.getTransportById = function(transportId) {
            return getTransportById(parseInt(transportId));
        };

        this.getTransactionById = function(transactionId) {
            for (var c = 0; c < _transactions.length; c++) {
                if (_transactions[c].id === transactionId) {
                    return _transactions[c];
                }
            }
        };

        this.getActions = function(transportId) {
            var transport = getTransportById(transportId);

            if (!transport) {
                console.error('You provided an invalid transportId. The transport did not exist.');
                return [];
            }

            var ret = [];
            var actionIds = transport.getActions();
            for (var actionId in actionIds) {
                ret.push(getActionById(actionId));
            }

            return ret;
        };

        this.getActionById = function(actionId) {
            return getActionById(actionId);
        };

        this.getServerData = function(actionId) {
            var action = getActionById(actionId);
            if (action) {
                return action.serverData;
            }
        };

        this.getTimelineRange = function() {
            return [context.pageStartTime, _startRange, _endRange];
        };

        this.getUid = function(prefix) {
            _uid = _uid + 1;
            if (prefix) {
                return prefix + _uid;
            }
            return _uid;
        };

        function getTransportById(id) {
            return _transports.get(id);
        }

        function setTransportById(id, value) {
            _transports.set(id, value);
        }

        function getActionById(id) {
            return _actions.get(id);
        }

        function setActionById(id, value) {
            _actions.set(id, value);
        }

        function parseTransports(transportMarks) {
            var transport;
            var current;
            var id;
            for (var c = 0; c < transportMarks.length; c++) {
                current = transportMarks[c];
                id = transportMarks[c].context.auraXHRId;
                transport = getTransportById(id);
                if (!transport) {
                    transport = new TransportDataRow(
                        { id: id, name: 'http-request {' + id + '}' },
                        _bootstrapMetrics.pageStartTime
                    );
                    setTransportById(id, transport);
                }

                transport.mergeData(current);

                _startRange = Math.min(transport.getStartTime(), _startRange);
                _endRange = Math.max(transport.getEndTime(), _endRange);
            }
        }

        function parseActions(actionMarks) {
            var current;
            var id;
            var action;
            for (var c = 0; c < actionMarks.length; c++) {
                current = actionMarks[c];
                id = current.context.id;

                action = getActionById(id);

                if (!action) {
                    action = new ActionsDataRow({ id: id }, _bootstrapMetrics.pageStartTime);
                    setActionById(id, action);
                }

                action.mergeData(current);

                _startRange = Math.min(action.getStartTime(), _startRange);
                _endRange = Math.max(action.getEndTime(), _endRange);
            }
        }

        function parseServerData(dataMarks) {
            var current;
            var xhrId;
            var calltree;
            var transport;
            for (var c = 0; c < dataMarks.length; c++) {
                current = dataMarks[c];
                if (!current.context) {
                    continue;
                }
                xhrId = current.context.id;

                transport = getTransportById(xhrId);
                if (!transport) {
                    continue; // Not sure why this would happen. Just being safe.
                }

                transport.mergeData(current);
            }
        }
    }

    function getActionFromTransport(transport, actionPath) {
        if (!transport || !actionPath) {
            throw new Error('Necessary arguments not specified. Expected (transport, actionName)');
        }
        // No Actions? No need doing any further logic.
        if (!transport.actions) {
            return null;
        }

        // Format: "1$apex://DreamforceData/ACTION$getFeatureList"
        var actionDef = actionPath.replace(/^\d\$/g, '');

        var action;
        for (var actionId in transport.actions) {
            action = _processor.getActionById(actionId);
            if (action && action.columns[0] === actionDef) {
                return action;
            }
        }

        return null;
    }
    // Custom Transactions

    // Custom Transactions
    function TransactionDataRow(transaction, pageStartTime) {
        var duration = transaction.duration || 0;
        var startTimeRelative = transaction.ts;
        var startTimeAbsolute = (transaction.pageStartTime || pageStartTime) + startTimeRelative;
        var endTimeAbsolute = startTimeAbsolute + duration;

        this.columns = [transaction.id, '', duration + 'ms', startTimeRelative + 'ms'];
        this.id = _processor.getUid(transaction.id);
        this.timeline = [startTimeAbsolute, endTimeAbsolute];
        this.styles = {
            timeline: 'transaction',
            row: 'transaction'
        };

        // Special formatting, Needs to be moved out of here into its own format classes
        this.columns[0] = formatTitle(this.columns[0]);

        this.mergeData = function() {};

        this.getEndTime = function() {
            return endTimeAbsolute;
        };

        this.getStartTime = function() {
            //return transaction.ts;
            return startTimeAbsolute;
        };

        // Used in temporary console.log
        this.getData = function() {
            return transaction;
        };

        function formatTitle(currentTitle) {
            switch (currentTitle) {
                case 'ltng:performance':
                    return `ltng:performance [${transaction.eventSource}]`;
                case 'ltng:interaction':
                    return `ltng:interaction [${transaction.eventSource}:${transaction.locator.target}]`;
                case 'ltng:pageView':
                    return `ltng:pageView [${transaction.page.context}]`;
            }
            return currentTitle;
        }
    }

    // Transforms PROCESSED marks to a row that the grid expects.
    // XHR calls
    function TransportDataRow(marks, pageStartTime) {
        this.columns = [marks.name, marks.id];
        this.id = marks.id;
        this.timeline = [];
        this.styles = {
            timeline: 'transport',
            row: 'transport'
        };

        this.mergeData = function(data) {
            var calltree;

            if (!marks[data.phase]) {
                marks[data.phase] = data;
            }

            if (data.context && data.context.actionDefs) {
                if (!marks.actions) {
                    marks.actions = {};
                }

                for (var d = 0; d < data.context.actionDefs.length; d++) {
                    // Format is actionName$actionId in 202, actionId in 204
                    var pair = data.context.actionDefs[d].split('$');
                    var actionId = pair[1] || pair[0];
                    marks.actions[actionId] = pair[0];
                }
            }

            if (data.context && data.context.perf && data.context.perf.calltree) {
                calltree = data.context.perf.calltree[0];
                if (calltree) {
                    marks.serverData = calltree;
                    for (var d = 0; d < calltree.children.length; d++) {
                        if (calltree.children[d].name === 'action') {
                            var action = getActionFromTransport(
                                marks,
                                calltree.children[d].attachment.actionName
                            );
                            if (action) {
                                action.serverData = calltree.children[d];
                            }
                        }
                    }
                }
            }

            if (marks.start) {
                this.timeline[0] = this.getStartTime();

                // Start Time Column
                this.columns[3] = Math.round(marks.start.ts) + 'ms';
            }

            if (marks.end && marks.start) {
                // Hydrated actions don't go through stamp or send phases, just
                // end, which screws up durations. If this was pre-send, just abandon it.
                // we'll eventually get the right end marks.
                if (marks.end.ts - marks.start.ts < 0) {
                    marks.end = null;
                    return;
                }
                this.timeline[1] = this.getEndTime();

                // Duration Column
                this.columns[2] = Math.round(marks.end.ts - marks.start.ts) + 'ms';
            }
        };

        this.getChildren = function() {
            return _processor.getActions(this.id);
        };

        this.getActions = function() {
            return marks.actions || [];
        };

        this.getStartTime = function() {
            var start = marks.start && marks.start.ts;
            if (start) {
                return pageStartTime + start;
            }
            return Infinity;
        };

        this.getEndTime = function() {
            var end = marks.end && marks.end.ts;
            if (end) {
                return pageStartTime + end;
            }
            return 0;
        };

        this.mergeData(marks);
    }

    function ActionsDataRow(marks, pageStartTime) {
        this.columns = ['unknown action', marks.id];
        this.id = marks.id;
        this.timeline = [];
        this.styles = {
            timeline: 'action',
            row: 'action'
        };

        this.mergeData = function(data) {
            if (!data.hasOwnProperty('phase')) {
                return;
            }

            if (!marks[data.phase]) {
                marks[data.phase] = data;
            }

            if (marks.stamp) {
                this.columns[0] = marks.stamp.context.def;
                this.timeline[0] = this.getStartTime();
            }

            if (marks.start) {
                this.timeline[1] = pageStartTime + marks.start.ts;
                this.columns[3] = Math.round(marks.start.ts) + 'ms';

                if (marks.end) {
                    this.columns[2] = Math.round(marks.end.ts - marks.start.ts) + 'ms';
                }
            }

            if (marks.end) {
                this.timeline[2] = this.getEndTime();
                if (marks.start) {
                    this.columns[2] = Math.round(marks.end.ts - marks.start.ts) + 'ms';
                }
            }
        };

        this.getStartTime = function() {
            var stamp = marks.stamp && marks.stamp.ts;
            if (stamp) {
                return pageStartTime + stamp;
            }
            return Infinity;
        };

        this.getEndTime = function() {
            var end = marks.end && marks.end.ts;
            if (end) {
                return pageStartTime + end;
            }
            return 0;
        };

        this.mergeData(marks);
    }

    function TransactionGrid_OnItemClick(eventData) {
        if (eventData.type === 'action') {
            outputActionServerData(_processor.getActionById(eventData.id));
            // Lets print out the server Data
        } else if (eventData.type === 'transport') {
            outputTransportServerData(_processor.getTransportById(eventData.id));
            // Print out the server data.
        } else if (eventData.type === 'transaction') {
            var transaction = _processor.getTransactionById(eventData.id);
            if (transaction) {
                var json = JSON.stringify(transaction.getData());
                chrome.devtools.inspectedWindow.eval(`
                    console.log(${json});
                `);
            }
        }
    }

    /* ------------------- Event related functions ---------------------*/

    function createEventManager() {
        var eventManager = {};

        eventManager.attach = function(eventName, func) {
            if (!eventManager[eventName]) {
                eventManager[eventName] = [];
            }
            eventManager[eventName].push(func);
        };

        eventManager.remove = function(eventName) {
            if (eventManager[eventName] || eventManager[eventManager].length > 0) {
                eventManager[eventName] = [];
            }
        };

        eventManager.notify = function(eventName, data) {
            if (eventManager[eventName] && eventManager[eventName].length > 0) {
                for (var x = 0; x < eventManager[eventName].length; x++) {
                    eventManager[eventName][x](data);
                }
            }
        };

        return eventManager;
    }

    this.attach = function(eventName, callback) {
        eventManager.attach(eventName, callback);
    };

    this.remove = function(eventName) {
        eventManager.remove(eventName);
    };

    this.notify = function(eventName, data) {
        eventManager.notify(eventName, data);
    };
}
