import LabelData from "../../../_locales/en/messages.json";

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
