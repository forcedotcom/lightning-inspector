import React from 'react';
import Markdown from '../misc/Markdown';
import about from '../../../../ABOUT.md';

class Help extends React.PureComponent {
  render() {
    return (
      <Markdown source={about}/>
    )
  }
}

export default Help;
