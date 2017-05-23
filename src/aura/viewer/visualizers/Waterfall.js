import React from 'react';
import Dimensions from 'react-dimensions';
import _ from 'lodash';
import { saveSvgAsPng } from 'save-svg-as-png';
import saveCanvasAsImage from 'canvas-to-image';
import Placeholder from '../misc/Placeholder';
import Menu, { MenuItem } from 'rc-menu';
import Checkbox from 'rc-checkbox';
import WaterfallSidebar from './WaterfallSidebar';
import SplitPane from '../misc/SplitPane';
import ReactDOM from 'react-dom';
import deepQueryFilter from '../helpers/deepQueryFilter';
import flattenDeep from '../helpers/flattenDeep';
import chunkBy from '../helpers/chunkBy';
import DarkWaterfall, {
  TextCell as DarkTextCell,
  Column as DarkColumn,
  GridBackground as DarkGridBackground,
  RulerCell as DarkRulerCell,
  RangeCell as DarkRangeCell
} from 'react-waterfall/lib/themes/ChromeDarkWaterfall';
import LightWaterfall, {
  TextCell as LightTextCell,
  Column as LightColumn,
  GridBackground as LightGridBackground,
  RulerCell as LightRulerCell,
  RangeCell as LightRangeCell
} from 'react-waterfall/lib/themes/ChromeWaterfall';
import '../../../core/viewer/helpers/RCCheckbox.less';
import '../../../core/viewer/helpers/RCMenu.less';
import './Waterfall.scss';
import './SharedStyles.scss';

const Waterfalls = {
  light: {
    Waterfall: LightWaterfall,
    TextCell: LightTextCell,
    Column: LightColumn,
    GridBackground: LightGridBackground,
    RulerCell: LightRulerCell,
    RangeCell: LightRangeCell
  },
  dark: {
    Waterfall: DarkWaterfall,
    TextCell: DarkTextCell,
    Column: DarkColumn,
    GridBackground: DarkGridBackground,
    RulerCell: DarkRulerCell,
    RangeCell: DarkRangeCell
  }
};

class Waterfall extends React.Component {
  static SMALL_AURA_CYCLE = 10;
  static IDLE_TIME_THRESHOLD = 5000;
  static EXPERIENCE_IDLE_TIMEOUT = 500;
  static OverviewMap = {
    SPT: { fill: '#4bc0c0', title: 'Server (SPT)' },
    EPT: { fill: '#FF6384', title: 'Perceived Latency (EPT)' },
    BPT: { fill: '#ff8e2c', title: 'JavaScript (BPT)' },
    IPT: { fill: '#000', title: `Idle >= ${Waterfall.IDLE_TIME_THRESHOLD} ms` }
  };

  state = {
    crumbs: [],
    rowIndex: null,
    details: null,
    networkRows: [],
    networkRootRows: [],
    idleRows: [],
    instrumentationRows: [],
    instrumentationRootRows: [],
    optionsMenuVisible: false,
    options: {
      showAuraCycles: true,
      showSmallAuraCycles: false,
      showSyntheticPageView: true,
      query: '',
      trimIdle: true,
      showPerfEvents: false,
      detailsPaneWidth: 300,
      topPaneHeight: 0,
      showOnlyAuraRelated: true
    }
  };

  static defaultProps = {
    theme: 'light',
    instrumentation: [],
    network: [],
    isBusy: false,
    onOptionsChange: () => 0,
    getOptions: () => ({})
  };

