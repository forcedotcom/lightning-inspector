import React from 'react';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import WireframeWorker from 'worker-loader?inline!./WireframeWorker';
import _ from 'lodash';
import Placeholder from '../misc/Placeholder';
import Spinner from '../misc/Spinner';

class Wireframe extends React.Component {
  state = {
    loadTime: Number.MAX_SAFE_INTEGER
  };

  static defaultProps = {
    fitWidth: 300,
    bucket: 'active',
    viewport: true,
    onUpdateBoundaryCycles: (min, max, cycles) => null
  };

  async componentWillMount() {
    const { bucket, fitWidth, onUpdateBoundaryCycles } = this.props;

    let [cycles, lifeCycles, visibility, window] = await Promise.all([
      ContentProxy.gatherer('aura', { bucket }).getArtifact('cycleMarks'),
      ContentProxy.gatherer('aura', { bucket }).getArtifact('componentLifeCycleMarks'),
      ContentProxy.gatherer('aura', { bucket }).getArtifact('componentVisibility'),
      ContentProxy.gatherer('default', { bucket }).getArtifact('window')
    ]);

    if (this.worker) {
      this.worker.terminate();
    }

    this.worker = new WireframeWorker();
    this.worker.postMessage(JSON.stringify({ cycles, lifeCycles, visibility, window, fitWidth }));
    this.worker.onmessage = event => {
      const data = JSON.parse(event.data);

      this.setState({ ready: true, ...data });

      onUpdateBoundaryCycles(data.minCycle, data.maxCycle, data.cycles, data.isPageLoad);

      this.worker.terminate();
    };
  }

  componentWillUnmount() {
    if (this.worker) {
      this.worker.terminate();
    }
  }
  
  componentWillReceiveProps = this.componentWillMount;

  setLoadTime(loadTime) {
    this.setState({ loadTime });
  }

  render() {
    const {
      ready, cycles, viewport, components, computedHeight,
      computedWidth, isPageLoad, minCycle, maxCycle, renderCycles,
      screenshot, loadTime
    } = this.state;

    const { viewport: viewportEnabled } = this.props;

    if (ready != true) {
      return (
        <Placeholder>
          <Spinner />
        </Placeholder>
      );
    }

    const elementColors = {
      visible: 'rgba(22, 142, 0, 0.08)',
      missing: 'rgba(0, 0, 255, 0.02)',
      hidden: 'rgba(255, 0, 0, 0.04)'
    };

    const rects = _.map(components, ({ x, y, width, height, visibilityMode, cycle }, i) => {
      if (cycles[cycle].end <= loadTime) {
        return (
          <rect key={i}
                x={x}
                y={y}
                width={width}
                height={height}
                stroke={elementColors[visibilityMode]}/>
        );
      }
    });

    return (
      <div>
        <svg fill='transparent'
             width={computedWidth}
             height={computedHeight}>
          {viewportEnabled ? <rect x={viewport.x}
                                   y={viewport.y}
                                   width={viewport.width}
                                   height={viewport.height}
                                   fill='rgba(255, 255, 0, 0.2)'/> : null }
          {rects}
        </svg>
      </div>
    );
  }
}

export default Wireframe;
