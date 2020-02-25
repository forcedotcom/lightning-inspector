import Immutable from 'immutable';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import BrowserApi from '../../../aura/viewer/BrowserApi.js';
import { Icon } from 'react-lds';
import classNames from 'classnames';
import AuraComponent from '../AuraComponent.js';
import EventParameters from './EventParameters.js';

// TODO: Define Prop Types
export default class EventCard extends PureComponent {
    constructor(props) {
        super(props);

        this.handleExpandSection = this.handleExpandSection.bind(this);

        this.state = {
            eventName: this.props.name.startsWith('markup://')
                ? this.props.name.substr(9)
                : this.props.name,
            eventSourceId: this.props.sourceId,
            eventDuration: this.props.duration,
            eventType: this.props.type === 'APPLICATION' ? 'APP' : 'CMP',
            eventCaller: this.props.caller,
            parameters: this.props.parameters,
            expanded: !!this.props.expanded
        };

        if (this.state.eventName === 'aura:valueChange') {
            this.state.valueChangeExpression =
                '{! ' + JSON.parse(this.state.parameters).expression + ' }';
        }

        // renderCallStack(this);
    }

    static childContextTypes = {
        assetBasePath: PropTypes.string
    };

    getChildContext() {
        return {
            assetBasePath: '/dist/slds/'
        };
    }

    handleExpandSection() {
        // Toogle expanded
        this.setState(function(prevState) {
            return { expanded: !prevState.expanded };
        });
    }

    getTitle() {
        return `[${this.state.eventType}] ${this.state.eventName}`;
    }

    render() {
        const labels = {
            eventcard_parameters: BrowserApi.getLabel('eventcard_parameters'),
            eventcard_caller: BrowserApi.getLabel('eventcard_caller'),
            eventcard_source: BrowserApi.getLabel('eventcard_source'),
            eventcard_duration: BrowserApi.getLabel('eventcard_duration'),
            eventcard_callStack: BrowserApi.getLabel('eventcard_callStack'),
            eventcard_togglegrid: BrowserApi.getLabel('eventcard_togglegrid')
        };

        const Fragment = React.Fragment;

        return (
            <div style={{ background: 'rgb(244, 246, 249)' }}>
                <div className="slds-panel slds-grid slds-grid_vertical slds-nowrap">
                    <div className="slds-form slds-form_stacked">
                        <div className="slds-panel__section">
                            <div className="slds-media">
                                <div className="slds-media__figure">
                                    <button
                                        aria-controls={this.props.id}
                                        aria-expanded={this.state.expanded + ''}
                                        className="slds-button"
                                        onClick={this.handleExpandSection}
                                    >
                                        <Icon
                                            icon={classNames({
                                                chevronright: !this.state.expanded,
                                                chevrondown: this.state.expanded
                                            })}
                                            size="small"
                                            sprite="utility"
                                            svgClassName="slds-icon-text-default"
                                        />
                                    </button>
                                </div>
                                <div className="slds-media__body">
                                    <h2
                                        className="slds-truncate slds-text-heading_small event-card-title"
                                        title={this.state.eventName}
                                    >
                                        <a
                                            href="javascript:void(0);"
                                            onClick={this.handleExpandSection}
                                        >
                                            {this.state.eventName}
                                        </a>
                                    </h2>
                                    <p
                                        className="slds-truncate slds-text-body_small"
                                        title="Event Summary Information"
                                    >
                                        {this.state.valueChangeExpression
                                            ? [
                                                  this.state.eventType,
                                                  this.state.valueChangeExpression
                                              ].join(' -')
                                            : this.state.eventType}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {this.state.expanded && (
                            <Fragment>
                                <div className="slds-panel__section slds-border_top">
                                    <h3 className="slds-text-heading_small slds-m-bottom_medium">
                                        Event Info
                                    </h3>
                                    <ul>
                                        <li className="slds-form-element slds-hint-parent">
                                            <span className="slds-form-element__label">
                                                Event Name
                                            </span>
                                            <div className="slds-form-element__control">
                                                <span className="slds-form-element__static">
                                                    {this.state.eventName}
                                                </span>
                                            </div>
                                        </li>
                                        <li className="slds-form-element slds-hint-parent">
                                            <span className="slds-form-element__label">
                                                {labels.eventcard_parameters}
                                            </span>
                                            <div className="slds-form-element__control">
                                                <span className="slds-form-element__static">
                                                    <EventParameters
                                                        parameters={this.props.parameters}
                                                    />
                                                </span>
                                            </div>
                                        </li>
                                        <li className="slds-form-element slds-hint-parent">
                                            <span className="slds-form-element__label">
                                                {labels.eventcard_caller}
                                            </span>
                                            <div className="slds-form-element__control">
                                                <span className="slds-form-element__static">
                                                    <aurainspector-outputfunction className="caller">
                                                        {this.props.caller}
                                                    </aurainspector-outputfunction>
                                                </span>
                                            </div>
                                        </li>
                                        {this.state.eventSourceId && (
                                            <li className="slds-form-element slds-hint-parent">
                                                <span className="slds-form-element__label">
                                                    {labels.eventcard_source}
                                                </span>
                                                <div className="slds-form-element__control">
                                                    <span className="slds-form-element__static">
                                                        <span className="eventSource">
                                                            <AuraComponent
                                                                globalId={this.state.eventSourceId}
                                                            />
                                                        </span>
                                                    </span>
                                                </div>
                                            </li>
                                        )}

                                        <li className="slds-form-element slds-hint-parent">
                                            <span className="slds-form-element__label">
                                                {labels.eventcard_duration}
                                            </span>
                                            <div className="slds-form-element__control">
                                                <span className="slds-form-element__static">
                                                    <span className="eventDuration">
                                                        {this.props.duration}ms
                                                    </span>
                                                </span>
                                            </div>
                                        </li>
                                        <li className="slds-form-element slds-hint-parent">
                                            <span className="slds-form-element__label">
                                                {labels.eventcard_callStack}
                                            </span>
                                            <div className="slds-form-element__control">
                                                <span className="slds-form-element__static">
                                                    <table className="callStack"></table>
                                                </span>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <button className="slds-hide slds-button slds-button--neutral slds-button--x-small slds-m-top--x-small">
                                    {labels.eventcard_togglegrid}
                                </button>
                                <div className="slds-hide eventHandledByGrid"></div>
                            </Fragment>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
