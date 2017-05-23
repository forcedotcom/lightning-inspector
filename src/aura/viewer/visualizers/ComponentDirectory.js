import React from 'react';
import { Table, Column, Cell, Header, Text as DefaultText } from '../misc/FixedDataTable';
import Menu, { MenuItem } from 'rc-menu';
import Checkbox from 'rc-checkbox';
import _ from 'lodash';
import Placeholder from '../misc/Placeholder';
import '../../../core/viewer/helpers/RCCheckbox.less';
import '../../../core/viewer/helpers/RCMenu.less';
import './ComponentDirectory.scss';
import './SharedStyles.scss';

class Text extends React.PureComponent {
  render() {
    let { rowIndex, columnKey, getColumnValue, isComparisonMode, className = '', ...props } = this.props;
    let value = getColumnValue(rowIndex, columnKey);

    if (isComparisonMode) {
      if (typeof value === 'number') {
        if (value > 0) {
          className += ' fdt-cell-green';
          value = `+${value}`;
        } else if (value < 0) {
          className += ' fdt-cell-red';
          value = String(value);
        }
      }
    }

    if (value == null) {
      value = '-';
    }

    return (
      <DefaultText className={className} {...props} >
        {value}
      </DefaultText>
    );
  }
}

class ComponentDirectory extends React.Component {
  static defaultProps = {
    onComponentClick: () => 0,
    setColumnWidths: () => 0,
    getColumnWidths: () => ({}),
    componentHistoryBase: null,
    componentHistoryHead: null,
    onOptionsChange: () => 0,
    getOptions: () => ({})
  };

  dropdownEnabled = new Set();
  state = {
    components: [],
    columnWidths: this.props.getColumnWidths(),
    componentsMap: {},
    options: {
      showAggregate: true,
      showAuraNamespace: false,
      showLightningNamespace: false,
      showUiNamespace: false,
      showLeaks: true
    },
    canShowLeaks: false,
    optionsMenuVisible: false
  };

