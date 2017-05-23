import React from 'react';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import { local } from '../../../core/storage';
import SplitPane from '../misc/SplitPane';
import AceEditor from '../misc/AceEditor';
import { marksToTimings } from '../helpers/decode';
import _ from 'lodash';
import ReactList from 'react-list';
import './Actions.scss';

export default class Actions extends React.Component {
  static optionTypes = [
    { namespace: 'aura', key: 'filterActions', require: true, name: 'Enable' }

  ];

  state = {};

  async componentWillMount({ bucket } = this.props) {
    let [actions, filteredActions] = await Promise.all([
      ContentProxy.gatherer('aura', { bucket }).getArtifact('actionMarks'),
      local.get('aura', 'filteredActions')
    ]);

    actions = marksToTimings(actions);
    actions = _.filter(actions, action => action.event === 'enqueueAction');

    _.each(actions, action => action.name = action.name.substring(0, action.name.indexOf(':')));

    this.setState({ actions, ready: true, filteredActions });
  }

  componentWillReceiveProps = this.componentWillMount;

  async _onChange(value) {
    this.setState({ filteredActions: value });

    local.set('aura', 'filteredActions', value)
  }

  render() {
    const { ready, actions, filteredActions } = this.state;
    const { theme } = this.props;

    if (ready != true) {
      return null;
    }

    return (
      <div style={{ width: '100%', height: '100%' }}>
        <div className='actions-info banner-message warn'>
          Stop actions from firing i.e. <code>getRelatedListInfo</code>. Append <code>+&lt;time in ms&gt;</code> to
          defer actions i.e. <code>getRelatedListInfo+4000</code>
        </div>
        <div>
          <SplitPane primary='second'
                     minSize={200}>
            <AceEditor width='100%'
                       height='100%'
                       theme={theme}
                       onChange={::this._onChange}
                       value={filteredActions}/>
            <div className='actions-list'
                 style={{ height: '100%' }}>
              <div className='actions-header'>Enqueued Actions</div>
              <div>
                <ReactList
                  itemRenderer={(index, key) =>
                    <div key={key}
                         className='action-item'>{`${actions[index].name} (${(actions[index].end - actions[index].start).toFixed(2)} ms)`}</div>}
                  length={actions.length}
                  type='uniform'/>
              </div>
            </div>
          </SplitPane>
        </div>
      </div>
    );
  }
}
