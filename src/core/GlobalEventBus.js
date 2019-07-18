import BrowserApi from '../aura/viewer/BrowserApi.js';

export const PUBLISH_KEY = 'AuraInspector:publish';
export const PUBLISH_BATCH_KEY = 'AuraInspector:publishbatch';
export const BOOTSTRAP_KEY = 'AuraInspector:bootstrap';

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
 * AuraInspector:UpdatedStorageData             Aura Storage Service has async fetched data to show in the storage panel.
 * AuraInspector:RemoveStorageData              Remove stored response for the action we would like to drop next time we see it
 * AuraInspector:ShowComponentInTree            Indicates you want to show the specified globalID in the component tree.
 * AuraInspector:OnClientActionStart            We started executing the handler for a controller action.
 * AuraInspector:OnClientActionEnd              Controller Action finished execution.
 * AuraInspector:OnDescriptorSelect             A descriptor was clicked on, we may want to take some action here such as showing a panel that has more information.
 * AuraInspector:OnInjectionScriptInitialized   The AuraInspectorInjectionScript has been injected and initialized. (Usable by external plugins to know when they can wire into the script on the hosted page.)
 * AuraInspector:OnActionStateChange            When an action is enqueued, fired, running we fire this message with the current status of the action. Includes just changed data on the action that we care about.
 * AuraInspector:ShowLoading                    Show the Loading indicator in the Lightning Inspector Panel. (The parameter passed to the ShowLoading is used as a trace key. Use it for Show and Hide so we know what to stop tracking.)
 * AuraInspector:hideLoading                    Hide the Loading indicator for the Lightning Inspector Panel
 * AuraInspector:OnError                        An Error occured somewhere. First parameter is the error message.

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
export default class GlobalEventBus {
    constructor() {
        this._subscribers = new Map();
    }

    publish(key, data) {
        if (!key) {
            return;
        }
        const PUBLISH_KEY = 'AuraInspector:publish';

        const jsonData = JSON.stringify(data);
        const command = `
            window.postMessage({
                "action": "${PUBLISH_KEY}",
                "key": "${key}",
                "data": ${jsonData}
            }, window.location.href);
        `;

        BrowserApi.eval(command);
        this.callSubscribers(key, data);
    }

    subscribe(key, callback) {
        const subscribers = this._subscribers;
        if (!subscribers.has(key)) {
            subscribers.set(key, []);
        }

        subscribers.get(key).push(callback);
    }

    unsubscribe(key, callback) {
        const subscribers = this._subscribers;
        if (!subscribers.has(key)) {
            return;
        }
        const index = subscribers.get(key).indexOf(callback);
        if (index !== -1) {
            subscribers.get(key).splice(index, 1);
        }
    }

    callSubscribers(key, data) {
        const subscribers = this._subscribers;
        //console.log("GlobalEventBus:callSubscribers", key, data);
        if (subscribers.has(key)) {
            subscribers.get(key).forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    console.error('Key: ', key, ' resulted in error ', e);
                }
            });
        }
    }

    /**
     * Broadcast a message to a listener at any level in the inspector. Including, the InjectedScript, the ContentScript or the DevToolsPanel object.
     *
     * @param  {String} key MessageID to broadcast.
     * @param  {Object} data any type of data to pass to the subscribe method.
     */
    static publish(key, data) {
        return globalDefaultBus.publish(key, data);
    }

    /**
     * Listen for a published message through the system.
     *
     * @param  {String} key Unique MessageId that would be broadcast through the system.
     * @param  {Function} callback function to be executed when the message is published.
     */
    static subscribe(key, callback) {
        return globalDefaultBus.subscribe(key, callback);
    }

    /**
     * NEEDS DOC
     */
    static callSubscribers(key, data) {
        return globalDefaultBus.callSubscribers(key, data);
    }
}

// By default, uses the global version
// Yes I realize this is kinda messy.
const globalDefaultBus = new GlobalEventBus();
