import ReactDOM from 'react-dom';
import React from 'react';
import './devtoolsPanel.css';
import AuraInspectorEventLog from './AuraInspectorEventLog';
import AuraInspectorActionsView from './AuraInspectorActionsView';
import AuraInspectorComponentTree from './AuraInspectorComponentTree';
import AuraInspectorComponentView from './AuraInspectorComponentView';
import AuraInspectorPerformanceView from './AuraInspectorPerformanceView';
import AuraInspectorDefinitionsList from './AuraInspectorDefinitionsList.js';
import AuraInspectorStorageView from './AuraInspectorStorageView.js';
import AuraInspectorTransactionGrid from './AuraInspectorTransactionGrid.js';
import AuraInspectorTransactionPanel from './AuraInspectorTransactionPanel.js';
import AuraInspectorTransactionView from './AuraInspectorTransactionView.js';
import DevToolsEncodedId from './DevToolsEncodedId.js';
import AuraInspectorOptions from './optionsProxy.js';
import JsonSerializer from '../aura/JsonSerializer.js';

/**
 * You can use the publish and subscribe methods to broadcast messages through to the end points of the architecture.
 * The majority of the work is done in the devtoolsPanel and the AuraInspectorInjectedScript. So you'll usually want
 * to communicate between those two layers.
 *
 *
 * The layers go like this.
 * devtoolsPanel <- background <- contentScript <-> AuraInspectorInjectedScript
 *      |------------------------------------------------------^
 *
 * The messages you can publish and subscribe to are
 *
 * AuraInspector:OnAuraInitialized              $A is available and we are just about to run $A.initAsync
 * AuraInspector:OnPanelConnect                 The Aura Panel has been loaded and initialized. (Where we start the instrumentation of the app.)
 * AuraInspector:OnBootstrapEnd                 We've instrumented Aura, and now the Dev Tools can initialize and expect it to be there.
 * AuraInspector:OnContextMenu                  User Selected the "Inspect Aura Component" option in the context menu. Handled in the inspected script. Does not contain the information on what they clicked on.
 * AuraInspector:OnHighlightComponent           We focused over a component in the ComponentTree or ComponentView and the accompanying HTML element in the DOM should be spotlighted.
 * AuraInspector:OnHighlightComponentEnd        We have stopped focusing on the component, and now remove the dom element spotlight.
 * AuraInspector:AddPanel                       Add the panel at the specified URL as an Iframe tab.
 * AuraInspector:ConsoleLog                     [DEPRECATED] Show a message in the DevTools console.
 * AuraInspector:OnEventStart                   An Aura event is about to fire. Allows us to track that everything between the start and end happend as a result of this event.
 * AuraInspector:OnEventEnd                     An Aura event fired. Process all the events and actions that have happened since the event fired.
 * AuraInspector:OnTransactionEnd               Transaction has ended and should now be added to the UI.
 * AuraInspector:StorageData                    Aura Storage Service has async fetched data to show in the storage panel.
 * AuraInspector:RemoveStorageData              Remove stored response for the action we would like to drop next time we see it
 * AuraInspector:ShowComponentInTree            Indicates you want to show the specified globalID in the component tree.
 * AuraInspector:OnClientActionStart            We started executing the handler for a controller action.
 * AuraInspector:OnClientActionEnd              Controller Action finished execution.
 * AuraInspector:OnDescriptorSelect             A descriptor was clicked on, we may want to take some action here such as showing a panel that has more information.
 * AuraInspector:OnInjectionScriptInitialized   The AuraInspectorInjectionScript has been injected and initialized. (Usable by external plugins to know when they can wire into the script on the hosted page.)
 * AuraInspector:OnActionStateChange            When an action is enqueued, fired, running we fire this message with the current status of the action. Includes just changed data on the action that we care about.
 * AuraInspector:Sidebar:ViewComponent          Show a Component in the Sidebar. Pass the globalId as the first parameter.

 // ChaosManager stuff, move to SfdcInspector:
 * AuraInspector:OnStartChaosRun                User has click button "Start Chaos Run" in chaos tab, let's start randomly clicking through the app
 * AuraInspector:OnStopChaosRun                 User has click button "Stop the Run", we are done with current new chaos run
 * AuraInspector:OnSaveChaosRun                 User has click button "Save the Run", we will save the chaos run into local file
 * AuraInspector:OnLoadChaosRun                 User has load a chaos run from local file
 * AuraInspector:OnReplayChaosRun               User has click button "Replay Chaos Run", let's start replaying
 * AuraInspector:OnContinueChaosRun             We might need to refresh during a replay, this will continue the ongoing replay.
 * AuraInspector:OnStopAllChaosRun              User has click the panic button, let's stop all chaos run, and clear up everything
 * AuraInspector:OnSomeActionGetDropped         We just drop some action during a replay
 */

