import Queue from '../queue';
import qs from 'qs';

const testConnectionError = res => {
  if (res === 'ConnectionError') {
    throw Error('Connection error');
  }

  return res;
};

const logError = e => {
  console.error(e);

  throw e;
};

class ViewerContentProxy {
  artifactQueues = {};

  this = new Proxy({}, {
    get: (target, method) => {
      return async(...args) => {
        if (process.env.NODE_ENV !== 'production') {
          console.debug(method);
        }

        const activeTab = await this.getActiveTab();

        return browser.runtime.sendMessage({
          tabId: activeTab.tabId,
          text: 'ContentInvoke',
          method,
          args
        }).then(testConnectionError).catch(logError);
      }
    }
  });

  buckets = new Proxy({}, {
    get: (target, method) => {
      return async(...args) => {
        if (process.env.NODE_ENV !== 'production') {
          console.debug(method);
        }

        const activeTab = await this.getActiveTab();

        return browser.runtime.sendMessage({
          tabId: activeTab.tabId,
          text: 'ContentBucketsInvoke',
          method,
          args
        }).then(testConnectionError).catch(logError);
      }
    }
  });

  _buckets = {};

  bucket(bucket = 'active') {
    if (this._buckets[bucket]) {
      return this._buckets[bucket];
    }
    return this._buckets[bucket] = new Proxy({}, {
      get: (target, method) => {
        if (process.env.NODE_ENV !== 'production') {
          console.debug(method);
        }

        return async(...args) => {
          const activeTab = await this.getActiveTab();

          return browser.runtime.sendMessage({
            tabId: activeTab.tabId,
            text: 'ContentCollectorInvoke',
            bucket,
            method,
            args
          }).then(testConnectionError).catch(logError);
        }
      }
    });
  };

  _gatherers = {};

  gatherer(namespace, { bucket = 'active', def } = {}) {
    const proxyKey = [namespace, bucket, JSON.stringify(def)].join('');

    if (this._gatherers[proxyKey]) {
      return this._gatherers[proxyKey];
    }

    return this._gatherers[proxyKey] = new Proxy({}, {
      get: (target, method) => {
        if (process.env.NODE_ENV !== 'production') {
          console.debug(method);
        }

        return async(...args) => {
          const activeTab = await this.getActiveTab();

          if (bucket) {
            const name = method + '-' + JSON.stringify(args);
            return new Promise((resolve, reject) => {
              let artifactQueue = this.artifactQueues[name];

              if (!artifactQueue) {
                artifactQueue = this.artifactQueues[name] = new Queue();
              }

              artifactQueue.add(
                () => browser.runtime.sendMessage({
                  tabId: activeTab.tabId,
                  text: 'GathererInvokeAndCollect',
                  namespace,
                  method,
                  args,
                  bucket,
                  def
                }).then(testConnectionError)
                             .then(resolve)
                             .catch(logError)
                             .catch(reject)
              );
            });
          }

          return browser.runtime.sendMessage({
            tabId: activeTab.tabId,
            text: 'GathererInvoke',
            namespace,
            method,
            args,
            bucket
          }).then(testConnectionError).catch(logError);
        }
      }
    })
  }

  getActiveTab() {
    return this._activeTab;
  }

  _activeTab = this._fetchActiveTab();

  async _fetchActiveTab() {
    try {
      const activeTab = JSON.parse(qs.parse(window.location.search.substring(1)).activeTab);

      if (activeTab.title != null) {
        document.title = `(EPT) ${activeTab.title}`;

        return activeTab;
      }
    } catch (e) {
      // ignore
    }

    if (
      browser.devtools != null &&
      browser.devtools.inspectedWindow != null &&
      browser.devtools.inspectedWindow.tabId &&
      typeof browser.devtools.inspectedWindow.eval === 'function'
    ) {
      return new Promise((resolve, reject) => {
        const tabId = browser.devtools.inspectedWindow.tabId;

        // TODO make into promise
        browser.devtools.inspectedWindow.eval('window.location', (location, isException) => {
          if (isException) {
            reject('eval(window.location) fail');
            return;
          }

          browser.devtools.inspectedWindow.eval('document.title', (title, isException) => {
            if (isException) {
              reject('eval(document.title) fail');
              return;
            }

            resolve({ ...location, tabId, tabURL: location.href, title });
          });
        });
      })
    }

    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    const a = document.createElement('a');
    a.href = activeTab.url;

    return {
      ...activeTab,
      tabId: activeTab.id,
      tabURL: activeTab.url,
      title: activeTab.title,
      hostname: a.hostname
    };
  }
}

if (!window.ContentProxy) {
  window.ContentProxy = new ViewerContentProxy();
}


export default window.ContentProxy;
