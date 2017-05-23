import Promise from 'bluebird';
import React from 'react';
import ContentProxy from '../../core/message/ViewerContentProxy';
import Workspace from './layout/Workspace';
import Raw from './layout/Raw';
import Waterfall from './layout/Waterfall';
import Components from './layout/Components';
import Timeline from './layout/Timeline';
import Insight from './layout/Insight';
import Footer from './layout/Footer';
import SimpleFooter from './layout/SimpleFooter';
import Charts from './layout/Charts';
import Header from './layout/Header';
import Cost from './layout/Cost';
import Help from './layout/Help';
import Actions from './layout/Actions';
import ModeSelector from './layout/ModeSelector';
import Viewer, { Tab } from '../../core/viewer/Viewer';
import alertify from 'alertify.js';
import Placeholder from './misc/Placeholder';
import fetch from './helpers/fetch';
import qs from 'qs';
import _ from 'lodash';
import './AuraViewer.scss';
import InstrumentationParser from '../parser/InstrumentationParser';
import { mergeContext } from './helpers/decode';

window.Promise = Promise;

const params = qs.parse(window.location.search.substring(1));

document.body.style.height = `${params.height}`;
document.body.style.width = `${params.width}`;

export default class AuraViewer extends React.Component {
  state = { bucket: 'active', ready: false, progress: 1, progressMessage: 'Loading...' };

  async testPageSupportStatus() {
    let isSupportedPage;

    try {
      isSupportedPage = await ContentProxy.this.isSupported('aura');
    } catch (e) {
      // ignore
      return 'NoContentScript';
    }

    isSupportedPage = isSupportedPage || 'PageNotSupported';

    if (isSupportedPage !== true) {
      const message = {
        PageNotSupported: 'This is not an Aura page (or plugin is disabled)',
        NoContentScript: 'Extension just installed; refresh page and then open the extension'
      }[isSupportedPage];

      this.setState({ ready: false, progress: null, progressMessage: message });

      return false;
    }
  }

  async setBucket(bucket, shouldForcePull = false) {
    if (!this.testPageSupportStatus()) {
      return false;
    }

    const isEmpty = await ContentProxy.bucket(bucket).isEmpty();
    const isFrozen = await ContentProxy.bucket(bucket).isFrozen();
    const shouldPull = (shouldForcePull || ((!ModeSelector.isSimpleMode() && isEmpty) || (isEmpty && !isFrozen)));

    if (shouldPull) {
      this.setState({ ready: false }); // allow background prefetch for (non force pulls)

      await ContentProxy.bucket().unfreeze();
      await ContentProxy.bucket().invalidate();

      const [auraArtifactNames, staticArtifactNames] = await Promise.all([
        ContentProxy.gatherer('aura', { bucket: false, def: [] }).getArtifactNames(),
        ContentProxy.gatherer('default', { bucket: false, def: [] }).getArtifactNames()
      ]);

      const delay = shouldForcePull ? 0 : 1000;

      // parallel fetch
      const artifacts = [
        ...auraArtifactNames.map(name => ({
          name, promise: Promise.delay(delay)
                                .then(() => ContentProxy.gatherer('aura').getArtifact(name))
        })),
        ...staticArtifactNames.map(name => ({
          name, promise: Promise.delay(delay)
                                .then(() => ContentProxy.gatherer('default').getArtifact(name))
        }))
      ];

      if (shouldForcePull) {
        let counter = 0;
        for (const { name, promise } of artifacts) {
          this.setState({ progressMessage: `Prefetching ${_.startCase(name).toLowerCase()}...` });

          await promise;

          this.setState({ progress: ++counter / artifacts.length });
        }

        this.setState({ ready: true });
      }
    }

    if (this.state.bucket !== bucket || this.state.ready !== true) {
      this.setState({ bucket, ready: true, progress: 1 });
    }
  }

  async import(text, name) {
    try {
      const artifacts = JSON.parse(text);
      alertify.log(`Loaded file: ${name}`, 'log');

      await ContentProxy.buckets.import(artifacts);

      this.setBucket('active', false, false);
    } catch (e) {
      console.error(e);
      alertify.error(`Could not load file: ${name}`, 'error');
    }
  }

