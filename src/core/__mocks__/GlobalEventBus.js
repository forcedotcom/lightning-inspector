/**
 * Mocks the GlobalEventBus to fire publish and subscribe calls right in the context, vs using a postMessage in
 * the parent window.
 */

const PUBLISH_KEY = "AuraInspector:publish";

export default class GlobalEventBus {

    /**
     * Broadcast a message to a listener at any level in the inspector. Including, the InjectedScript, the ContentScript or the DevToolsPanel object.
     *
     * @param  {String} key MessageID to broadcast.
     * @param  {Object} data any type of data to pass to the subscribe method.
     */
    static publish(key, data) {
        if(!key) { return; }
        // const PUBLISH_BATCH_KEY = "AuraInspector:publishbatch";
        // const BOOTSTRAP_KEY = "AuraInspector:bootstrap";

        const subscribers = GlobalEventBus.subscribers;
        const jsonData = JSON.stringify(data);
        this.callSubscribers(key, data);
    }

    /**
     * Listen for a published message through the system.
     *
     * @param  {String} key Unique MessageId that would be broadcast through the system.
     * @param  {Function} callback function to be executed when the message is published.
     */
    static subscribe(key, callback) {
        const subscribers = GlobalEventBus.subscribers;
        if(!subscribers.has(key)) {
            subscribers.set(key, []);
        }

        subscribers.get(key).push(callback);
    }

    /**
     * Call everyone who is listening for this subscriber.
     */
    static callSubscribers(key, data) {
        const subscribers = GlobalEventBus.subscribers;

        if(subscribers.has(key)) {
            subscribers.get(key).forEach(function(callback){
                try {
                    callback(data);
                } catch(e) {
                    console.error("Key: ", key, " resulted in error ", e);
                }
            });
        }
    }
}

GlobalEventBus.subscribers = new Map();