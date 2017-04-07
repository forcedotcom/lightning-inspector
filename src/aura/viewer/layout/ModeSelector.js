import React from 'react';
import Placeholder from '../misc/Placeholder';
import './ModeSelector.scss';
import options from '../../options.json';
import { sync } from '../../../core/storage';
import ContentProxy from '../../../core/message/ViewerContentProxy';

export default class ModeSelector extends React.Component {
  static isModeSelected() {
    return !!localStorage.uiMode;
  }

  static isSimpleMode() {
    return localStorage.uiMode === 'simple';
  }

  static async setUIMode(mode) {
    const { advanced, simple } = options;
    const nextOptions = mode === 'simple' ? simple : advanced;

    for (const option in nextOptions) {
      if (!nextOptions.hasOwnProperty(option)) {
        continue;
      }

      await sync.set('aura', option, nextOptions[option]);
    }

    await ContentProxy.this.reload();

    localStorage.uiMode = mode;

    window.close();

    location.reload();
  }

  render() {
    return (
      <div className='mode-selector'>
        <Placeholder>
          Select your type of UI to begin (you can change this later). <b style={{ color: 'red' }}>Once your selection
          is made, the page will reload!</b>
          <br />
          <br />
          <button className='generic'
                  onClick={() => ModeSelector.setUIMode('simple')}>Simple UI
          </button>
          <button className='generic'
                  onClick={() => ModeSelector.setUIMode('advanced')}>Advanced UI
          </button>
        </Placeholder>
      </div>
    )
  }
}