  _calculateState(nextState, props = this.props) {
    const { componentHistoryBase, componentHistoryHead, onOptionsChange } = props;
    const { options } = { ...this.state };
    const { sortDir, sortColumn, options: nextOptions = {} } = { ...this.state, ...nextState };
    const componentsMapBase = {};
    const componentsMapHead = {};

    Object.assign(options, nextOptions);

    if (componentHistoryBase) {
      for (let i = 0; i < componentHistoryBase.length; i++) {
        let currComponentHistory = componentHistoryBase;
        let type = currComponentHistory[i].type;
        let key = !options.showAggregate ? currComponentHistory[i].name + currComponentHistory[i].id : currComponentHistory[i].name;
        let currComponentsMap = componentsMapBase;
        currComponentsMap[key] = currComponentsMap[key] || {};
        currComponentsMap[key].key = key;
        currComponentsMap[key][type] = currComponentsMap[key][type] || 0;
        currComponentsMap[key][type]++;
        currComponentsMap[key].id = !options.showAggregate ? currComponentHistory[i].id : '-';
        currComponentsMap[key].name = currComponentHistory[i].name;
        currComponentsMap[key].ownerName = currComponentsMap[key].ownerName || currComponentHistory[i].ownerName;
        currComponentsMap[key].ownerId = currComponentsMap[key].ownerId || currComponentHistory[i].ownerId;
      }
    }

    if (componentHistoryHead) {
      for (let i = 0; i < componentHistoryHead.length; i++) {
        let currComponentHistory = componentHistoryHead;
        let type = currComponentHistory[i].type;
        let key = !options.showAggregate ? currComponentHistory[i].name + currComponentHistory[i].id : currComponentHistory[i].name;
        let currComponentsMap = componentsMapHead;
        currComponentsMap[key] = currComponentsMap[key] || {};
        currComponentsMap[key].key = key;
        currComponentsMap[key][type] = currComponentsMap[key][type] || 0;
        currComponentsMap[key][type]++;
        currComponentsMap[key].id = !options.showAggregate ? currComponentHistory[i].id : '-';
        currComponentsMap[key].name = currComponentHistory[i].name;
        currComponentsMap[key].ownerName = currComponentsMap[key].ownerName || currComponentHistory[i].ownerName;
        currComponentsMap[key].ownerId = currComponentsMap[key].ownerId || currComponentHistory[i].ownerId;
      }
    }

    const componentsMap = componentsMapBase;

    if (componentHistoryBase && componentHistoryHead) {
      for (let key of _.uniq(Object.keys(componentsMapHead).concat(Object.keys(componentsMapBase)))) {
        let baseComponent = componentsMap[key];
        let headComponent = componentsMapHead[key];

        if (baseComponent != null && headComponent != null) {
          for (let type of ['create', 'render', 'rerender', 'afterRender', 'unrender', 'destroy']) {
            let baseValue = baseComponent[type];
            let headValue = headComponent[type];

            if (headValue != null && baseValue != null) {
              baseComponent[type] = headValue - baseValue;
            } else if (headValue != null) {
              baseComponent[type] = headValue;
            } else if (baseValue != null) {
              // NOTE  if something is found in the BASE but not in the HEAD, we assume BASE removed it (similar to git)
              baseComponent[type] = -baseValue;
            }
          }
        } else if (headComponent != null) {
          baseComponent = componentsMap[key] = headComponent;
        } else {
          for (let type of ['create', 'render', 'rerender', 'afterRender', 'unrender', 'destroy']) {
            let baseValue = baseComponent[type];
            if (baseValue != null) {
              baseComponent[type] = -baseValue;
            }
          }
        }
      }
    }


    let components = Object.values(componentsMap);

    if (options.showLeaks) {
      nextRow:
        for (let i = 0; i < components.length; i++) {
          let component = components[i];
          for (let k of ['create', 'render', 'rerender', 'afterRender', 'unrender', 'destroy']) {
            if (component[k] != null && component[k] !== 0) {
              continue nextRow;
            }
          }

          components.splice(i--, 1);
        }
    }

    if (!options.showAuraNamespace) {
      for (let i = 0; i < components.length; i++) {
        let component = components[i];
        if (component.name.indexOf('aura') === 0) {
          components.splice(i--, 1);
        }
      }
    }

    if (!options.showUiNamespace) {
      for (let i = 0; i < components.length; i++) {
        let component = components[i];
        if (component.name.indexOf('ui') === 0) {
          components.splice(i--, 1);
        }
      }
    }

    if (!options.showLightningNamespace) {
      for (let i = 0; i < components.length; i++) {
        let component = components[i];
        if (component.name.indexOf('lightning') === 0) {
          components.splice(i--, 1);
        }
      }
    }

    if (options.query) {
      var queryLowerCase = options.query.toLowerCase();

      var skipKeys = {
        ownerName: true,
        ownerId: true,
        parentKey: true
      };

      nextRow:
        for (let i = 0; i < components.length; i++) {
          let component = components[i];
          for (let n in component) {
            if (!skipKeys.hasOwnProperty(n)) {
              if (String(component[n]).toLowerCase().indexOf(queryLowerCase) > -1) {
                continue nextRow;
              }
            }
          }

          components.splice(i--, 1);
        }
    }

    if (sortColumn) {
      components = components.sort((a, b) => {
        if (sortColumn === 'id' || sortColumn === 'name') {
          return (a[sortColumn] || '').localeCompare(b[sortColumn])
        }

        return (a[sortColumn] || 0) - (b[sortColumn] || 0);
      });

      if (sortDir === 'desc') {
        components = components.reverse();
      }
    }

    const isComparisonMode = componentHistoryBase && componentHistoryHead;

    setTimeout(() => onOptionsChange(options), 0);

    this.setState({
      components,
      scrollToRowIndex: null,
      scrollFromRowIndex: null,
      componentsMap,
      sortDir,
      sortColumn,
      isComparisonMode,
      options,
      canShowLeaks: isComparisonMode
    });
  }

  componentWillReceiveProps(nextProps) {
    this._calculateState({ ...this.state, options: nextProps.getOptions() }, nextProps);
  }

  componentWillMount() {
    const { getOptions } = this.props;

    this._calculateState({ ...this.state, options: getOptions() }, this.props);
  }

