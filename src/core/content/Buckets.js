import Collector from './Collector';

export default class Buckets {
  constructor() {
    this.buckets = {};
    this.counter = 0;

    this.next();
  }

  names() {
    return Object.keys(this.buckets);
  }

  active() {
    return this.get(this.counter);
  }

  next() {
    this.get(++this.counter);

    return this.counter;
  }

  clear() {
    this.buckets = {};
    this.counter = 0;

    this.next();
  }

  get(name) {
    if (this.buckets[name] == null) {
      this.buckets[name] = new Collector();
    }

    return this.buckets[name];
  }

  import(next) {
    Object.assign(this, next);

    for (const name in this.buckets) {
      if (!this.buckets.hasOwnProperty(name)) {
        continue;
      }

      this.buckets[name] = Object.assign(new Collector(), this.buckets[name]);
    }
  }

  export() {
    return Object.assign({}, this);
  }
}
