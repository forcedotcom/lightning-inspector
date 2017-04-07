import React from 'react';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import SimpleFooter from './SimpleFooter';
import Wireframe from './Wireframe';
import _ from 'lodash';
import './Footer.scss';

export default class Footer extends React.Component {
  static height = 57;
  static defaultProps = { onChangeBucket: () => 0 };

  state = { ready: false, context: null, contentCollectorTime: null };


  async componentWillMount({ bucket, onChangeBucket } = this.props) {
    const [context, buckets, isActiveBucketFrozen] = await Promise.all([
      ContentProxy.gatherer('aura', { bucket, def: { mode: 'NA' } }).getArtifact('context'),
      ContentProxy.buckets.names(),
      ContentProxy.bucket().isFrozen()
    ]);

    if (isActiveBucketFrozen && bucket === 'active') {
      try {
        // we assume the last bucket is the active one
        onChangeBucket(buckets[buckets.length - 2]);

        return;
      } catch (e) {
        console.error(e);
      }
    }

    this.setState({ ready: true, context, buckets });
  }

  componentWillReceiveProps = this.componentWillMount;

  render() {
    const { ready, buckets } = this.state;
    const { onChangeBucket, bucket: activeBucket } = this.props;

    if (ready != true) {
      return null;
    }

    return (
      <div className='footer'
           style={{ height: Footer.height }}>
        <div className='footer-wireframes'>
          {
            _.map(buckets, (bucket, i) => {
              return (
                <div onClick={() => activeBucket !== bucket && onChangeBucket(bucket)}
                     className={'footer-wireframe ' + ((activeBucket === bucket || activeBucket === 'active' && i + 1 === buckets.length) ? 'selected' : '')}
                     key={bucket}>
                  <div style={{ width: '100%', height: '100%', overflowY: 'scroll' }}>
                    <Wireframe fitWidth={80}
                               viewport={false}
                               bucket={bucket}/>
                  </div>
                  <div className='footer-wireframe-name'>{bucket}</div>
                </div>
              )
            })
          }
        </div>
        <SimpleFooter {...this.props}/>
      </div>
    );
  }
}
