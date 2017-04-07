import React from 'react';
import showdown from 'showdown';
import './Markdown.scss';

const converter = new showdown.Converter();

converter.setOption('simpleLineBreaks', true);
converter.setOption('tables', true);
converter.setFlavor('github');

class Markdown extends React.PureComponent {
  render() {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'auto' }}
           className='markdown-section'>
        <div dangerouslySetInnerHTML={{ __html: converter.makeHtml(this.props.source) }}/>
      </div>
    )
  }
}

export default Markdown;
