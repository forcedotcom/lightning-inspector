import setImmediate from './setImmediate';
import { postMessage, onMessage } from '../message/DOMMessage';
import getParam from './getParam';
import JSONfn from 'json-fn';
import Storage from '../storage';

window.__injection_sync_storage__ = window.__injection_sync_storage__ || {};
window.__injection_local_storage__ = window.__injection_local_storage__ || {};

if (window.location.search.indexOf('syncStorage=') > -1) {
  try {
    const syncStorage = window.__injection_sync_storage__;
    const urlSyncStorage = JSON.parse(decodeURIComponent(getParam('syncStorage', window.location.href)));
    for (const namespace of urlSyncStorage) {
      syncStorage[namespace] = Object.assign(syncStorage[namespace] || {}, urlSyncStorage[namespace]);
    }
  } catch (e) {
    // ignore
  }
}

if (window.location.search.indexOf('localStorage=') > -1) {
  try {
    const localStorage = window.__injection_local_storage__;
    const urlLocalStorage = JSON.parse(decodeURIComponent(getParam('localStorage', window.location.href)));
    for (const namespace of urlLocalStorage) {
      localStorage[namespace] = Object.assign(localStorage[namespace] || {}, urlLocalStorage[namespace]);
    }
  } catch (e) {
    // ignore
  }
}

export default class Gatherer {
  static MARK_BUFFER_SIZE = 100000;

  namespace = null;
  marks = new Array(Gatherer.MARK_BUFFER_SIZE);
  marksIdx = 0;
  marksLength = Gatherer.MARK_BUFFER_SIZE;
  datastore = [];
  cycle = 0;
  cycleInitiatorEvent = null;
  cycleStarted = false;
  markOptions = {};
  storeOptions = {};
  artifacts = {};

  static injectors = {};
  static ready = false;

  constructor(namespace) {
    this.namespace = namespace;

    Gatherer.init(this);
  }

