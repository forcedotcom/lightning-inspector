import React from 'react';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import { decodeContext, mergeContext, marksToTimings } from '../helpers/decode';
import _ from 'lodash';
import { Table, Column, Cell, Text, Header, ColumnGroup } from '../misc/FixedDataTable';
import './Cost.scss';
import Menu, { MenuItem } from 'rc-menu';
import Checkbox from 'rc-checkbox';

class Cost extends React.Component {
  static optionTypes = [
    { namespace: 'aura', key: 'collectComponentLifeCycleData', require: true, name: 'Enable' }
  ];

  state = {
    query: '',
    options: {
      showSelfLifeCycles: false,
      showTotalLifeCycles: false
    },
    optionsMenuVisible: false
  };

  async _calculateState({ bucket, query }, { computeCosts = false } = {}) {
    let { rootCostEntries, costEntries, total: selfTotalAcrossAllComponents }  = this.state;

    if (computeCosts) {
      let lifeCycles = await ContentProxy.gatherer('aura', { bucket }).getArtifact('componentLifeCycleMarks');

      lifeCycles = marksToTimings(lifeCycles);
      lifeCycles = decodeContext(lifeCycles, { contextParser: 'qs' });
      lifeCycles = mergeContext(lifeCycles);
      lifeCycles = _.sortBy(lifeCycles, lifeCycle => lifeCycle.start);

      const depths = new Array(100);
      const costs = {};

      for (const entry of lifeCycles) {
        const { start, end } = entry;

        let depth = 0;
        let lastEntry;

        while (true) {
          lastEntry = depths[depth];

          if (lastEntry != null) {
            if (start < lastEntry.end && lastEntry.start < end) {
              depth++;
              continue;
            }
          }

          entry.depth = depth;

          depths[depth] = entry;

          lastEntry = depths[depth - 1];

          if (lastEntry != null) {
            costs[lastEntry.name][`self.${lastEntry.type}`] -= entry.end - entry.start;
          }

          const duration = entry.end - entry.start;

          costs[entry.name] = costs[entry.name] || {};

          costs[entry.name][`count.${entry.type}`] = costs[entry.name][`count.${entry.type}`] || 0;
          costs[entry.name][`self.${entry.type}`] = costs[entry.name][`self.${entry.type}`] || 0;
          costs[entry.name][`total.${entry.type}`] = costs[entry.name][`total.${entry.type}`] || 0;

          costs[entry.name][`count.${entry.type}`] += 1;
          costs[entry.name][`self.${entry.type}`] += duration;
          costs[entry.name][`total.${entry.type}`] += duration;

          break;
        }
      }

      selfTotalAcrossAllComponents = 0;
      for (const componentName in costs) {
        let selfComponentTotal = 0;
        let totalComponentTotal = 0;

        for (const lifeCycle in costs[componentName]) {
          if (lifeCycle.indexOf('self.') === 0) {
            selfComponentTotal += costs[componentName][lifeCycle];
          } else if (lifeCycle.indexOf('total.') === 0) {
            totalComponentTotal += costs[componentName][lifeCycle];
          }
        }

        selfTotalAcrossAllComponents += selfComponentTotal;

        costs[componentName][`self.total`] = selfComponentTotal;
        costs[componentName][`total.total`] = totalComponentTotal;
      }

      for (const componentName in costs) {
        const cost = costs[componentName];

        cost[`self.weight`] = cost[`self.total`] / selfTotalAcrossAllComponents * 100;

        // create is count
        cost[`count`] = cost[`count.create`] || 1;

        cost[`self.total`] = cost[`self.total`];
        cost[`self.average`] = (
          (cost[`self.create`] || 0) / (cost[`count.create`] || 1) +
          (cost[`self.render`] || 0) / (cost[`count.render`] || 1) +
          (cost[`self.afterRender`] || 0) / (cost[`count.afterRender`] || 1) +
          (cost[`self.rerender`] || 0) / (cost[`count.rerender`] || 1) +
          (cost[`self.unrender`] || 0) / (cost[`count.unrender`] || 1) +
          (cost[`self.destroy`] || 0) / (cost[`count.destroy`] || 1)
        );

        cost[`total.total`] = cost[`total.total`];
        cost[`total.average`] = (
          (cost[`total.create`] || 0) / (cost[`count.create`] || 1) +
          (cost[`total.render`] || 0) / (cost[`count.render`] || 1) +
          (cost[`total.afterRender`] || 0) / (cost[`count.afterRender`] || 1) +
          (cost[`total.rerender`] || 0) / (cost[`count.rerender`] || 1) +
          (cost[`total.unrender`] || 0) / (cost[`count.unrender`] || 1) +
          (cost[`total.destroy`] || 0) / (cost[`count.destroy`] || 1)
        );
      }

      rootCostEntries = costEntries = [];
      for (const [name, attrs] of Object.entries(costs)) {
        for (const attr in attrs) {
          if (typeof attrs[attr] === 'number') {
            attrs[attr] = Math.round(attrs[attr] * 100) / 100;
          }
        }

        costEntries.push({
          ...attrs,
          name
        });
      }
    }

    costEntries = rootCostEntries;

    if (query) {
      costEntries = _.filter(costEntries, entry => entry.name.toLowerCase().indexOf(query.toLowerCase()) > -1);
    }

    this.setState({ rootCostEntries, costs: costEntries, ready: true, total: selfTotalAcrossAllComponents, query });
  }

