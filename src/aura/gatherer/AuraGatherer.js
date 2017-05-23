import Gatherer from '../../../src/core/gatherer/Gatherer';
import safeEval from './helpers/safeEval';
import mergeWith from './helpers/mergeWith';
import getInnerBoundingClientRect from './helpers/getInnerBoundingClientRect';
import getBoundingClientRect from './helpers/getBoundingClientRect';
import getElementVisibleArea from './helpers/getElementVisibleArea';
import ContentProxy from '../../core/message/GathererContentProxy';
import * as XHRInspector from '../../core/gatherer/XHRInspector';

if (process.env.NODE_ENV !== 'production') {
  window.addEventListener('error', error => console.error(error.error || error));
}

class AuraGatherer extends Gatherer {
  auraInstance = null;
  xhrCounter = 0;
  componentCounter = 0;
  xhrCounter2 = 0;
  options = {};
  componentDefinitions = new Map();
  ignoreComponentServiceProp = null;
  syntheticPageViewCounter = 0;
  globalIndex = null;
  capturingPageActions = false;
  pageEventCount = 0;
  enqueuedActionsCounter = 0;
  filteredActions = {};
  performActionFiltering = false;
  activeTransactionsCount = 0;
  lastPurgeTime = 0;

  constructor(namespace, auraInstance) {
    super(namespace);

    const syncStorage = Gatherer.storage.sync.get(namespace);
    const localStorage = Gatherer.storage.local.get(namespace);

    this.options = Object.assign({}, syncStorage, localStorage);
    this.auraInstance = auraInstance;

    const {options, markOptions, storeOptions} = this;

    const cycleMarkOption = {
      log: options.logToConsole,
      collect: options.collectAuraCycleData | (options.timelineMode === 'external' & options.showAuraCyclesInTimeline),
      timeline: options.timelineMode === 'devtools' & options.showAuraCyclesInTimeline,
      cycle: false,
      start: true
    };

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Gatherer storage.local', localStorage);
      console.debug('Gatherer storage.sync', syncStorage);
      console.debug('Gatherer options', options);
      console.debug('Gatherer markOptions', markOptions);
      console.debug('Gatherer storeOptions', storeOptions);
    }

    Object.assign(markOptions, {
      cycle: cycleMarkOption,
      fireAction: {
        log: options.logToConsole,
        collect: options.filterActions | (options.timelineMode === 'external' & options.showActionsInTimeline),
        timeline: options.timelineMode === 'devtools' & options.showActionsInTimeline,
        cycle: Gatherer.oneOf(cycleMarkOption),
        start: true
      },
      enqueueAction: {
        log: options.logToConsole,
        collect: options.filterActions | (options.timelineMode === 'external' & options.showActionsInTimeline),
        timeline: options.timelineMode === 'devtools' & options.showActionsInTimeline,
        cycle: Gatherer.oneOf(cycleMarkOption),
        start: true
      },
      event: {
        log: options.logToConsole,
        collect: options.timelineMode === 'external' & options.showEventsInTimeline,
        timeline: options.timelineMode === 'devtools' & options.showEventsInTimeline,
        cycle: false,
        start: true
      },
      transaction: {
        log: options.logToConsole,
        collect: options.timelineMode === 'external' & options.showTransactionsInTimeine,
        timeline: options.timelineMode === 'devtools' & options.showTransactionsInTimeine,
        cycle: Gatherer.oneOf(cycleMarkOption),
        start: true
      },
      request: {
        log: options.logToConsole,
        collect: options.timelineMode === 'external' & options.showMarksInTimeline,
        timeline: options.timelineMode === 'devtools' & options.showMarksInTimeline,
        cycle: Gatherer.oneOf(cycleMarkOption),
        start: true
      },
      create: {
        log: options.logToConsole,
        collect: options.collectComponentLifeCycleData |
        (options.timelineMode === 'external' & options.showComponentLifeCycleInTimeline),
        timeline: options.timelineMode === 'devtools' & options.showComponentLifeCycleInTimeline,
        cycle: Gatherer.oneOf(cycleMarkOption),
        start: options.collectComponentLifeCycleData | (options.timelineMode != 'none' & options.timelineMode != null)
      },
      unrender: {
        log: options.logToConsole,
        collect: options.collectComponentLifeCycleData |
        (options.timelineMode === 'external' & options.showComponentLifeCycleInTimeline),
        timeline: options.timelineMode === 'devtools' & options.showComponentLifeCycleInTimeline,
        cycle: Gatherer.oneOf(cycleMarkOption),
        start: options.collectComponentLifeCycleData | (options.timelineMode != 'none' & options.timelineMode != null)
      },
      rerender: {
        log: options.logToConsole,
        collect: options.collectComponentLifeCycleData |
        (options.timelineMode === 'external' & options.showComponentLifeCycleInTimeline),
        timeline: options.timelineMode === 'devtools' & options.showComponentLifeCycleInTimeline,
        cycle: Gatherer.oneOf(cycleMarkOption),
        start: options.collectComponentLifeCycleData | (options.timelineMode != 'none' & options.timelineMode != null)
      },
      afterRender: {
        log: options.logToConsole,
        collect: options.collectComponentLifeCycleData |
        (options.timelineMode === 'external' & options.showComponentLifeCycleInTimeline),
        timeline: options.timelineMode === 'devtools' & options.showComponentLifeCycleInTimeline,
        cycle: Gatherer.oneOf(cycleMarkOption),
        start: options.collectComponentLifeCycleData | (options.timelineMode != 'none' & options.timelineMode != null)
      },
      render: {
        log: options.logToConsole,
        collect: options.collectComponentLifeCycleData |
        (options.timelineMode === 'external' & options.showComponentLifeCycleInTimeline),
        timeline: options.timelineMode === 'devtools' & options.showComponentLifeCycleInTimeline,
        cycle: Gatherer.oneOf(cycleMarkOption),
        start: options.collectComponentLifeCycleData | (options.timelineMode != 'none' & options.timelineMode != null)
      },
      destroy: {
        log: options.logToConsole,
        collect: options.collectComponentLifeCycleData |
        (options.timelineMode === 'external' & options.showComponentLifeCycleInTimeline),
        timeline: options.timelineMode === 'devtools' & options.showComponentLifeCycleInTimeline,
        cycle: Gatherer.oneOf(cycleMarkOption),
        start: options.collectComponentLifeCycleData | (options.timelineMode != 'none' & options.timelineMode != null)
      },
      mark: {
        log: options.logToConsole,
        collect: options.timelineMode === 'external' & options.showMarksInTimeline,
        timeline: options.timelineMode === 'devtools' & options.showMarksInTimeline,
        cycle: Gatherer.oneOf(cycleMarkOption)
      }
    });

