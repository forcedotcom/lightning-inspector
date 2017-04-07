import React from 'react';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import LimitXHRActions from './LimitXHRActions';
import JSONViewer from '../misc/JSONViewer';
import { SimpleTable } from '../misc/FixedDataTable';
import InstrumentationParser from '../../parser/InstrumentationParser';
import { mergeContext } from '../helpers/decode';
import _ from 'lodash';
import select from 'selectn';

export default class LimitXHRDuration extends React.Component {
  static MAX_DURATION = 300;

  state = {};

  async _calculateState({ bucket } = this.props) {
    this.setState({ status: 'Fetching transactions...' });

    let transactions = await ContentProxy.gatherer('aura', { bucket }).getArtifact('transactions');

    transactions.forEach(data => data.context.transaction = JSON.parse(data.context.transaction));
    transactions = mergeContext(transactions);
    transactions = new InstrumentationParser(transactions).getParsed();

    const requests = {};
    const failed = {};
    let requestDivisor = 0;
    let failedXHR = []; 

    LimitXHRActions.forEachTransaction(transactions, (__id, primary, context, children) => {
      if (!(primary && primary.type === 'transport')) {
        return;
      }

      const id = (context.auraXHRId != null ? `/aura?r=${context.auraXHRId}` : null) || context.id || context.requestId || primary.id || primary.name || '';

      if (requests.hasOwnProperty(id)) {
        return;
      }

      requests[id] = primary;
      requestDivisor++;

      if (
        context == null ||
        context.parsed == null
      ) {
        return;
      }

      if(!context.parsed.totalTime && context.xhrDuration) {
        context.parsed.totalTime = context.xhrDuration;
      }

      const actions = LimitXHRActions.getChildrenOfType(transactions, children, 'actions');

      if (context.parsed.totalTime <= LimitXHRDuration.MAX_DURATION || select('0.primary.name', actions) === 'sendData') {
        return;
      }

      requestDivisor--;
      requestDivisor += Math.max(1, context.parsed.totalTime / 1000);

      failed[id] = {
        id,
        duration: context.parsed.totalTime,
        actions: _.keyBy(actions, action => action.primary.name || action.context.id),
        primary,
        context: context
      };

      failedXHR.push(failed[id]);
    });

    const requestCount = Object.keys(requests).length;
    const failedCount = Object.keys(failed).length;

    this.setState({ failedXHR, failedCount, requestCount, score: (1 - failedCount / requestCount) * 100, status: true, jsonData:{} });
  }

  componentDidMount = () => this._calculateState();
  componentWillReceiveProps = this._calculateState;

  render() {
    const { failedXHR, failedCount, requestCount, score, status, jsonData } = this.state;
    const { AuditResult } = this.props;

    return (
      <AuditResult title='Optimize XHR Response Times'
                   score={score}
                   status={status}
                   description='In order to improve the responsiveness of the page, its recommended that xhr calls take < 300ms. Review the "Optimize # Actions per XHR" tab for some ideas on how to reduce xhr response times.'
                   groups={['XHREfficiency']}>
        <div>
          <b>{failedCount}</b> out of <b>{requestCount}</b> requests take longer than > {LimitXHRDuration.MAX_DURATION}ms duration.
          <br />
          <div className='image-compression-table'>
            <SimpleTable
              getColumnValue={(failedXHR, rowIndex, columnKey) => {
                if (columnKey === 'auraXHRId') {
                  return failedXHR[rowIndex].context.auraXHRId;
                } else if (columnKey === 'url') {
                  return failedXHR[rowIndex].id;
                } else if (columnKey === 'background') {
                  return failedXHR[rowIndex].context.auraXHRId.background;
                } else if(columnKey === 'actions') {
                  return Object.keys(failedXHR[rowIndex].actions).join();
                  //return <div style={{ width: '100%', marginTop: 0, overflow: 'scroll', textAlign: 'left' }}><JSONViewer style={{ marginTop: 0 }} data={failedXHR[rowIndex].actions}/></div>
                } else if(columnKey === 'duration') {
                  return failedXHR[rowIndex].context.xhrDuration;
                } else if(columnKey === 'actionCount') {
                  return Object.keys(failedXHR[rowIndex].actions).length;
                }
              }}
              onRowClick={(failedXHR, rowIndex) => this.setState({ jsonData: failedXHR[rowIndex].actions })}
              rows={failedXHR}
              columns={[
                { header: { displayName: 'auraXHRId' }, columnKey: 'auraXHRId', flexGrow: 1 },
                { header: { displayName: 'URL' }, columnKey: 'url', flexGrow: 1 },
                { header: { displayName: 'Duration ms' }, columnKey: 'duration', flexGrow: 1 },
                { header: { displayName: 'Actions' }, columnKey: 'actionCount', flexGrow: 1 },
                { header: { displayName: 'Action Names' }, columnKey: 'actions', flexGrow: 2 },
              ]}/>
          </div>
          <div style={{ width: '100%', marginTop: 10, overflow: 'scroll', textAlign: 'left' }}>
              <JSONViewer style={{ marginTop: 5 }} data={jsonData}/>
          </div>
        </div>
      </AuditResult>
    );
  }
}