  async componentWillMount({ bucket } = this.props) {
    this._calculateState({ bucket, query: this.state.query }, { computeCosts: true });
  }

  componentWillReceiveProps = this.componentWillMount;

  _onHeaderClick(columnKey) {
    let { sortColumn, sortDir, costs } = this.state;
    let nextSortDir;

    if (sortColumn && sortColumn === columnKey) {
      nextSortDir = sortDir === 'desc' ? 'asc' : 'desc';
    } else {
      nextSortDir = 'asc';
    }

    costs = _.sortBy(costs, component => component[columnKey] || 0);

    if (nextSortDir === 'asc') {
      costs = costs.reverse();
    }

    this.setState({ sortColumn: columnKey, sortDir: nextSortDir, costs });
  }

  _getColumnValue(rowIndex, columnKey) {
    const { costs } = this.state;

    return costs[rowIndex][columnKey];
  }

  render() {
    const { costs, ready, total, sortColumn, sortDir, query, options, optionsMenuVisible } = this.state;

    if (ready != true) {
      return null;
    }

    // TODO use simple table
    const columns = _.compact([
      // @formatter:off
      { columnKey: 'name', width: 150, align: 'left', required: true, group: '', fixed: true },
      { columnKey: 'count', width: 60, group: '', fixed: true },
      { columnKey: 'self.average', flexGrow: 1, width: 100, displayName: 'Average (ms)', group: 'self' },
      { columnKey: 'self.total', flexGrow: 1, width: 100, displayName: 'Total (ms)', group: 'self' },
      { columnKey: 'self.weight', flexGrow: 1, width: 100, append: '%', displayName: 'Weight', group: 'self' },
      { columnKey: 'total.average', flexGrow: 1, width: 80, displayName: 'Average (ms)', group: 'aggregate' },
      { columnKey: 'total.total', flexGrow: 1, width: 100, displayName: 'Total (ms)', group: 'aggregate' },
      { columnKey: 'self.create', flexGrow: 1, width: 100, displayName: 'Create (ms)', shouldShow: options.showSelfLifeCycles, group: 'Self Life Cycles' },
      { columnKey: 'self.render', flexGrow: 1, width: 100, displayName: 'Render (ms)', shouldShow: options.showSelfLifeCycles, group: 'Self Life Cycles' },
      { columnKey: 'self.rerender', flexGrow: 1, width: 100, displayName: 'Rerender (ms)', shouldShow: options.showSelfLifeCycles, group: 'Self Life Cycles' },
      { columnKey: 'self.unrender', flexGrow: 1, width: 100, displayName: 'Unrender (ms)', shouldShow: options.showSelfLifeCycles, group: 'Self Life Cycles' },
      { columnKey: 'self.afterRender', flexGrow: 1, width: 100, displayName: 'AfterRender (ms)', shouldShow: options.showSelfLifeCycles, group: 'Self Life Cycles' },
      { columnKey: 'self.destroy', flexGrow: 1, width: 100, displayName: 'Destroy (ms)', shouldShow: options.showSelfLifeCycles, group: 'Self Life Cycles' },
      { columnKey: 'total.create', flexGrow: 1, width: 100, displayName: 'Create (ms)', shouldShow: options.showTotalLifeCycles, group: 'Aggregate Life Cycles' },
      { columnKey: 'total.render', flexGrow: 1, width: 100, displayName: 'Render (ms)', shouldShow: options.showTotalLifeCycles, group: 'Aggregate Life Cycles' },
      { columnKey: 'total.afterRender', flexGrow: 1, width: 100, displayName: 'AfterRender (ms)', shouldShow: options.showTotalLifeCycles, group: 'Aggregate Life Cycles' },
      { columnKey: 'total.rerender', flexGrow: 1, width: 100, displayName: 'Rerender (ms)', shouldShow: options.showTotalLifeCycles, group: 'Aggregate Life Cycles' },
      { columnKey: 'total.unrender', flexGrow: 1, width: 100, displayName: 'Unrender (ms)', shouldShow: options.showTotalLifeCycles, group: 'Aggregate Life Cycles' },
      { columnKey: 'total.destroy', flexGrow: 1, width: 100, displayName: 'Destroy (ms)', shouldShow: options.showTotalLifeCycles, group: 'Aggregate Life Cycles' }
      // @formatter:on
    ].map((columnProps, i) => {
      if (columnProps.shouldShow !== false) {
        return <Column key={i}
                       isResizable={false}
                       header={<Header sortColumn={sortColumn}
                                       sortDir={sortDir}
                                       displayName={columnProps.displayName || columnProps.columnKey}
                                       onHeaderClick={::this._onHeaderClick}
                                       align={columnProps.align}/>}
                       cell={<Text getColumnValue={::this._getColumnValue}
                                   align={columnProps.align}
                                   append={columnProps.append}/>}
                       {...columnProps}/>
      }
    }));

    const groups = _.map(_.groupBy(columns, column => column.props.group), (columns, group) => {
      return (
        <ColumnGroup key={group}
                     fixed={group === ''}
                     header={<Header displayName={group}
                                     sortColumn='NO_SORT'/>}>
          {columns}
        </ColumnGroup>
      )
    });

    return (
      <div className='costs'>
        <div className='banner-message error'>
          Total Component JavaScript: {total.toFixed(2)} ms
        </div>
        <div style={{ height: 'calc(100% - 24px)', width: '100%', position: 'relative' }}>
          <div className='search-bar'>
            <input type='text'
                   className={query && 'search-highlight'}
                   onChange={e => this._calculateState({ query: e.target.value })}
                   value={query}
                   placeholder='Search'/>
            <button className='generic '
                    selected={optionsMenuVisible}
                    onClick={() => this.setState({ optionsMenuVisible: !optionsMenuVisible })}>
              Options
            </button>
          </div>
          <div className='options-wrapper'
               style={{ display: optionsMenuVisible ? 'block' : 'none' }}>
            <Menu
              onClick={({ key }) => this.setState({ options: Object.assign(options, { [key]: !options[key] }) })}>
              <MenuItem key='showSelfLifeCycles'>
                <Checkbox checked={options.showSelfLifeCycles}/>
                <label>Show breakdown of SELF time by life cycle</label>
              </MenuItem>
              <MenuItem key='showTotalLifeCycles'>
                <Checkbox checked={options.showTotalLifeCycles}/>
                <label>Show breakdown of TOTAL time by life cycle</label>
              </MenuItem>
            </Menu>
          </div>
          <div style={{ width: '100%', height: 'calc(100% - 25px)' }}>
            <Table rowsCount={costs.length}>
              {groups}
            </Table>
          </div>
        </div>
      </div>
    );
  }
}

export default Cost;