  _onRowClick(proxy, rowIndex) {
    const { dropdownEnabled } = this;
    const row = this.getRowByIndex(rowIndex);

    if (dropdownEnabled.has(row.key)) {
      dropdownEnabled.delete(row.key);
    } else {
      dropdownEnabled.add(row.key);
    }

    this.forceUpdate();
  }

  _onHeaderClick(columnKey) {
    const { sortColumn, sortDir } = this.state;
    let nextSortDir;

    if (sortColumn && sortColumn === columnKey) {
      nextSortDir = sortDir === 'desc' ? 'asc' : 'desc';
    } else {
      nextSortDir = 'asc';
    }

    this._calculateState({ sortColumn: columnKey, sortDir: nextSortDir });
  }

  _getColumnValue(rowIndex, columnKey) {
    const { components } = this.state;

    return components[rowIndex][columnKey];
  }

  getRowByIndex(rowIndex) {
    const { components } = this.state;

    return components[rowIndex];
  }

  _onCrumbClick(key, fromRowIndex) {
    const { components } = this.state;

    for (var i = 0; i < components.length; i++) {
      if (components[i].key === key) {
        this.setState({ scrollToRowIndex: i, scrollFromRowIndex: fromRowIndex });
        return;
      }
    }

    this.setState({ scrollToRowIndex: null, scrollFromRowIndex: null });
  }

  _rowDropdownHeightGetter(rowIndex) {
    const { dropdownEnabled } = this;
    const row = this.getRowByIndex(rowIndex);

    return dropdownEnabled.has(row.key) ? 30 : 0;
  }

  _rowClassNameGetter(rowIndex) {
    const { options, canShowLeaks }= this.state;
    const classNames = ['fdt-clickable'];

    if (rowIndex === this.state.scrollFromRowIndex) {
      classNames.push('fdt-row-highlighted-2');
    }

    if (rowIndex === this.state.scrollToRowIndex) {
      classNames.push('fdt-row-highlighted');
    }

    if (canShowLeaks && options.showLeaks) {
      const row = this.getRowByIndex(rowIndex);

      if ((row.create - ((row.unrender || 0) + (row.destroy || 0))) <= 0) {
        classNames.push('fdt-row-dim');
      } else if (row.create > 0) {
        classNames.push('fdt-row-red');
      } else {
        classNames.push('fdt-row-dim');
      }
    }

    return classNames.join(' ');
  }

  _rowDropdownGetter(rowIndex) {
    const { dropdownEnabled } = this;
    const row = this.getRowByIndex(rowIndex);

    if (dropdownEnabled.has(row.key)) {
      const { onComponentClick } = this.props;
      const { componentsMap, options } = this.state;

      let crumbs = [];
      let parentKey = row.parentKey;

      while (componentsMap[parentKey]) {
        const parentRow = componentsMap[parentKey];

        if (!(options.showAuraNamespace && parentRow.name.indexOf('aura:') === 0)) {
          crumbs.push(
            <div key={crumbs.length}
                 onClick={this._onCrumbClick.bind(this, parentKey, rowIndex)}
                 className='component-directory-crumb'>
              {parentRow.id}:{parentRow.name}
            </div>
          );
        }

        if (parentRow.parentKey === parentKey) {
          break;
        }

        parentKey = parentRow.parentKey
      }

      crumbs.unshift(<div key={crumbs.length}
                          onClick={() => onComponentClick(row.id)}
                          className='component-directory-crumb'>
        {row.id}:{row.name}
      </div>);

      let timeout;
      let allowScroll;

      return (
        <div className='component-directory-crumbs'
             onWheel={e => allowScroll ? e.stopPropagation() : null}
             onMouseEnter={() => {
               clearTimeout(timeout);
               timeout = setTimeout(() => allowScroll = true, 25);
             }}
             onMouseLeave={() => {
               clearTimeout(timeout);
               allowScroll = false;
             }}
             onClick={e => e.stopPropagation()}>
          {crumbs}
        </div>
      )
    }

    return null;
  }