  async export() {
    const artifacts = await ContentProxy.buckets.export();
    const activeTab = await ContentProxy.getActiveTab();

    const date = new Date();
    const dateStr = `${date.getMonth() + 1},${date.getDate()},${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    const contentType = 'application/json';
    const a = document.createElement('a');
    const blob = new Blob([JSON.stringify(artifacts)], { 'type': contentType });

    alertify
      .defaultValue(`EPT ${activeTab.title} (${activeTab.hostname}) - ${dateStr}`)
      .prompt('Save as', (filename, e) => {
        e.preventDefault();

        a.href = window.URL.createObjectURL(blob);
        a.download = filename.replace(/(\.json\s*?)+$/g, '.json');
        a.click();
      });
  }

  async pull() {
    await this.setBucket('active', true);
  }

  async popout() {
    const activeTab = await ContentProxy.getActiveTab();

    browser.tabs.create({
      url: `viewer.html?${qs.stringify({
        activeTab: JSON.stringify(activeTab),
        width: '100%',
        height: '100%'
      })}`
    });
  }

  async push() {
    const { inputValue: text } = await alertify.prompt('What do you want to name the upload?');

    alertify.error('Uploading may take some time...please wait (do not close the popup window EVEN if this alert goes away)');

    this.setState({ ready: false, progress: 0, progressMessage: 'Preparing artifacts...' });

    const { bucket } = this.state;
    const artifacts = await ContentProxy.buckets.export();
    const networkTimings = await ContentProxy.gatherer('default', { bucket }).getArtifact('networkResourceTimings');
    const window = await ContentProxy.gatherer('default', { bucket, def: { location: {} } }).getArtifact('window');
    const activeTab = await ContentProxy.getActiveTab();
    const transactions = await ContentProxy.gatherer('aura', { bucket, def: [] }).getArtifact('transactions');

    _.each(transactions, data => data.context.transaction = JSON.parse(data.context.transaction));

    const instrumentation = new InstrumentationParser(mergeContext(transactions), []).getParsed();
    const rootNodes = _.compact(_.map(instrumentation.primary, (transaction, name) => transaction.depth === 0 ? name : null));

    this.setState({ progressMessage: 'Validating artifacts...' });

    console.log(rootNodes);
    // TODO push transactions as children

    for (const k in artifacts.buckets) {
      if ((bucket === k) || (bucket === 'active' && k === String(artifacts.counter))) {
        continue;
      }

      delete artifacts.buckets[k];
    }

    artifacts.counter = Object.keys(artifacts.buckets)[0];

    const uploadBucket = artifacts.buckets[artifacts.counter].collected;
    for (const k in uploadBucket) {
      if (k.indexOf('componentDefinitions') > -1) {
        delete uploadBucket[k];
      }
    }

    const data = [
      {
        name: 'root',
        group: activeTab.hostname,
        subgroup: null
      }
    ];

    for (let { name, response, initiatorType, duration } of networkTimings) {
      let contentLength = response.headers && response.headers['content-length'];

      if (contentLength != null) {
        contentLength = Number(contentLength);
      }

      const cacheControl = response.headers && response.headers['cache-control'];
      const contentType = response.headers && response.headers['content-type'];

      const url = document.createElement('a');
      url.href = name;

      data.push({
        name: url.pathname + (url.search.indexOf('i=') > -1 ? url.search : ''),
        group: url.hostname,
        subgroup: null,
        duration: duration != null ? Number(duration.toFixed(2)) : duration,
        query: decodeURIComponent(url.search),
        contentLength,
        cacheControl,
        contentType,
        initiatorType
      });
    }

    try {
      const dashboardOrigin = process.env.GIT_BRANCH === 'master'
        ? 'http://fleahy-chatter2.internal.salesforce.com:5005' : 'http://mkurian-ltm.internal.salesforce.com:5000';
      const { body: { data: { metrics }, status: statusA, message: messageA } } = await fetch(`${dashboardOrigin}/api/v1/import/metrics`, {
        method: 'post',
        body: { tags: { type: 'plugin', host: activeTab.hostname }, name: text, data }
      }, e => this.setState({ progressMessage: 'Uploading metrics...', progress: (e.percent || 0) / 100 / 2 }));

      if (statusA) {
        throw Error(messageA);
      }

      const metricId = metrics[0]._id;
      const fileId = metrics[0].file_id;
      const { body: { status: statusB, message: messageB } } = await fetch(`${dashboardOrigin}/api/v1/import/blob`, {
        method: 'post',
        body: { title: 'Plugin', type: 'plugin', data: artifacts, metric_id: metricId }
      }, e => this.setState({
        progressMessage: 'Uploading blobs (slow)...',
        progress: (e.percent || 0) / 100 / 2 + 0.5
      }));

      if (statusB) {
        throw Error(messageB);
      }

      const url = `${dashboardOrigin}/?` + qs.stringify({
          SELECT_TYPE: { type: 'plugin' },
          SELECT_VIEW: { viewId: 'BASE' },
          SELECT_FILES: { fileIds: [fileId] },
          SELECT_VIEW_MODE: { mode: 'normal' },
          SELECT_METRICS: {
            fileIds: [fileId],
            metricIds: [metricId]
          },
          SELECT_DRAWER: { name: 'ExtensionWaterfall' }
        }, { encoded: false });

      setTimeout(() => {
        browser.tabs.create({ url });
      }, 1200);
    } catch (e) {
      alertify.error(e.message);
    }

    this.setState({ ready: true });
  }

  async clear() {
    if (ModeSelector.isSimpleMode()) {

      const nextBucket = await ContentProxy.buckets.next();

      await ContentProxy.bucket(nextBucket).freeze();

      await ContentProxy.gatherer('*', { bucket: false }).purge();

      this.setState({ bucket: Number(nextBucket) });
    } else {
      await ContentProxy.buckets.clear();

      await ContentProxy.bucket().freeze();

      await ContentProxy.gatherer('*', { bucket: false }).purge();

      this.setState({ bucket: 'active' });
    }
  }

  async componentWillMount() {
    if (!ModeSelector.isSimpleMode()) {
      this.setBucket('active');
    } else {
      if (!this.testPageSupportStatus()) {
        return;
      }

      this.setState({ ready: true });
    }
  }

  render() {
    if (!ModeSelector.isModeSelected()) {
      return (
        <Viewer name='welcome'
                showOptionsBar={false}
                namespaces={['aura', 'default']}>
          <Tab name='welcome'
               content={<ModeSelector/>}/>
        </Viewer>
      );
    }

    const { bucket, ready, progress, progressMessage } = this.state;

    if (!ready) {
      return (
        <Viewer name='loader'
                showOptionsBar={false}
                header={<Header showClearButton={false}
                                showPushButton={false}
                                showPullButton={false}
                                onPopout={::this.popout}
                                onClear={::this.clear}
                                onExport={::this.export}
                                onImport={::this.import}
                                onPush={::this.push}/>}>
          <Tab name='Aura Performance'
               content={
                 <Placeholder>
                   {progressMessage}
                   {progress != null && (
                     <span>
                       ({parseInt(progress * 100)}%)
                       <div className='loader'
                            style={{
                              width: 100,
                              margin: `5px auto`,
                              height: 10,
                              borderWidth: 1,
                              borderLeftWidth: Math.max(progress * 100, 1)
                            }}/>
                     </span>
                   )}
                 </Placeholder>
               }/>
        </Viewer>
      );
    }

    if (ModeSelector.isSimpleMode()) {
      return (
        <Viewer name='simple'
                showOptionsBar={false}
                namespaces={['aura', 'default']}
                bucket={bucket}
                header={<Header showClearButton={false}
                                onPopout={::this.popout}
                                onPull={::this.pull}
                                onClear={::this.clear}
                                onExport={::this.export}
                                onImport={::this.import}
                                onPush={::this.push}/>}
                footer={<Footer onChangeBucket={bucket => this.setBucket(bucket)}/>}>
          <Tab name='insights'
               content={<Insight/>}/>
          <Tab name='waterfall'
               content={<Waterfall/>}/>
          <Tab name='charts'
               content={<Charts/>}/>
          <Tab name='components'
               content={<Components/>}/>
          <Tab name='timeline'
               content={<Timeline/>}/>
        </Viewer>
      )
    }

    return (
      <Viewer name='advanced'
              showOptionsBar={true}
              namespaces={['aura', 'default']}
              bucket={bucket}
              header={<Header onPopout={::this.popout}
                              onPull={::this.pull}
                              onClear={::this.clear}
                              onExport={::this.export}
                              onImport={::this.import}
                              onPush={::this.push}/>}
              footer={<SimpleFooter />}>

        <Tab name='insights'
             content={<Insight/>}/>
        <Tab name='waterfall'
             content={<Waterfall/>}/>
        <Tab name='charts'
             content={<Charts/>}/>
        <Tab name='components'
             content={<Components/>}/>
        <Tab name='timeline'
             content={<Timeline/>}/>
        <Tab name='workspace'
             content={<Workspace/>}/>
        <Tab name='cost'
             content={<Cost/>}/>
        <Tab name='actions'
             content={<Actions/>}/>
        <Tab name='raw'
             destroyInactive={true}
             content={<Raw/>}/>
        <Tab name='help'
             content={<Help/>}/>
      </Viewer>
    );
  }
}