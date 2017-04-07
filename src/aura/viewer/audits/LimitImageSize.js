import React from 'react';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import JSONViewer from '../misc/JSONViewer';
import { SimpleTable } from '../misc/FixedDataTable';
import getEntriesByContentType from '../helpers/getEntriesByContentType';
import _ from 'lodash';

export default class LimitImageSize extends React.Component {
  static MAX_IMAGE_SIZE = 102400; 

  state = {images:[], image:{}};

  async _calculateState({ bucket } = this.props) {
    this.setState({status: 'Fetching Image size data'});
    const entries = await ContentProxy.gatherer('default', { bucket }).getArtifact('networkResourceTimings');
    const images = getEntriesByContentType(entries, 'image');    
    let failed = {};
    let requests = {};
    let failedImages = [];
    let aggregateSize = 0;

    for (let i=0; i< images.length; i++) {
      let currentImage = images[i];
      let contentLength = !isNaN(currentImage.response.headers["content-length"]) ? parseInt(currentImage.response.headers["content-length"]) : currentImage.transferSize;
      
      let image = { 
          name: currentImage.name.split('#')[0], 
          contentLength: contentLength, 
          contentType: currentImage.response.headers['content-type'],
          shouldGzip: (currentImage.response.headers['content-type'] == "image/svg+xml" && currentImage.encodedBodySize == currentImage.decodedBodySize)
        }

      if(!requests[image.name]) {
        requests[image.name] = image;
      }

      if(contentLength > LimitImageSize.MAX_IMAGE_SIZE) {        
        if(!failed[currentImage.name]) {
          failed[currentImage.name] = image;
          failedImages.push(image);
          aggregateSize += image.contentLength;
        }        
      }        
    }
    failedImages.sort(function(a,b){return b.contentLength - a.contentLength});
    let failedCount = Object.keys(failed).length;
    let requestCount = Object.keys(requests).length;
    let score = failedCount == 0 ? 100 : 100 -  Math.ceil(aggregateSize / (LimitImageSize.MAX_IMAGE_SIZE ));
    this.setState({failedCount, requestCount, failedImages, score: score, status: true});
  }

  componentDidMount = () => this._calculateState();
  componentWillReceiveProps = this._calculateState;

  render() {
    const { AuditResult } = this.props;
    const { failedCount, requestCount, failedImages, score, status, image } = this.state;
    return(
      <AuditResult title='Avoid Large Images'
        score={score}
        status={status}
        description='Optimize Images to < 100kb in size for optimal performance for users who are grographically remote or on limited bandwidth network connections. Visit the Image Compression tab for image optimization ideas.'
        groups={['ResourceEfficiency']}>
        <div style={{ width: '100%' }}>
          Images > {LimitImageSize.MAX_IMAGE_SIZE/1024}kb in length.
          <div className='image-compression-table'>
            <SimpleTable
              getColumnValue={(failedImages, rowIndex, columnKey) => {
                if (columnKey === 'name') {
                  const index = failedImages[rowIndex].name.indexOf('?') === -1 ? failedImages[rowIndex].name.length : failedImages[rowIndex].name.indexOf('?');
                  return failedImages[rowIndex].name.substring(0, index);
                } else if (columnKey === 'mime') {
                  return failedImages[rowIndex].contentType;
                } else if (columnKey === 'contentLength') {
                  return failedImages[rowIndex].contentLength;
                } else if(columnKey === 'recommendation') {
                  return failedImages[rowIndex].shouldGzip ? 'Gzip SVG' : 'Compress Image';
                }
              }}
              onRowClick={(failedImages, rowIndex) => this.setState({ image: failedImages[rowIndex] })}
              rows={failedImages}
              columns={[
                {
                  columnKey: 'name',
                  width: 200,
                  fixed: true,
                  header: { displayName: 'Name', align: 'left' },
                  body: { align: 'left', ellipses: 'left' }
                },
                { header: { displayName: 'Type' }, columnKey: 'mime', flexGrow: 2 },
                { header: { displayName: 'Size' }, columnKey: 'contentLength', flexGrow: 2 },
                { header: { displayName: 'Recommendation' }, columnKey: 'recommendation', flexGrow: 2 }
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
