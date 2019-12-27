import React, { useEffect } from 'react';
import Configuration from '../configuration/configuration';

export default function HelpTab(props) {
    const helpConfiguration = Configuration.getApplicationHelpConfiguration();

    const listItems = helpConfiguration.map(topic => {
        return (
            <li className="slds-dropdown__item" role="presentation" key={topic.text}>
                <a href={topic.href} role="menuitem" tabIndex="-1" onClick={HandleItem_OnClick}>
                    <span className="slds-truncate" title={topic.text}>
                        {topic.text}
                    </span>
                </a>
            </li>
        );
    });

    function HandleTrigger_OnClick(event) {
        const element = event.target;

        if (!element) {
            return;
        }

        const parent = element.closest('.slds-dropdown-trigger_click');
        parent.classList.toggle('slds-is-open');
    }

    function HandleItem_OnClick(event) {
        event.stopPropagation();
        event.preventDefault();
        var url = event.currentTarget.getAttribute('href');

        if (typeof props.onHelpLinkClick === 'function') {
            props.onHelpLinkClick(url);
        }
    }

    function HandleOutside_OnClick(event) {
        const target = event.target;
        const isOpen = target.closest('.slds-is-open');
        if (isOpen) {
            return;
        }
        document.body
            .querySelector('.help-tab .slds-dropdown-trigger_click')
            .classList.remove('slds-is-open');
    }

    useEffect(() => {
        document.body.addEventListener('click', HandleOutside_OnClick);

        return function cleanup() {
            document.body.removeEventListener('click', HandleOutside_OnClick);
        };
    });

    return (
        <li
            className="slds-tabs_default__item slds-tabs_default__overflow-button help-tab"
            title={props.title}
            role="presentation"
            key="help"
        >
            <div className="slds-dropdown-trigger slds-dropdown-trigger_click">
                <button
                    className="slds-button"
                    aria-haspopup="true"
                    onClick={HandleTrigger_OnClick}
                >
                    Help
                    <svg
                        className="slds-button__icon slds-button__icon_x-small slds-button__icon_right"
                        aria-hidden="true"
                    >
                        <use xlinkHref="/src/devtoolsPanel/external/slds-assets/icons/utility-sprite/svg/symbols.svg#down"></use>
                    </svg>
                </button>
                <div className="slds-dropdown slds-dropdown_right">
                    <ul
                        className="slds-dropdown__list slds-dropdown_length-with-icon-10"
                        role="menu"
                    >
                        {listItems}
                    </ul>
                </div>
            </div>
        </li>
    );
}
