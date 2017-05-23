import React from 'react';
import ReactHighcharts from 'react-highcharts';
import HighCharts from 'highcharts';
import DarkTheme from '../misc/HighChartsDark';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import { mergeContext } from '../helpers/decode';
import _ from 'lodash';
import Spinner from '../misc/Spinner';
import Placeholder from '../misc/Placeholder';
import './Charts.scss';

export default class Charts extends React.Component {
  static optionTypes = [
    { namespace: 'aura', key: 'collectTransactionMetrics', require: true, name: 'Enable' }
  ];

  state = {};

  async componentWillMount({ bucket } = this.props) {
    this.setState({ status: false });

    try {
      let [transactions] = await Promise.all([
        ContentProxy.gatherer('aura', { bucket, def: [] }).getArtifact('transactions')
      ]);

      _.each(transactions, data => data.context.transaction = JSON.parse(data.context.transaction));

      transactions = mergeContext(transactions);

      const categories = _.map(transactions, transaction => transaction.transaction.id);

      const configs = _.map([
        {
          key: 'componentCount',
          name: 'Aura Component Count'
        },
        {
          key: 'objectCount',
          name: 'DOM Element Count'
        },
        {
          key: 'memory',
          name: 'Memory'
        },
        {
          key: 'actionsStorageSize',
          name: 'Action Storage Size'
        }
      ], ({ key, name }) => {
        return {
          legend: { enabled: false },
          chart: { type: 'area', zoomType: 'xy' },
          title: { text: name },
          credits: { enabled: false },
          tooltip: { crosshairs: true, valueDecimals: 2 },
          xAxis: {
            title: 'Time (ms)',
            categories,
            labels: {
              overflow: 'justify',
              formatter() {
                if (this.value.length > 30) {
                  return `${this.value.substr(0, 27)}...`;
                } else {
                  return this.value;
                }
              },
            }
          },
          yAxis: {
            title: { text: key },
            labels: {
              formatter () {
                if (key == 'usedJSHeapSize') {
                  return (`${Highcharts.numberFormat(this.value / (1024 * 1024), 2)}MB`);
                } else {
                  return this.value;
                }
              }
            }
          },
          plotOptions: { area: { animation: false, pointStart: 0 } },
          series: [{ data: _.map(transactions, key) }],
        };
      });

      this.setState({ configs, status: true });
    } catch (e) {
      this.setState({ status: e.message });
    }
  }

  componentWillReceiveProps = this.componentWillMount;

  render() {
    const { status, configs } = this.state;
    const { theme } = this.props;


    if (status !== true) {
      return (
        <Placeholder>
          { status || <Spinner /> }
        </Placeholder>
      )
    }

    if (theme === 'dark') {
      HighCharts.setOptions(DarkTheme);
    }

    const graphs = _.map(configs, (config, i) => {
      return (
        <div className='chart'
             key={i}>
          <ReactHighcharts config={config}/>
        </div>
      )
    });

    return (
      <div style={{ height: '100%', width: '100%', overflowY: 'scroll' }}>
        {graphs}
      </div>
    )
  }
}