  _onColumnResizeEndCallback(newColumnWidth, columnKey) {
    const { columnWidths } = this.state;
    const { setColumnWidths } = this.props;

    columnWidths[columnKey] = newColumnWidth;

    this.setState({ columnWidths });

    setTimeout(() => setColumnWidths(columnWidths), 0);
  }

  render() {
    const {
      components, sortColumn, sortDir, options, canShowLeaks,
      scrollToRowIndex, columnWidths, optionsMenuVisible, isComparisonMode
    } = this.state;

    // TODO use simple table
    const columns = [
      { columnKey: 'id', fixed: true, width: 50, required: true },
      { columnKey: 'name', fixed: true, width: 200, required: true, align: 'left' },
      { columnKey: 'create', flexGrow: 2, width: 50 },
      { columnKey: 'render', flexGrow: 2, width: 50 },
      { columnKey: 'rerender', flexGrow: 2, width: 50 },
      { columnKey: 'unrender', flexGrow: 2, width: 50 },
      { columnKey: 'afterRender', flexGrow: 2, width: 50 },
      { columnKey: 'destroy', flexGrow: 2, width: 50 }
    ].map((columnProps, i) =>
      <Column
        key={i}
        isResizable={true}
        header={<Header sortColumn={sortColumn}
                        sortDir={sortDir}
                        onHeaderClick={::this._onHeaderClick}
                        align={columnProps.align}/>}
        cell={<Text getColumnValue={::this._getColumnValue}
                    isComparisonMode={isComparisonMode}
                    align={columnProps.align}/>}
        {...columnProps}
        width={columnWidths[columnProps.columnKey] || columnProps.width}/>
    );


    return (
      <div className='component-directory'>
        <div className='search-bar'>
          <input type='text'
                 className={options.query && 'search-highlight '}
                 onChange={e => this._calculateState({ options: Object.assign(options, { query: e.target.value }) })}
                 value={options.query}
                 placeholder='Search'/>
          <button className='generic'
                  selected={optionsMenuVisible}
                  onClick={() => this.setState({ optionsMenuVisible: !optionsMenuVisible })}>
            Options
          </button>
        </div>
        <div className='options-wrapper'
             style={{ display: optionsMenuVisible ? 'block' : 'none' }}>
          <Menu
            onClick={({ key }) => this._calculateState({ options: Object.assign(options, { [key]: !options[key] }) })}>
            <MenuItem key='showAggregate'>
              <Checkbox checked={options.showAggregate}/>
              <label>Show aggregate</label>
            </MenuItem>
            <MenuItem key='showAuraNamespace'>
              <Checkbox checked={options.showAuraNamespace}/>
              <label>Show aura:*</label>
            </MenuItem>
            <MenuItem key='showUiNamespace'>
              <Checkbox checked={options.showUiNamespace}/>
              <label>Show ui:*</label>
            </MenuItem>
            <MenuItem key='showLightningNamespace'>
              <Checkbox checked={options.showLightningNamespace}/>
              <label>Show lightning:*</label>
            </MenuItem>
            { canShowLeaks ? <MenuItem key='showLeaks'>
              <Checkbox checked={options.showLeaks}/>
              <label>Show leaks (red)</label>
            </MenuItem> : null }
          </Menu>
        </div>
        <div style={{ width: '100%', height: 'calc(100% - 25px)', position: 'relative' }}>
          {components == null || components.length === 0 ?
            <Placeholder text='NO COMPONENTS'/> :
            <Table
              ref='table'
              onColumnResizeEndCallback={::this._onColumnResizeEndCallback}
              isColumnResizing={false}
              scrollToRow={scrollToRowIndex}
              rowsCount={components.length}
              rowClassNameGetter={::this._rowClassNameGetter }
              rowDropdownHeightGetter={!options.showAggregate ? ::this._rowDropdownHeightGetter : () => 0}
              rowDropdownGetter={!options.showAggregate ? ::this._rowDropdownGetter : () => null}
              onRowClick={!options.showAggregate ? ::this._onRowClick : () => null}>
              {columns}
            </Table> }
        </div>
      </div>
    );
  }
}

export default ComponentDirectory;