    Object.assign(storeOptions, {
      transaction: {
        collect: options.collectTransactionData | options.collectTransactionMetrics
      }
    });

    const canFilterAction = options.filterActions &
      (typeof options.filteredActions === 'string' && options.filteredActions.trim().length > 0);

    if (canFilterAction) {
      this.performActionFiltering = true;
      options.filteredActions
        .split('\n')
        .filter(name => name.trim().length > 0 && name.indexOf('-') !== 0)
        .forEach(name => {
          name = name.split('+');
          this.filteredActions[name[0]] = Number(name[1]) || false;
        });
    } else {
      this.shouldEnqueueAction = () => true;
      this.performActionFiltering = options.preventActionBoxCarring;
    }

    if (Gatherer.oneOf(markOptions.fireAction, markOptions.enqueueAction) || canFilterAction) {
      this.captureActions();
    }

    if (Gatherer.oneOf(markOptions.event)) {
      this.captureEvents();
    }

    if (Gatherer.oneOf(markOptions.mark)) {
      this.captureMarks();
    }

    if (Gatherer.oneOf(markOptions.transaction, storeOptions.transaction)) {
      this.captureTransactions();
      this.reconcileSyntheticPageView();
    }

    if (Gatherer.oneOf(markOptions.render, markOptions.rerender, markOptions.destroy, markOptions.create, markOptions.unrender)) {
      this.captureComponentLifeCycle();
    }

    if (true || options.stopUnloadEvents) {
      AuraGatherer.stopUnloadEvents();
    }

    if (options.captureComponentDefinitions) {
      this.captureComponentDefinitions();
    }

    this.markPerfXHRs();

    this.registerArtifact('lastPurgeTime', () => this.lastPurgeTime, {collectMethod: 'set'});
    this.registerArtifact('cycleMarks', () => this.marked('cycle'), {collectMethod: 'push'});
    this.registerArtifact('actionMarks', () => this.marked('fireAction', 'enqueueAction'), {collectMethod: 'push'});
    this.registerArtifact('markMarks', () => this.marked('mark'), {collectMethod: 'push'});
    this.registerArtifact('requestMarks', () => this.marked('request'), {collectMethod: 'push'});
    this.registerArtifact('eventMarks', () => this.marked('event'), {collectMethod: 'push'});
    this.registerArtifact('context', () => this.getContext(), {collectMethod: 'set'});
    this.registerArtifact('componentDefinitions', () => this.getComponentDefinitions(), {collectMethod: 'set'});
    this.registerArtifact('transactionMarks', () => this.marked('transaction'), {collectMethod: 'push'});
    this.registerArtifact('componentVisibility', () => this.getComponentVisibility(), {collectMethod: 'set'});
    this.registerArtifact('componentLifeCycleMarks',
      () => this.marked('create', 'render', 'rerender', 'destroy', 'afterRender', 'unrender'), {collectMethod: 'push'});
    this.registerArtifact('transactions',
      () => {
        if (Gatherer.oneOf(markOptions.transaction, storeOptions.transaction)) {
          return new Promise(resolve => {
            if (options.managePageView) {
              this.auraInstance.metricsService.transactionEnd('ltng', 'pageView');
            }

            this.reconcileSyntheticPageView(() => resolve(this.stored('transaction')));
          });
        }

        return this.stored('transaction');
      }, {collectMethod: 'push'});

    if (options.autoCollection) {
      this.markEnd = (event, id, name) => {
        super.markEnd(event, id, name);

        this.notifyPageEvent();
      };

      this.markEndWithContext = (event, id, name, context) => {
        super.markEndWithContext(event, id, name, context);

        this.notifyPageEvent();
      }
    }

