import React from 'react';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import ComponentProfile from '../visualizers/ComponentProfile';
import { decodeContext, mergeContext, marksToTimings } from '../helpers/decode';
import SnapshotStore from '../helpers/SnapshotStore';
import ModeSelector from './ModeSelector';

class Components extends React.Component {
  static optionTypes = [
    { namespace: 'aura', key: 'collectComponentLifeCycleData', require: true, name: 'Enable' },
    { namespace: 'aura', key: 'collectAuraCycleData', name: 'Cycles' }
  ];

  state = {
    instrumentation: {},
    network: {}
  };

  async _onComponentClick(id) {
    await ContentProxy.gatherer('aura', { bucket: false }).inspectComponent(id);
  }

  async componentWillMount({ bucket } = this.props) {
    let [componentHistory] = await Promise.all([
      ContentProxy.gatherer('aura', { bucket }).getArtifact('componentLifeCycleMarks')
    ]);

    componentHistory = marksToTimings(componentHistory);
    componentHistory = decodeContext(componentHistory, { contextParser: 'qs' });
    componentHistory = mergeContext(componentHistory);

    for (const component of componentHistory) {
      component.name = component.name.replace('$', ':');
    }

    this.setState({ componentHistory });
  }

  componentWillReceiveProps = this.componentWillMount;

  render() {
    const { componentHistory } = this.state;
    const { theme } = this.props;

    return (
      <ComponentProfile theme={theme}
                        showAuraCycles={!ModeSelector.isSimpleMode()}
                        componentHistory={componentHistory}
                        store={new SnapshotStore()}
                        onComponentClick={::this._onComponentClick}/>
    );
  }
}

export default Components;