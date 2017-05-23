import React from 'react';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import MinifySourcesWorker from 'worker-loader?inline!./MinifySourcesWorker';
import AceEditor from '../misc/AceEditor';

export default class MinifySources extends React.Component {
  state = { failedComponentNames: [] };

  async _calculateState({ bucket } = this.props) {
    this.setState({ status: 'Fetching definitions...' });

    const componentDefinitions = await ContentProxy.gatherer('aura', { bucket }).getArtifact('componentDefinitions');

    const worker = new MinifySourcesWorker();
    worker.postMessage(JSON.stringify(componentDefinitions));
    worker.onmessage = event => {
      const failedComponentNames = JSON.parse(event.data);
      const componentDefinitionCount = Object.keys(componentDefinitions).length;

      this.setState({
        failedComponentNames,
        componentDefinitions,
        componentDefinitionCount,
        status: true,
        score: (componentDefinitionCount - failedComponentNames.length) / componentDefinitionCount * 100
      });

      worker.terminate();
    };
  }

  componentDidMount = () => this._calculateState();
  componentWillReceiveProps = this._calculateState;

  render() {
    const { failedComponentNames, componentDefinitionCount, status, score } = this.state;
    const { theme, AuditResult } = this.props;

    return (
      <AuditResult title='Minify Code'
                   score={score}
                   status={status}
                   description={<div>Component sources should be delivered minified in PROD mode to improve network transfer performance. 
                   If components show up as unminified, consider compiling them with the google closure compiler to find out any issues preventing minification. 
                   <br/><br/>The closure compiler can be downloaded at https://developers.google.com/closure/compiler/docs/gettingstarted_app, and run like this for eg.<br/><br/>
                   <pre>java -jar compiler.jar --js hello.js --js_output_file hello-compiled.js</pre><br/>Custom Components currently do not support minification.</div>}
                   groups={['ResourceEfficiency']}>
        <div>
          Page has about <b>{componentDefinitionCount}</b> components; <b>{failedComponentNames.length}</b> components
          need compression.
          { failedComponentNames.length ?
            <div style={{ marginTop: 10 }}>
              <AceEditor value={failedComponentNames.join('\n')}
                         theme={theme}
                         height='300px'
                         width='100%'/>
            </div> : null }
        </div>
      </AuditResult>
    );
  }
}