    if (options.increaseMaxXHRs) {
      if (this.auraInstance.clientService.$setQueueSize$) {
        this.auraInstance.clientService.$setQueueSize$(12);
      }
    }
  }

  requestContentPull() {
    ContentProxy.bucket().invalidate();

    ContentProxy.bucket().unfreeze()
      .then(() => ContentProxy.gatherer('default', {bucket: false, def: []}).getArtifactNames())
      .then(defaultArtifactNames => Promise.all([
        ...defaultArtifactNames.map(name => ContentProxy.gatherer('default').getArtifact(name)),
        ...this.getArtifactNames().map(name => ContentProxy.gatherer('aura').getArtifact(name))
      ]))
      .then(() => ContentProxy.buckets.next())
      .then(() => ContentProxy.bucket().freeze())
      .then(() => {
        this.lastPurgeTime = performance.now();

        if (process.env.NODE_ENV !== 'production') {
          console.debug(performance.now());
        }
      });

  }

  _requestContentPull() {
    return ContentProxy.bucket().invalidate()
      .then(() => ContentProxy.gatherer('default', {bucket: false, def: []}).getArtifactNames())
      .then(defaultArtifactNames => Promise.all([
        ...defaultArtifactNames.map(name => ContentProxy.gatherer('default').getArtifact(name)),
        ...this.getArtifactNames().map(name => ContentProxy.gatherer('aura').getArtifact(name))
      ]));

  }

  _requestContentSoftPull() {
    return ContentProxy.gatherer('default', {bucket: false, def: []}).getArtifactNames()
      .then(defaultArtifactNames => Promise.all([
        ...defaultArtifactNames.map(name => ContentProxy.gatherer('default').getArtifact(name)),
        ...this.getArtifactNames().map(name => ContentProxy.gatherer('aura').getArtifact(name))
      ]));
  }


  hasBackgroundWork() {
    try {
      const transactions = this.auraInstance.metricsService.getTransactions();

      for (let i = 0, length = transactions.length; i < length; i++) {
        const transaction = transactions[i];

        if (
          transaction.id === 'ltng:pageView' ||
          (transaction.config && transaction.config.context && transaction.config.context.isSyntheticPageView)
        ) {
          continue;
        }

        return true;
      }
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('MetricsService#getTransactions does not exist. Active transaction count: ' + this.activeTransactionsCount)
      }

      if (this.activeTransactionsCount > 0) {
        return true;
      }
    }

    return !!this.auraInstance.clientService.inFlightXHRs();
  }

  notifyPageEvent() {
    this.pageEventCount++;
    if (this.capturingPageActions === false) {
      const lastPageEventCount = this.pageEventCount;
      setTimeout(() => {
        this.capturingPageActions = false;
        if (
          lastPageEventCount === this.pageEventCount &&
          this.pageEventCount > 250 && !this.hasBackgroundWork()
        ) {
          this.pageEventCount = 0;
          this.requestContentPull();

          if (process.env.NODE_ENV !== 'production') {
            console.log('Pushed / created page');
          }
        } else {
          this.notifyPageEvent();
        }
      }, 500);

      this.capturingPageActions = true;
    }
  }

  markPerfXHRs() {
    XHRInspector.on('beforeRequest', (xhr, request) => {
      const {body, url} = request;
      const isPerf = body != null && body.indexOf != null ? (body.indexOf('beacon') + 1) || (body.indexOf('sendData') + 1) : false;

      if (isPerf) {
        if (url.indexOf('?') + 1) {
          request.url += '&perf=true'
        } else {
          request.url += '?perf=true';
        }
      }

      if (url.indexOf('?') + 1) {
        request.url += '&i=' + this.xhrCounter2;
      } else {
        request.url += '?i=' + this.xhrCounter2;
      }

      this.xhrCounter2++;
    });
  }

  purge() {
    super.purge();

    this.componentDefinitions = new Map();
    this.lastPurgeTime = performance.now();
    this.componentCounter = 0;
    this.reconcileSyntheticPageView(() => 0);
  }

  getComponentDefinitions() {
    const {componentDefinitions} = this;
    const defs = Object.create(null);

    // TODO deep walk definitions and serialize functions; currrently, it is being overriden by base component

    for (const [name, definition] of componentDefinitions.entries()) {
      if (typeof definition === 'function') {
        defs[name] = definition.toString();
      } else {
        defs[name] = definition;
      }
    }

    return defs;
  }

  getHeapSize() {
    return (window.performance.memory || {usedJSHeapSize: 0}).usedJSHeapSize;
  }

  getMode() {
    try {
      return this.auraInstance.getContext().mode || 'PROD';
    } catch (e) {
      const auraSourceRequest = window.performance.getEntriesByType('resource').filter(a => a.name.indexOf('aura_') > -1 && a.name.indexOf('.js') > -1);

      if (auraSourceRequest.length) {
        const mode = auraSourceRequest[0].name.match(/aura_(.*?)\.js/)[1];

        if (['prod', 'dev', 'proddebug'].indexOf(mode) > -1) {
          return mode.toUpperCase();
        }
      }

      return 'PROD';
    }
  }

  captureComponentDefinitions() {
    const componentService = this.auraInstance.componentService;
    const componentDefinitions = this.componentDefinitions;
    const definitionProp = componentService.getUnusedDefinitions.toString().match(/this\.(.*?)\)/)[1];

    if (definitionProp == null) {
      console.error('Could not find componentDefinition map');
      return;
    }

    const mode = this.getMode();
    const storage = Gatherer.storage.local.get('aura') || {};
    const evalCache = new Map();
    const mergeCache = new Map();

    if (process.env.NODE_ENV !== 'production') {
      console.log('Firing captureComponentDefinitions', storage);
    }

    this.ignoreComponentServiceProp = definitionProp;

    function customizer(obj, src) {
      if (typeof src === 'function') {
        return src;
      }

      if (typeof src === 'object') {
        return mergeWith(obj, src, customizer)
      }

      return obj;
    }

    const target = componentService[definitionProp] = new Proxy(componentService[definitionProp], {
      set(target, name, value) {
        if (
          componentDefinitions.has(name) &&
          typeof componentDefinitions.get(name) === 'string' &&
          typeof value === 'object'
        ) {
          componentDefinitions.set(name, {
            ...value,
            preventFirstAddComponentClass: true, // where component definition is provided after addComponentClass
            componentClass: `function(){$A.componentService.addComponentClass("${name}", ${componentDefinitions.get(name)})}`
          });
        } else {
          componentDefinitions.set(name, value);
        }

        if (`override_activated_${mode}_${name}` in storage) {
          console.log('Intercepting override', name, value);
        }

        target[name] = value;

        return true;
      },
      get(target, name) {
        if (`override_activated_${mode}_${name}` in storage) {
          const componentDefinition = componentDefinitions.get(name);
          const overrideComponentDefinition = storage[`override_definition_${mode}_${name}`];

          if (
            overrideComponentDefinition != null &&
            ((typeof componentDefinition === 'function' && typeof overrideComponentDefinition === 'string') ||
            (typeof componentDefinition === 'object' && typeof overrideComponentDefinition === 'object'))
          ) {
            if (typeof overrideComponentDefinition === 'string') {
              if (!evalCache.has(overrideComponentDefinition)) {
                evalCache.set(overrideComponentDefinition, safeEval(`return ${overrideComponentDefinition};`));
              }

              if (process.env.NODE_ENV !== 'production') {
                console.log(`Overriding`, name);
              }

              return evalCache.get(overrideComponentDefinition);
            }

            if (!mergeCache.has(name)) {
              // TODO hydrate functions and override if function.toString does not match
              mergeCache.set(name, mergeWith(overrideComponentDefinition, componentDefinition, customizer));
            }

            if (process.env.NODE_ENV !== 'production') {
              console.log(`Overriding`, name);
            }

            return mergeCache.get(name);
          }

          if (process.env.NODE_ENV !== 'production') {
            console.error(`auraGatherer component override type mismatch: ${name}. Delete override and edit again`);
          }
        }

        return target[name];
      }
    });

    // TODO does addComponentClass override existing classes?
    const _addComponentClass = componentService.addComponentClass;
    componentService.addComponentClass = (name, exporter) => {
      if (!componentDefinitions.has(name)) {
        componentDefinitions.set(name, exporter.toString());

        // NOTE in case the injector was loaded late
        if (target.hasOwnProperty(name)) {
          componentDefinitions[name] = target[name]; // re-add to go through proxy
        }
      }

      if (
        `override_activated_${mode}_${name}` in storage &&
        `override_definition_${mode}_${name}` in storage &&
        storage[`override_definition_${mode}_${name}`].preventFirstAddComponentClass === true
      ) {
        storage[`override_definition_${mode}_${name}`].preventFirstAddComponentClass = false;
        return;
      }

      return _addComponentClass.call(componentService, name, exporter);
    };
  }

  getContext() {
    return this.auraInstance.getContext();
  }

  reconcileSyntheticPageView(callback) {
    const metricsService = this.auraInstance.metricsService;

    if (this.syntheticPageViewCounter !== 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Ending syntheticPageView: ${this.syntheticPageViewCounter - 1}`);
      }

      let timeout = 0;
      const _callback = callback;

      callback = () => {
        clearTimeout(timeout);
        _callback();
      };

      const transaction = metricsService.transactionEnd('syntheticPageView', this.syntheticPageViewCounter - 1, {
        context: {callback},
        postProcess: () => null
      }, () => null);

      timeout = setTimeout(() => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Transaction was not reconciled');
        }

        callback();
      }, 3000);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Reconciling syntheticPageView transaction', this.syntheticPageViewCounter - 1);
    }

    metricsService.syntheticTransactionStart('syntheticPageView', this.syntheticPageViewCounter, {
      context: {
        warning: 'THIS IS NOT THE SAME AS PAGEVIEW BY FRAMEWORK',
        count: this.syntheticPageViewCounter,
        isSyntheticPageView: true
      }
    });

    return this.syntheticPageViewCounter++;
  }

  inspectComponent(id) {
    this.initGlobalIndex();

    if (this.globalIndex == null) {
      return 'Could not find global index (tell dev)';
    }

    const component = this.globalIndex[id];

    if (component == null) {
      console.error(`Could not find component ${id}`);

      return 'Could not find component';
    }

    if (this.domOutlineCtx == null) {
      this.domOutlineCanvas = document.createElement('canvas');
      this.domOutlineCanvas.addEventListener('click', () => {
        this.domOutlineCanvas.style.display = 'none';
      });

      window.addEventListener('resize', () => {
        this.domOutlineCanvas.style.display = 'none';
      });

      this.domOutlineCanvas.style.backgroundColor = 'rgba(0,0,0,0.3)';
      this.domOutlineCanvas.style.position = 'fixed';
      this.domOutlineCanvas.style.top = '0px';
      this.domOutlineCanvas.style.bottom = '0px';
      this.domOutlineCanvas.style.left = '0px';
      this.domOutlineCanvas.style.right = '0px';
      this.domOutlineCanvas.style.zIndex = 99999;
      this.domOutlineCtx = this.domOutlineCanvas.getContext('2d');
      this.domOutlineCtx.font = '12px Arial';

      document.body.appendChild(this.domOutlineCanvas);
    }

    this.domOutlineCanvas.width = Math.max(document.body.offsetWidth, window.innerWidth) * window.devicePixelRatio;
    this.domOutlineCanvas.height = Math.max(document.body.offsetHeight, window.innerHeight) * window.devicePixelRatio;
    this.domOutlineCanvas.style.width = `${Math.max(document.body.offsetWidth, window.innerWidth)}px`;
    this.domOutlineCanvas.style.height = `${Math.max(document.body.offsetHeight, window.innerHeight)}px`;
    this.domOutlineCanvas.style.display = 'block';

    this.domOutlineCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.domOutlineCtx.clearRect(0, 0, this.domOutlineCanvas.width, this.domOutlineCanvas.height);

    let hiddenElements = 0;
    if (Array.isArray(component.elements)) {
      component.elements.forEach(element => {
        let rect = getBoundingClientRect(element);

        rect = {left: rect.left, top: rect.top, width: element.offsetWidth, height: element.offsetHeight};

        if (rect.left === 0 && rect.top === 0 && rect.width === 0 && rect.height === 0) {
          hiddenElements++;
        } else {
          this.domOutlineCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          this.domOutlineCtx.fillRect(rect.left, rect.top - 15, this.domOutlineCtx.measureText(id).width + 10, 15);
          this.domOutlineCtx.fillStyle = '#000';
          this.domOutlineCtx.fillText(id, rect.left + 4, rect.top - 4);

          this.domOutlineCtx.fillStyle = 'rgba(28, 144, 243, 0.5)';
          this.domOutlineCtx.fillRect(rect.left, rect.top, rect.width, rect.height);
          this.domOutlineCtx.strokeStyle = 'rgba(255, 129, 0, 0.75)';
          this.domOutlineCtx.strokeWidth = 5;
          this.domOutlineCtx.rect(rect.left, rect.top, rect.width, rect.height);
          this.domOutlineCtx.stroke();
        }
      });
    }

    const elementCount = Array.isArray(component.elements) ? component.elements.length : 0;
    const elementCountText = `${id}: ${elementCount} visible / ${hiddenElements} hidden`;
    this.domOutlineCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.domOutlineCtx.fillRect(0, 0, this.domOutlineCtx.measureText(elementCountText).width + 10, 15);
    this.domOutlineCtx.fillStyle = '#000';
    this.domOutlineCtx.fillText(elementCountText, 4, 10);

    this.domOutlineCanvas.style.display = 'block';

    return null;
  }

  captureEvents() {
    let eventCount = 0;
    const installOverride = this.auraInstance.installOverride;

    if (installOverride == null) {
      return console.error('Could not find installOverride');
    }

    installOverride('Event.fire', (config, a, b, c) => {
      const event = config.scope;
      const eventDefName = event.getDef().getDescriptor().getQualifiedName().replace('markup://', '');
      const source = event.getSource ? event.getSource() : event.get();

      let name = `${eventDefName}$e${eventCount++}`;

      if (source != null) {
        name += ` (${source.getName()}:${source.getGlobalId()})`;
      }

      if (eventDefName === 'aura:valueChange') {
        const param = event.getParams();
        const value = AuraGatherer.getValueName(param.value);
        const oldValue = AuraGatherer.getValueName(param.oldValue);

        name += ` (${param.expression}: ${oldValue}:>${value})`;
      } else if (eventDefName === 'aura:valueInit') {
        const param = event.getParams();
        const value = AuraGatherer.getValueName(param.value);

        name += ` (value: ${value})`;
      }

      this.markStart('event', name, false);

      const ret = config.fn.call(config.scope, a, b, c);

      this.markEnd('event', name, name, true);

      return ret;
    });
  }

  shouldEnqueueAction(name) {
    const filteredActions = this.filteredActions;
    return filteredActions.hasOwnProperty(name) ? filteredActions[name] : true;
  }

  captureActions() {
    const installOverride = this.auraInstance.installOverride;

    if (installOverride == null) {
      return console.error('Could not find installOverride');
    }

    if (this.performActionFiltering) {
      const clientService = this.auraInstance.clientService;
      const prop = /this\.(.*?)\.push/g.exec(clientService.enqueueAction.toString())[1];

      let enqueuedActions = [];
      let timeoutCount = 0;

      console.log(`Enqueue action property: ${prop}`);

      const preventActionBoxCarring = this.options.preventActionBoxCarring;
      const captureActionPush = arr => {
        arr._push = arr.push;
        arr.push = (action, forceEnqueueAction) => {
          const actionName = action.getDef().getName() || 'na';
          const shouldEnqueueAction = this.shouldEnqueueAction(actionName);

          if (forceEnqueueAction === true) {
            arr._push(action);
          } else if (shouldEnqueueAction === true) {
            if (preventActionBoxCarring) {
              setTimeout(() => {
                enqueuedActions.push(action, true);
                clientService.runActions([]);
                console.info(`Running non-boxcarred action: ${actionName}`);
                timeoutCount = 0;
              }, timeoutCount);

              timeoutCount += 20;
            } else {
              arr._push(action);
            }
          } else if (shouldEnqueueAction === false) {
            console.info(`Prevented action: ${actionName}`);
          } else {
            setTimeout(() => {
              enqueuedActions.push(action, true);
              clientService.runActions([]);
              console.info(`Running deferred action: ${actionName}`);
            }, shouldEnqueueAction);
          }
        };
      };

      captureActionPush(enqueuedActions);
      Object.defineProperty(clientService, prop, {
        configurable: false,
        get() {
          return enqueuedActions;
        },
        set(value) {
          enqueuedActions = value;
          captureActionPush(value);
        }
      });
    }

    installOverride('enqueueAction', (config, action) => {
      const actionName = action.getDef().getName() || 'na';
      const name = `${actionName}:${action.getId()}`;

      this.markStart('enqueueAction', name);

      return config.fn.call(config.scope, action);
    });

    installOverride('Action.runDeprecated', (config, event, a) => {
      const action = config.self;
      const name = `${action.getDef().getName() || 'na'}:${action.getId()}`;

      this.markStart('fireAction', name);

      const ret = config.fn.call(config.scope, event, a);

      this.markEnd('enqueueAction', name, name);
      this.markEnd('fireAction', name, name);

      return ret;
    });

    installOverride('Action.finishAction', (config, event, a) => {
      const action = config.self;
      const name = `${action.getDef().getName() || 'na'}:${action.getId()}`;

      this.enqueuedActionsCounter = Math.max(this.enqueuedActionsCounter - 1, 0);

      this.markStart('fireAction', name, name);

      const ret = config.fn.call(config.scope, event, a);

      this.markEnd('enqueueAction', name, name);
      this.markEnd('fireAction', name, name);

      return ret;
    });
  }

  captureMarks() {
    const installOverride = this.auraInstance.installOverride;
    const metricsService = this.auraInstance.metricsService;

    if (installOverride == null) {
      return console.error('Could not find installOverride');
    }

    installOverride('ClientService.send', (config, auraXHR, actions, method, options) => {
      options = options || {};

      const requestName = (method.requestId || auraXHR.requestId || auraXHR.marker) && false;

      auraXHR.__name = `xhr@${requestName || this.xhrCounter++} (bg:${options.background || false}) (${(auraXHR.length / 1024).toFixed(2)}kb)`

      this.markStart('request', auraXHR.__name);

      return config.fn.call(config.scope, auraXHR, actions, method, options);
    });

    installOverride('ClientService.receive', (config, auraXHR, b, c, d) => {
      this.nextCycle();

      this.markEnd('request', auraXHR.__name, auraXHR.__name);

      return config.fn.call(config.scope, auraXHR, b, c, d);
    });

    if (metricsService == null) {
      return console.error('Could not find metricsService');
    }

    if ((metricsService._markStart = metricsService.markStart) != null) {
      metricsService.markStart = (ns, name, context) => {
        if (ns !== 'actions' && ns !== 'transport') {
          const markName = name ? `${ns}:${name}` : ns;
          this.markStart('mark', markName);
        }

        return metricsService._markStart(ns, name, context);
      };
    }

    if ((metricsService._markEnd = metricsService.markEnd) != null) {
      metricsService.markEnd = (ns, name, context) => {
        if (ns !== 'actions' && ns !== 'transport') {
          const markName = name ? `${ns}:${name}` : ns;
          this.markEnd('mark', markName, markName);
        }

        return metricsService._markEnd(ns, name, context);
      }
    }

    if ((metricsService._mark = metricsService.mark) != null) {
      metricsService.mark = (ns, name, context) => {
        if (ns !== 'actions' && ns !== 'transport') {
          const markName = (name ? `${ns}:${name}` : ns);
          this.mark('mark', markName, markName);
        }

        return metricsService._mark(ns, name, context);
      }
    }

    // perf shim
    if ((this.auraInstance._mark = this.auraInstance.mark) != null) {
      this.auraInstance.mark = (ns, name, context) => {
        if (ns !== 'actions' && ns !== 'transport') {
          const markName = (name ? `${ns}:${name}` : ns);
          this.mark('mark', markName, markName);
        }

        return this.auraInstance._mark(ns, name, context);
      }
    }
  }

  captureTransactions() {
    const metricsService = this.auraInstance.metricsService;
    const storageService = this.auraInstance.storageService;
    const compService = this.auraInstance.componentService;

    if ((metricsService._transactionStart = metricsService.transactionStart) != null) {
      metricsService.transactionStart = (ns, name, config) => {
        const context = config && config.context;
        const isSyntheticPageView = context && context.isSyntheticPageView;

        if (!isSyntheticPageView) {
          let id = `${ns}:${name}`;

          if (id.indexOf('ltng:performance') === 0) {
            if (config && config.context) {
              id = id || config.context.eventSource;
            }
          }

          this.activeTransactionsCount++;
          this.markStart('transaction', id);
        }

        return metricsService._transactionStart(ns, name, config);
      };
    }

    if ((metricsService._syntheticTransactionStart = metricsService.syntheticTransactionStart) != null) {
      metricsService.syntheticTransactionStart = (ns, name, config) => {
        const context = config && config.context;
        const isSyntheticPageView = context && context.isSyntheticPageView;

        if (!isSyntheticPageView) {
          let id = `${ns}:${name}`;
          this.activeTransactionsCount++;
          this.markStart('transaction', id);
        }

        return metricsService._syntheticTransactionStart(ns, name, config);
      };
    }

    let MAXTIME = 30000;
    for (const k in metricsService.constructor) {
      if (metricsService.constructor[k] > 20000) {
        MAXTIME = metricsService.constructor[k] = Number.MAX_SAFE_INTEGER;

        if (process.env.NODE_ENV != 'production') {
          console.info('Updated transaction MAX_TIME');
        }
        break;
      }
    }

    window.metricsService = metricsService;

    metricsService.onTransactionsKilled(transactions => {
      for (let i = 0, length = transactions.length; i < length; i++) {
        const transaction = transactions[i];
        const context = transaction.config.context;
        const isSyntheticPageView = context && context.isSyntheticPageView;

        if (process.env.NODE_ENV !== 'production') {
          if (!isSyntheticPageView) {
            console.error('Transaction killed by metric service', transaction);
          }
        }

        if (isSyntheticPageView) {
          metricsService.syntheticTransactionStart('synthPageView', transaction.context.count, transaction);
        }
      }
    });

    metricsService.onTransactionEnd(transaction => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(transaction);
      }

      let transactionName = transaction.id;
      const context = transaction.context;
      const isSyntheticPageView = context && context.isSyntheticPageView;

      if (!isSyntheticPageView) {
        if (transactionName === 'ltng:performance') {
          transactionName = transactionName || transaction.eventSource;
        }

        this.activeTransactionsCount = Math.max(this.activeTransactionsCount - 1, 0);
        this.markEnd('transaction', transactionName, transactionName);
      }

      const options = this.options;
      const {id, name} = transaction;
      const payload = {
        transaction: {id}, // TODO remove this object
        memory: null,
        objectCount: null,
        componentCount: null,
        createdAt: Date.now(),
        id: id || name
      };

      let store = false;

      if (options.collectTransactionData) {
        store = true;
        payload.transaction = JSON.stringify(transaction); // TODO stringify if aura.mode=DEV || PRODDEBUG
      }

      if (options.collectTransactionMetrics) {
        store = true;
        payload.start = transaction.ts;
        payload.end = transaction.ts + transaction.duration;
        payload.memory = this.getHeapSize();
        payload.objectCount = document.getElementsByTagName('*').length - 1;

        if (compService.countComponents != null) {
          payload.componentCount = compService.countComponents();
        } else if (compService.$indexes$.$globalIndex$ != null) {
          payload.componentCount = Object.keys(compService.$indexes$.$globalIndex$).length;
        }

        // TODO cache getStorage
        if (storageService != null && storageService.getStorage != null) {
          const actionsStorage = storageService.getStorage('actions');
          if (actionsStorage != null) {
            store = false;

            const then = () => {
              this.store('transaction', payload);

              if (isSyntheticPageView) {
                context.callback();
              }
            }

            actionsStorage.getSize().then(size => {
              payload.actionsStorageSize = size;
              payload.maxActionsStorageSize = actionsStorage.getMaxSize();
            }).then(then).catch(then);
          }
        }
      }

      if (store) {
        this.store('transaction', payload);

        if (isSyntheticPageView) {
          context.callback();
        }
      }
    });
  }

  initGlobalIndex() {
    try {
      if (this.globalIndex == null) {
        const compService = this.auraInstance.componentService;

        for (const k in compService) {
          if (!compService.hasOwnProperty(k)) {
            continue;
          }

          if (Array.isArray(compService[k]) || typeof compService[k] === 'function') {
            continue;
          }

          if (k === this.ignoreComponentServiceProp) {
            continue;
          }

          for (const n in compService[k]) {
            if (!compService[k].hasOwnProperty(n)) {
              continue;
            }

            if (Array.isArray(compService[k][n]) || typeof compService[k][n] === 'function') {
              continue;
            }

            for (const j in compService[k][n]) {
              if (!compService[k][n].hasOwnProperty(j)) {
                continue;
              }

              if (Array.isArray(compService[k][n][j]) || typeof compService[k][n][j] === 'function') {
                continue;
              }

              const obj = compService[k][n][j];
              if (obj && typeof obj === 'object' && 'elements' in obj) {
                if (obj.getGlobalId && obj.getGlobalId() === j) {
                  this.globalIndex = compService[k][n];
                  break;
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  getComponentVisibility() {
    this.initGlobalIndex();

    const globalIndex = this.globalIndex;

    if (globalIndex == null) {
      return [];
    }

    const status = [];

    let virtualCount = 0;

    // ComponentTypes
    // -------
    // VirtualTemplate
    // VirtualInstance
    // Concrete
    // Abstract

    for (const id in globalIndex) {
      if (!globalIndex.hasOwnProperty(id)) {
        continue;
      }

      const component = globalIndex[id];
      const name = component.getName();
      let elements = component.elements;
      let owner = component.getOwner();

      let concrete = false;
      let isVirtualTemplate = false;
      let ownerName;
      let ownerId;

      if (owner != null) {
        ownerId = owner.getGlobalId();
        ownerName = owner.getName();
      }

      let visited = new WeakSet();
      let currOwner = owner;
      while (currOwner != null) {
        if (visited.has(currOwner)) {
          break;
        }

        visited.add(currOwner);

        if (
          owner.getName().indexOf('ui:virtual') + 1 ||
          owner.getName().indexOf('ui$virtual') + 1
        ) {
          isVirtualTemplate = true;
          break;
        }

        currOwner = owner.getOwner();
      }


      if (Array.isArray(elements) && elements.length) {
        concrete = true;

        status.push({
          id,
          ownerName,
          ownerId,
          type: isVirtualTemplate ? 'virtualTemplate' : 'concrete',
          name,
          elements: elements.map(element => {
            const visible = getElementVisibleArea(element);
            let rect = getInnerBoundingClientRect(element);

            return {
              visible,
              nodeName: element.nodeName.toLowerCase(),
              rect: {left: rect.left, top: rect.top, bottom: rect.bottom, right: rect.right}
            };
          })
        });
      }

      elements = component._virtualItems;

      if (Array.isArray(elements) && elements.length) {
        concrete = false;

        const traverse = (elements, props) => {
          if (elements == null) {
            return;
          }

          if (Array.isArray(elements) || elements.length != null) {
            for (let i = 0, length = elements.length; i < length; i++) {
              const element = elements[i];
              const id = `v${virtualCount++}`;
              const name = element.classList[0] || element.getAttribute('data-aura-class') || (`${props.ownerName}:${element.nodeName.toLowerCase()}`);

              const visible = getElementVisibleArea(element);
              let rect = getInnerBoundingClientRect(element);
              rect = {left: rect.left, top: rect.top, bottom: rect.bottom, right: rect.right};

              status.push({
                id,
                name,
                type: 'virtualInstance',
                ownerId: props.ownerId,
                ownerName: props.ownerName,
                elements: [{
                  nodeName: element.nodeName.toLowerCase(),
                  visible,
                  rect
                }]
              });

              traverse(Array.prototype.slice.call(element.children)
                .filter(element => element.getAttribute('data-aura-rendered-by') != null), {
                ownerName: name,
                ownerId: id
              });
            }

            return;
          }

          return traverse([elements], props);
        };

        traverse(elements, {ownerName: name, ownerId: id});
      }

      if (!concrete) {
        status.push({id, name, type: 'abstract', elements: []});
      }
    }

    return status;
  }

  captureComponentLifeCycle() {
    const self = this;
    const Component = this.auraInstance.Component;
    const compService = this.auraInstance.componentService;
    const installOverride = this.auraInstance.installOverride;

    if (Component == null) {
      return console.error('Could not find $A.Component');
    }

    if (installOverride == null) {
      return console.error('Could not find installOverride');
    }

    installOverride('ComponentService.createComponentPriv', (config, a, callback, b) => {
      const perfName = String(this.componentCounter++);

      this.markStart('create', perfName);

      let component = null;
      let wrappedCallback = null;

      if (callback) {
        wrappedCallback = (_component, a, b) => {
          component = _component;
          callback(_component, a, b);
        };

        config.fn.call(config.scope, a, wrappedCallback, b);
      } else {
        component = config.fn.call(config.scope, a, callback, b);
      }

      const id = component.getGlobalId();
      const name = component.getName();

      component.__cachedName = name;
      component.__cachedId = id;
      component.__cachedOwnerName = null;
      component.__cachedOwnerId = null;

      if (this.options.collectComponentLifeCycleData) {
        const context = AuraGatherer.createComponentLifeCycleContext('create', name, id, null, null, null);
        this.markEndWithContext('create', perfName, `${name}:${id}`, context);
      } else {
        this.markEnd('create', perfName, `${name}:${id}`);
      }

      return component;
    });

    if ((compService._newComponentDeprecated = compService.newComponentDeprecated)) {
      compService.newComponentDeprecated = (a, b, c, d, e) => {
        const perfName = String(this.componentCounter++);

        this.markStart('create', perfName);

        const component = compService._newComponentDeprecated(a, b, c, d, e);
        const id = component.getGlobalId();
        const name = component.getName();

        component.__cachedName = name;
        component.__cachedId = id;
        component.__cachedOwnerName = null;
        component.__cachedOwnerId = null;

        if (this.options.collectComponentLifeCycleData) {
          const context = AuraGatherer.createComponentLifeCycleContext('create', name, id, null, null, null);
          this.markEndWithContext('create', perfName, `${name}:${id}`, context);
        } else {
          this.markEnd('create', perfName, `${name}:${id}`);
        }

        return component;
      };
    }

    Component.prototype.pluginComponentLifeCycle = function (funcName, a, b) {
      let name = this.__cachedName;
      let id = this.__cachedId;

      if (name == null) {
        name = this.__cachedName = this.getName();
      }

      if (id == null) {
        id = this.__cachedId = this.getGlobalId();
      }

      self.markStart(funcName, `${name}:${id}`);
      const ret = this[`__${funcName}`](a, b);

      if (self.options.collectComponentLifeCycleData) {
        let ownerName;
        let ownerId;

        if (this.__cachedOwnerName != null) {
          ownerName = this.__cachedOwnerName;
          ownerId = this.__cachedOwnerId;
        } else {
          const owner = this.getOwner();
          ownerName = this.__cachedOwnerName = owner ? owner.getName() : 'base';
          ownerId = this.__cachedOwnerId = owner ? owner.getGlobalId() : '0';
        }

        const context = AuraGatherer.createComponentLifeCycleContext(funcName, name, id, ownerName, ownerId, ret);
        self.markEndWithContext(funcName, `${name}:${id}`, `${name}:${id}`, context);
      } else {
        self.markEnd(funcName, `${name}:${id}`, `${name}:${id}`);
      }

      return ret;
    };

    Component.prototype.__render = Component.prototype.render;
    Component.prototype.render = function (a, b) {
      return this.pluginComponentLifeCycle('render', a, b);
    };

    Component.prototype.__rerender = Component.prototype.rerender;
    Component.prototype.rerender = function (a, b) {
      return this.pluginComponentLifeCycle('rerender', a, b);
    };

    Component.prototype.__unrender = Component.prototype.unrender;
    Component.prototype.unrender = function (a, b) {
      return this.pluginComponentLifeCycle('unrender', a, b);
    };

    Component.prototype.__afterRender = Component.prototype.afterRender;
    Component.prototype.afterRender = function (a, b) {
      return this.pluginComponentLifeCycle('afterRender', a, b);
    };

    Component.prototype.__destroy = Component.prototype.destroy;
    Component.prototype.destroy = function (a, b) {
      return this.pluginComponentLifeCycle('destroy', a, b);
    };
  }

  static getValueName(value) {
    if (Array.isArray(value)) {
      return `Array[${value.length}]`
    } else if (value instanceof $A.Component) {
      return value.getName();
    } else if (value !== null && typeof value === 'object') {
      return '{Object}'
    } else if (value === undefined) {
      return null;
    } else if (typeof value === 'string' && (value.indexOf('"') > -1 || value.indexOf('\n') > -1)) {
      return value.replace(/"/g, '\\"').replace(/\n/g, '\\n'); // TODO perf hit might be too high
    }

    return value;
  };

  static createComponentLifeCycleContext(type, name, id, ownerName, ownerId, elements) {
    if (type === 'render' || type === 'rerender') {
      return `type=${type}&name=${name}&id=${id}&ownerName=${ownerName}&ownerId=${ownerId}&elements=${Array.isArray(elements) ? elements.length : !!elements}`;
    } else {
      return `type=${type}&name=${name}&id=${id}&ownerName=${ownerName}&ownerId=${ownerId}`;
    }
  }

  static stopUnloadEvents() {
    const addEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type) {
      if (type === 'unload' || type === 'beforeunload') {
        return;
      }

      return addEventListener.apply(this, arguments);
    };
  }
}

if (window.$A == null) {
  window.__$A = null;

  Object.defineProperty(window, '$A', {
    enumerable: false,
    get() {
      return this.__$A;
    },
    set(auraInstance) {
      this.__$A = auraInstance;

      if (
        auraInstance == null ||
        auraInstance.Component == null ||
        auraInstance.metricsService == null ||
        auraInstance.componentService == null
      ) {
        return;
      }

      window.auraGatherer = new AuraGatherer('aura', auraInstance);

      AuraGatherer.setSupported('aura', true);
      Gatherer.setSupported('default', true);
    }
  });

  const _hasOwnProperty = window.hasOwnProperty;
  window.hasOwnProperty = function (a) {
    if (a === '$A') {
      return !!this.__$A;
    }

    return _hasOwnProperty.call(this, a);
  };
} else {
  window.auraGatherer = new AuraGatherer('aura', window.$A);

  if (process.env.NODE_ENV !== 'production') {
    console.warn('Late injection');
  }

  Gatherer.setSupported('aura', true);
  Gatherer.setSupported('default', true);
}

window.contentProxy = ContentProxy;

