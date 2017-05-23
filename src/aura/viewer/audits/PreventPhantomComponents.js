import React from 'react';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import _ from 'lodash';
import { decodeContext, mergeContext, marksToTimings } from '../helpers/decode';
import JSONViewer from '../misc/JSONViewer';

export default class PreventPhantomComponents extends React.Component {
  static SLACK = 10;

  state = { failedComponents: {} };

  _isBaseAuraComponent(obj) {
    return (obj.name.indexOf('aura:component') + 1) || (obj.name.indexOf('aura$component') + 1);
  }

  async _calculateState({ bucket } = this.props) {
    let [visibility, lifeCycles] = await Promise.all([
      await ContentProxy.gatherer('aura', { bucket }).getArtifact('componentVisibility'),
      await ContentProxy.gatherer('aura', { bucket }).getArtifact('componentLifeCycleMarks')
    ]);

    lifeCycles = marksToTimings(lifeCycles);
    lifeCycles = decodeContext(lifeCycles, { contextParser: 'qs' });
    lifeCycles = mergeContext(lifeCycles);

    const failedComponents = {};
    const virtualComponentsById = _.keyBy(_.filter(visibility,
      component => component.type.indexOf('virtual') + 1), component => component.id + component.name);
    const componentEventsById = _.groupBy(
      _.filter(lifeCycles,
        component => !this._isBaseAuraComponent(component) && !virtualComponentsById[component.id + component.name]),
      component => `${component.name} ____ (${component.id})`
    );

    for (let id in componentEventsById) {
      if (!componentEventsById.hasOwnProperty(id)) {
        continue
      }

      const events = componentEventsById[id];
      const createEvents = _.filter(events, event => event.type === 'create');
      const destroyEvents = _.filter(events, event => event.type === 'destroy' || event.type === 'unrender');
      const renderEvents = _.filter(events, event => event.type === 'render' || event.type === 'rerender');

      if (createEvents.length && destroyEvents.length && renderEvents.length === 0) {
        if (id.indexOf('aura') !== 0) {
          const name = id.substring(0, id.indexOf('____'));
          const uid = id.substring(id.indexOf('____') + '____'.length + 1);

          failedComponents[name] = failedComponents[name] || {};
          failedComponents[name][uid] = events;
        }
      }
    }

    this.setState({
      failedComponents,
      status: true,
      score: 100 - Object.keys(failedComponents).length
    });
  }

  componentDidMount = () => this._calculateState();
  componentWillReceiveProps = this._calculateState;

  render() {
    const { failedComponents, status, score } = this.state;
    const { AuditResult } = this.props;

    return (
      <AuditResult title='Avoid Phantom Components'
                   status={status}
                   score={score}
                   description='Components that are created and destroyed without rendering to screen could be potential bottlenecks that use up memory/cpu resources and delay creations/rendering of content that is visible to the user.'
                   groups={['AuraCycleEfficiency', 'MemoryManagement']}>
        <div>
          The page has <b>{Object.keys(failedComponents).length}</b> components which were created and destroyed without
          ever rendering to screen (slack: {PreventPhantomComponents.SLACK} components).
          <br />
          <JSONViewer style={{ marginTop: 5 }}
                      data={failedComponents}/>
        </div>
      </AuditResult>
    );
  }
}
