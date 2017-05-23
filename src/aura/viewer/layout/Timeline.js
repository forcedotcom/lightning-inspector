import React from 'react';
import { SimpleFlameChart, SimpleStack, injectSimpleFlameChartStyles } from 'react-flamechart';
import { Vibrant, Warm, Green, Cool } from 'react-flamechart/lib/helpers/HSLColorGenerator';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import { marksToTimings } from '../helpers/decode';
import Spinner from '../misc/Spinner';
import Placeholder from '../misc/Placeholder';
import _ from 'lodash';

const defaultStacks = [
  {
    name: 'Network / Mark',
    types: ['plugin', 'request', 'mark'],
    defaultHeight: 0.1,
    overviewHeight: 20,
    getTimingColor(timing) {
      return Vibrant.colorForID(timing.name)
    }
  },
  {
    name: 'Event / Action',
    types: ['plugin', 'event', 'enqueueAction', 'fireAction'],
    defaultHeight: 0.2,
    overviewHeight: 20,
    getTimingColor(timing, mode) {
      return mode === 'overview' ? Cool.colorForID('overview') : Cool.colorForID(timing.name)
    }
  },
  {
    name: 'Transaction',
    types: ['plugin', 'transaction'],
    defaultHeight: 0.2,
    overviewHeight: 20,
    getTimingColor(timing) {
      return Green.colorForID(timing.name)
    }
  },
  {
    name: 'Component / Cycle',
    types: ['plugin', 'cycle', 'create', 'destroy', 'render', 'rerender', 'unrender', 'afterRender'],
    defaultHeight: 0.5,
    overviewHeight: 20,
    overviewType: "spread",
    getTimingColor(timing, mode) {
      return mode === 'overview' ? '#ead161' : Warm.colorForID(timing.name)
    }
  }
];

injectSimpleFlameChartStyles();

class Timeline extends React.Component {
  static optionTypes = [
    {
      namespace: 'aura', key: 'timelineMode', name: 'Timeline Mode', require: 'external',
      options: [
        { value: 'devtools', label: 'DevTools' },
        { value: 'external', label: 'In Plugin' },
        { value: 'none', label: 'Disabled' }
      ]
    },
    { namespace: 'aura', key: 'showActionsInTimeline', name: 'Actions' },
    { namespace: 'aura', key: 'showTransactionsInTimeine', name: 'Transactions' },
    { namespace: 'aura', key: 'showMarksInTimeline', name: 'Marks' },
    { namespace: 'aura', key: 'showComponentLifeCycleInTimeline', name: 'Components' },
    { namespace: 'aura', key: 'showEventsInTimeline', name: 'Events' },
    { namespace: 'aura', key: 'showAuraCyclesInTimeline', name: 'Cycles' },
    { namespace: 'aura', key: 'stopUnloadEvents', name: 'Stop unloads' }
  ];

  state = { stacks: defaultStacks, timings: [], min: 0, max: 0, start: 0 };

  async componentWillMount({ bucket } = this.props) {
    this.setState({ status: false });

    try {
      const [cycles, marks, requests, events, transactions, actions, lifeCycles, lastPurgeTime] = await Promise.all([
        ContentProxy.gatherer('aura', { bucket }).getArtifact('cycleMarks'),
        ContentProxy.gatherer('aura', { bucket }).getArtifact('markMarks'),
        ContentProxy.gatherer('aura', { bucket }).getArtifact('requestMarks'),
        ContentProxy.gatherer('aura', { bucket }).getArtifact('eventMarks'),
        ContentProxy.gatherer('aura', { bucket }).getArtifact('transactionMarks'),
        ContentProxy.gatherer('aura', { bucket }).getArtifact('actionMarks'),
        ContentProxy.gatherer('aura', { bucket }).getArtifact('componentLifeCycleMarks'),
        ContentProxy.gatherer('aura', { bucket, def: 0 }).getArtifact('lastPurgeTime')
      ]);

      const timings = marksToTimings([...cycles, ...marks, ...requests, ...events, ...transactions, ...actions, ...lifeCycles]);

      timings.forEach(timing => timing.type = timing.event);
      timings.forEach(timing => timing.name = `${timing.name || timing.id} (${timing.type})`);

      const min = _.min(_.map(timings, 'start')) || 0;
      const max = _.max(_.map(timings, 'end')) || 0;

      this.setState({ timings, min: min - (min - lastPurgeTime), start: lastPurgeTime, max, status: true });
    } catch (e) {
      this.setState({ status: e.message });
    }
  }

  componentWillReceiveProps = this.componentWillMount;

  render() {
    let { stacks, timings, start, max, min, status } = this.state;
    const { theme } = this.props;

    if (status !== true) {
      return (
        <Placeholder>
          { status || <Spinner /> }
        </Placeholder>
      )
    }

    stacks = _.map(stacks, (stack, i) => <SimpleStack {...stack} key={i}/>);

    return (
      <SimpleFlameChart timings={timings}
                        start={start}
                        theme={theme}
                        min={min}
                        max={max}>
        {stacks}
      </SimpleFlameChart>
    );
  }
}

export default Timeline;
