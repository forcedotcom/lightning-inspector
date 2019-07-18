import React from 'react';
import PropTypes from 'prop-types';

import BrowserApi from '../../aura/viewer/BrowserApi.js';
import $Aura from '../../aura/AuraInjectedScriptApi.js';
import FunctionCallValueUtils from '../../aura/FunctionCallValueUtils.js';

import './AuraComponent.css';

export default class AuraComponent extends React.Component {
    static propTypes = {
        globalId: PropTypes.string.isRequired,
        componentData: PropTypes.object,
        summarizeData: PropTypes.bool,
        showExpressions: PropTypes.bool
    };

    constructor(props) {
        super(props);

        this.state = {
            componentData: this.props.componentData
        };

        this.handleOnClick = this.handleOnClick.bind(this);
        this.handleDblClick = this.handleDblClick.bind(this);
    }

    async getComponentData() {
        const componentData = await $Aura.Inspector.getComponent(this.props.globalId, {
            body: false,
            attributes: !this.props.summarizeData
        });

        this.setState({ componentData });
        return componentData;
    }

    hasComponentData() {
        return !(this.state.componentData === undefined || this.state.componentData === null);
    }

    componentDidMount() {
        // Update if we haven't already
        if (!this.hasComponentData()) {
            this.getComponentData();
        }
    }

    componentWillReceiveProps(props) {
        if (props.hasOwnProperty('componentData')) {
            this.setState({
                componentData: props.componentData
            });
        }
    }

    shouldShowAttribute(attribute) {
        const attributes = this.state.componentData.attributes;
        const attributesChanged = this.state.componentData.attributesChanged;
        const expressions = this.state.componentData.expressions;

        if (attribute === 'body') {
            return false;
        }

        if (attributesChanged[attribute] === false) {
            return false;
        }

        if (this.props.showExpressions !== true && expressions.hasOwnProperty(attribute)) {
            return false;
        }

        return true;
    }

    formatKey(key) {
        return <span className="component-attribute-key">{key}</span>;
    }

    formatValue(value, expression) {
        let formattedValue;

        if (value === null) {
            formattedValue = 'null';
        } else if (value === undefined) {
            formattedValue = 'undefined';
        } else if (Array.isArray(value)) {
            formattedValue = (
                <React.Fragment>
                    [<i className="component-array-length">{value.length}</i>]
                </React.Fragment>
            );
        } else if (typeof value === 'object') {
            formattedValue = Object.keys(value).length > 0 ? '{..}' : '{}';
        } else if (FunctionCallValueUtils.isFCV(value)) {
            formattedValue = FunctionCallValueUtils.formatFCV(value);
        } else if (FunctionCallValueUtils.isFCV(expression)) {
            formattedValue = FunctionCallValueUtils.formatFCV(expression);
        } else if (expression) {
            formattedValue = expression;
        } else {
            formattedValue = value.toString();
        }

        return <span className="component-attribute-value">{formattedValue}</span>;
    }

    formatAttributes() {
        const attributes = this.state.componentData.attributes || {};
        const attributesChanged = this.state.componentData.attributesChanged || {};
        const expressions = this.state.componentData.expressions || {};

        const elements = [];

        Object.entries(attributes).forEach(item => {
            const key = item[0];

            if (!this.shouldShowAttribute(key)) {
                return;
            }

            elements.push(
                <span className="component-attribute" key={key}>
                    {this.formatKey(key)}={this.formatValue(item[1], expressions[key])}
                </span>
            );
        });

        return elements;
    }

    render() {
        if (this.state.componentData) {
            const componentData = this.state.componentData;
            let descriptor;
            if (componentData.valid === false) {
                descriptor = 'INVALID';
            } else {
                descriptor = componentData.descriptor.split('://')[1] || data.descriptor;
            }

            return (
                <span
                    className="auracomponent"
                    onClick={this.handleOnClick}
                    onDoubleClick={this.handleDblClick}
                >
                    <span className="component-tagname">{descriptor}</span>
                    <span className="component-attribute" key="globalId">
                        {this.formatKey('globalId')}={this.formatValue(this.props.globalId)}
                    </span>
                    {this.formatAttributes()}
                </span>
            );
        }

        return <div>{this.props.globalId}</div>;
    }

    // Event Handlers

    handleOnClick() {
        var command = `
            this.$auraTemp = $A.getComponent('${this.props.globalId}'); undefined;
        `;
        BrowserApi.eval(command);
    }

    handleDblClick() {
        var command = `
            this.$auraTemp = $A.getComponent('${this.props.globalId}'); undefined;
        `;
        BrowserApi.eval(command).then(() => {
            $Aura.Inspector.publish('AuraInspector:ShowComponentInTree', this.props.globalId);
        });
    }
}
