import BrowserApi from './viewer/BrowserApi.js';
import JsonSerializer from './JsonSerializer.js';
import DevToolsEncodedId from './DevToolsEncodedId.js';

export default class $Aura {
    static Inspector = {
        async getComponent(globalId, options) {
            const componentId = DevToolsEncodedId.getCleanId(globalId);
            const configuration = JSON.stringify(options || {});
            const cmd = `window[Symbol.for('AuraDevTools')].Inspector.getComponent('${globalId}', ${configuration})`;
            const componentJSON = await BrowserApi.eval(cmd);

            return JsonSerializer.parse(componentJSON);
        },

        async publish(key, data) {
            const command = `window[Symbol.for('AuraDevTools')].Inspector.publish("${key}", ${JSON.stringify(
                data
            )})`;
            BrowserApi.eval(command);
        }
    };
}
