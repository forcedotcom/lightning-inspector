import React from 'react';
import ReactList from 'react-list';
import SplitPane from '../misc/SplitPane';
import AceEditor from '../misc/AceEditor';
import Checkbox from 'rc-checkbox';
import beautify from 'js-beautify';
import alertify from 'alertify.js';
import _ from 'lodash';
import { ObjectDefinition, FunctionDefinition } from '../helpers/ComponentTransform';
import Placeholder from '../misc/Placeholder';
import '../../../core/viewer/helpers/RCMenu.less';
import '../../../core/viewer/helpers/RCCheckbox.less';
import '../../../core/viewer/helpers/SplitPane.scss';
import './Workspace.scss';

const lowerCaseCache = new Map();

class Workspace extends React.Component {
  static defaultProps = {
    onSaveComponent: null,
    overrideComponentDefinitions: {},
    overrideComponentNames: [],
    activatedOverrideComponentNames: [],
    commentCode: true,
    onAddOverrideComponentDefinition: () => null,
    onDeleteOverrideComponentDefinition: () => null,
    onSaveOverrideComponentDefinition: () => null,
    onActivateChangeOverrideComponentName: () => null
  };

  currComponentNames = [];
  currOverrideComponentNames = [];

  state = {
    activeQuery: '',
    overrideQuery: '',
    globalQuery: '',
    activeFileName: null,
    isOverride: false
  };

  constructor(...args) {
    super(...args);

    alertify.parent(document.body);
  }

  static TypeColorMap = {
    object: 'blue',
    string: 'orange',
    deferredObject: 'purple',
    default: 'red',
    null: 'red'
  };

  renderDefault(index, key) {
    const { activeFileName, isOverride } = this.state;
    const { componentDefinitions } = this.props;
    const { currComponentNames } = this;

    const name = currComponentNames[index];
    const componentDefinition = componentDefinitions[name];

    let type = typeof componentDefinition;
    if (componentDefinition == null) {
      type = 'null';
    } else if (componentDefinition.preventFirstAddComponentClass === true) {
      type = 'deferredObject';
    }

    return (
      <div key={key}
           className={'workspace-filename ' + (activeFileName === name && !isOverride && 'workspace-filename-selected')}>
        <div onClick={() => this.setState({ activeFileName: name, isOverride: false })}
             className='workspace-filename-text'>
          {componentDefinitions.hasOwnProperty(name) &&
          <div
            className={`workspace-filename-bulb workspace-filename-bulb-${Workspace.TypeColorMap[type] || Workspace.TypeColorMap.default}`}
            title={`Stored as ${type}`}/>}
          {currComponentNames[index]}
        </div>
      </div>
    );
  }

  _setOverrideComponentNameActivated(name, activated) {
    const { activatedOverrideComponentNames, onActivateChangeOverrideComponentName } = this.props;
    const idx = activatedOverrideComponentNames.indexOf(name) + 1;

    if (activated && !idx) {
      activatedOverrideComponentNames.push(name);
    } else if (!activated && idx) {
      activatedOverrideComponentNames.splice(idx - 1, 1);
    }

    onActivateChangeOverrideComponentName(name, activated, activatedOverrideComponentNames);

    setTimeout(() => this.forceUpdate());
  }

  renderOverride(index, key) {
    const { activeFileName, isOverride } = this.state;
    const { activatedOverrideComponentNames, componentDefinitions } = this.props;
    const { currOverrideComponentNames } = this;

    const name = currOverrideComponentNames[index];
    const isActive = componentDefinitions.hasOwnProperty(name);

    return (
      <div key={key}
           className={'workspace-filename ' + (activeFileName === name && isOverride && 'workspace-filename-selected')}>
        <Checkbox onChange={e => this._setOverrideComponentNameActivated(name, e.target.checked)}
                  checked={activatedOverrideComponentNames.indexOf(name) > -1}/>
        <div onClick={() => this.setState({ activeFileName: name, isOverride: true })}
             className='workspace-filename-text'>
          <div
            className={`workspace-filename-bulb ${isActive ? 'workspace-filename-bulb-green' : 'workspace-filename-bulb-gray'}`}
            title={`${isActive ? 'Visible' : 'Not found on'} on page`}/>
          {currOverrideComponentNames[index]}
        </div>
      </div>
    );
  }

  _resizeAce() {
    if (this.refs.aceMeta) this.refs.aceMeta.editor.resize();
    if (this.refs.aceCode) this.refs.aceCode.editor.resize();
  }

