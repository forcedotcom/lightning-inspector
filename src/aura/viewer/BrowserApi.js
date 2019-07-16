/**
 * Interact with the Browser Extensions API
 * Abstracted so we can normalize browser API differences in the WebExtensions protocol and chrome.
 */
export default class BrowserApi {
    static eval(command) {
        return new Promise((resolve, reject) => {
            getBrowserApi().devtools.inspectedWindow.eval(command, function(returnValue, exceptionInfo) {
                if(exceptionInfo) {
                    reject(exceptionInfo);
                }
                resolve(returnValue);
            });
        });
    }
}


function getBrowserApi() {
    if(typeof browser !== "undefined") {
        return browser;
    } 
    return chrome;
}