  purge() {
    this.nextCycle();
    this.marks = new Array(Gatherer.MARK_BUFFER_SIZE);
    this.marksIdx = 0;
    this.cycleInitiatorEvent = null;
    this.cycleStarted = false;
    this.datastore = [];
    this.marksLength = Gatherer.MARK_BUFFER_SIZE;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`Purged gatherer: ${this.namespace}`);
    }
  }

  getArtifactNames() {
    return Object.keys(this.artifacts);
  }

  registerArtifact(name, func, options) {
    this.artifacts[name] = { name, func, options };
  }

  getArtifact(name) {
    if (this.artifacts[name]) {
      const artifact = this.artifacts[name];
      const data = artifact.func();

      if (data instanceof Promise) {
        return data.then(data => ({ ...artifact.options, data, collected: true }));
      }

      return { ...artifact.options, data, collected: true };
    }

    console.error('Could not find artifact:' + name);

    return { data: [] };
  }

  markStart(event, id) {
    const { markOptions } = this;
    const { collect, timeline, log, cycle, start } =  markOptions[event];

    if (cycle) {
      this.cycleStart(event);
    }

    if (start) {
      if (collect) {
        const { marks, marksLength } = this;

        if (this.marksIdx === marksLength) {
          this.marksLength = marks.length += Gatherer.MARK_BUFFER_SIZE;
        }

        marks[this.marksIdx++] =
          `${event};{"event":"${event}","cycle":"${this.cycle}","namespace":"${this.namespace}","id":"${event + id}","ts":${((performance.now() * 1000) >> 0) / 1000},"type":"start"}`;
      }

      if (timeline) {
        performance.mark(`s${event + id}`);
      }

      if (log) {

      }
    }
  }

  markEnd(event, id, name) {
    const { markOptions } = this;
    const { collect, timeline, log, cycle } =  markOptions[event];

    if (collect) {
      const { marks, marksLength } = this;

      if (this.marksIdx === marksLength) {
        this.marksLength = marks.length += Gatherer.MARK_BUFFER_SIZE;
      }

      marks[this.marksIdx++] =
        `${event};{"event":"${event}","cycle":"${this.cycle}","name":"${name}","namespace":"${this.namespace}","id":"${event + id}","ts":${((performance.now() * 1000) >> 0) / 1000},"type":"end"}`;
    }

    if (timeline) {
      performance.mark(`e${event + id}`);
      Gatherer.performanceMeasure(`${name} (${event})`, `s${event + id}`, `e${event + id}`);
    }

    if (log) {

    }

    if (cycle) {
      this.cycleStart(event);
    }
  }

  markEndWithContext(event, id, name, context) {
    const { markOptions } = this;
    const { collect, timeline, log, cycle } =  markOptions[event];

    if (collect) {
      const { marks, marksLength } = this;

      if (this.marksIdx === marksLength) {
        this.marksLength = marks.length += Gatherer.MARK_BUFFER_SIZE;
      }

      if (typeof context === 'object') {
        marks[this.marksIdx++] =
          `${event};{"event":"${event}","cycle":"${this.cycle}","name":"${name}","namespace":"${this.namespace}","id":"${event + id}","ts":${((performance.now() * 1000) >> 0) / 1000},"context":${JSON.stringify(context)},"type":"end"}`;
      } else {
        marks[this.marksIdx++] =
          `${event};{"event":"${event}","cycle":"${this.cycle}","name":"${name}","namespace":"${this.namespace}","id":"${event + id}","ts":${((performance.now() * 1000) >> 0) / 1000},"context":"${context}","type":"end"}`;
      }
    }

    if (timeline) {
      performance.mark(`e${event + id}`);
      Gatherer.performanceMeasure(`${name} (${event})`, `s${event + id}`, `e${event + id}`);
    }

    if (log) {

    }

    if (cycle) {
      this.cycleStart(event);
    }
  }

  mark(event, id, name) {
    const { markOptions } = this;
    const { collect, timeline, log, cycle } =  markOptions[event];

    if (collect) {
      const { marks, marksLength } = this;

      if (this.marksIdx === marksLength) {
        this.marksLength = marks.length += Gatherer.MARK_BUFFER_SIZE;
      }

      marks[this.marksIdx++] =
        `${event};{"event":"${event}","cycle":"${this.cycle}","namespace":"${this.namespace}","id":"${event + id}","ts":${((performance.now() * 1000) >> 0) / 1000},"type":"stamp"}`;
    }

    if (cycle) {
      this.cycleStart(event);
    }

    if (timeline) {
      performance.mark(`s${event + id}`);
      performance.mark(`e${event + id}`);
      Gatherer.performanceMeasure(`${name} (${event})`, `s${event + id}`, `e${event + id}`);
    }

    if (log) {

    }
  }

  markWithContext(event, id, name, context) {
    const { markOptions } = this;
    const { collect, timeline, log, cycle } =  markOptions[event];

    if (collect) {
      const { marks, marksLength } = this;

      if (this.marksIdx === marksLength) {
        this.marksLength = marks.length += Gatherer.MARK_BUFFER_SIZE;
      }

      marks[this.marksIdx++] =
        `${event};{"event":"${event}","cycle":"${this.cycle}","namespace":"${this.namespace}","id":"${event + id}","ts":${((performance.now() * 1000) >> 0) / 1000},"context":"${context}","type":"stamp"}`;
    }

    if (cycle) {
      this.cycleStart(event);
    }

    if (timeline) {
      performance.mark(`s${event + id}`);
      performance.mark(`e${event + id}`);
      Gatherer.performanceMeasure(`${name} (${event})`, `s${event + id}`, `e${event + id}`);
    }

    if (log) {

    }
  }

  store(event, context) {
    if (typeof data === 'string') {
      this.datastore.push(`${event};{"event":"${event}","namespace":"${this.namespace}","context":"${context}","cycle":${this.cycle}}`);
    } else {
      this.datastore.push({ event, namespace: this.namespace, cycle: this.cycle, context });
    }
  }

  stored(...events) {
    const { datastore } = this;

    let data;
    let match = Gatherer.getMatcher(events);

    data = datastore.filter(a => !!a);
    data = data.filter(a => match(a));
    // data = data.map(a => typeof a === 'object' ? a : JSON.parse(a.substring(a.indexOf(';') + 1)));

    const nextDatastore = datastore.filter(a => !match(a));

    datastore.length = 0; // clear memory

    this.datastore = nextDatastore;

    return data;
  }

  marked(...events) {
    const { marks } = this;

    let data;
    let match = Gatherer.getMatcher(events);

    data = marks.filter(a => !!a);
    data = data.filter(a => match(a));
    // data = data.map(a => typeof a === 'object' ? a : JSON.parse(a.substring(a.indexOf(';') + 1)));

    const remainingMarks = marks.filter(a => !match(a));

    marks.length = 0; // clear memory

    this.marks = remainingMarks;
    this.marksIdx = remainingMarks.length;
    this.marksLength = remainingMarks.length;

    return data;
  }

  cycleStart(initiatorEvent) {
    if (this.cycleStarted === false) {
      this.markStart('cycle', this.cycle);
      setImmediate(() => this.cycleEnd());
      this.cycleInitiatorEvent = initiatorEvent;
      this.cycleStarted = true;
    }
  }

  cycleEnd() {
    if (this.cycleStarted === true) {
      this.markEndWithContext('cycle', this.cycle, this.cycle, `initiatorEvent=${this.cycleInitiatorEvent}`);
      this.cycle++;
      this.cycleStarted = false;
      this.cycleInitiatorEvent = null;
    }
  }

  nextCycle() {
    this.cycleEnd();
  }

  static init(injector) {
    if (Gatherer.injectors[injector.namespace]) {
      throw Error('Namespace already registered');
    }

    Gatherer.injectors[injector.namespace] = injector;

    if (!Gatherer.ready) {
      Gatherer.initContentListeners();

      Gatherer.ready = true;
    }
  }

  static initContentListeners() {
    onMessage('GathererInvoke', (payload, respond) => {
      try {
        const { namespace, method, args } = payload;

        if (namespace === 'static') {
          const response = Gatherer[method].apply(null, args);

          Promise.resolve(response).then(data => respond(JSONfn.stringify(data)));
        } else if (namespace === '*') {
          const responses = [];

          const injectors = Gatherer.injectors;
          for (const _namespace in injectors) {
            const injector = injectors[_namespace];
            responses.push(injector[method](...args));
          }

          Promise.all(responses.map(response => Promise.resolve(response)))
                 .then(data => respond(JSONfn.stringify(data)));
        } else {
          const injector = Gatherer.injectors[namespace];
          const response = injector[method].apply(injector, args);

          Promise.resolve(response).then(data => respond(JSONfn.stringify(data)));
        }
      } catch (e) {
        console.error(payload);
        console.error(e);
      }
    });
  }

  static getMatcher(events) {
    return a => typeof a === 'object' ? events.includes(a.event) : events.includes(a.substring(0, a.indexOf(';')));
  };

  static oneOf(...options) {
    for (const option of options) {
      for (const key in option) {
        if (key === 'log' || key === 'start' || key === 'end') {
          continue;
        }

        if (option[key]) {
          return true;
        }
      }
    }

    return false;
  }

  static setSupported(namespace, supported) {
    // use postMessage for performance
    postMessage('InjectionSupport', { namespace, supported });
  }

  static performanceMeasure = (name, start, end) => {
    try {
      performance.measure(name, start, end);
    } catch (e) {
      // ignore
    }
  };

  static storage = {
    sync: new Storage(window.__injection_sync_storage__),
    local: new Storage(window.__injection_local_storage__)
  };
}