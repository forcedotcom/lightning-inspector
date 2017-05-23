import React from 'react';
import AceEditor from '../misc/AceEditor';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import alertify from 'alertify.js';
import Placeholder from '../misc/Placeholder';
import Spinner from '../misc/Spinner';

class Raw extends React.Component {
  static optionTypes = [];

  state = { contentLength: 0, content: null, busy: null };

  async componentWillMount() {
    alertify.confirm(`This module pulls all collected metrics and is to be used for debugging purposes. It is a may take up 30 seconds. 
      Would you still like to continue?`, async() => {
      this.setState({ busy: true });

      const artifacts = await ContentProxy.buckets.export();

      const content = JSON.stringify(artifacts, null, 2);

      this.setState({
        content,
        contentLength: content.length / 2,
        busy: false
      });
    });
  }

  componentWillReceiveProps = this.componentWillMount;

  render() {
    const { theme } = this.props;
    const { content, contentLength, busy } = this.state;

    if (!content) {
      return (
        <Placeholder>
          {busy ? <Spinner /> : `No content`}
        </Placeholder>
      )
    }

    return (
      <div style={{ width: '100%', height: '100%' }}>
        <div className='banner-message warn'>{`Size: ${(contentLength / 1024).toFixed(2)} KB`}</div>
        <div style={{ width: '100%', height: 'calc(100% - 24px)' }}>
          <AceEditor height='100%'
                     width='100%'
                     theme={theme}
                     value={content}
                     showLineNumbers={false}
                     wrapEnabled={true}
                     fontSize={9}/>
        </div>
      </div>
    )
  }
}

export default Raw;
