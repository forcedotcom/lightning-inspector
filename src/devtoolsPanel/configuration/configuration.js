import configuration from '../../../configuration.json';

export default class Configuration {
    /**
     * Returns the contents of the configuration.json file as JSON.
     */
    static async getApplicationConfiguration() {
        const response = await fetch(chrome.extension.getURL('configuration.json'), {
            method: 'get'
        });
        return await response.json();
    }

    /**
     * Get the configuration for the help dropdown.
     * Returns a collection of objects in the format
     * [
     *  {title, href},
     *  {title, href}
     * ]
     *
     * @returns An array of help topics
     */
    static getApplicationHelpConfiguration() {
        if (Array.isArray(configuration.help)) {
            return configuration.help;
        }
        return [];
    }
}