  _calculateState(nextState, opts = {
    ignoreComputeMinMax: false,
    resetCrumbsToIndex: null,
    selectRowIndex: null,
    useInputAsRootNetworkRows: false
  }) {
    let { options: nextOptions, instrumentationRows, crumbs, instrumentationBaseRows, networkRows, rootNetworkRows, min: currMin, max: currMax } = { ...this.state, ...nextState };
    const { onOptionsChange } = this.props;
    const { ignoreComputeMinMax, resetCrumbsToIndex, selectRowIndex, useInputAsRootNetworkRows } = opts;
    const options = Object.assign({}, this.state.options, nextOptions);
    const { query, showAuraCycles, trimIdle, showPerfEvents, showOnlyAuraRelated, showSmallAuraCycles, showSyntheticPageView } = options;
    let idleRows = [];

    if (nextState.instrumentationRows && (resetCrumbsToIndex != null || selectRowIndex != null)) {
      if (resetCrumbsToIndex != null) {
        crumbs.length = resetCrumbsToIndex;
      }

      if (selectRowIndex != null) {
        if (instrumentationRows[selectRowIndex] != null && instrumentationRows[selectRowIndex].rows != null) {
          const prev = instrumentationRows;
          instrumentationBaseRows = instrumentationRows[selectRowIndex].rows || [];
          crumbs.push({ rows: prev, rowIndex: selectRowIndex });
        }
      } else {
        instrumentationBaseRows = instrumentationRows;
      }
    }

    instrumentationRows = instrumentationBaseRows;
    rootNetworkRows = useInputAsRootNetworkRows ? networkRows : rootNetworkRows;
    networkRows = rootNetworkRows;

    if (!showAuraCycles) {
      instrumentationRows = instrumentationRows.filter(row => row.type !== 'cycle');
    }

    if (!showSmallAuraCycles) {
      instrumentationRows = instrumentationRows.filter(row => !(row.type === 'cycle' && ((row.range.end - row.range.start) < Waterfall.SMALL_AURA_CYCLE)));
    }

    if (!showPerfEvents) {
      instrumentationRows = instrumentationRows.filter(row => row.type !== 'perf');
    }

    if (!showSyntheticPageView) {
      instrumentationRows = instrumentationRows.filter(row => row.type !== 'syntheticPageView');
    }

    if (showOnlyAuraRelated) {
      networkRows = Waterfall.getAuraNetworkRows(networkRows);
    }

    instrumentationRows = instrumentationRows.filter(row => !row.__idle__);
    networkRows = networkRows.filter(row => !row.__idle__);

    if (trimIdle) {
      let totalDiff = 0;
      let networkIdx = 0;
      let instrumentationIdx = 0;
      let i;
      let highestMax = 0;
      let aggrRows = _.sortBy([...instrumentationRows, ...networkRows], a => a.start);

      for (i = 0; i < aggrRows.length - 1; i++) {
        let curr = aggrRows[i];

        if (curr.__idle__ === true) {
          continue;
        }

        let next = aggrRows[i + 1];

        if (curr.mode === 'network') {
          networkIdx++;
        } else if (curr.mode === 'instrumentation') {
          instrumentationIdx++;
        }

        curr.range.startTrim = curr.start - totalDiff;
        curr.range.endTrim = curr.end - totalDiff;
        next.range.startTrim = next.start - totalDiff;
        next.range.endTrim = next.end - totalDiff;

        highestMax = Math.max(curr.end, highestMax);

        let diff = Math.max(next.start - highestMax, 0);
        if (diff > Waterfall.IDLE_TIME_THRESHOLD) {
          idleRows.push({
            name: 'idle',
            __idle__: true,
            type: '░░░░░░░',
            start: next.range.startTrim - diff - 1,
            duration: diff,
            range: {
              fill: 'red',
              idleTime: diff,
              startTrim: next.range.startTrim - diff - 1,
              endTrim: next.range.startTrim - diff - 1
            }
          });

          instrumentationRows.splice(instrumentationIdx++, 0, {
            name: 'idle',
            __idle__: true,
            type: '░░░░░░░',
            start: next.range.startTrim - diff - 1,
            duration: diff,
            range: {
              fill: 'red',
              idleTime: diff,
              startTrim: next.range.startTrim - diff - 1,
              endTrim: next.range.startTrim - diff - 1
            }
          });

          networkRows.splice(networkIdx++, 0, {
            name: 'idle',
            __idle__: true,
            type: '░░░░░░░',
            start: next.range.startTrim - diff - 1,
            duration: diff,
            range: {
              fill: 'red',
              idleTime: diff,
              startTrim: next.range.startTrim - diff - 1,
              endTrim: next.range.startTrim - diff - 1
            }
          });

          totalDiff += diff;
        }

        next.range.startTrim -= diff;
        next.range.endTrim -= diff;
      }

      for (; i < aggrRows.length; i++) {
        let curr = aggrRows[i];

        curr.range.startTrim = curr.start - totalDiff;
        curr.range.endTrim = curr.end - totalDiff;
      }
    } else {
      for (const row of instrumentationRows) {
        row.range.startTrim = row.start;
        row.range.endTrim = row.end;
      }

      for (const row of networkRows) {
        row.range.startTrim = row.start;
        row.range.endTrim = row.end;
      }
    }

    for (const row of instrumentationRows) {
      row.range.start = row.range.startTrim;
      row.range.end = row.range.endTrim;
    }

    for (const row of idleRows) {
      row.range.start = row.range.startTrim;
      row.range.end = row.range.endTrim;
    }

    if (!ignoreComputeMinMax) {
      let min;
      let max;
      let diff;

      const minRow = _.minBy(_.filter(instrumentationRows, row => !row.__idle__), row => row.range.start);
      const maxRow = _.maxBy(_.filter(instrumentationRows, row => !row.__idle__), row => row.range.end);

      if (minRow != null) {
        min = minRow.range.start;
      }

      if (maxRow != null) {
        max = maxRow.range.end;

        diff = max - min;

        if (false && diff > 1000) {
          max = Math.ceil(max / 1000) * 1000;
        } else if (diff > 100) {
          max = Math.ceil(max / 100) * 100;
        } else if (diff > 10) {
          max = Math.ceil(max / 10) * 10;
        } else {
          // ignore
        }
      }

      if (diff === 0 || diff == null) {
        max = min + 1;
      }

      instrumentationRows = _.filter(instrumentationRows, row => row.range.start >= min && row.range.end <= max);
      idleRows = _.filter(idleRows, row => row.range.start >= min && row.range.end <= max);

      currMin = min;
      currMax = max;

      this.setState({ min, max });
    }

    if (query && query.trim()) {
      networkRows = deepQueryFilter(networkRows, query);
      instrumentationRows = deepQueryFilter(instrumentationRows, query);
      // console.log(networkRows);
      // console.log(networkRows, 'c');
    }

    if (instrumentationRows.length === 0) {
      networkRows = [];
    }

    networkRows = _.filter(networkRows, row => {
      if (row.range.startTrim < currMin) {
        return;
      }

      if (row.range.endTrim > currMax) {
        return;
      }

      row.range.start = Math.max(currMin, row.range.startTrim);
      row.range.end = Math.min(currMax, row.range.endTrim);

      return row;
    });


    const flattenedInstrumentationRows = [];

    for (let i = 0; i < instrumentationRows.length; i++) {
      const row = instrumentationRows[i];
      if (row.type !== 'cycle') {
        flattenedInstrumentationRows.push(row);
        continue;
      }

      let j;
      const cycles = [row];
      for (j = i + 1; j < instrumentationRows.length; j++) {
        const row = instrumentationRows[j];
        if (row.type !== 'cycle') {
          break;
        }

        cycles.push(row);
      }

      i = j - 1;

      if (cycles.length > 1) {
        const minRow = _.minBy(cycles, row => row.range.start);
        const maxRow = _.maxBy(cycles, row => row.range.end);
        const cycleNames = _.map(cycles, row => row.context.cycle).join(',');
        const fillDashArray = [];
        let totalTime = 0;

        for (let i = 0; i < cycles.length; i++) {
          const currCycleRange = cycles[i].range;
          const diff = currCycleRange.end - currCycleRange.start;

          totalTime += diff;

          fillDashArray.push(diff);

          if (cycles[i + 1]) {
            const nextCycleRange = cycles[i + 1].range;
            fillDashArray.push(nextCycleRange.start - currCycleRange.end);
          }
        }

        flattenedInstrumentationRows.push({
          name: `cycles: ${cycleNames}`,
          type: minRow.type,
          cycles,
          range: {
            totalTime,
            fillDashArray,
            start: minRow.range.start,
            end: maxRow.range.end,
            fill: minRow.range.fill
          }
        });
      } else {
        flattenedInstrumentationRows.push(row);
      }
    }

    onOptionsChange(options);

    this.setState({
      instrumentationBaseRows,
      instrumentationRows: flattenedInstrumentationRows,
      unflattenedInstrumentationRows: instrumentationRows,
      idleRows,
      options,
      crumbs,
      networkRows
    });
  }

