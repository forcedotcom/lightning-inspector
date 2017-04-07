export default class Collector {
  constructor() {
    this.collected = {};
    this.status = {};
    this.frozen = false;

    this.invalidate();
  }

  freeze() {
    this.frozen = true;
  }

  unfreeze() {
    this.frozen = false;
  }

  isFrozen() {
    return this.frozen;
  }

  getTime() {
    return this.time;
  }

  invalidate() {
    this.time = Date.now();
  }

  valid(name) {
    if (this.frozen) {
      return true;
    }

    const valid = this.status[name] === this.time;

    if (!valid) {
      this.status[name] = this.time;
      return false;
    }

    return true;
  }

  set(name, data) {
    return this.collected[name] = data;
  }

  get(name, def) {
    return this.collected[name] != null ? this.collected[name] : def;
  }

  push(name, data) {
    if (!this.collected[name]) {
      return this.set(name, data);
    }

    return this.collected[name] = this.collected[name].concat(data);
  }

  isEmpty() {
    return Object.keys(this.collected).length === 0 && Object.keys(this.status).length === 0;
  }
}
