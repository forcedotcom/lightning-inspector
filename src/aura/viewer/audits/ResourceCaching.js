import React from 'react';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import { SimpleTable } from '../misc/FixedDataTable';
import _ from 'lodash';

export default class ResourceCaching extends React.Component {
  state = {};

  async _calculateState({ bucket } = this.props) {
    this.setState({ status: 'Fetching Resource Cache Headers' });
    const entries = await ContentProxy.gatherer('default', { bucket }).getArtifact('networkResourceTimings');
    const getRequests = entries.filter(function (entry) {
      return entry.request.method != 'POST' && typeof entry.response.headers['content-type'] != 'undefined';
    });

    const uncacheable = getRequests.filter(function (entry) {
      return _.includes(entry.response.headers['cache-control'], 'no-cache') || _.includes(entry.response.headers['cache-control'], 'no-store');
    });

    const noMaxAge = getRequests.filter(function (entry) {
      return !_.includes(entry.response.headers['cache-control'], 'no-cache') && !_.includes(entry.response.headers['cache-control'], 'no-store') && !_.includes(entry.response.headers['cache-control'], 's-maxage') && !_.includes(entry.response.headers['cache-control'], 'max-age');
    });

    let score = (100 * (1 - uncacheable.length / getRequests.length) + 100 * (1 - 0.5 * noMaxAge.length / getRequests.length)) / 2;
    this.setState({
      getRequests,
      uncacheable,
      noMaxAge,
      getCount: getRequests.length,
      uncacheableCount: uncacheable.length,
      noMaxAgeCount: noMaxAge.length,
      score: score,
      status: true
    })

  }

  componentDidMount = () => this._calculateState();
  componentWillReceiveProps = this._calculateState;

  render() {
    const { AuditResult } = this.props;
    const { getRequests, uncacheable, noMaxAge, getCount, uncacheableCount, noMaxAgeCount, score: score, status } = this.state;

    return (
      <AuditResult title='Make Resources Cacheable'
                   score={score}
                   status={status}
                   description='Improve performace of GET requests by specifying appropriate cache-control headers where appropriate. This allows resources to be cached in the browser, on proxies and on CDN. Ability to serve these off a CDN can significantly boost page performance, while also reducing load on the origin server.'
                   groups={['ResourceEfficiency']}>
        <div>
          The page made {getCount} GET requests. {uncacheableCount} of these requests were not cacheable,
          while {noMaxAgeCount} did not include a max-age directive.
          <br/>
          <br/>
          <h3>Uncacheable GET Requests</h3>
          *Size estimates of resources may be incorrect due to browser resource timing limitations.
          <div className='image-compression-table'
               style={{ height: 180 }}>
            <SimpleTable
              getColumnValue={(uncacheable, rowIndex, columnKey) => {
                if (columnKey === 'name') {
                  const index = uncacheable[rowIndex].name.indexOf('?') === -1 ? uncacheable[rowIndex].name.length : uncacheable[rowIndex].name.indexOf('?');
                  return uncacheable[rowIndex].name.substring(0, index);
                } else if (columnKey === 'mime') {
                  return uncacheable[rowIndex].response.headers['content-type'];
                } else if (columnKey === 'cacheControl') {
                  return uncacheable[rowIndex].response.headers['cache-control'];
                } else if (columnKey === 'contentLength') {
                  return Math.max(uncacheable[rowIndex].transferSize, uncacheable[rowIndex].encodedBodySize, uncacheable[rowIndex].response.headers['content-length']);
                }
              }}
              rows={uncacheable}
              columns={[
                {
                  columnKey: 'name',
                  width: 200,
                  fixed: true,
                  header: { displayName: 'Name', align: 'left' },
                  body: { align: 'left', ellipses: 'left' }
                },
                { header: { displayName: 'Type' }, columnKey: 'mime', flexGrow: 2 },
                { header: { displayName: 'Cache Control' }, columnKey: 'cacheControl', flexGrow: 2 },
                { header: { displayName: 'Size*' }, columnKey: 'contentLength', flexGrow: 2 }
              ]}/>
          </div>
          <br/>
          <h3>Cacheable GET Requests without max-age directive</h3>
          *Size estimates of resources may be incorrect due to browser resource timing limitations.
          <div className='image-compression-table'>
            <SimpleTable
              getColumnValue={(noMaxAge, rowIndex, columnKey) => {
                if (columnKey === 'name') {
                  const index = noMaxAge[rowIndex].name.indexOf('?') === -1 ? noMaxAge[rowIndex].name.length : noMaxAge[rowIndex].name.indexOf('?');
                  return noMaxAge[rowIndex].name.substring(0, index);
                } else if (columnKey === 'mime') {
                  return noMaxAge[rowIndex].response.headers['content-type'];
                } else if (columnKey === 'contentLength') {
                  return Math.max(noMaxAge[rowIndex].transferSize, noMaxAge[rowIndex].encodedBodySize, noMaxAge[rowIndex].response.headers['content-length']);
                } else if (columnKey === 'cacheControl') {
                  return noMaxAge[rowIndex].response.headers['cache-control'];
                }
              }}
              rows={noMaxAge}
              columns={[
                {
                  columnKey: 'name',
                  width: 200,
                  fixed: true,
                  header: { displayName: 'Name', align: 'left' },
                  body: { align: 'left', ellipses: 'left' }
                },
                { header: { displayName: 'Type' }, columnKey: 'mime', flexGrow: 2 },
                { header: { displayName: 'Cache Control' }, columnKey: 'cacheControl', flexGrow: 2 },
                { header: { displayName: 'Size*' }, columnKey: 'contentLength', flexGrow: 2 }
              ]}/>
          </div>
        </div>
      </AuditResult>
    );
  }
}