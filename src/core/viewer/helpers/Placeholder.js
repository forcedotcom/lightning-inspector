import React from 'react';
import './Placeholder.css';

class Placeholder extends React.PureComponent {
  render() {
    let { children } = this.props;

    if (children == null || children.length === 0) {
      children = 'No content';
    }

    return (
      <div className='placeholder'>
        <div>{children}</div>
      </div>
    );
  }
}

export default Placeholder;
