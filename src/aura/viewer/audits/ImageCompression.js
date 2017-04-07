import React from 'react';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import ImageCompressionWorker from 'worker-loader?inline!./ImageCompressionWorker';
import { postMessage, onMessage } from '../../../core/message/WorkerMessage';
import { SimpleTable } from '../misc/FixedDataTable';
import getEntriesByContentType from '../helpers/getEntriesByContentType';
import _ from 'lodash';
import './ImageCompression.scss';

export default class ImageCompression extends React.Component {
  state = { images: [], image: {} };

  async _calculateState({ bucket } = this.props) {
    this.setState({ status: 'Computing image compression...', image: {} });

    const entries = await ContentProxy.gatherer('default', { bucket }).getArtifact('networkResourceTimings');
    const images = getEntriesByContentType(entries, 'image').filter(function (image) {
      return image.response.headers['content-type'] != "image/svg+xml"
    }).sort(function (a, b) {
      return parseInt(b.response.headers['content-length']) - parseInt(a.response.headers['content-length'])
    });


    if (this.worker) {
      this.worker.terminate();
    }

    const worker = this.worker = new ImageCompressionWorker();

    onMessage(worker, 'fetch', ({ url, opts }, respond) => {
      ContentProxy.this.fetch(url, opts)
                  .then(res => respond(res));
    });

    postMessage(worker, 'images', images, images => {
      this.setState({
        images: images.filter(image => image.savings['90'] > .2 || image.bigImage),
        status: true,
        score: (1 - _.filter(images, image => image.savings['90'] > .2 && image.bigImage).length / images.length) * 100
      });

      if (process.env.NODE_ENV !== 'production') {
        // not terminating to save the blobs in worker context
        worker.terminate();
      }
    });
  }

  componentDidMount = () => this._calculateState();
  componentWillReceiveProps = this._calculateState;

  render() {
    const { AuditResult } = this.props;
    const { images, status, score, image } = this.state;

    // TODO move align-left into table
    return (
      <AuditResult title='Image Compression'
                   description='Compressing images at JPEG 90% Image Quality level can help improve image loading times with minimal impact to image quality. Listed below are the potential gains by compressing images > 100kb and also additional optimization opportunities that will help cut down the image size by atleast 20%. Click on any row to see the image.'
                   groups={['ResourceEfficiency']}
                   status={status}
                   score={score}>
        <div style={{ width: '100%' }}>
          Savings listed in object below
          <div className='image-compression-table'>
            <SimpleTable
              getColumnValue={(images, rowIndex, columnKey) => {
                if (columnKey === 'name') {
                  const index = images[rowIndex].name.indexOf('?') === -1 ? images[rowIndex].name.length : images[rowIndex].name.indexOf('?');
                  return images[rowIndex].name.substring(0, index);
                } else if (columnKey === 'mime') {
                  return images[rowIndex].response.headers['content-type'];
                } else if (columnKey === 'contentLength') {
                  return images[rowIndex].response.headers['content-length'];
                } else {
                  return Number(((images[rowIndex].savings[columnKey] || 0) * 100).toFixed(2));
                }
              }}
              onRowClick={(images, rowIndex) => this.setState({ image: images[rowIndex] })}
              rows={images}
              columns={[
                {
                  columnKey: 'name',
                  width: 200,
                  fixed: true,
                  header: { displayName: 'Name', align: 'left' },
                  body: { align: 'left', ellipses: 'left' }
                },
                { header: { displayName: 'Type' }, columnKey: 'mime', flexGrow: 2 },
                { header: { displayName: 'Original Size' }, columnKey: 'contentLength', flexGrow: 2 },
                { header: { displayName: 'Savings' }, columnKey: '90', flexGrow: 2, body: { append: '%' } }
              ]}/>
          </div>
          <div style={{ width: '100%', marginTop: 10, overflow: 'scroll', textAlign: 'center' }}>
            <img src={image.name}
                 className='image-preview'/>
          </div>
        </div>
      </AuditResult>
    );
  }
}
