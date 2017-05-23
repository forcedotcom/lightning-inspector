import React from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import Checkbox from 'rc-checkbox';
import ContentProxy from '../message/ViewerContentProxy';
import Storage, { sync } from '../storage';
import _ from 'lodash';
import './OptionBar.scss';
import './helpers/RCCheckbox.less';
import './helpers/ReactSelect.scss';

class OptionBar extends React.Component {
  static height = 24;

  state = { optionTypes: [] };

  setOptionTypes(optionTypes) {
    this.setState({ optionTypes })
  }

  _setOverflowEnabled(visible) {
    const node = ReactDOM.findDOMNode(this);

    if (visible) {
      node.style.overflowX = 'visible';
    } else {
      node.style.overflowX = 'visible'; // visible
    }
  }

  async componentWillMount() {
    const { namespaces } = this.props;

    let injectedSyncStorage = {};

    try {
      injectedSyncStorage = await ContentProxy.this.getInjectedSyncStorage();
    } catch (e) {
      // ignore
    }
    
    const syncStorage = await sync.get(namespaces);

    this.setState({
      injectedSyncStorage: new Storage(injectedSyncStorage),
      syncStorage: new Storage(syncStorage),
      ready: true
    });
  }

  componentWillReceiveProps = this.componentWillMount;

  render() {
    let { optionTypes, syncStorage, injectedSyncStorage, ready } = this.state;
    let { onOptionChange, style } = this.props;

    if (ready != true) {
      return null;
    }

    // TODO temporary; clean up this
    optionTypes = optionTypes.map((optionType, i) => {
      const method = optionType.hasOwnProperty('options') ? 'select' : 'checkbox';
      const visibleKey = optionType.name || optionType.key.substring(optionType.key.indexOf('__') + 2); // TODO what if array?
      const namespace = optionType.namespace;

      const headOptionValue = _.reduce(
        Array.isArray(optionType.key) ? optionType.key : [optionType.key],
        (memo, key) => memo && syncStorage.get(namespace, key),
        true
      );

      const baseOptionValue = _.reduce(
        Array.isArray(optionType.key) ? optionType.key : [optionType.key],
        (memo, key) => memo && injectedSyncStorage.get(namespace, key),
        true
      );

      const warning = headOptionValue != baseOptionValue && ' (updated on page refresh)';

      switch (method) {
        case 'select':
          return (
            <div key={optionType.key}
                 className={`option ${method} ${optionType.hasOwnProperty('require') && 'required'}`}>
              <div className='select-label'>{visibleKey}<span title='Will be updated on page refresh'>{warning}</span>:
              </div>
              <Select style={{ width: 150, minWidth: 150 }}
                      simpleValue
                      onChange={value => onOptionChange(namespace, optionType.key, value)}
                      value={headOptionValue}
                      placeholder={'Select...'}
                      onOpen={() => this._setOverflowEnabled(true)}
                      onClose={() => this._setOverflowEnabled(false)}
                      options={optionType.options}/>
            </div>
          );

        default:
        case 'checkbox':
          return (
            <div key={optionType.key}
                 className={`option ${method} ${optionType.hasOwnProperty('require') && 'required'}`}>
              <Checkbox checked={!!headOptionValue}
                        onChange={e => onOptionChange(namespace, optionType.key, e.target.checked)}/>
              <div className='checkbox-label'>{visibleKey}<span title='Will be updated on page refresh'>{warning}</span>
              </div>
            </div>
          );
      }
    });

    return (
      <div className='options'
           style={style}>
        {optionTypes.length === 0 ?
          <div className='no-options'>This module does not have any required options</div> : optionTypes}
      </div>
    )
  }
}

export default OptionBar;