  _addOverride(name) {
    const { componentDefinitions, overrideComponentNames, overrideComponentDefinitions, onAddOverrideComponentDefinition } = this.props;

    if (overrideComponentNames.indexOf(name) < 0) {
      overrideComponentNames.push(name);
      overrideComponentDefinitions[name] = componentDefinitions[name] || {};
      onAddOverrideComponentDefinition(name, overrideComponentDefinitions[name], overrideComponentDefinitions);
    }

    this.setState({ activeFileName: name, isOverride: true }, () => alertify.log(`Editing ${name}`));
  }

  _deleteOverride(name) {
    const { overrideComponentNames, overrideComponentDefinitions, onDeleteOverrideComponentDefinition } = this.props;
    const idx = overrideComponentNames.indexOf(name);

    if (idx + 1) {
      overrideComponentNames.splice(idx, 1);
      delete overrideComponentDefinitions[name];
      onDeleteOverrideComponentDefinition(name, overrideComponentDefinitions[name], overrideComponentDefinitions);
      this._setOverrideComponentNameActivated(name, false);
    }

    this.setState({ activeFileName: null, isOverride: false }, () => alertify.log(`Deleted ${name}`));
  }

  _saveOverride(name, forceUpdate = true, hideSuccess = false) {
    const { overrideComponentDefinitions, onSaveOverrideComponentDefinition } = this.props;
    const meta = this.refs.aceMeta.editor.getSession().getValue();
    const code = this.refs.aceCode.editor.getSession().getValue();
    const { encoder } = this;

    try {
      overrideComponentDefinitions[name] = encoder.decode(meta, code);
      onSaveOverrideComponentDefinition(name, overrideComponentDefinitions[name], overrideComponentDefinitions);
    } catch (e) {
      alertify.error(e.message);
    }

    let pre = 'override';
    lowerCaseCache.delete(pre + name);

    if (!hideSuccess) {
      alertify.success(`Saved ${name}`);
    }

    if (forceUpdate) {
      this.forceUpdate();
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const { activeFileName, isOverride } = this.state;

    if (
      activeFileName != null &&
      nextState.activeFileName != null &&
      ((nextState.activeFileName !== activeFileName) && isOverride) ||
      ((nextState.activeFileName === activeFileName) && (isOverride && !nextState.isOverride))
    ) {
      this._saveOverride(activeFileName, false, true);
    }
  }

  render() {
    const { theme, componentDefinitions, componentNames, overrideComponentNames, overrideComponentDefinitions, commentCode } = this.props;
    const { activeFileName, isOverride, activeQuery, overrideQuery, globalQuery } = this.state;

    let currOverrideComponentNames = overrideComponentNames;
    let currComponentNames = componentNames;
    let data = (isOverride ? overrideComponentDefinitions : componentDefinitions)[activeFileName];
    let meta = '';
    let code = '';

    if (data != null) {
      let encoder;

      try {
        if (typeof data === 'object') {
          encoder = new ObjectDefinition(data);
        } else {
          encoder = new FunctionDefinition(data, commentCode);
        }

        meta = beautify(encoder.meta(), { indent_size: 2, brace_style: 'collapse-preserve-inline' });
        code = beautify(encoder.code(), { indent_size: 2, brace_style: 'collapse-preserve-inline' });
      } catch (e) {
        alertify.log('Looks like you have a critical syntax error when you saved. Delete the edited file and start over :(');
      }

      this.encoder = encoder;
    }

    if (globalQuery) {
      let pre;

      pre = 'override';
      currOverrideComponentNames = _.filter(currOverrideComponentNames, a => {
        if (!lowerCaseCache.has(pre + a)) {
          lowerCaseCache.set(pre + a, JSON.stringify(overrideComponentDefinitions[a]).toLowerCase());
        }

        return lowerCaseCache.get('override' + a).indexOf(globalQuery) + 1 || a.toLowerCase().indexOf(globalQuery) + 1;
      });

      pre = 'active';
      currComponentNames = _.filter(currComponentNames, a => {
        if (!lowerCaseCache.has(pre + a)) {
          lowerCaseCache.set(pre + a, JSON.stringify(componentDefinitions[a]).toLowerCase());
        }

        return lowerCaseCache.get(pre + a).indexOf(globalQuery) + 1 || a.toLowerCase().indexOf(globalQuery) + 1;
      });
    }

    if (overrideQuery) {
      currOverrideComponentNames = _.filter(currOverrideComponentNames, a => a.toLowerCase().indexOf(overrideQuery) + 1);
    }

    if (activeQuery) {
      currComponentNames = _.filter(currComponentNames, a => a.toLowerCase().indexOf(activeQuery) + 1);
    }

    this.currOverrideComponentNames = currOverrideComponentNames;
    this.currComponentNames = currComponentNames;

    return (
      <div className={`${theme} workspace workspace-full`}>
        <div className='search-bar'>
          <input type='text'
                 className={globalQuery && 'search-highlight '}
                 onInput={e => this.setState({ globalQuery: e.target.value.toLowerCase() })}
                 placeholder='Search all content'/>
        </div>
        <div style={{ height: 'calc(100% - 25px)', width: '100%', position: 'relative'  }}>
          <SplitPane minSize={100}
                     onChange={::this._resizeAce}
                     defaultSize={200}>
            <SplitPane minSize={100}
                       defaultSize='70%'
                       primary='first'
                       split='horizontal'>
              <div className='workspace-full'>
                <div className='workspace-header'>Active</div>
                <div className='search-bar'>
                  <input type='text'
                         className={activeQuery && 'search-highlight '}
                         onInput={e => this.setState({ activeQuery: e.target.value.toLowerCase() })}
                         placeholder='Filter by name'/>
                </div>
                <div style={{ height: 'calc(100% - 27px - 22px)', width: '100%', overflowY: 'scroll', position: 'relative'  }}>
                  <ReactList
                    itemRenderer={::this.renderDefault}
                    length={currComponentNames.length}
                    type='uniform'/>
                </div>
              </div>
              <div className='workspace-full'>
                <div className='workspace-header'>Override
                  <small> (check to activate)</small>
                </div>
                <div className='search-bar'>
                  <input type='text'
                         className={overrideQuery && 'search-highlight '}
                         onInput={e => this.setState({ overrideQuery: e.target.value.toLowerCase() })}
                         placeholder='Filter by name'/>
                </div>
                <div style={{ height: 'calc(100% - 27px - 22px)', width: '100%', overflowY: 'scroll', position: 'relative' }}>
                  <ReactList
                    itemRenderer={::this.renderOverride}
                    length={currOverrideComponentNames.length}
                    type='uniform'/>
                </div>
              </div>
            </SplitPane>
            { activeFileName == null ? <Placeholder>Click on a file to edit</Placeholder> :
              <div className='workspace-full'
                   style={{ fontSize: 11, position: 'relative' }}>
                <div className='workspace-toolbar'>
                  <div className='workspace-overview'
                       style={{ float: 'left' }}>
                    <span className='workspace-overview-mode'>{isOverride ? 'Editing' : 'Readonly'}</span>
                    {/*{ isOverride && <span ref='overviewStatus' className='workspace-overview-status'>(Save)</span> }*/}
                    <span className='workspace-overview-filename'>{activeFileName}</span>
                  </div>
                  { !isOverride &&
                  <button className='generic '
                          style={{ float: 'right' }}
                          onClick={() => this._addOverride(activeFileName)}>Edit</button> }
                  { isOverride && <button className='generic '
                                          style={{ float: 'right' }}
                                          onClick={() => this._saveOverride(activeFileName)}>Save</button> }
                  { isOverride && <button className='generic '
                                          style={{ float: 'right' }}
                                          onClick={() => this._deleteOverride(activeFileName)}>Delete</button> }
                </div>
                <div>
                  <SplitPane minSize={100}
                             defaultSize='80%'
                             primary='first'
                             onChange={::this._resizeAce}
                             split='horizontal'>
                    <div className='workspace-full workspace-flex-vertical'>
                      <div className='workspace-header workspace-small'>JAVASCRIPT</div>
                      <div className='workspace-full'>
                        <AceEditor ref='aceCode'
                                   readOnly={!isOverride}
                                   mode='javascript'
                                   theme={theme}
                                   height='100%'
                                   tabSize={2}
                                   width='100%'
                                   value={code}
                                   name={isOverride + activeFileName}/>
                      </div>
                    </div>
                    <div className='workspace-full workspace-flex-vertical'>
                      <div className='workspace-header workspace-small'>DEFINITION (FUNCTIONS NOT EDITABLE)</div>
                      <div className='workspace-full'>
                        <AceEditor ref='aceMeta'
                                   readOnly={!isOverride}
                                   mode='javascript'
                                   theme={theme}
                                   height='100%'
                                   tabSize={2}
                                   width='100%'
                                   value={meta}
                                   name={isOverride + activeFileName}/>
                      </div>
                    </div>
                  </SplitPane>
                </div>
              </div> }
          </SplitPane>
        </div>
      </div>
    )
  }
}

export default Workspace;
