import Buckets from './Buckets';
import { postMessage, onMessage } from '../message/DOMMessage';
import injectScriptByText from '../injectScriptByText';
import { sync, local } from '../../core/storage';

if (process.env.NODE_ENV !== 'production') {
    String.prototype.color = function(color) {
        return [`color:${color}`, this, 'color:inherit'];
    };
}

const WHITELIST = /(\.cmp|\.app|\.force\.com|\.salesforce\.com|\/s\/)/g;

export default class Content {
    buckets = new Buckets();
    valid = {};

    syncStorage = {};
    localStorage = {};
    processors = [];

    constructor(namespaces, processors) {
        this.namespaces = namespaces;
        this.processors = processors;

        Promise.all([sync.get(this.namespaces), local.get(this.namespaces)]).then(
            ([syncStorage, localStorage]) => {
                this.syncStorage = syncStorage;
                this.localStorage = localStorage;

                if (process.env.NODE_ENV !== 'production') {
                    console.info('Content script loaded');
                }

                if (
                    WHITELIST.test(window.location.pathname) ||
                    /forceGatherers/.test(window.location.search)
                ) {
                    if (!this.syncStorage.default.disablePlugin) {
                        if (process.env.NODE_ENV !== 'production') {
                            console.log('Injecting gatherers');
                        }

                        this.performSyncStorageAndScriptInjection();

                        if (process.env.NODE_ENV !== 'production') {
                            console.log('Injecting storage.local', localStorage);
                        }

                        this.performLocalStorageInjection();
                    }
                }
            }
        );

        this.initViewerListeners();
        this.initInjectionListeners();
    }

    // TODO switch to Set
    setSupported(namespace, value) {
        const valid = this.valid;

        valid[namespace] = value;

        valid['*'] = false;

        for (const k in valid) {
            if (valid[k]) {
                valid['*'] = true;
                break;
            }
        }
    }

    isSupported(namespace) {
        return this.valid[namespace] ? this.valid[namespace] : false;
    }

    getInjectedSyncStorage() {
        return this.syncStorage;
    }

    reload() {
        window.location.reload();
    }

    fetch(url, { method = 'GET', headers = {}, timeout = 600 } = {}) {
        const xhr = new XMLHttpRequest();

        xhr.withCredentials = true;
        xhr.open(method, url, true);
        xhr.responseType = 'arraybuffer';
        xhr.timeout = timeout;

        for (const header in headers) {
            xhr.setRequestHeader(header, headers[header]);
        }

        return new Promise(resolve => {
            xhr.onreadystatechange = () => {
                try {
                    if (xhr.readyState == XMLHttpRequest.DONE) {
                        if (200 <= xhr.status && xhr.status < 300) {
                            resolve({
                                body: Array.from(new Uint8Array(xhr.response)),
                                headers: xhr.getAllResponseHeaders()
                            });
                        } else {
                            resolve({ error: true });
                        }
                    }
                } catch (e) {
                    console.error(e);
                    resolve({ error: true });
                }
            };

            xhr.ontimeout = function(e) {
                console.error(`Timeout ${url}`, e);
                resolve({ error: 'timeout' });
            };

            xhr.send();
        });
    }

    setSyncStorage(namespace, key, value) {
        return sync.set(namespace, key, value);
    }

    setLocalStorage(namespace, key, value) {
        return local.set(namespace, key, value);
    }

    getInjectedLocalStorage() {
        return this.localStorage;
    }

