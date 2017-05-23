export default class SnapshotStore {
  static set = async function (key, value) {
    await browser.storage.local.set({ [String(key)]: value });
  };

  static get = async function (key) {
    const data = await browser.storage.local.get(key == null ? null : { [String(key)]: null });
    return key == null ? data : data[String(key)];
  };

  static has = async function (key) {
    const sentinel = Date.now() + '' + Math.random();
    const data = await browser.storage.local.get({ [String(key)]: sentinel });
    return data[String(key)] !== sentinel;
  };

  static remove = async function (key) {
    await browser.storage.local.remove(key);
  };

  constructor(namespace = 'snapshot') {
    this.namespace = namespace;
  }

  async alias(key, alias) {
    if (arguments.length === 2) {
      await SnapshotStore.set(this.namespace + 'alias-' + key, alias);
    }

    return await SnapshotStore.get(this.namespace + 'alias-' + key);
  }

  async add(data) {
    let count = 0;
    while (++count) {
      if (await this.has(count)) {
        continue;
      }

      try {
        await SnapshotStore.set(this.namespace + 'data-' + count, JSON.stringify(data));
        return count;
      } catch (e) {
        if (e instanceof DOMException) {
          alert('Exceeded the storage quota. Please delete some snapshots before attempting to take another');
        }

        throw e;
      }
    }
  }

  async _findId(key) {
    const id = [`${this.namespace + 'data'}-${key}`];

    if (await SnapshotStore.has(id)) {
      return id;
    }
  }

  async has(key) {
    return !!(await this._findId(key));
  }

  async get(key) {
    try {
      let id = await this._findId(key);
      let data = await SnapshotStore.get(id);

      return JSON.parse(data) || [];
    } catch (e) {
      return null;
    }
  }


  async delete(key) {
    let id = await this._findId(key);

    if (id) {
      await SnapshotStore.remove(id);
      await SnapshotStore.remove(this.namespace + 'alias-' + key);
    }
  }

  async keys() {
    let keys = [];
    try {
      let data = await SnapshotStore.get(null);
      for (let key in data) {
        if (key.indexOf(this.namespace + 'data') === 0) {
          keys.push(key.substring(key.indexOf('-') + 1));
        }
      }
    } catch (e) {
      // ignore
    }

    return keys;
  }
}