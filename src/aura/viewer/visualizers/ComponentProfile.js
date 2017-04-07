import React from 'react';
import ReactDOM from 'react-dom';
import ComponentDirectory from './ComponentDirectory';
import _ from 'lodash';
import Select from '../../../core/viewer/helpers/Select';
import Promise from 'bluebird';
import alertify from 'alertify.js';
import './ComponentProfile.scss';

const DEFAULT_SNAPSHOT = '@current';

class ComponentProfile extends React.Component {
  state = {
    baseSnapshot: null,
    baseSnapshotKey: null,
    baseCycles: [],
    headCycles: [],
    baseSelectedCycles: {},
    headSelectedCycles: {},
    headSnapshot: null,
    headSnapshotKey: null,
    lastUpdatedSnapshot: null,
    snapshotKeys: [DEFAULT_SNAPSHOT]
  };

  static defaultProps = {
    onSelectSnapshotKey: (mode, key) => localStorage.setItem('component-profile-' + mode, key),
    getSelectedSnapshotKey: (mode) => localStorage.getItem('component-profile-' + mode),
    showAuraCycles: true
  };

  constructor(...args) {
    super(...args);

    alertify.parent(document.body);
  }

  _onOptionsChange(options) {
    window.localStorage.setItem('component-options', JSON.stringify(options));
  }

  _getOptions() {
    try {
      return JSON.parse(window.localStorage.getItem('component-options')) || {};
    } catch (e) {
      return {};
    }
  }

  _getColumnWidths() {
    try {
      return JSON.parse(window.localStorage.getItem('table-column-widths')) || {};
    } catch (e) {
      return {};
    }
  }

  _setColumnWidths(columnWidths) {
    window.localStorage.setItem('table-column-widths', JSON.stringify(columnWidths));
  }