var panel = new AuraInspectorDevtoolsPanel();

// Connects to content script
// and draws the panels.
panel.init(function() {
    // Probably the default we want
    AuraInspectorOptions.getAll({ activePanel: 'transaction' }, function(options) {
        if (!panel.hasPanel(options['activePanel'])) {
            // If the panel we are switching to doesn't exist, use the
            // default which is the Component Tree.
            options['activePanel'] = 'component-tree';
        }

        panel.showPanel(options['activePanel']);
    });
});

function AuraInspectorDevtoolsPanel() {
    //var EXTENSIONID = "mhfgenmncdnmcoonglmkepfdnjjjcpla";
    var PUBLISH_KEY = 'AuraInspector:publish';
    var PUBLISH_BATCH_KEY = 'AuraInspector:publishbatch';
    var BOOTSTRAP_KEY = 'AuraInspector:bootstrap';
    var runtime = null;
    var actions = new Map();
    // For Drawing the Tree, eventually to be moved into it's own component
    var nodeId = 0;
    var events = new Map();
    var panels = new Map();
    const renderedPanels = new Set();
    var _name = 'AuraInspectorDevtoolsPanel';
    var _onReadyQueue = [];
    var _isReady = false;
    var _initialized = false;
    var _subscribers = new Map();
    var tabId;
    var currentPanel;

    this.handleHeaderActions_OnClick = HeaderActions_OnClick.bind(this);

    this.connect = function() {
        if (runtime) {
            return;
        }
        tabId = chrome.devtools.inspectedWindow.tabId;

        runtime = chrome.runtime.connect({ name: _name });
        runtime.onMessage.addListener(BackgroundScript_OnMessage.bind(this));
        //runtime.onDisconnect.addListener(DevToolsPanel_OnDisconnect.bind(this));
        runtime.postMessage({
            action: 'BackgroundPage:publish',
            key: 'BackgroundPage:InjectContentScript',
            data: tabId
        });
        runtime.postMessage({ subscribe: ['AuraInspector:bootstrap'], tabId: tabId });
    };

    this.disconnect = function(port) {};

    this.init = function(finishedCallback) {
        this.connect();

        // Wait for the AuraInjectedScript to finish loading.
        this.subscribe('AuraInspector:OnBootstrapEnd', () => {
            if (_initialized) {
                return;
            }

            //-- Attach Event Listeners
            // var header = document.querySelector('header.tabs');
            const headerTabs = document.querySelector('.header-tabs');
            headerTabs.addEventListener('click', HeaderActions_OnClick.bind(this));

            // Initialize Panels
            var eventLog = new AuraInspectorEventLog(this);
            var tree = new AuraInspectorComponentTree(this);
            var perf = new AuraInspectorPerformanceView(this);
            var transaction = new AuraInspectorTransactionPanel(this);
            var actions = new AuraInspectorActionsView(this);
            var storage = new AuraInspectorStorageView(this);

            this.addPanel('component-tree', tree, chrome.i18n.getMessage('tabs_componenttree'));
            this.addPanel('performance', perf, chrome.i18n.getMessage('tabs_performance'));
            this.addPanel('transaction', transaction, chrome.i18n.getMessage('tabs_transactions'));
            this.addPanel('event-log', eventLog, chrome.i18n.getMessage('tabs_eventlog'));
            this.addPanel('actions', actions, chrome.i18n.getMessage('tabs_actions'));
            this.addPanel(storage.panelId, storage, chrome.i18n.getMessage('tabs_storage'));

            // Sidebar Panel
            // The AuraInspectorComponentView adds the sidebar class

            this.sidebar = new AuraInspectorComponentView(this);
            // Render into the proper element
            this.sidebar.init(document.getElementById('sidebar-container'));
            this.sidebar.render();

            // Draw the help option
            fetch(chrome.extension.getURL('configuration.json'), {
                method: 'get'
            }).then(function(response) {
                response.json().then(function(json) {
                    drawHelp(json.help);
                });
            });

            this.subscribe(
                'AuraInspector:OnContextMenu',
                function() {
                    this.publish('AuraInspector:ContextElementRequest', {});
                }.bind(this)
            );

            this.subscribe('AuraInspector:AddPanel', AuraInspector_OnAddPanel.bind(this));
            this.subscribe(
                'AuraInspector:ShowComponentInTree',
                AuraInspector_OnShowComponentInTree.bind(this)
            );
            this.subscribe('AuraInspector:Search', AuraInspector_OnSearch.bind(this));
            this.subscribe('AuraInspector:CancelSearch', AuraInspector_OnCancelSearch.bind(this));
            this.subscribe(
                'AuraInspector:Sidebar:ViewComponent',
                AuraInspector_Sidebar_OnViewComponent.bind(this)
            );

            // AuraInspector:publish and AuraInspector:publishbash are essentially the only things we listen for anymore.
            // We broadcast one publish message everywhere, and then we have subscribers.
            // We do this here, after we've setup all the subscribers. So now we say send us everything that has been
            // queued up, and start listening going forward.
            runtime.postMessage({
                subscribe: [PUBLISH_KEY, PUBLISH_BATCH_KEY],
                port: runtime.name,
                tabId: tabId
            });

            _initialized = true;

            if (typeof finishedCallback === 'function') {
                finishedCallback();
            }
        });

        this.subscribe(
            'AuraInspector:OnAuraUnavailable',
            AuraInspector_OnAuraUnavailable.bind(this)
        );
        this.subscribe(
            'AuraInspector:OnAuraInitialized',
            AuraInspector_OnAuraInitialized.bind(this)
        );

        this.publish(
            'AuraInspector:OnPanelConnect',
            'DevtoolsPanel: Devtools loaded.' + Date.now()
        );

        //this.subscribe("AuraInspector:RequestReleaseInfo", AuraInspector_OnRequestReleaseInfo.bind(this));

        var tryAgainButton = document.querySelector('#no-aura-available-try-again');
        tryAgainButton.addEventListener('click', TryAgainButton_OnClick.bind(this));

        toggleAvailableDialog();
    };

    /**
     * Adds a tab for the panel interface.
     *
     * @param {String} key unique identifier for the panel.
     * @param {Object} panel Instance of the panel you are adding.
     * @param {String} title The label which goes in the Tab to select for the panel.
     */
    this.addPanel = function(key, panel, title) {
        if (!panels.has(key)) {
            const container = document.getElementById('devtools-container');

            // Create Tab Body and Header
            var tabBody = document.createElement('section');
            tabBody.className = 'tab-body slds-hide slds-col';
            tabBody.id = 'tab-body-' + key;
            tabBody.role = 'tabpanel';
            tabBody.class = 'slds-tabs-default__content';
            tabBody.setAttribute('aria-labelledby', 'tabs-' + key);

            if (title) {
                const tabId = 'tabs-' + key;
                const fragment = document.createDocumentFragment();
                ReactDOM.render(
                    <li
                        className="slds-tabs--default__item"
                        title={title}
                        role="presentation"
                        data-tabid={tabId}
                    >
                        <a
                            className="slds-tabs--default__link"
                            href="javascript:void(0);"
                            role="tab"
                            tabIndex="0"
                            aria-selected="false"
                            aria-controls={'tab-body-' + key}
                            id={tabId}
                        >
                            {title}
                        </a>
                    </li>,
                    fragment
                );
                container.querySelector('.header-tabs > ul').appendChild(fragment);
            }

            // Initialize component with new body
            panel.init(tabBody);
            panels.set(key, panel);

            container.appendChild(tabBody);
        }
    };

    /*
     * Which panel to show to the user in the dev tools.
     */
    this.showPanel = function(key, options) {
        if (!key) {
            return;
        }
        var buttons = document.querySelectorAll('.header-tabs > ul > li');
        var sections = document.querySelectorAll('section.tab-body:not(.sidebar)');
        var panelKey = key.indexOf('tabs-') == 0 ? key.substring(5) : key;
        var buttonKey = 'tabs-' + panelKey;
        var current = panels.get(panelKey);
        const isPanelRendered = renderedPanels.has(panelKey);

        // When you try to show the panel that already is shown, we don't want to refire render.
        // That does setup stuff and that shouldn't happen while you are using a panel.
        if (current === currentPanel || !current) {
            return;
        } else {
            currentPanel = current;
        }

        for (var c = 0; c < buttons.length; c++) {
            if (buttons[c].getAttribute('data-tabId') === buttonKey) {
                buttons[c].classList.add('slds-is-active');
                sections[c].classList.add('slds-show');
                sections[c].classList.remove('slds-hide');
            } else {
                buttons[c].classList.remove('slds-is-active');
                sections[c].classList.remove('slds-show');
                sections[c].classList.add('slds-hide');
            }
            this.hideSidebar();
        }

        // Render the output. Panel is responsible for not redrawing if necessary.
        if (current) {
            this.hideLoading();
            if (!isPanelRendered) {
                renderedPanels.add(panelKey);
                current.render(options);
            }

            if (!current.onShowPanel && isPanelRendered) {
                current.render(options);
            }

            if (current.onShowPanel) {
                current.onShowPanel(options);
            }

            AuraInspectorOptions.set('activePanel', panelKey);
        }
    };

    /**
     * Check if a panel exists.
     * Depending on the mode, some panels will not be added.
     */
    this.hasPanel = function(key) {
        return panels.has(key);
    };

    /**
     * Broadcast a message to a listener at any level in the inspector. Including, the InjectedScript, the ContentScript or the DevToolsPanel object.
     *
     * @param  {String} key MessageID to broadcast.
     * @param  {Object} data any type of data to pass to the subscribe method.
     */
    this.publish = function(key, data) {
        if (!key) {
            return;
        }

        var jsonData = JSON.stringify(data);
        var command = `
            window.postMessage({
                "action": "${PUBLISH_KEY}",
                "key": "${key}",
                "data": ${jsonData}
            }, window.location.href);
        `;

        chrome.devtools.inspectedWindow.eval(command, function() {
            if (_subscribers.has(key)) {
                //console.log(key, _subscribers.get(key).length)
                _subscribers.get(key).forEach(function(callback) {
                    callback(data);
                });
            }
        });
    };

    /**
     * Listen for a published message through the system.
     *
     * @param  {String} key Unique MessageId that would be broadcast through the system.
     * @param  {Function} callback function to be executed when the message is published.
     */
    this.subscribe = function(key, callback) {
        if (!_subscribers.has(key)) {
            _subscribers.set(key, []);
        }

        _subscribers.get(key).push(callback);
    };

    /**
     * Essentially hides the component view. More might go in there, but for now, thats it.
     */
    this.hideSidebar = hideSidebar;

    /**
     * Shows the little spinning blocks.
     */
    this.showLoading = function() {
        document.getElementById('loading').style.display = 'block';
    };

    /**
     * Hides the spinning blocks.
     */
    this.hideLoading = function() {
        document.getElementById('loading').style.display = 'none';
    };

    /**
     * Gets the mode that Aura is running in. Usually either DEV or PROD.
     * Try to avoid using this method and try to get everything working in production mode.
     *
     * @param  {Function} callback Since the eval call to get the value is async, you need to provide a callback which has the value as the first parameter to process the mode.
     *
     * @example
     * this.getMode(function(mode){ console.log("The mode is: " + mode)});
     */
    this.getMode = function(callback) {
        chrome.devtools.inspectedWindow.eval('$A.getContext().getMode();', callback);
    };

    this.showComponentByIdInSidebar = function(globalId) {
        this.publish('AuraInspector:Sidebar:ViewComponent', globalId);
    };

    this.getCount = function(key, callback) {
        if (typeof callback !== 'function') {
            throw new Error('callback is required for - getCount(key, callback)');
        }
        const command = `window[Symbol.for('AuraDevTools')].Inspector.getCount('${key}');`;

        chrome.devtools.inspectedWindow.eval(command, function(response, exceptionInfo) {
            if (exceptionInfo) {
                console.error(command, ' resulted in ', exceptionInfo);
            }

            const count = parseInt(response, 10);

            callback(count);
        });
    };

    this.getComponent = function(globalId, callback, configuration) {
        if (typeof callback !== 'function') {
            throw new Error('callback is required for - getComponent(globalId, callback)');
        }
        if (DevToolsEncodedId.isComponentId(globalId)) {
            globalId = DevToolsEncodedId.getCleanId(globalId);
        }
        var command;

        if (configuration && typeof configuration === 'object') {
            var configParameter = JSON.stringify(configuration);
            command = `window[Symbol.for('AuraDevTools')].Inspector.getComponent('${globalId}', ${configParameter});`;
        } else {
            command = `window[Symbol.for('AuraDevTools')].Inspector.getComponent('${globalId}');`;
        }

        chrome.devtools.inspectedWindow.eval(command, function(response, exceptionInfo) {
            if (exceptionInfo) {
                console.error(command, ' resulted in ', exceptionInfo);
            }
            if (!response) {
                return;
            }

            const component = JsonSerializer.parse(response);

            callback(component);
        });
    };

    this.getComponents = function(globalIds, callback) {
        if (!Array.isArray(globalIds)) {
            throw new Error('globalIds was not an array - getComponents(globalIds, callback)');
        }
        var count = globalIds.length;
        var processed = 0;
        var returnValue = [];
        for (var c = 0; c < count; c++) {
            this.getComponent(
                globalIds[c],
                function(index, component) {
                    returnValue[index] = component;
                    if (++processed == count) {
                        callback(returnValue);
                    }
                }.bind(this, c)
            );
        }
    };

    this.getRootComponents = function(callback) {
        if (typeof callback !== 'function') {
            throw new Error('callback is required for - getRootComponent(callback)');
        }

        chrome.devtools.inspectedWindow.eval(
            "window.$A && $A.getRoot() && window[Symbol.for('AuraDevTools')].Inspector.getRootComponents();",
            function(rootNodes, exceptionInfo) {
                if (exceptionInfo) {
                    console.error(exceptionInfo);
                }
                if (!rootNodes) {
                    return;
                }
                const component = JsonSerializer.parse(rootNodes);
                callback(component);
            }
        );
    };

    /**
     * Localized Events.
     * Should probably just move to the publish and subscribe methods.
     */
    this.attach = function(eventName, eventHandler) {
        if (!events.has(eventName)) {
            events.set(eventName, new Set());
        }
        events.get(eventName).add(eventHandler);
    };

    /**
     * Localized event notification.
     * Should probably be replaced with pub/sub.
     */
    this.notify = function(eventName, data) {
        if (events.has(eventName)) {
            var eventInfo = { data: data };
            events.get(eventName).forEach(function(item) {
                item(eventInfo);
            });
        }
    };

    /*
     =========== BEGIN REFACTOR! ===============
     Can we move some of these to the individual panels themselves?
     */
    this.highlightElement = function(globalId) {
        this.publish('AuraInspector:OnHighlightComponent', globalId);
    };

    this.removeHighlightElement = function() {
        this.publish('AuraInspector:OnHighlightComponentEnd');
    };

    this.addLogMessage = function(msg) {
        this.publish('AuraInspector:ConsoleLog', msg);
    };

    /**
     * Should show a message of a different type obviously.
     */
    this.addErrorMessage = function(msg) {
        console.error(msg);
    };

    this.openTab = function(url) {
        if (url.startsWith('/')) {
            // Resolve to be absolute first.
            chrome.devtools.inspectedWindow.eval('window.location.origin', function(origin) {
                runtime.postMessage({
                    action: 'BackgroundPage:publish',
                    key: 'BackgroundPage:OpenTab',
                    data: origin + url
                });
            });
        } else {
            runtime.postMessage({
                action: 'BackgroundPage:publish',
                key: 'BackgroundPage:OpenTab',
                data: url
            });
        }
    };

    /*
     =========== END REFACTOR! ===============
     */

    /* Event Handlers */

    function HeaderActions_OnClick(event) {
        const target = event.srcElement;

        if (target.id.indexOf('tabs-') === 0) {
            this.showPanel(target.id);
            event.preventDefault();
        }
    }

    function DevToolsPanel_OnDisconnect() {
        this.disconnect();
    }

    function BackgroundScript_OnMessage(message) {
        if (!message) {
            return;
        }
        if (message.action === 'AuraInspector:bootstrap') {
            this.publish(
                'AuraInspector:OnBootstrapEnd',
                'DevtoolsPanel: AuraInspector:bootstrap was called.'
            );
        } else if (message.action === PUBLISH_KEY) {
            callSubscribers(message.key, message.data);
        } else if (message.action === PUBLISH_BATCH_KEY) {
            var data = message.data || [];
            for (var c = 0, length = data.length; c < length; c++) {
                callSubscribers(data[c].key, data[c].data);
            }
        } else {
            console.warn('BackgroundScript_OnMessage, unknown message:', message.action);
        }
    }

    function callSubscribers(key, data) {
        //console.log("Calling Subscribers For: ", key);
        if (_subscribers.has(key)) {
            _subscribers.get(key).forEach(function(callback) {
                try {
                    //console.log("DevtoolsPanel:CallSubscribers", key, data);
                    callback(data);
                } catch (e) {
                    console.error('Key: ', key, ' resulted in error ', e);
                }
            });
        } else {
            //console.log("DevtoolsPanel:NoSubscribersFor", key, data);
        }
    }

    function AuraInspector_OnShowComponentInTree() {
        this.showPanel('component-tree');
    }

    function AuraInspector_OnAddPanel(message) {
        // If we don't have this check, anyone one the web page who
        // reverse enginers our plugin could add a panel to the aura inspector
        // in which case they would have full access to the page.
        // By limiting it to chrome-extension url's only, we are assuming
        // the extension trying to add the panel is already trusted and has access to the page.
        if (message.scriptUrl.indexOf('chrome-extension://') !== 0) {
            return;
        }

        // Security fix.
        // We instantiate a panel using a global window[] reference,
        // and we don't want people to call any function, just the panel
        // constructors.
        if (!message.classConstructor.startsWith('InspectorPanel')) {
            return;
        }

        var script = document.createElement('script');
        script.src = message.scriptUrl;
        script.onload = function() {
            var panelConstructor = window[message.classConstructor];
            if (!panelConstructor) {
                this.addLogMessage(
                    `Tried to create the panel ${message.panelId} with constructor ${message.classConstructor} which did not exist.`
                );
                return;
            }
            this.addPanel(message.panelId, new panelConstructor(this), message.title);
        }.bind(this);

        document.body.appendChild(script);

        if (message.hasOwnProperty('stylesheetUrl')) {
            var link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', message.stylesheetUrl);

            document.head.appendChild(link);
        }
    }

    function AuraInspector_OnAuraUnavailable() {
        toggleAvailableDialog();
    }

    function AuraInspector_OnAuraInitialized() {
        // The initialize script ran.
        this.publish('AuraInspector:OnPanelConnect', 'DevtoolsPanel:OnAuraInitialized');

        toggleAvailableDialog();
    }

    function TryAgainButton_OnClick() {
        this.showLoading();

        toggleAvailableDialog();

        setTimeout(() => {
            this.hideLoading();
        }, 300);
    }

    function AuraInspector_OnCancelSearch() {
        if (currentPanel && currentPanel.onCancelSearch) {
            currentPanel.onCancelSearch();
        }
    }

    function AuraInspector_OnSearch(searchTerm) {
        if (currentPanel && currentPanel.onSearch) {
            currentPanel.onSearch(searchTerm);
        }
    }

    function AuraInspector_Sidebar_OnViewComponent(globalId) {
        this.sidebar.setData(globalId);
        showSidebar();
    }

    /**  BEGIN HELP BUTTON */
    function Dropdown_OnClick(event) {
        if (this.classList.contains('is-open')) {
            hideHelp(this);
        } else {
            showHelp(this);
        }
    }

    function Body_OnClick(event) {
        var target = event.target;
        var current = target;
        while (current != null && current != current.parentNode) {
            if (current == this) {
                return;
            }
            current = current.parentNode;
        }

        hideHelp(this);
    }

    function Help_OnClick(event) {
        if (event.target.tagName === 'A') {
            event.stopPropagation();
            event.preventDefault();
            var url = event.target.getAttribute('href');
            panel.openTab(url);
        }
    }

    function Dropdown_OnKey(event) {
        if (event.keyCode) {
            if (
                event.keyCode === 27 ||
                event.keyCode === 40 ||
                event.keyCode === 9 ||
                event.keyCode === 38
            ) {
                if (this.classList.contains('is-open')) {
                    event.stopPropagation();
                    event.preventDefault();

                    if (event.keyCode === 27) {
                        //Close the menu.
                        hideHelp(this);
                        this.getElementsByClassName('trigger')[0].focus();
                    } else {
                        //Focus next item.
                        var offset = 0;
                        if (event.keyCode === 40 || event.keyCode === 9) {
                            // Down
                            offset = 1;
                        } else if (
                            event.keyCode === 38 ||
                            (event.keyCode === 9 && event.shiftKey)
                        ) {
                            // Up
                            offset = -1;
                        }
                        // var d = 0;
                        // d = (event.keyCode === 40) || (event.keyCode === 9) ? 1 : d; //down
                        // d = (event.keyCode === 38) || (event.keyCode === 9 && event.shiftKey) ? -1 : d; //up
                        if (offset != 0) {
                            var links = Array.from(this.getElementsByTagName('a'));
                            var currentIndex = links.indexOf(document.activeElement);
                            var link = links[currentIndex + offset];
                            if (link) {
                                link.focus();
                            }
                        }
                    }
                } else if (event.keyCode != 27 && event.keyCode != 9) {
                    //Open the menu if it is closed.
                    Dropdown_OnClick.call(this, event);
                }
            }
        }
    }

    function Dropdown_OnHover(event) {
        event.target.focus();
    }

    function drawHelp(helpLinks) {
        const header = document.querySelector('.header-tabs > ul');
        const li = document.createElement('li');
        li.className = "slds-tabs--default__item";
        li.title="help";
        header.appendChild(li);

        var dropdown = document.createElement('div');
        dropdown.id = 'help';
        dropdown.className = 'dropdown-trigger dropdown-trigger--click';
        dropdown.addEventListener('click', Dropdown_OnClick);
        dropdown.addEventListener('keydown', Dropdown_OnKey, false);

        var trigger = document.createElement('button');
        trigger.className = 'trigger';
        trigger.setAttribute('aria-haspopup', 'true');
        // trigger.insertAdjacentHTML(
        //     'beforeend',
        //     '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52"><path d="m28.4 38h-5c-0.8 0-1.4-0.6-1.4-1.4v-1.5c0-4.2 2.7-8 6.7-9.4 1.2-0.4 2.3-1.1 3.2-2.1 5-6 0.4-13.2-5.6-13.4-2.2-0.1-4.3 0.7-5.9 2.2-1.3 1.2-2.1 2.7-2.3 4.4-0.1 0.6-0.7 1.1-1.5 1.1h-5c-0.9 0-1.6-0.7-1.5-1.6 0.4-3.8 2.1-7.2 4.8-9.9 3.2-3 7.3-4.6 11.7-4.5 8.3 0.3 15.1 7.1 15.4 15.4 0.3 7-4 13.3-10.5 15.7-0.9 0.4-1.5 1.1-1.5 2v1.5c0 0.9-0.8 1.5-1.6 1.5z m1.6 10.5c0 0.8-0.7 1.5-1.5 1.5h-5c-0.8 0-1.5-0.7-1.5-1.5v-5c0-0.8 0.7-1.5 1.5-1.5h5c0.8 0 1.5 0.7 1.5 1.5v5z"></path></svg>'
        // );
        trigger.innerHTML = "Help";

        var label = document.createElement('span');
        label.className = 'slds-assistive-text';
        label.textContent = chrome.i18n.getMessage('tabs_help');

        trigger.appendChild(label);
        dropdown.appendChild(trigger);

        var menu = document.createElement('div');
        menu.className = 'dropdown dropdown--right';
        menu.addEventListener('click', Help_OnClick);

        var menuList = document.createElement('ul');
        menuList.className = 'dropdown__list';
        menuList.setAttribute('role', 'menu');

        var menuitem;
        var link;
        for (var c = 0; c < helpLinks.length; c++) {
            menuitem = document.createElement('li');
            menuitem.className = 'dropdown__item';
            menuitem.label = helpLinks[c].text;

            link = document.createElement('a');
            link.setAttribute('role', 'menuitem');
            link.href = helpLinks[c].href;
            link.textContent = helpLinks[c].text;
            link.addEventListener('mousemove', Dropdown_OnHover);

            menuitem.appendChild(link);
            menuList.appendChild(menuitem);
        }

        menu.appendChild(menuList);
        dropdown.appendChild(menu);
        li.appendChild(dropdown);
        header.appendChild(li);
    }

    function showHelp(dropdown) {
        document.body.addEventListener('click', Body_OnClick.bind(dropdown));
        dropdown.classList.add('is-open');
        dropdown.setAttribute('aria-expanded', 'true');
        dropdown.getElementsByTagName('a')[0].focus();
    }

    function hideHelp(dropdown) {
        document.body.removeEventListener('click', Body_OnClick.bind(dropdown));
        dropdown.classList.remove('is-open');
        dropdown.setAttribute('aria-expanded', 'false');
    }

    /** END HELP BUTTON */

    function toggleAvailableDialog() {
        // Check if Aura is present, but not the InjectedScript
        chrome.devtools.inspectedWindow.eval('!!(window.$A || window.Aura)', function(
            isAuraPresent
        ) {
            // const isAuraPresent = availability[0];
            // const isContentScriptPresent = availability[1];
            const noAuraAvailable = document.querySelector('#no-aura-available-container');
            const container = document.querySelector('#devtools-container');

            if (isAuraPresent) {
                hide(noAuraAvailable);
                show(container);
            } else {
                show(noAuraAvailable);
                hide(container);
            }
        });
    }

    function show(element) {
        if (Array.isArray(element) || element instanceof NodeList) {
            element.forEach(show);
            return;
        }
        element.classList.remove('slds-hide');
    }

    function hide(element) {
        if (Array.isArray(element) || element instanceof NodeList) {
            element.forEach(hide);
            return;
        }
        element.classList.add('slds-hide');
    }

    function showSidebar() {
        document.body.classList.add('sidebar-visible');
    }

    function hideSidebar() {
        document.body.classList.remove('sidebar-visible');
    }
}
