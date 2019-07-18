//chrome.devtools.inspectedWindow.eval("!!window[Symbol.for('AuraDevTools')] && !!window.$A", function(isAuraPresent){
import BrowserApi from './aura/viewer/BrowserApi.js';

// Detect if we are inspecting anything other than a DevTools Window
chrome.devtools.inspectedWindow.eval('location.protocol', loadDevtools);

function loadDevtools(protocol) {
    var isDevTools = protocol === 'chrome-devtools:';

    // So we don't include Aura when inspecting an Inspector
    if (!isDevTools) {
        chrome.devtools.panels.create(
            chrome.i18n.getMessage('devtools_tabname'),
            'icon24.png',
            'viewerPanel.html',
            function(/*ExtensionPanel*/ panel) {
                // Test button, not sure what to do with this.
                // var button = panel.createStatusBarButton("images/icon24.png", "Test", false);
                // button.onClicked.addListener(function(){
                //     alert("Clicked");
                // });
                //
                // Implement Search!
                panel.onSearch.addListener(function(action, queryString) {
                    // TODO: Abstract the Symbol.for() stuff?
                    // Maybe just InjectedScript.search(); ?
                    BrowserApi.eval(
                        `window[Symbol.for('AuraDevTools')].Inspector.search('${action}', '${queryString}')`
                    );
                });
            }
        );

        chrome.devtools.panels.elements.createSidebarPane(
            chrome.i18n.getMessage('devtools_tabname'),
            function(sidebar) {
                sidebar.setPage('viewerSidebar.html');
            }
        );

        chrome.devtools.panels.elements.onSelectionChanged.addListener(function() {
            BrowserApi.eval(
                "window.$A && this.$0 && $0.getAttribute && $0.getAttribute('data-aura-rendered-by')"
            ).then(function(globalId) {
                if (globalId) {
                    // Need to include undefined at the end, or devtools can't handle it internally.
                    // You'll see this error.
                    // "Extension server error: Inspector protocol error: Object has too long reference chain(must not be longer than 1000)"
                    var command = "$auraTemp = $A.getCmp('" + globalId + "'); undefined;";
                    BrowserApi.eval(command);
                }
            });
        });
    }
}