  _calculateState(props = this.props) {
    const { getSelectedSnapshotKey } = props;

    const baseKey = getSelectedSnapshotKey('base');
    const headKey = getSelectedSnapshotKey('head');

    this.fetchKeys();

    if (!baseKey && !headKey) {
      this.selectSnapshot('base', DEFAULT_SNAPSHOT);

      return;
    }

    if (baseKey) {
      this.selectSnapshot('base', baseKey);
    }

    if (headKey) {
      this.selectSnapshot('head', headKey);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ baseSnapshotKey: null, headSnapshotKey: null }, () => this._calculateState(nextProps));
  }

  componentDidMount() {
    this._calculateState();
    this._updateMainHeight();
  }

  componentDidUpdate() {
    this._updateMainHeight();
  }

  async fetchKeys(callback) {
    const { store } = this.props;
    const snapshotKeys = await store.keys();
    const snapshotAliases = {};

    await Promise.each(snapshotKeys, async key => {
      snapshotAliases[key] = await store.alias(key);
    });

    this.setState({
      snapshotKeys: [DEFAULT_SNAPSHOT, ...snapshotKeys],
      snapshotAliases: snapshotAliases
    }, () => {
      if (typeof callback === 'function') {
        callback();
      }
    });
  }

  selectCycles(type, cycles) {
    this.setState({ [type === 'base' ? 'baseSelectedCycles' : 'headSelectedCycles']: _.zipObject(cycles, cycles) });
  }

  selectCycle(type, cycle, selected) {
    const { baseSelectedCycles, headSelectedCycles } = this.state;

    if (type === 'base') {
      if (selected) {
        baseSelectedCycles[cycle] = cycle;
      } else {
        delete baseSelectedCycles[cycle];
      }
    } else {
      if (selected) {
        headSelectedCycles[cycle] = cycle;
      } else {
        delete headSelectedCycles[cycle];
      }
    }

    this.setState({ headSelectedCycles, baseSelectedCycles });
  }

  async deleteSnapshot(mode, key) {
    const { store } = this.props;

    key = String(key);

    await store.delete(key);

    this.selectSnapshot(mode, null);
    this.fetchKeys();
  }

  async  updateSnapshotAlias(key, alias) {
    const { store } = this.props;
    const { snapshotAliases } = this.state;

    snapshotAliases[key] = alias;

    this.setState({ snapshotAliases });

    await store.alias(key, alias);
  }

  _handleDelete(mode, key) {
    const { snapshotAliases } = this.state;

    key = String(key);

    const alias = snapshotAliases[key] || key;

    alertify.confirm(`Delete snapshot:${alias}?`, async() => {
      this.deleteSnapshot(mode, key);
      alertify.log(`Deleted snapshot:${alias}`);
    });
  }

  _handleRename(key, def) {
    alertify.defaultValue(def || key)
            .prompt(`Rename snapshot:${key}`,
              (alias, e) => {
                e.preventDefault();

                this.updateSnapshotAlias(key, alias);

                alertify.success(`Renamed to ${alias}`);
              }, e => e.preventDefault());
  }

  async selectSnapshot(mode, key) {
    const { store, onSelectSnapshotKey } = this.props;

    if (mode === 'base' && key == null) {
      this.setState({
        baseSnapshot: null,
        baseSnapshotKey: null,
        baseSelectedCycles: {},
        baseCycles: []
      });

      onSelectSnapshotKey(mode, '');
      return;
    }

    if (mode === 'head' && key == null) {
      this.setState({
        headSnapshot: null,
        headSnapshotKey: null,
        headSelectedCycles: {},
        headCycles: []
      });

      onSelectSnapshotKey(mode, '');
      return;
    }

    const fetchAndSetSnapshots = async mode => {
      if (mode === 'base') {
        this.setState({ baseSnapshot: {}, baseCycles: [], baseSelectedCycles: {} });
      } else {
        this.setState({ headSnapshot: {}, headCycles: [], headSelectedCycles: {} });
      }

      const snapshot = key === DEFAULT_SNAPSHOT ? this.props.componentHistory : await store.get(key);
      const cycles = _.uniq(_.map(snapshot, 'cycle'));
      const selectedCycles = _.zipObject(cycles, cycles);

      if (mode === 'base') {
        this.setState({ baseSnapshot: snapshot, baseCycles: cycles, baseSelectedCycles: selectedCycles });
      } else {
        this.setState({ headSnapshot: snapshot, headCycles: cycles, headSelectedCycles: selectedCycles });
      }

      onSelectSnapshotKey(mode, key);
    };

    if (mode === 'base') {
      this.setState({ baseSnapshotKey: String(key) });
    } else {
      this.setState({ headSnapshotKey: String(key) });
    }

    await fetchAndSetSnapshots(mode);
  }

  async setSnapshot() {
    const { store, componentHistory } = this.props;

    const nextDefaultKey = await store.add([]);

    alertify.defaultValue(nextDefaultKey)
            .prompt(`Give a name for your snapshot (default: ${nextDefaultKey}):`,
              async(alias, e) => {
                e.preventDefault();

                await store.delete(nextDefaultKey);
                const key = await store.add(componentHistory);

                if (key != alias) {
                  await store.alias(key, alias);
                }

                alertify.success('Added snapshot:' + alias);

                this.selectSnapshot('base', key);

                this.fetchKeys();
              }, async e => {
                e.preventDefault();

                await store.delete(nextDefaultKey);
              });

  }

  _updateMainHeight() {
    setTimeout(() => {
      let { main, toolbar1, toolbar2, componentDirectory } = this.refs;
      let offsetHeight = 0;

      if (main) {
        main = ReactDOM.findDOMNode(main);

        if (toolbar1) {
          offsetHeight += ReactDOM.findDOMNode(toolbar1).offsetHeight;
        }

        if (toolbar2) {
          offsetHeight += ReactDOM.findDOMNode(toolbar2).offsetHeight;
        }

        main.style.height = `calc(100% - ${offsetHeight}px)`;

        if (componentDirectory != null && componentDirectory.refs.table) {
          componentDirectory.refs.table.onResize();
        }
      }
    }, 0);
  }

  render() {
    const {
      baseSnapshot, headSnapshot, baseSnapshotKey, headSnapshotKey, baseSelectedCycles,
      baseCycles, headSelectedCycles, headCycles, snapshotKeys, snapshotAliases
    } = this.state;

    const { showAuraCycles } = this.props;

    const snapshotNames = snapshotKeys.map(key => {
      const alias = key === DEFAULT_SNAPSHOT ? key : snapshotAliases[key];
      return { label: (alias || key), value: key };
    });

    const baseCycleNames = baseCycles.map((cycle, i) => {
      const isSelected = baseSelectedCycles.hasOwnProperty(cycle);
      return { label: cycle, value: cycle, isSelected };
    });

    const headCycleNames = headCycles.map((cycle, i) => {
      const isSelected = headSelectedCycles.hasOwnProperty(cycle);
      return { label: cycle, value: cycle, isSelected };
    });

    return (
      <div style={{ width: '100%', height: '100%' }}>
        <div ref='toolbar1'
             className='component-toolbar'>
          <div style={{ width: '100%' }}>
            <div style={{ width: '50%', display: 'inline-block', verticalAlign: 'top' }}>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '100%' }}>
                  <Select value={baseSnapshotKey}
                          onChange={a => this.selectSnapshot('base', a && a.value)}
                          placeholder='Select base'
                          options={snapshotNames}/>
                </div>
                { baseSnapshotKey && baseSnapshotKey !== DEFAULT_SNAPSHOT &&
                <button className='generic'
                        onClick={() => this._handleRename(baseSnapshotKey, snapshotAliases[baseSnapshotKey])}>
                  ✎
                </button> }
                {baseSnapshotKey && baseSnapshotKey !== DEFAULT_SNAPSHOT &&
                <button className='generic'
                        onClick={() => this._handleDelete('base', baseSnapshotKey)}>
                  ✕
                </button> }
              </div>
            </div>
            <div style={{ width: '50%', display: 'inline-block', verticalAlign: 'top' }}>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '100%' }}>
                  <Select value={headSnapshotKey}
                          onChange={a => this.selectSnapshot('head', a && a.value)}
                          placeholder='Select head'
                          options={snapshotNames}/>
                </div>
                { headSnapshotKey && headSnapshotKey !== DEFAULT_SNAPSHOT &&
                <button className='generic'
                        onClick={() => this._handleRename(headSnapshotKey, snapshotAliases[headSnapshotKey])}>
                  ✎
                </button> }
                { headSnapshotKey && headSnapshotKey !== DEFAULT_SNAPSHOT &&
                <button className='generic'
                        onClick={() => this._handleDelete('head', headSnapshotKey)}>
                  ✕
                </button> }
              </div>
            </div>
          </div>
          <button className='generic'
                  onClick={::this.setSnapshot}>
            Take Snapshot
          </button>
        </div>
        { showAuraCycles ? <div ref='toolbar2'
                                className='component-toolbar'>
          <div style={{ width: '50%', display: 'inline-block', verticalAlign: 'top' }}>
            <Select value={_.map(_.filter(baseCycleNames, a => a.isSelected), 'value')}
                    multi={true}
                    style={{ marginLeft: 0 }}
                    onChange={a => this.selectCycles('base', _.map(a, 'value'))}
                    placeholder='Select base cycle'
                    options={baseCycleNames}/>
          </div>
          <div style={{ width: '50%', display: 'inline-block', verticalAlign: 'top' }}>
            <Select value={_.map(_.filter(headCycleNames, a => a.isSelected), 'value')}
                    multi={true}
                    onChange={a => this.selectCycles('head', _.map(a, 'value'))}
                    placeholder='Select head cycle'
                    options={headCycleNames}/>
          </div>
        </div> : null }
        <div ref='main'
             style={{ width: '100%', height: 'calc(100% - 55px)' }}>
          <ComponentDirectory ref='componentDirectory'
                              getColumnWidths={::this._getColumnWidths}
                              setColumnWidths={::this._setColumnWidths}
                              onOptionsChange={::this._onOptionsChange}
                              getOptions={::this._getOptions}
                              {...this.props}
                              componentHistoryBase={(headSnapshot || baseSnapshot) && _.filter(baseSnapshot, event => baseSelectedCycles.hasOwnProperty(event.cycle))}
                              componentHistoryHead={headSnapshot && _.filter(headSnapshot, event => headSelectedCycles.hasOwnProperty(event.cycle))}/>
        </div>
      </div>
    );
  }
}

export default ComponentProfile;