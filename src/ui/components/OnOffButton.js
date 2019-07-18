import React from "react";
import PropTypes from "prop-types";

// import BrowserApi from "../../aura/viewer/BrowserApi.js";
// import GlobalEventBus from "../../core/GlobalEventBus.js";

import { StatefulButton, StatefulButtonState } from "react-lds";

export default class OnOffButton extends React.Component {
  static childContextTypes = {
    assetBasePath: PropTypes.string
  };

  getChildContext() {
    return {
      assetBasePath: "/dist/slds/"
    };
  }

  render() {
    return (
      <StatefulButton
        onClick={this.props.onClick}
        selected={this.props.selected}
        flavor={this.props.selected ? "success" : "destructive"}
        tooltip={this.props.tooltip || this.props.label}
      >
        <StatefulButtonState
          state="selected"
          icon="check"
          sprite="utility"
          title={this.props.label}
        />
        <StatefulButtonState
          state="not-selected"
          icon="add"
          sprite="utility"
          title={this.props.label}
        />
        <StatefulButtonState
          state="focus"
          icon={this.props.selected ? "check" : "add"}
          sprite="utility"
          title={this.props.label}
        />
      </StatefulButton>
    );
  }
}
