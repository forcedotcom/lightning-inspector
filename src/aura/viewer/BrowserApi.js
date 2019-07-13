/**
 * Interact with the Browser Extensions API
 * Abstracted so we can normalize browser API differences in the WebExtensions protocol and chrome.
 */
import stripJsonComments from "strip-json-comments";
import fs from "fs";


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

    static getLabel(key) {
        if(!labels.hasOwnProperty(key)) {
            return `[${key}]`;
        }

        return labels[key].message;
    }
}


function getBrowserApi() {
    if(typeof browser !== "undefined") {
        return browser;
    } 
    return chrome;
}

const json = stripJsonComments(fs.readFileSync('_locales/en/messages.json', 'utf8')); 
const labels = JSON.parse(json);