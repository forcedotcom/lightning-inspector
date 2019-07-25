if (!window.compatReady) {
    if (typeof window.browser === 'undefined' && typeof window.chrome !== 'undefined') {
        function promisify(obj, key) {
            if (obj == null) {
                return;
            }

            const func = obj[key];

            obj[key] = function(...args) {
                const inputArgs = args;
                return new Promise((resolve, reject) => {
                    func(...args, (...args) => {
                        if (obj.lastError || chrome.runtime.lastError) {
                            if (process.env.NODE_ENV !== 'production') {
                                console.error(
                                    key,
                                    ...inputArgs,
                                    obj.lastError || chrome.runtime.lastError
                                );
                            }

                            reject(obj.lastError || chrome.runtime.lastError);
                            return;
                        }

                        resolve(...args);
                    });
                });
            };
        }

        if (chrome.storage) {
            promisify(chrome.storage.local, 'set');
            promisify(chrome.storage.local, 'get');
            promisify(chrome.storage.local, 'remove');
            promisify(chrome.storage.sync, 'set');
            promisify(chrome.storage.sync, 'get');
            promisify(chrome.storage.sync, 'remove');
        }
        if (chrome.tabs) {
            promisify(chrome.tabs, 'query');
            promisify(chrome.tabs, 'sendMessage');
            promisify(chrome.tabs, 'create');
        }
        if (chrome.runtime) {
            promisify(chrome.runtime, 'sendMessage');
        }
        if (chrome.contextMenus) {
            promisify(chrome.contextMenus, 'removeAll');
        }

        window.browser = chrome;
    }

    if (browser.storage && browser.storage.sync == null) {
        browser.storage.sync = browser.storage.local;
    }

    window.compatReady = true;
}
