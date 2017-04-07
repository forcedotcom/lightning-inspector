import React from 'react';
import AuraWorkspace from '../visualizers/Workspace';
import ContentProxy from '../../../core/message/ViewerContentProxy';
import { local } from '../../../core/storage';

class Workspace extends React.Component {
  static optionTypes = [
    { namespace: 'aura', key: 'captureComponentDefinitions', require: true, name: 'Enable' }
  ];

  state = {};

  _onActivateChangeOverrideComponentName(name, activated) {
    if (activated) {
      local.set('aura', `override_activated_${this.state.mode}_${name}`, true);
    } else {
      local.remove('aura', `override_activated_${this.state.mode}_${name}`);
    }
  }

  _onAddOverrideComponentDefinition(name, data) {
    local.set('aura', `override_definition_${this.state.mode}_${name}`, data);
  }

  async _onDeleteOverrideComponentDefinition(name) {
    await local.remove('aura', `override_definition_${this.state.mode}_${name}`);
    await local.remove('aura', `override_activated_${this.state.mode}_${name}`);
  }

  _onSaveOverrideComponentDefinition(name, data) {
    local.set('aura', `override_definition_${this.state.mode}_${name}`, data);
  }

  async componentWillMount({ bucket } = this.props) {
    const [context, componentDefinitions, localStorage] = await Promise.all([
      ContentProxy.gatherer('aura', { bucket }).getArtifact('context'),
      ContentProxy.gatherer('aura', { bucket }).getArtifact('componentDefinitions'),
      local.get('aura')
    ]);

    const mode = context.mode;
    const overrideComponentDefinitions = {};
    const activatedOverrideComponentNames = {};

    for (const k in localStorage) {
      if (!localStorage.hasOwnProperty(k)) {
        continue;
      }

      if (k.indexOf(`override_definition_${mode}_`) === 0) {
        const substr = `override_definition_${mode}_`.length;
        const name = k.substring(substr);
        overrideComponentDefinitions[name] = localStorage[k];
      }

      if (k.indexOf(`override_activated_${mode}_`) === 0) {
        const substr = `override_activated_${mode}_`.length;
        const name = k.substring(substr);
        activatedOverrideComponentNames[name] = true;
      }
    }

    this.setState({
      mode: context.mode,
      activatedOverrideComponentNames: Object.keys(activatedOverrideComponentNames),
      overrideComponentDefinitions,
      overrideComponentNames: Object.keys(overrideComponentDefinitions),
      componentDefinitions,
      componentNames: Object.keys(componentDefinitions).sort((a, b) => a.localeCompare(b))
    });
  }

  componentWillReceiveProps = this.componentWillMount;

  render() {
    const {
      mode, componentNames, componentDefinitions, overrideComponentNames,
      overrideComponentDefinitions, activatedOverrideComponentNames
    } = this.state;

    if (mode == null) {
      return null;
    }

    const { theme } = this.props;

    return (
      <AuraWorkspace theme={theme}
                     commentCode={mode === 'PROD'}
                     componentNames={componentNames}
                     componentDefinitions={componentDefinitions}
                     overrideComponentNames={overrideComponentNames}
                     overrideComponentDefinitions={overrideComponentDefinitions}
                     activatedOverrideComponentNames={activatedOverrideComponentNames}
                     onAddOverrideComponentDefinition={::this._onAddOverrideComponentDefinition}
                     onSaveOverrideComponentDefinition={::this._onSaveOverrideComponentDefinition}
                     onDeleteOverrideComponentDefinition={::this._onDeleteOverrideComponentDefinition}
                     onActivateChangeOverrideComponentName={::this._onActivateChangeOverrideComponentName}/>
    )
  }
}

export default Workspace;
