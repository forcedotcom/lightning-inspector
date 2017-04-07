import React from 'react';
import numeral from 'numeral';
import JSONViewer from '../misc/JSONViewer';
import { ObjectTable } from '../misc/FixedDataTable';
import SplitPane from '../misc/SplitPane';
import { ResponsiveAceEditor } from '../misc/AceEditor';
import TabbedPane from '../misc/TabbedPane';
import Placeholder from '../misc/Placeholder';
import _ from 'lodash';
import beautify from 'js-beautify';
import './WaterfallSidebar.scss';
import qs from 'qs';

const toSeconds = time => (time / 1000).toFixed(4) + ' s';
const toKb = bytes => (bytes / 1024).toFixed(2) + ' KB';
const toKbPerSec = bytesPerMs => numeral((bytesPerMs / 1024) * 1000).format('0,0.00') + ' KB/s';

class Timing extends React.PureComponent {
  _renderTimings(group, key) {
    const names = _.map(group.stats,
      (stat, i) => stat.hideEmpty && stat.value == 0 ? null : <div key={i}
                                                                   className='timing-item'>{stat.name}</div>);
    let left = 0;

    const total = _.sum(_.map(group.stats, 'value'));
    const bars = _.map(group.stats, (stat, i) => {
      if (stat.hideEmpty && stat.value === 0) {
        return null;
      }

      if (stat.showBar) {
        const pctWidth = stat.value / total * 100;

        const elem = (
          <div key={i}
               className='timing-bar'
               style={{ width: `${pctWidth}%`, left: `${left}%`, backgroundColor: pctWidth ? stat.fill : 'gray' }}/>
        );

        left += pctWidth;

        return elem;
      }

      return (
        <div key={i}
             className='timing-bar no-bar'/>
      );
    });

    const values = _.map(group.stats, (stat, i) => {
      if (stat.hideEmpty && stat.value === 0) {
        return null;
      }

      const value = stat.format ? stat.format(stat.value) : stat.value;

      return (
        <div key={i}
             className='timing-item timing-right'>{value}</div>
      );
    });

    return (
      <div className='timing'
           key={group.title}
           style={{ width: '100%' }}>
        <div className='timing-title'>
          {group.title}
        </div>
        <div className='flex'
             style={{ width: '100%' }}>
          <div className='box'>
            {_.compact(names).length == 0 ? <div className='timing-item'>No non-zero metric</div> : names}
          </div>
          <div className='box'
               style={{ flex: 6 }}>
            {bars}
          </div>
          <div className='box'>
            {values}
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { data } = this.props;
    const { context = {} } = data;

    if (context.parsed == null) {
      return (
        <Placeholder />
      )
    }

    let groups = [];

    switch (context.parsed.version) {
      case 204: {
        const {
          totalTime,
          latency,
          background,
          responseLength,
          requestLength
        } = context.parsed;

        groups = [
          {
            title: 'Connection Details',
            stats: [
              { value: latency, name: 'Latency', showBar: true, format: toSeconds, fill: '#AE81FF', hideEmpty: true },
              {
                value: totalTime,
                name: 'Total Time',
                showBar: true,
                format: toSeconds,
                fill: '#03A9F4',
                hideEmpty: true
              }
            ]
          },
          {
            title: 'Request / Response Details',
            stats: [
              { value: String(background), name: 'Background' },
              { value: responseLength, name: 'Response Length', format: toKb },
              { value: requestLength, name: 'Request Length', format: toKb }
            ]
          }
        ];
        break;
      }
      case 206: {
        const {
          background,
          status,
          delay,
          redirect,
          dns,
          tcp,
          ttfb,
          transfer,
          responseLength,
          requestLength,
          networkSpeed
        } = context.parsed;

        groups = [
          {
            title: 'Connection Details',
            stats: [
              { value: delay, name: 'Delay', showBar: true, format: toSeconds, fill: '#AE81FF', hideEmpty: true },
              { value: redirect, name: 'Redirect', showBar: true, format: toSeconds, fill: '#E6DB74', hideEmpty: true },
              { value: dns, name: 'DNS', showBar: true, format: toSeconds, fill: '#E6DB74', hideEmpty: true },
              { value: tcp, name: 'TCP', showBar: true, format: toSeconds, fill: '#AE81FF', hideEmpty: true },
              {
                value: ttfb,
                name: 'Waiting (TTFB)',
                showBar: true,
                format: toSeconds,
                fill: '#465457',
                hideEmpty: true
              },
              { value: transfer, name: 'Transfer', showBar: true, format: toSeconds, fill: '#03A9F4', hideEmpty: true },
            ]
          },
          {
            title: 'Request / Response Details',
            stats: [
              { value: String(background), name: 'Background' },
              { value: status, name: 'Status' },
              { value: networkSpeed, name: 'Network Speed', format: value => transfer ? toKbPerSec(value) : 'N/A' },
              { value: responseLength, name: 'Response Length', format: toKb },
              { value: requestLength, name: 'Request Length', format: toKb }
            ]
          }
        ];

        break;
      }
      case 'w3c': {
        const {
          redirect,
          queue,
          appCache,
          dns,
          tcp,
          ssl,
          stall,
          ttfb,
          transfer,
          transferSize,
          responseLength,
          requestLength,
          networkSpeed,
          isCached
        } = context.parsed;

        groups = [
          {
            title: 'Connection Details',
            stats: [
              { value: redirect, name: 'Redirect', showBar: true, format: toSeconds, fill: '#F92672', hideEmpty: true },
              { value: queue, name: 'Queue', showBar: true, format: toSeconds, fill: '#F92672', hideEmpty: true },
              {
                value: appCache,
                name: 'App Collector',
                showBar: true,
                format: toSeconds,
                fill: '#F92672',
                hideEmpty: true
              },
              { value: dns, name: 'DNS', showBar: true, format: toSeconds, fill: '#E6DB74', hideEmpty: true },
              { value: tcp, name: 'TCP', showBar: true, format: toSeconds, fill: '#AE81FF', hideEmpty: true },
              { value: ssl, name: 'SSL', showBar: true, format: toSeconds, fill: '#AE81FF', hideEmpty: true },
              { value: stall, name: 'Stall', showBar: true, format: toSeconds, fill: '#AE81FF', hideEmpty: true },
              {
                value: ttfb,
                name: 'Waiting (TTFB)',
                showBar: true,
                format: toSeconds,
                fill: '#465457',
                hideEmpty: true
              },
              { value: transfer, name: 'Transfer', showBar: true, format: toSeconds, fill: '#03A9F4', hideEmpty: true },
            ]
          },
          {
            title: 'Request / Response Details',
            stats: [
              { value: String(isCached), name: 'Cached' },
              { value: networkSpeed, name: 'Network Speed', format: value => transfer ? toKbPerSec(value) : 'N/A' },
              { value: transferSize, name: 'Transfer Size', format: toKb },
              { value: responseLength, name: 'Response Length', format: toKb },
              { value: requestLength, name: 'Request Length', format: toKb }
            ]
          }
        ];

        break;
      }
      default:
        throw Error('Could not parse network timings');
    }

    return (
      <div className='full'>
        {_.map(groups, group => this._renderTimings(group))}
      </div>
    );
  }
}

const parsedBody = new Map();

class WaterfallSidebar extends React.PureComponent {
  render() {
    const { data, onClose, theme } = this.props;

    const dataCpy = JSON.parse(JSON.stringify(data));

    delete dataCpy.rows;
    delete dataCpy.range;

    if (dataCpy.context && dataCpy.context.actionDefs) {
      dataCpy.actionDefs = dataCpy.context.actionDefs;

      delete dataCpy.context.actionDefs;
    }

    let responseHeaders = (dataCpy.context && dataCpy.context.response && dataCpy.context.response.headers) || {};
    let responseBody = (dataCpy.context && dataCpy.context.response && dataCpy.context.response.body) || '';

    const responseBodyGetter = () => {
      if (responseBody) {
        if (parsedBody.has(responseBody)) {
          return parsedBody.get(responseBody);
        }

        try {
          let parsedResponseBody = responseBody.replace('while(1);', '');
          parsedResponseBody = beautify(parsedResponseBody, { indent_size: 2 });

          parsedBody.set(responseBody, parsedResponseBody);

          return parsedResponseBody;
        } catch (e) {
          console.error(e);
        }
      }

      return requestBody;
    };

    let requestHeaders = (dataCpy.context && dataCpy.context.request && dataCpy.context.request.headers) || {};
    let requestBody = (dataCpy.context && dataCpy.context.request && dataCpy.context.request.body) || '';

    const requestBodyGetter = () => {
      if (requestBody) {
        if (parsedBody.has(requestBody)) {
          return parsedBody.get(requestBody);
        }

        try {
          let parsedRequestBody = qs.parse(requestBody);
          parsedRequestBody.message = JSON.parse(parsedRequestBody.message);
          parsedRequestBody['aura.context'] = JSON.parse(parsedRequestBody['aura.context']);
          parsedRequestBody = JSON.stringify(parsedRequestBody, null, 2);

          parsedBody.set(requestBody, parsedRequestBody);

          return parsedRequestBody;
        } catch (e) {
          // ignore
        }
      }

      return requestBody;
    };

    return (
      <div className='details-panel'>
        <TabbedPane onClose={onClose}
                    showClose={true}
                    context={
                      <div className='full'
                           style={{ overflow: 'auto', padding: 5 }}>
                        <JSONViewer data={dataCpy}
                                    shouldExpandNode={(keyNames, obj, level) => level <= 1}/>
                      </div>
                    }
                    response={
                      <SplitPane split='horizontal'
                                 primary='second'
                                 defaultSize={parseInt(localStorage.responsePanel) || '75%'}
                                 onChange={size => localStorage.responsePanel = size}>
                        <div style={{ width: '100%', height: '100%' }}>
                          <ObjectTable data={responseHeaders}/>
                        </div>
                        <div style={{ width: '100%', height: '100%' }}>
                          <ResponsiveAceEditor valueGetter={responseBodyGetter}
                                               wrapEnabled={false}
                                               showLineNumbers={false}
                                               theme={theme}/>
                        </div>
                      </SplitPane>
                    }
                    request={
                      <SplitPane split='horizontal'
                                 primary='second'
                                 defaultSize={parseInt(localStorage.requestPanel) || '75%'}
                                 onChange={size => localStorage.requestPanel = size}>
                        <div style={{ width: '100%', height: '100%' }}>
                          <ObjectTable data={requestHeaders}/>
                        </div>
                        <div style={{ width: '100%', height: '100%' }}>
                          <ResponsiveAceEditor valueGetter={requestBodyGetter}
                                               wrapEnabled={true}
                                               showLineNumbers={false}
                                               theme={theme}/>
                        </div>
                      </SplitPane>
                    }
                    timing={<Timing data={data}/>}
                    tabs={['context', 'timing', 'response', 'request']}/>
      </div>
    );
  }
}

export default WaterfallSidebar;
