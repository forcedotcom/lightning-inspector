import _ from 'lodash';
import Parser from './Parser';
import path from 'path';

export default class NetworkParser extends Parser {

  static PrimaryKeys = ['id', 'name', 'duration', 'type', 'start', 'end', 'depth', 'fill'];

  constructor(events, location = {}) {
    _.each(events, data => {
      data.name = data.name.replace(location.origin || '', '').replace(location.pathname || '', '') || data.initiatorType;
    });

    super(events);
  }

  getParsed() {
    return super.getParsed();
  }

  /**
   * Get typeof metric
   *
   * @param metric
   * @returns {*}
   */
  static getType(metric) {
    if (metric.name.indexOf('perf=true') + 1) {
      return 'perfXhr';
    } else if (metric.name.indexOf('aura') + 1) {
      return 'aura';
    } else if (metric.initiatorType === 'xmlhttprequest') {
      return 'xhr';
    }

    return metric.initiatorType || metric.entryType || 'default';
  }

  static getColor(type) {
    const colorMap = {
      use: 'lightgray',
      link: 'green',
      script: 'orange',
      xhr: '#c05593',
      aura: '#4bc0c0',
      perfXhr: 'green',
      default: 'lightgray'
    };

    return colorMap[type] || colorMap.default;
  }

  /**
   * Validate transactions. Flattening transactions to make it more
   * accessible in later stages
   *
   * @param metric
   * @param parentMetric
   * @param depth
   * @returns {*}
   */
  validate(metric, parentMetric, depth) {
    // just a simple validation (for debugging)
    if (metric.startTime == null) {
      console.error(metric);

      throw Error('Invalid transaction');
    }

    metric.type = NetworkParser.getType(metric);
    metric.fill = NetworkParser.getColor(metric.type);
    metric.depth = depth;

    return metric;
  }

  /**
   * Parsing metrics
   *
   * @param metric
   * @returns {{primary, secondary}}
   */
  parse(metric) {
    metric.secureConnectionStart = metric.secureConnectionStart || metric.connectStart; // in case not SSL

    const redirect = metric.redirectEnd - metric.redirectStart;
    const queue = metric.redirectEnd > 0 && metric.fetchStart > 0 ? metric.fetchStart - metric.redirectEnd : 0;
    const appCache = metric.domainLookupStart > 0 && metric.fetchStart > 0 ? metric.domainLookupStart - metric.fetchStart : 0;
    const dns = metric.domainLookupEnd - metric.domainLookupStart;
    const tcp = metric.secureConnectionStart - metric.connectStart;
    const ssl = metric.connectEnd - metric.secureConnectionStart;
    const stall = metric.requestStart - metric.connectEnd;
    const ttfb = metric.responseStart - metric.requestStart;
    const transfer = metric.responseEnd - metric.responseStart;
    const transferSize = metric.transferSize || 0;
    const responseLength = metric.decodedBodySize || 0;
    const requestLength = metric.transferSize || 0;
    const networkSpeed = ((transferSize || 0) / transfer) || 0;
    const isCached = metric.transferSize === 0;

    metric.args = _.compact(_.map(metric.name.split('/'), part => {
      try {
        return JSON.parse(decodeURIComponent(part));
      } catch (e) {
        // ignore
      }
    }));

    metric.parsed = {
      version: 'w3c',
      redirect,
      queue,
      appCache,
      dns,
      ssl,
      tcp,
      stall,
      ttfb,
      transfer,
      transferSize,
      responseLength,
      requestLength,
      networkSpeed,
      isCached
    };

    metric.start = metric.startTime;
    metric.end = metric.startTime + metric.duration;
    metric.url = decodeURIComponent(metric.name);
    metric.name = path.basename(metric.url);

    return metric;
  }

  /**
   * Return the structure which is then extended to an aggregation.
   * Arrays will be merged
   *
   * @param id
   * @param metric
   * @param childrenIds
   * @returns {{primary: {}, secondary: {}, children: {}}}
   */
  map(id, metric, childrenIds) {
    const primary = _.fromPairs(
      _.map(
        NetworkParser.PrimaryKeys,
        attr => [attr, metric[attr]]
      )
    );

    const secondaryKeys = _.filter(
      _.keys(metric),
      attr => !NetworkParser.PrimaryKeys.includes(attr)
    );


    let context = _.fromPairs(
      _.map(
        secondaryKeys,
        attr => [attr, metric[attr]]
      )
    );

    return {
      primary: { [id]: primary },
      context: { [id]: context },
      children: { [id]: childrenIds }
    };
  }
}
