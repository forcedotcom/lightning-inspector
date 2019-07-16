import GlobalEventBus from "../../core/GlobalEventBus.js";
import LabelData from "../../../_locales/en/messages.json";

const PUBLISH_KEY = "AuraInspector:publish";
const PUBLISH_BATCH_KEY = "AuraInspector:publishbatch";
const BOOTSTRAP_KEY = "AuraInspector:bootstrap";

/**
 * Interact with the Browser Extensions API
 * Abstracted so we can normalize browser API differences in the WebExtensions protocol and chrome.
 */
export default class BrowserApi {
    static async eval(command) {
        return new Promise((resolve, reject) => {
            if(inBrowser()) {
                try {
                    const indirectEval = eval;
                    const result = indirectEval(command);
                    resolve(result);
                } catch(e) {
                    reject(e);
                }
                return;
            }

            getBrowserApi().devtools.inspectedWindow.eval(command, function(returnValue, exceptionInfo) {
                if(exceptionInfo) {
                    reject(exceptionInfo);
                }
                resolve(returnValue);
            });
        });
    }

    static getLabel(key) {
        if(inBrowser()) {
            if(LabelData.hasOwnProperty(key)) {
                return LabelData[key].message;
            }
            return `[${key}]`;
        }
        
        const message = getBrowserApi().i18n.getMessage(key);
        if(message === undefined || message === null) {
            return `[${key}]`;
        }
        return message;
    }

    static runtime = {
        connect: (config) => {
            if(inBrowser()) {
                return {
                    onMessage: {
                        addListener: (listener) => {
                            listeners.push(listener);
                        }
                    },
                    postMessage: () => {}
                };
            }
            return chrome.runtime.connect(config);
        }
    };

    static devtools = {
        inspectedWindow: {
            get tabId() {
                if(inBrowser()) {
                    return -1;
                }
                return getBrowserApi().devtools.inspectedWindow.tabId;
            },
            eval: (command, callback) => {
                return BrowserApi.eval(command).then(callback).catch(callback);
            }
        }
    }
}

export class BrowserTestApi {
    static callListeners(data) {
        listeners.forEach((callback) => {callback(data);});
    }

    static callSubscribers(message) {        
        if(!message) { return; }
        if(message.action === "AuraInspector:bootstrap") {
            GlobalEventBus.publish("AuraInspector:OnBootstrapEnd", "DevtoolsPanel: AuraInspector:bootstrap was called.");
        } else if(message.action === PUBLISH_KEY) {
            GlobalEventBus.callSubscribers(message.key, message.data);
        } else if(message.action === PUBLISH_BATCH_KEY) {
            var data = message.data || [];
            for(var c=0,length=data.length;c<length;c++) {
                GlobalEventBus.callSubscribers(data[c].key, data[c].data);
            }
        } else {
            console.warn("BrowserTestApi:callSubscribers, unknown message:", message.action);
        }
    }
}

const listeners = [];

function getBrowserApi() {
    if(typeof browser !== "undefined") {
        return browser;
    } else if(typeof chrome !== "undefined" && chrome.devtools !== undefined) {
        return chrome;
    }

    return null;
}


function inBrowser() {
    return typeof global !== "object" && (typeof chrome === "undefined" || chrome.devtools === undefined);
}
