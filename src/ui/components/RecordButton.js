import React from 'react';
import PropTypes from 'prop-types';

import { IconButton } from 'react-lds';

export default class RecordButton extends React.PureComponent {
    static childContextTypes = {
        assetBasePath: PropTypes.string
    };

    getChildContext() {
        return {
            assetBasePath: '/dist/slds/'
        };
    }

    render() {
        return (
            <IconButton
                sprite="utility"
                icon="record"
                onClick={this.props.onClick}
                title={this.props.title}
                tooltip={this.props.tooltip}
                size="small"
                className={this.props.recording ? 'slds-icon-text-error' : 'slds-icon-text-default'}
            ></IconButton>
        );
    }
}
