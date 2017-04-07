import React from 'react';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import InstrumentationParser from '../../parser/InstrumentationParser';
import NetworkParser from '../../parser/NetworkParser';
import AuraWaterfall from '../visualizers/Waterfall';
import { marksToTimings, mergeContext } from '../helpers/decode';
import Spinner from '../misc/Spinner';
import Placeholder from '../misc/Placeholder';
import _ from 'lodash';

class Waterfall extends React.Component {
  static optionTypes = [
    { namespace: 'aura', key: 'collectTransactionData', require: true, name: 'Enable' },
    { namespace: 'aura', key: 'collectAuraCycleData', name: 'Cycles' },
    { namespace: 'aura', key: 'managePageView', name: 'Close page view on current page' },
    { namespace: 'aura', key: 'increaseMaxXHRs', name: 'Increase XHR queue size (DEV mode)' },
    { namespace: 'aura', key: 'preventActionBoxCarring', name: 'Prevent action box-carring' }
  ];

  state = {
    instrumentation: [],
    network: []
  };

  async componentWillMount({ bucket, showHelpInfoBar = true } = this.props) {
    this.setState({ status: false });

    try {
      let [cycles, transactions, resources, window] = await Promise.all([
        ContentProxy.gatherer('aura', { bucket }).getArtifact('cycleMarks'),
        ContentProxy.gatherer('aura', { bucket, def: [] }).getArtifact('transactions'),
        ContentProxy.gatherer('default', { bucket }).getArtifact('networkResourceTimings'),
        ContentProxy.gatherer('default', { bucket, def: { location: {} } }).getArtifact('window')
      ]);

      // TODO improve reconcile/decode process
      cycles = marksToTimings(cycles, { contextParser: 'qs' });

      _.each(transactions, data => data.context.transaction = JSON.parse(data.context.transaction));
      transactions = mergeContext(transactions);

      const instrumentation = new InstrumentationParser(transactions, cycles).getParsed();
      const network = new NetworkParser(resources, window.location).getParsed();

      this.setState({ instrumentation, network, showHelpInfoBar, status: true });
    } catch (e) {
      this.setState({ status: e.message });
    }
  }

  componentWillReceiveProps = this.componentWillMount;

  render() {
    const { instrumentation, network, showHelpInfoBar, status } = this.state;
    const { theme } = this.props;

    if (status !== true) {
      return (
        <Placeholder>
          { status || <Spinner /> }
        </Placeholder>
      )
    }

    return (
      <div style={{ height: '100%', width: '100%' }}>
        { showHelpInfoBar ? <div className='banner-message warn'>
          <b>Double click</b> on a row for a drilldown; <b>single click</b> for more context. Network waterfall
          contains all requests/responses (searchable)
        </div> : null }
        <div style={{ height: `calc(100% - ${showHelpInfoBar ? 24 : 0}px)`, width: '100%' }}>
          <AuraWaterfall instrumentation={instrumentation}
                         network={network}
                         theme={theme}
                         onOptionsChange={options => localStorage.waterfallOptions = JSON.stringify(options)}
                         getOptions={options => JSON.parse(localStorage.waterfallOptions || '{}')}/>
        </div>
      </div>
    );
  }
}

export default Waterfall;