  componentWillMount() {
    const instrumentationRows = Waterfall.toWaterfallRows(this.props.instrumentation, 'instrumentation');
    const networkRows = Waterfall.toWaterfallRows(this.props.network, 'network');

    this._calculateState({ instrumentationRows, networkRows, options: this.props.getOptions() }, {
      resetCrumbsToIndex: 0,
      useInputAsRootNetworkRows: true
    });

    this.setState({ details: null, instrumentationRootRows: instrumentationRows, rootNetworkRows: networkRows });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.instrumentation !== nextProps.instrumentation ||
      this.props.network !== nextProps.network) {
      const instrumentationRows = Waterfall.toWaterfallRows(nextProps.instrumentation, 'instrumentation');
      const networkRows = Waterfall.toWaterfallRows(nextProps.network, 'network');

      this._calculateState({ instrumentationRows, networkRows, options: this.props.getOptions() }, {
        resetCrumbsToIndex: 0,
        useInputAsRootNetworkRows: true
      });

      this.setState({ details: null, instrumentationRootRows: instrumentationRows, rootNetworkRows: networkRows });
    }
  }

  _setViewOption(key, value) {
    const { options } = this.state;
    const { onOptionsChange } = this.props;

    options[key] = value;

    this.setState({ options });

    setTimeout(() => onOptionsChange(options), 0);
  }

  _renderPieGraph() {
    const data = {
      labels: Object.keys(Waterfall.OverviewMap),
      datasets: [
        {
          data: [300, 50, 100],
          backgroundColor: _.values(Waterfall.OverviewMap),
          hoverBackgroundColor: _.values(Waterfall.OverviewMap)
        }]
    };

    return (
      <div>
        <div className='crumbs'>
          <div className='crumb'
               style={{ float: 'right' }}
               onClick={() => {
                 const canvas = ReactDOM.findDOMNode(this.refs.overviewDoughnut);
                 canvas.id = Date.now();
                 saveCanvasAsImage(canvas.id, { name: 'overview-breakdown', quality: 1, type: 'png' });
               }}>
            Download (PNG)
          </div>
          <div className='crumb'>Overview</div>
        </div>
      </div>
    );
  }

  _setQuery(query) {
    clearTimeout(this.queryDebouncer);

    this.queryDebouncer = setTimeout(() => {
      const { options } = this.state;

      this._calculateState({ options: Object.assign(options, { query }) }, { ignoreComputeMinMax: true });
    }, 400);
  }

  render() {
    const {
      instrumentationRows, networkRows, min, max, idleRows, crumbs, details, instrumentationRootRows,
      unflattenedInstrumentationRows, optionsMenuVisible, overviewModalVisible, options, rootNetworkRows
    } = this.state;
    const { containerHeight, containerWidth, theme, isBusy } = this.props;
    const { Waterfall: _Waterfall, TextCell, Column, GridBackground, RulerCell, RangeCell } = Waterfalls[theme] || Waterfalls.light;

    const hasNetwork = rootNetworkRows && rootNetworkRows.length;
    const textWidth = 60;
    const crumbsHeight = 16;
    const searchHeight = 25;
    const overviewHeight = 52;
    const overviewPaneHeight = overviewHeight + crumbsHeight;
    const splitPaneHeight = containerHeight - searchHeight;
    const topPaneHeight = hasNetwork ? Math.min(options.topPaneHeight || containerHeight * 0.5, splitPaneHeight - 50) : splitPaneHeight;
    const bottomPaneHeight = splitPaneHeight - topPaneHeight;
    const instrumentationPaneHeight = topPaneHeight - crumbsHeight - overviewPaneHeight;
    const networkPaneHeight = bottomPaneHeight - crumbsHeight;

    const navigation = crumbs.map(({ rows, rowIndex }, i) =>
      <div className='crumb'
           key={i}
           onClick={() => this._calculateState({ instrumentationRows: rows }, {
             selectRowIndex: rowIndex,
             resetCrumbsToIndex: i
           })}>
        {`${rows[rowIndex].name} (${((rows[rowIndex].end - rows[rowIndex].start) / 1000).toFixed(2)} s)`}
      </div>
    );

    let instrumentationTypeColumn = [];
    let networkTypeColumn = [];
    let overviewTypeColumn = [];
    let nameColumnWidth = 150;
    let typeColumnWidth = 0;

    if (!details) {
      nameColumnWidth = 200;
      typeColumnWidth = 75;

      instrumentationTypeColumn = [
        <Column key={1}
                header={<TextCell textGetter={(...args) => this._columnTextGetter('instrumentation', ...args)}/>}
                cell={<TextCell textGetter={(...args) => this._columnTextGetter('instrumentation', ...args)}/>}
                columnKey='type'
                width={typeColumnWidth}/>
      ];

      networkTypeColumn = [
        <Column key={1}
                header={<TextCell textGetter={(...args) => this._columnTextGetter('network', ...args)}/>}
                cell={<TextCell textGetter={(...args) => this._columnTextGetter('network', ...args)}/>}
                columnKey='type'
                width={typeColumnWidth}/>
      ];

      overviewTypeColumn = [
        <Column key={1}
                header={null}
                cell={<TextCell textGetter={(...args) => this._columnTextGetter('overview', ...args)}
                                fontSize='8px'/>}
                columnKey='type'
                width={typeColumnWidth}/>
      ];
    }

    return (
      <div className={`${theme} ept-waterfall`}
           style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
        <div className='search-bar'>
          <input className={options.query && 'search-highlight'}
                 type='text'
                 defaultValue={options.query}
                 onChange={e => this._setQuery(e.target.value)}
                 placeholder='Search (filter e.g. q:callTime>200)'/>
          <button className='generic '
                  selected={optionsMenuVisible}
                  onClick={() => this.setState({ optionsMenuVisible: !optionsMenuVisible })}>
            Options
          </button>
        </div>
        <div className='options-wrapper'
             style={{ display: optionsMenuVisible ? 'block' : 'none' }}>
          <Menu
            onClick={({ key }) => this._calculateState({ options: Object.assign(options, { [key]: !options[key] }) })}>
            <MenuItem key='showAuraCycles'>
              <Checkbox checked={options.showAuraCycles}/>
              <label>Show aura cycles
                <small>Aura cycle is time spent in rendering</small>
              </label>
            </MenuItem>
            <MenuItem key='showSmallAuraCycles'>
              <Checkbox checked={options.showSmallAuraCycles}/>
              <label>Show small aura cycles
                <small>{`Cycles less than < ${Waterfall.SMALL_AURA_CYCLE}ms`}</small>
              </label>
            </MenuItem>
            <MenuItem key='showSyntheticPageView'>
              <Checkbox checked={options.showSyntheticPageView}/>
              <label>Show current page transaction
                <small>Captures all transactions since last `Pull`</small>
              </label>
            </MenuItem>
            <MenuItem key='showPerfEvents'>
              <Checkbox checked={options.showPerfEvents}/>
              <label>Show perf events
                <small>ltng:newDefs</small>
              </label>
            </MenuItem>
            <MenuItem key='showOnlyAuraRelated'>
              <Checkbox checked={options.showOnlyAuraRelated}/>
              <label>Show only aura related
                <small>Applies to network waterfall (bottom)</small>
              </label>
            </MenuItem>
            <MenuItem key='trimIdle'>
              <Checkbox checked={options.trimIdle}/>
              <label>Trim idle
                <small>{`Hide time gaps > 5s`}</small>
              </label>
            </MenuItem>
            <MenuItem key='showInteractionEvents'>
              <Checkbox checked={options.showInteractionEvents}/>
              <label>Show interaction events
                <small>TBD: Coming in future release</small>
              </label>
            </MenuItem>
          </Menu>
        </div>
        <SplitPane
          split='vertical'
          minSize={100}
          maxSize={-300}
          className={details ? '' : 'SplitPane-1-only'}
          defaultSize={options.detailsPaneWidth}
          primary='second'
          onChange={size => this._setViewOption('detailsPaneWidth', size)}>
          <SplitPane
            split='horizontal'
            defaultSize={topPaneHeight}
            minSize={50}
            maxSize={-50}
            primary='first'
            className={ !hasNetwork ? 'SplitPane-1-only' : ''}
            onChange={size => this._setViewOption('topPaneHeight', size)}>
            <div className='full'>
              <div className='overview'
                   style={{ height: overviewPaneHeight, width: '100%' }}>
                <div className='crumbs'>
                  <div className='crumb'
                       style={{ float: 'right' }}
                       onClick={() => saveSvgAsPng(ReactDOM.findDOMNode(this.refs.overviewWaterfall).getElementsByTagName('svg')[0], 'overview-waterfall.png', { scale: 2 })}>
                    Download (PNG)
                  </div>
                  <div className='crumb'>Overview ⌂
                  </div>
                </div>
                <div className='overview-waterfall'>
                  <_Waterfall ref='overviewWaterfall'
                              rowCount={4}
                              rowHeightGetter={rowType => rowType === 'header' ? 0 : 13}
                              width={containerWidth - (details ? options.detailsPaneWidth : 0)}
                              height={overviewHeight}>
                    <Column header={null}
                            cell={<TextCell fontSize='8px'
                                            fontWeight='bold'
                                            textGetter={(...args) => this._columnTextGetter('overview', ...args)}/>}
                            columnKey='name'
                            width={nameColumnWidth}/>
                    {overviewTypeColumn}
                    <Column background={<GridBackground preferLineCount={3}
                                                        offsetWidth={-textWidth}/>}
                            header={null}
                            columnKey='range'
                            cell={<MultiRange instrumentationRows={unflattenedInstrumentationRows}
                                              idleRows={idleRows}
                                              min={min}
                                              max={max}
                                              textWidth={textWidth}
                                              networkRows={networkRows}/>}/>
                  </_Waterfall>
                </div>
              </div>
              <div className='crumbs'>
                <div className='crumb'
                     style={{ float: 'right' }}
                     onClick={() => saveSvgAsPng(ReactDOM.findDOMNode(this.refs.instrumentationWaterfall).getElementsByTagName('svg')[0], 'transactions-waterfall.png', { scale: 2 })}>
                  Download (PNG)
                </div>
                <div className='crumb'
                     onClick={() => this._calculateState({ instrumentationRows: instrumentationRootRows }, { resetCrumbsToIndex: 0 })}>
                  Instrumentation ⌂
                </div>
                {navigation}
              </div>
              <div style={{
                height: `${instrumentationPaneHeight}px`,
                width: '100%'
              }}>
                { instrumentationRows.length === 0 ? <Placeholder /> :
                  <_Waterfall ref='instrumentationWaterfall'
                              rowCount={instrumentationRows.length}
                              rowHeightGetter={(...args) => this._rowHeightGetter('instrumentation', ...args)}
                              onRowClick={(...args) => this._onRowClick('instrumentation', ...args)}
                              onRowDoubleClick={(...args) => this._onRowDoubleClick('instrumentation', ...args)}
                              width={containerWidth - (details ? options.detailsPaneWidth : 0)}
                              height={instrumentationPaneHeight}>
                    <Column
                      header={<TextCell textGetter={(...args) => this._columnTextGetter('instrumentation', ...args)}/>}
                      cell={<TextCell textGetter={(...args) => this._columnTextGetter('instrumentation', ...args)}/>}
                      columnKey='name'
                      width={nameColumnWidth}/>
                    {instrumentationTypeColumn}
                    <Column background={<GridBackground preferLineCount={3}
                                                        offsetWidth={-textWidth}/>}
                            header={<RulerCell preferLineCount={3}
                                               rangeMin={min}
                                               rangeMax={max}
                                               textGetter={value => `${(value / 1000).toFixed(2)} s`}/>}
                            columnKey='range'
                            cell={<RangeCell rangeMin={min}
                                             rangeMax={max}
                                             rangeBarFillGetter={(...args) => this._rangeFillGetter('instrumentation', ...args)}
                                             rangeBarFillDashArrayGetter={(...args) => this._rangeFillDashArrayGetter('instrumentation', ...args)}
                                             textWidth={textWidth}
                                             minGetter={(...args) => this._rangeValueGetter('instrumentation', 'start', ...args)}
                                             maxGetter={(...args) => this._rangeValueGetter('instrumentation', 'end', ...args)}
                                             textGetter={(...args) => this._columnTextGetter('instrumentation', ...args)}/>}/>
                  </_Waterfall> }
              </div>
            </div>
            { !hasNetwork ? <div/> :
              <div className='full'>
                <div className='crumbs'>
                  <div className='crumb'
                       style={{ float: 'right' }}
                       onClick={() => saveSvgAsPng(ReactDOM.findDOMNode(this.refs.networkWaterfall).getElementsByTagName('svg')[0], 'network-waterfall.png', { scale: 2 })}>
                    Download (PNG)
                  </div>
                  <div className='crumb'>Network ⌂</div>
                </div>
                <div style={{
                  height: `${networkPaneHeight}px`,
                  width: '100%'
                }}>
                  { networkRows.length === 0 ? <Placeholder /> :
                    <_Waterfall ref='networkWaterfall'
                                rowCount={networkRows.length}
                                rowHeightGetter={(...args) => this._rowHeightGetter('network', ...args)}
                                onRowClick={(...args) => this._onRowClick('network', ...args)}
                                onRowDoubleClick={(...args) => this._onRowDoubleClick('network', ...args)}
                                width={containerWidth - (details ? options.detailsPaneWidth : 0)}
                                height={networkPaneHeight}>
                      <Column header={<TextCell textGetter={(...args) => this._columnTextGetter('network', ...args)}/>}
                              cell={<TextCell textGetter={(...args) => this._columnTextGetter('network', ...args)}/>}
                              columnKey='name'
                              width={nameColumnWidth}/>
                      {networkTypeColumn}
                      <Column background={<GridBackground preferLineCount={3}
                                                          offsetWidth={-textWidth}/>}
                              header={<RulerCell preferLineCount={3}
                                                 rangeMin={min}
                                                 rangeMax={max}
                                                 textGetter={value => `${(value / 1000).toFixed(2)} s`}/>}
                              columnKey='range'
                              cell={<RangeCell rangeMin={min}
                                               rangeMax={max}
                                               rangeBarFillGetter={(...args) => this._rangeFillGetter('network', ...args)}
                                               textWidth={textWidth}
                                               minGetter={(...args) => this._rangeValueGetter('network', 'start', ...args)}
                                               maxGetter={(...args) => this._rangeValueGetter('network', 'end', ...args)}
                                               textGetter={(...args) => this._columnTextGetter('network', ...args)}/>}/>
                    </_Waterfall> }
                </div>
              </div>
            }
          </SplitPane>
          <div className='full'
               style={{ height: `calc(100% - ${searchHeight}px)` }}>
            <WaterfallSidebar data={details || {}}
                              theme={theme}
                              onClose={::this._onCloseDetails}/>
          </div>
        </SplitPane>
      </div>
    )
  }

  /**
   * Private functions
   */

  _rangeFillDashArrayGetter(type, columnKey, rowIndex) {
    const { instrumentationRows } = this.state;

    return instrumentationRows[rowIndex][columnKey].fillDashArray;
  }

  _columnTextGetter(type, columnKey, rowType, rowIndex) {
    const { instrumentationRows, networkRows, unflattenedInstrumentationRows } = this.state;

    if (type === 'overview') {
      if (columnKey === 'name') {
        return Waterfall.OverviewMap[_.keys(Waterfall.OverviewMap)[rowIndex]].title.toUpperCase();
      }

      if (columnKey === 'type') {
        let time;

        if (rowIndex === 0) {
          time = _.sumBy(Waterfall.getAuraNetworkRows(networkRows), row => row.range.end - row.range.start);
        } else if (rowIndex === 1) {
          time = _.sumBy(Waterfall.getAuraExperienceRows([...unflattenedInstrumentationRows, ...Waterfall.getAuraNetworkRows(networkRows)]), row => row.range.end - row.range.start);
        } else if (rowIndex === 2) {
          time = _.sumBy(Waterfall.getAuraCycleRows(unflattenedInstrumentationRows), row => row.range.end - row.range.start);
        } else if (rowIndex === 3) {
          time = _.sumBy(Waterfall.getIdleRows(unflattenedInstrumentationRows), row => row.range.idleTime);
        }

        return (time / 1000).toFixed(2) + ' s';
      }

      throw Error('Not a valid columnKey for overview');
    }

    const row = type === 'network' ? networkRows[rowIndex] : instrumentationRows[rowIndex];

    if (rowType === 'header') {
      return columnKey.charAt(0).toUpperCase() + columnKey.substring(1);
    }

    if (rowType === 'body') {
      let data = row[columnKey];

      if (columnKey === 'range') {
        if (row.type === 'syntheticPageView') {
          return ``;
        }

        if (row.__idle__) {
          return ` → ${(data.idleTime / 1000).toFixed(2)} s`;
        }

        if (type === 'network') {
          let text = ` → ${((data.end - data.start) / 1000).toFixed(2)} s`;

          if (data.endTrim > data.end && data.startTrim < data.start) {
            text += ' ⟷'
          } else if (data.startTrim < data.start) {
            text += ' ⟻'
          } else if (data.endTrim > data.end) {
            text += ' ⟼'
          }

          return text;
        } else {
          return ` → ${((data.totalTime || (data.end - data.start)) / 1000).toFixed(2)} s`;
        }
      }

      if (columnKey === 'name') {
        if (row.rows != null) {
          return `▸ ${data}`
        }
      }

      return data;
    }

    throw Error('Invalid rowType');
  }

  _rangeValueGetter(type, valueType, columnKey, rowIndex) {
    const { instrumentationRows, networkRows, max } = this.state;

    if (type === 'network') {
      const rowData = networkRows[rowIndex];
      return rowData[columnKey][valueType];
    } else {
      const rowData = instrumentationRows[rowIndex];

      if (rowData.type === 'syntheticPageView' && valueType === 'end') {
        let syntheticPageViewMax = max;

        for (let i = rowIndex + 1; i < instrumentationRows.length; i++) {
          const row = instrumentationRows[i];

          if (row.type !== 'syntheticPageView') {
            continue;
          }

          syntheticPageViewMax = row.range.start;

          break;
        }

        return syntheticPageViewMax;
      }

      return rowData[columnKey][valueType];
    }
  }

  _rowHeightGetter(type, rowType, rowIndex) {
    if (rowType === 'header') {
      return 17;
    }

    return 17;
  }

  _onRowDoubleClick(type, rowIndex) {
    if (type === 'network') {
      return;
    }

    clearTimeout(this.doubleClickTimeout);

    const { instrumentationRows } = this.state;

    this._calculateState({ instrumentationRows }, { selectRowIndex: rowIndex });
  }

  _rangeFillGetter(type, columnKey, rowIndex) {
    const { instrumentationRows, networkRows } = this.state;

    if (type === 'network') {
      return networkRows[rowIndex][columnKey].fill || 'gray';
    } else {
      return instrumentationRows[rowIndex][columnKey].fill || '#03A9F4';
    }
  }

  _onRowClick(type, rowIndex) {
    const { instrumentationRows, networkRows } = this.state;
    let details;

    if (type === 'network') {
      details = networkRows[rowIndex];
    } else {
      details = instrumentationRows[rowIndex];
    }

    clearTimeout(this.doubleClickTimeout);

    this.doubleClickTimeout = setTimeout(() => {
      this.setState({ details });
    }, 350);
  }

  _onCloseDetails() {
    this.setState({ details: null });
  }

  static toWaterfallRows(data, mode) {
    const rootNodes = _.compact(_.map(data.primary, (transaction, name) => transaction.depth === 0 ? name : null));
    const compareRows = (a, b) => a.range.start === b.range.start ? (a.range.end - b.range.end) : (a.range.start - b.range.start);

    function transform(nodes, includeSelf = true) {
      return _.compact(_.map(nodes, name => {
          const node = data.primary[name];

          node.name = node.name || node.id || name || 'No name';

          node.mode = mode;

          node.range = {
            start: node.start || 0,
            end: node.end || 0,
            startTrim: node.start || 0,
            endTrim: node.end || 0,
            fill: node.fill
          };

          const isServerPerfRoot = node.name === 'perf' && node.type === 'serverPerf';

          node.rows = transform(data.children[name], isServerPerfRoot ? false : includeSelf);
          node.rows = node.rows.sort(compareRows);

          if (node.type === 'syntheticPageView' && node.rows.length === 0) {
            return;
          }

          if (node.type === 'transport' && node.rows != null) {
            node.actions = _.fromPairs(_.map(_.filter(node.rows, row => row.type === 'actions'), row => [row.name + '-' + row.id, row]));
            node.rows = _.filter(node.rows, row => row.type !== 'actions');

            delete data.context[name].actionDefs;
          }

          node.context = data.context[name];

          if (isServerPerfRoot) {
            node.rows = flattenDeep(node.rows, node => {
              const rows = node.rows;
              delete node.rows;
              return rows;
            });
          }

          if (includeSelf && node != null && node.rows.length > 0) {
            node.rows.unshift({ ...node, rows: null });
          }

          if (node.rows.length === 0) {
            node.rows = null;
          }

          return node;
        }) || []);
    }

    const rows = transform(rootNodes);

    return rows.sort(compareRows);
  }

  static getAuraNetworkRows(rows) {
    return _.filter(rows, row => row.type === 'aura');
  }

  static getAuraExperienceRows(rows, isBusy) {
    const experienceRows = [];

    rows = _.sortBy(rows, row => row.range.start);
    rows = _.filter(rows, row => row.type !== 'perfXhr' && row.type !== 'syntheticPageView');
    rows = chunkBy(rows, row => row.__idle__);

    _.each(rows, rows => {
      let maxEnd = Number.MIN_SAFE_INTEGER;
      _.each(chunkBy(rows, (row, index, array) => {
        const next = array[index + 1];
        if (next) {
          maxEnd = Math.max(maxEnd, row.range.end);
          return next.range.start - maxEnd >= Waterfall.EXPERIENCE_IDLE_TIMEOUT;
        }

        return false;
      }, true), rows => {
        const minRow = _.minBy(rows, row => row.range.start);
        const maxRow = _.maxBy(rows, row => row.range.end);

        if (minRow != null) {
          experienceRows.push({ range: { start: minRow.range.start, end: maxRow.range.end } });
        }
      });
    });

    return experienceRows;
  }

  static getIdleRows(rows) {
    return _.filter(rows, row => row.__idle__ === true);
  }

  static getAuraCycleRows(rows) {
    return _.filter(rows, row => row.type === 'cycle');
  }

  static getPageViewRows(rows) {
    return _.filter(rows, row => row.name !== 'bootstrap' && row.type !== 'cycle');
  }
}

