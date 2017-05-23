import React from 'react';
import getReleaseVersion from '../helpers/getReleaseVersion';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import moment from 'moment';
import './Footer.scss';
import alertify from 'alertify.js';

export default class SimpleFooter extends React.Component {
  static height = 15;

  state = { ready: false, context: null, contentCollectorTime: null };


  async componentWillMount({ bucket } = this.props) {
    const [context, contentCollectorTime] = await Promise.all([
      ContentProxy.gatherer('aura', { bucket, def: { mode: 'NA' } }).getArtifact('context'),
      ContentProxy.bucket(bucket).getTime()
    ]);

    this.setState({ ready: true, context, contentCollectorTime });

    const { tabURL } = await ContentProxy.getActiveTab();
    const releaseVersion = await getReleaseVersion(tabURL);

    this.setState({ releaseVersion });

    const current = window.scriptLoader.getScript('viewer');
    const [remote] = await window.scriptLoader.getRemoteScriptsFromBackground('viewer');

    this.setState({ hasUpdate: current.version < remote.version, version: current.version });
  }

  async _promptDownload() {
    alertify.okBtn('Download').cancelBtn('Ignore').confirm(`The extension will download the latest scripts (new features). This will reload the page...`, async() => {
      await window.scriptLoader.updateScripts('gatherer', 'content', 'viewer', 'background');

      setTimeout(async() => {
        await ContentProxy.this.reload();

        window.close();
        window.location.reload();
      }, 1000);
    });
  }

  componentWillReceiveProps = this.componentWillMount;

  render() {
    const { ready, context, contentCollectorTime, releaseVersion, hasUpdate, version } = this.state;

    if (ready != true) {
      return null;
    }

    const notProd = context.mode.toLowerCase() !== 'prod';

    return (
      <div className='footer'
           style={{ height: SimpleFooter.height }}>
        <div className='bar'
             style={{ border: 'none' }}>
          <div className={`mode ${notProd && 'warning'}`}>{context.mode}</div>
          <div className='mode'>Extension Build: {version || 'LOCAL'}</div>
          { false && hasUpdate ? <div className='mode warning'
                                      onClick={::this._promptDownload}
                                      style={{ cursor: 'pointer' }}>OUTDATED (CLICK TO GET
            LATEST)</div> : null }
          { releaseVersion ? <div className='release-version'>{releaseVersion.asString}</div> : null }
          <div className='time'>Pulled {moment(contentCollectorTime).fromNow()}</div>
        </div>
      </div>
    );
  }
}
