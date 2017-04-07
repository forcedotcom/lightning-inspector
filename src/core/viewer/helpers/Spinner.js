import React from 'react';
import './Spinner.scss';

class Spinner extends React.PureComponent {
  render() {
    const { height, width, strokeWidth } = this.props;

    return (
      <div className='spinner'
           style={{ height, width, borderWidth: strokeWidth }}/>
    );
  }
}

export default Spinner;