class MultiRange extends React.PureComponent {
  render() {
    const { networkRows, instrumentationRows, idleRows, rowIndex, min, max, x, y, width, textWidth, height } = this.props;
    let rows;
    let fill;
    let showBars;
    let showName;
    let bars = [];
    let emptyText;
    let text;

    if (rowIndex === 0) {
      rows = Waterfall.getAuraNetworkRows(networkRows);
      fill = Waterfall.OverviewMap.SPT.fill;
    } else if (rowIndex === 1) {
      rows = Waterfall.getAuraExperienceRows([...instrumentationRows, ...Waterfall.getAuraNetworkRows(networkRows)]);
      fill = Waterfall.OverviewMap.EPT.fill;
    } else if (rowIndex === 2) {
      rows = Waterfall.getAuraCycleRows(instrumentationRows);
      fill = Waterfall.OverviewMap.BPT.fill;
      emptyText = 'NO AURA CYCLES';
      showName = true;
    } else {
      rows = Waterfall.getIdleRows(idleRows);
      fill = Waterfall.OverviewMap.IPT.fill;
      emptyText = 'NO IDLE TIME';
      showBars = true;
    }

    const events = _.map(rows, (row, i) => {
      let { start, end, idleTime } = row.range;

      const calculatedX = x + (start - min) / (max - min) * (width - textWidth);
      const calculatedWidth = Math.max((end - start) / (max - min) * (width - textWidth), 2);
      const calculatedHeight = 5;
      const calculatedY = y + (height - calculatedHeight) / 2;
      const name = row.name;

      if (showBars) {
        bars.push(
          <line key={i}
                x1={calculatedX}
                y1={0}
                stroke='red'
                x2={calculatedX}
                y2={60}/>
        )
      }

      return (
        <rect fill={fill}
              className='multi-range'
              key={i}
              x={calculatedX}
              y={calculatedY}
              width={calculatedWidth}
              height={calculatedHeight}>
          <title>{`${showName ? name + ' - ' : ''}${(((end - start) || idleTime) / 1000).toFixed(2)} s (${(start / 1000).toFixed(2)} s → ${(end / 1000).toFixed(2)} s)`}</title>
        </rect>
      )
    });

    if (events.length === 0) {
      events.push(<rect fill='rgba(0,0,0,0.1)'
                        key={0}
                        x={x}
                        y={y}
                        width={width}
                        height={height}/>);
      events.push(<text key={1}
                        x={x + width / 2}
                        textAnchor='middle'
                        alignmentBaseline='central'
                        y={y + height / 2}
                        fontSize='8px'
                        fill='#AAA'
                        width={width}
                        height={height}>{emptyText}</text>)
    }

    return (
      <g>
        {bars}
        {events}
      </g>
    );
  }
}

export default Dimensions({ elementResize: 500 })(Waterfall);