    _handleMessage(message, sender, respond) {
        if (process.env.NODE_ENV !== 'production') {
            const propByText = {
                ContentInvoke: 'this',
                ContentCollectorInvoke: 'this.collector',
                ContentBucketsInvoke: 'this.buckets'
            };

            console.log(
                '%c%s%c@%c%s%c.%c%s%c(%s) bucket:%c%s%c text:%c%s%c (active → bucket:%c%s%c collector:%c%s%c)',
                ...String(sender).color('#BCA3A3'),
                ...String(propByText[message.text] || message.namespace).color('#F92672'),
                ...String(message.method).color('#BCA3A3'),
                (message.args || []).join(','),
                ...String(
                    !message.bucket || message.bucket === 'active'
                        ? this.buckets.counter
                        : message.bucket
                ).color('#AE81FF'),
                ...String(message.text).color('#E6DB74'),
                ...String(this.buckets.counter).color('#AE81FF'),
                ...String(this.buckets.active().getTime()).color('#A6E22E')
            );
        }

        if (message.text === 'ContentInvoke') {
            const { args = [], method } = message;
            const response = this[method](...args);

            Promise.resolve(response)
                .then(respond)
                .catch(e => console.error(e));
        } else if (message.text === 'ContentCollectorInvoke') {
            const { args = [], method, bucket } = message;
            const collector =
                !bucket || bucket === 'active' ? this.buckets.active() : this.buckets.get(bucket);
            const response = collector[method](...args);

            Promise.resolve(response)
                .then(respond)
                .catch(e => console.error(e));
        } else if (message.text === 'ContentBucketsInvoke') {
            const { args = [], method } = message;
            const buckets = this.buckets;
            const response = buckets[method](...args);

            Promise.resolve(response)
                .then(respond)
                .catch(e => console.error(e));
        } else if (message.text === 'GathererInvoke') {
            let { namespace, method, args, def } = message;

            if (this.valid[namespace] === true) {
                postMessage('GathererInvoke', { namespace, method, args }, payload => {
                    payload = typeof payload !== 'undefined' ? JSON.parse(payload) : payload;
                    respond(payload == null ? def : payload);
                });
            } else {
                respond(def);
            }

            // TODO remove InvokeAndCollect with just Invoke; and use generic post processors Content rather than Collector
        } else if (message.text === 'GathererInvokeAndCollect') {
            const { namespace, method, args, def = [], bucket } = message;
            const collectorKey = ['gatherer', namespace, method, JSON.stringify(args)].join('-');
            const collector =
                !bucket || bucket === 'active' ? this.buckets.active() : this.buckets.get(bucket);

            if (collector.valid(collectorKey)) {
                return respond(collector.get(collectorKey, def));
            }

            if (this.valid[namespace] === true) {
                postMessage('GathererInvoke', { namespace, method, args }, payload => {
                    let {
                        data,
                        collectMethod = 'set',
                        collected,
                        processor: processorName
                    } = JSON.parse(payload);

                    if (Array.isArray(data)) {
                        data = data.map(a => {
                            if (typeof a === 'object') {
                                return a;
                            }

                            // TODO make into separate function
                            try {
                                return JSON.parse(a.substring(a.indexOf(';') + 1));
                            } catch (e) {
                                console.error(e);
                                console.error(a);
                                return {};
                            }
                        });
                    }

                    if (processorName) {
                        for (const processor of this.processors) {
                            if (processor.name === processorName) {
                                data = processor.process(data);
                                break;
                            }
                        }
                    }

                    Promise.resolve(data).then(data => {
                        if (collected) {
                            respond(collector[collectMethod](collectorKey, data));
                        } else {
                            respond(data == null ? def : data);
                        }
                    });
                });
            } else {
                respond(def);
            }
        }

        return true;
    }

    initViewerListeners() {
        browser.runtime.onMessage.addListener((message, sender, respond) =>
            this._handleMessage(message, 'viewer', respond)
        );
    }

    initInjectionListeners() {
        onMessage('InjectionSupport', ({ namespace, supported }) =>
            this.setSupported(namespace, supported)
        );
        onMessage('ContentDirect', (message, respond) =>
            this._handleMessage(message, 'injector', respond)
        );
    }

    performSyncStorageAndScriptInjection() {
        injectScriptByText(`
      window.__injection_sync_storage__ = ${JSON.stringify(this.syncStorage)}; 
      window.__injection_local_storage__ = window.__injection_local_storage__ || {};
    `);

        injectScriptByText(window.scriptLoader.getScript('gatherer').source);
    }

    performLocalStorageInjection() {
        injectScriptByText(`
       window.__injection_local_storage__ = window.__injection_local_storage__ ?
          Object.assign(window.__injection_local_storage__, ${JSON.stringify(
              this.localStorage
          )}) : {};
    `);
    }
}
