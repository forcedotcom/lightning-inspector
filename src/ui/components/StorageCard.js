import React from 'react';
import PropTypes from 'prop-types';

import { ExpandableSection } from 'react-lds';

export default class StorageCard extends React.Component {
    static childContextTypes = {
        assetBasePath: PropTypes.string
    };

    getChildContext() {
        return {
            assetBasePath: '/dist/slds/'
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.rawContents !== this.props.rawContents;
    }

    render() {
        return (
            <ExpandableSection
                className="slds-p-horizontal_x-small"
                id={this.props.storageId}
                title={this.props.storageId}
                defaultOpen={this.props.isExpanded}
            >
                <aurainspector-json expandTo="2">
                    {JSON.stringify(this.props.contents)}
                </aurainspector-json>
            </ExpandableSection>
        );
    }
}
