import React from 'react';
import ReactDOM from 'react-dom';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import _ from 'lodash';
import { decodeContext, mergeContext, marksToTimings } from '../helpers/decode';
import Wireframe from '../layout/Wireframe';
import JSONView from '../misc/JSONViewer';
import './PrioritizeViewport.scss';

export default class PrioritizeViewport extends React.Component {
  state = {};

  _isBaseAuraComponent(obj) {
    return (obj.name.indexOf('aura:component') + 1) || (obj.name.indexOf('aura$component') + 1);
  }

  async _calculateState({ bucket } = this.props) {
    this.setState({ status: 'Rendering viewport...' });

    let [visibility, cycles, lifeCycles] = await Promise.all([
      await ContentProxy.gatherer('aura', { bucket }).getArtifact('componentVisibility'),
      await ContentProxy.gatherer('aura', { bucket }).getArtifact('cycleMarks'),
      await ContentProxy.gatherer('aura', { bucket }).getArtifact('componentLifeCycleMarks')
    ]);

    lifeCycles = marksToTimings(lifeCycles);
    lifeCycles = decodeContext(lifeCycles, { contextParser: 'qs' });
    lifeCycles = mergeContext(lifeCycles);

    cycles = marksToTimings(cycles);
    cycles = decodeContext(cycles, { contextParser: 'qs' });
    cycles = mergeContext(cycles);

    const concreteComponentsById = _.keyBy(_.filter(visibility,
      component => !this._isBaseAuraComponent(component) && component.type === 'concrete'), 'id');
    const concreteComponentsByCycle = _.groupBy(_.filter(lifeCycles,
      component => component.type === 'render' && component.elements != null && !this._isBaseAuraComponent(component)), 'cycle');

    let computedTotalVisibleComponents = 0;
    let computedComponentCount = 0;
    let visibleTracker = [];

    const criticalCycles = _.intersection(Object.keys(concreteComponentsByCycle), _.map(cycles, cycle => String(cycle.name)))
                            .map(cycle => Number(cycle)).sort((a, b) => a - b).splice(0, 10);

    for (let cycle of criticalCycles) {
      let hiddenComponentCount = 0;
      let visibleComponentCount = 0;

      _.each(concreteComponentsByCycle[cycle], component => {
        if (concreteComponentsById.hasOwnProperty(component.id)) {
          const componentVisibility = concreteComponentsById[component.id];
          const visibleElementCount = _.filter(componentVisibility.elements, element => element.visible > 0).length;
          const elementCount = componentVisibility.elements.length;

          if (visibleElementCount / elementCount) {
            visibleComponentCount++;
          } else {
            hiddenComponentCount++;
          }
        }
      });

      visibleTracker.push({visible: visibleComponentCount, hidden: hiddenComponentCount});
      computedComponentCount += visibleComponentCount + hiddenComponentCount;
      computedTotalVisibleComponents += visibleComponentCount;
    }

    let vscore = 0;
    let hscore = 0;
    for(var i=0; i<visibleTracker.length; i++) {
      vscore +=  (100 * visibleTracker[i].visible / computedTotalVisibleComponents) * (1 - i/10);
      hscore +=  (100 * visibleTracker[i].hidden / (computedComponentCount - computedTotalVisibleComponents)) * (1 - i/10);   
    }
    let recommendationText = '';
    if(hscore > vscore) {
      recommendationText = 'Delay rendering of hidden/out of viewport components to improve page load performance.';
    } else if(vscore > 90){
      recommendationText = 'Page was loaded in a progressive manner. Review the page progress wireframe to determine further component priortization opportunities' ; 
    }  else {
      recommendationText = 'Review page progress wireframe and current page design to load visible components in viewport earlier in the page load process.'
    }
    const averageComponentVisibility = computedTotalVisibleComponents / computedComponentCount;
    //averageComponentVisibility * 100

    this.setState({
      computedComponentCount,
      computedTotalVisibleComponents,
      status: true,
      score: vscore,
      vscore: vscore,
      hscore: hscore,
      recommendationText: recommendationText
    });
  }

  _onUpdateBoundaryCycles(min, max, cycles, isPageLoad) {
    const rangeWrapper = ReactDOM.findDOMNode(this.refs.rangeWrapper);

    if (min == null || max == null) {
      rangeWrapper.style.visibility = 'hidden';
      return;
    } else {
      rangeWrapper.style.visibility = 'visible';
    }

    const range = ReactDOM.findDOMNode(this.refs.range);
    const rangeZeroTime = isPageLoad ? 0 : min.start;

    range.setAttribute('min', '0');
    range.setAttribute('max', String(max.end - rangeZeroTime));

    range.value = String(max.end - rangeZeroTime);

    this.rangeZeroTime = rangeZeroTime;
    this.cycles = cycles;

    this._setTime(max.ts - rangeZeroTime)
  }

  _setTime(value) {
    const { time, wireframe, json } = this.refs;
    const { cycles, rangeZeroTime } = this;

    value = Number(value);

    time.innerHTML = `${(value / 1000).toFixed(2)} s`;

    value += rangeZeroTime;

    wireframe.setLoadTime(value);

    let lastCycle = null;
    for (const cycle in cycles) {
      if (!cycles.hasOwnProperty(cycle)) {
        continue;
      }

      const cycleTiming = cycles[cycle];

      if (cycleTiming.start > value) {
        continue;
      }

      lastCycle = cycleTiming;

      if (cycleTiming.end >= value) {
        break;
      }
    }

    json.setData(lastCycle);
  }

  componentDidMount = () => this._calculateState();
  componentWillReceiveProps = this._calculateState;

  render() {
    const { status, score, recommendationText } = this.state;
    const { bucket, AuditResult } = this.props;

    const { computedComponentCount, computedTotalVisibleComponents } = this.state;

    return (
      <AuditResult title='Progressive Rendering'
                   status={status}
                   score={score}
                   description='Prioritize visible components that are above the fold/in the viewport over components outside the viewport or hidden components. This helps improve the time to first meaningful paint and improves perceived performance for the page.'
                   groups={['AuraCycleEfficiency', 'ProgressiveRendering']}>
        <div style={{ minHeight: 200, position: 'relative' }}>
          <div style={{ width: 'calc(100% - 200px)', display: 'inline-block', paddingRight: 5, verticalAlign: 'top' }}>
            {recommendationText}
            <div className='range-wrapper'
                 ref='rangeWrapper'
                 style={{ display: 'flex', width: 200, marginTop: 5 }}>
              <input onChange={e => this._setTime(e.target.value)}
                     step={0.1}
                     ref='range'
                     type='range'
                     style={{ width: '100%', flex: 5, marginRight: 5 }}/>
              <div
                style={{ flex: 3, textAlign: 'left', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                <span ref='time'>...</span>
              </div>
            </div>
            <JSONView ref='json'/>
          </div>
          <div className='wireframe-wrapper'
               style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 200 }}>
            <Wireframe ref='wireframe'
                       onUpdateBoundaryCycles={::this._onUpdateBoundaryCycles}
                       bucket={bucket}
                       fitWidth={200}/>
          </div>
        </div>
      </AuditResult>
    );
  }
}
