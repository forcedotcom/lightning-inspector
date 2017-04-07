import Queue from './queue';

export default class Storage {
  constructor(storageNamespace) {
    if (typeof storageNamespace === 'object') {
      this.storage = storageNamespace
    } else {
      this.storageNamespace = storageNamespace;
    }
  }

  queue = new Queue();

  get(namespace, key) {
    if (this.storage) {
      if (key == null) {
        if (Array.isArray(namespace)) {
          const obj = {};
          for (const n of namespace) {
            obj[n] = this.storage[namespace];
          }

          return obj;
        }

        return this.storage[namespace] || {};
      }

      return this.storage[namespace] && this.storage[namespace][key];
    }

    if (Array.isArray(namespace)) {
      const obj = {};
      for (const n of namespace) {
        obj[n] = {};
      }

      return this.queue.add(
        () => browser.storage[this.storageNamespace]
          .get(obj)
          .then(options => {
              if (key == null) {
                return options;
              }

              return options[key];
            }
          )
      );
    }

    return this.queue.add(
      () => browser.storage[this.storageNamespace]
        .get({ [namespace]: {} })
        .then(options => {
            if (key == null) {
              return options[namespace] || {};
            }

            return options[namespace][key];
          }
        )
    );
  }

  has(namespace, key) {
    if (this.storage) {
      return this.storage[namespace] && this.storage[namespace].hasOwnProperty(key);
    }

    return this.queue.add(
      () => browser.storage[this.storageNamespace]
        .get({ [namespace]: {} })
        .then(options => options[namespace].hasOwnProperty(key))
    );
  }

  set(namespace, key, value) {
    if (this.storage) {
      this.storage[namespace] = this.storage[namespace] || {};
      return this.storage[namespace][key] = value;
    }

    return this.queue.add(
      () => browser.storage[this.storageNamespace]
        .get({ [namespace]: {} })
        .then(options => {
          options[namespace][key] = value;
          return options;
        })
        .then(options => browser.storage[this.storageNamespace].set(options))
    );
  }

  remove(namespace, key) {
    if (this.storage) {
      if (this.storage[namespace]) {
        return delete this.storage[namespace][key];
      }

      return;
    }

    return this.queue.add(
      () => browser.storage[this.storageNamespace]
        .get({ [namespace]: {} })
        .then(options => {
          delete options[namespace][key];
          return options;
        })
        .then(options => browser.storage[this.storageNamespace].set(options))
    );
  }
}

if (typeof browser !== 'undefined') {
  exports.sync = new Storage('sync');
  exports.local = new Storage('local');
}

exports.from = function (obj) {
  return new Storage(obj);
};