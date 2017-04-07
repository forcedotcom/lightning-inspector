import React from 'react';
import './Header.scss';
import ModeSelector from './ModeSelector';

class Header extends React.Component {
  static height = 23;

  static defaultProps = { showClearButton: true, showPullButton: true, showPushButton: true };

  async _handleImport(e) {
    const input = e.target;
    const selectedFile = input.files[0];
    const reader = new FileReader();

    input.type = '';
    input.type = 'file';

    console.log('Importing file', selectedFile);

    reader.onload = async event => {
      const text = event.target.result;
      const name = selectedFile.name;

      this.props.onImport(text, name);
    };

    reader.readAsText(selectedFile);
  }

  render() {
    const { showClearButton, onExport, onPull, onPopout, onClear, onPush, showPullButton, showPushButton } = this.props;
    const nextMode = ModeSelector.isSimpleMode() ? 'advanced' : 'simple';

    return (
      <div className='headers'>
        <input type='file'
               ref='importer'
               onChange={::this._handleImport}
               className='importer'/>
        { showPullButton ? <button className='generic'
                                   onClick={onPull}>Pull</button> : null }
        { showClearButton ? <button className='generic'
                                    onClick={onClear}>Clear</button> : null }
        <button className='generic'
                onClick={onExport}>
          Export
        </button>
        <button className='generic'
                onClick={() => this.refs.importer.click()}>
          Import
        </button>
        <button className='generic'
                onClick={onPopout}>Popout
        </button>
        { showPushButton ? <button className='generic'
                                   onClick={onPush}>Push</button> : null }
        <button className='generic'
                style={{ textTransform: 'capitalize' }}
                onClick={() => ModeSelector.setUIMode(nextMode)}>
          {`${nextMode} ▶`}
        </button>
      </div>
    )
  }
}

export default Header;
