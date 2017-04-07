import React from 'react';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import JSONViewer from '../misc/JSONViewer';
import InstrumentationParser from '../../parser/InstrumentationParser';
import { mergeContext } from '../helpers/decode';
import _ from 'lodash';

export default class LimitXHRActions extends React.Component {
  static MAX_ACTION_COUNT = 5;

  state = {};

  static forEachTransaction(parsedTransactions, iteratee) {
    for (let id in parsedTransactions.primary) {
      if (!parsedTransactions.primary.hasOwnProperty(id)) {
        continue;
      }

      iteratee(id, parsedTransactions.primary[id] || {}, parsedTransactions.context[id] || {}, parsedTransactions.children[id] || {})
    }
  }

  static getChildrenOfType(parsedTransactions, children, type) {
    return _.map(
      _.filter(children, child => parsedTransactions.primary[child].type === type),
      id => {
        const context = parsedTransactions.context[id];
        const primary = parsedTransactions.primary[id];
        const children = parsedTransactions.children[id];

        return { context, primary, children };
      });
  }

  async _calculateState({ bucket } = this.props) {
    this.setState({status: 'Fetching transactions...'});

    let transactions = await ContentProxy.gatherer('aura', { bucket }).getArtifact('transactions');
    transactions.forEach(data => data.context.transaction = JSON.parse(data.context.transaction));
    transactions = mergeContext(transactions);
    transactions = new InstrumentationParser(transactions).getParsed();

    const requests = {};
    const failed = {};

    LimitXHRActions.forEachTransaction(transactions, (__id, primary, context, children) => {
      if (!(primary && primary.type === 'transport')) {
        return;
      }

      const id = (context.auraXHRId != null ? `/aura?r=${context.auraXHRId}` : null) || context.id || context.requestId || primary.id || primary.name || '';

      if (requests.hasOwnProperty(id)) {
        return;
      }

      requests[id] = primary;

      const actions = LimitXHRActions.getChildrenOfType(transactions, children, 'actions');

      if (actions.length <= LimitXHRActions.MAX_ACTION_COUNT) {
        return;
      }

      failed[id] = {
        id,
        duration: primary.duration,
        actions: _.keyBy(actions, action => action.primary.name || action.context.id),
        primary,
        context: context
      };
    });

    const requestCount = Object.keys(requests).length;
    const failedCount = Object.keys(failed).length;

    this.setState({ failed, failedCount, requestCount, score: (1 - failedCount / requestCount) * 100, status: true });
  }

  componentDidMount = () => this._calculateState();
  componentWillReceiveProps = this._calculateState;

  render() {
    const { AuditResult } = this.props;
    const { failed, failedCount, requestCount, score, status } = this.state;

    return (
      <AuditResult title='Optimize # Actions per XHR'
                   score={score}
                   status={status}
                   description='Actions batched together in a single XHR request are executed serially on the server. Having too many action can lead to long XHR response times'
                   groups={['XHREfficiency']}>
        <div>
          Page makes <b>{requestCount}</b> requests; <b>{failedCount}</b> requests
          have > {LimitXHRActions.MAX_ACTION_COUNT} actions.
          <br />
          <JSONViewer style={{ marginTop: 5 }}
                      data={failed}/>
        </div>
      </AuditResult>
    );
  }
}
