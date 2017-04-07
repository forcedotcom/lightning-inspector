import React from 'react';
import Audits, { Audit } from '../../../core/viewer/Audits';
import InsightsOverview from './InsightsOverview';
import MinifiySources from '../audits/MinifySources';
import LimitXHRActions from '../audits/LimitXHRActions';
import LimitXHRDuration from '../audits/LimitXHRDuration';
import ImageCompression from '../audits/ImageCompression';
import PrioritizeViewport from '../audits/PrioritizeViewport';
import PreventPhantomComponents from '../audits/PreventPhantomComponents';
import PreventUnrenderedComponents from '../audits/PreventUnrenderedComponents';
import LimitImageSize from '../audits/LimitImageSize';
import ResourceCaching from '../audits/ResourceCaching';

export default class Insight extends React.Component {
  static optionTypes = [
    {
      namespace: 'aura',
      key: ['collectComponentLifeCycleData', 'collectAuraCycleData'],
      require: [true, true],
      name: 'Enable'
    },
    { namespace: 'aura', key: 'captureComponentDefinitions', name: 'Definitions' }
  ];

  state = { context: null, scores: {} };

  async componentWillMount() {
    this.setState({ ready: true });
  }

  componentWillReceiveProps = this.componentWillMount;

  render() {
    const { ready } = this.state;

    if (ready != true) {
      return null;
    }

    return (
      <Audits groups={{
        ProgressiveRendering: {
          weight: 1,
          description: 'Focus on prioritizing visible, above the fold content over hidden or below the fold content thereby improving perceived performance and utility of the application.'
        },
        XHREfficiency: {
          weight: 1,
          description: 'Making XHR requests light and quick enable a snappy experience for the user when loading and interacting with a web application.'
        },
        AuraCycleEfficiency: {
          weight: 1,
          description: 'Focus on optimizing client side javascript code execution times and patterns. Performing client side work in smaller cycles helps improve the responsiveness/fps for the application.'
        },
        MemoryManagement: {
          weight: 1,
          description: 'Audits in this category aim at identifying memory leaks/unnecessary object allocations. Efficient memory management is vital special for mobile devices and lower end computers.'
        },
        ResourceEfficiency: {
          weight: 1,
          description: 'For web applications with a global audience, diversity of user devices and network connections, it is critical to deliver resources as quickly & efficiently as possible by using minification, compression & cacheability.'
        }
      }}>
        <Audit content={<InsightsOverview {...this.props}/>}/>
        <Audit content={<PrioritizeViewport {...this.props}/>}/>
        <Audit content={<LimitXHRActions {...this.props}/>}/>
        <Audit content={<LimitXHRDuration {...this.props}/>}/>
        <Audit content={<PreventPhantomComponents {...this.props}/>}/>
        <Audit content={<PreventUnrenderedComponents {...this.props}/>}/>
        <Audit content={<LimitImageSize {...this.props}/>}/>
        <Audit content={<ImageCompression {...this.props}/>}/>
        <Audit content={<ResourceCaching {...this.props}/>}/>
        <Audit content={<MinifiySources {...this.props}/>}/>
      </Audits>
    );
  }
}
