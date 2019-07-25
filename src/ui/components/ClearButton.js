import React from 'react';
import PropTypes from 'prop-types';

import { Button, ButtonIcon } from 'react-lds';

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
        const props = {
            icon: 'true',
            onClick: this.props.onClick,
            title: this.props.title,
            tooltip: this.props.tooltip
        };

        return (
            <Button {...props}>
                <ButtonIcon sprite="utility" icon="ban" />
            </Button>
        );
    }
}
