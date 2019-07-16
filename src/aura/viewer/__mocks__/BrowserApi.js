import stripJsonComments from "strip-json-comments";
import fs from "fs";

export default class BrowserApi {
    static async eval(command, callback) {
        if(typeof callback === "function") {
            callback(command);
        }
    }

    static getLabel(key) {
        if(!labels.hasOwnProperty(key)) {
            return `[${key}]`;
        }

        return labels[key].message;
    }
}

const json = stripJsonComments(fs.readFileSync('_locales/en/messages.json', 'utf8')); 
const labels = JSON.parse(json);