import React from 'react';
import HelpTab from './HelpTab';

export default function TabBar(props) {
    const tabs = Object.keys(props.panels).map(key => {
        const tab = props.panels[key];
        if (!tab.panelId) {
            console.warn(`Tab ${tab.title} does not have a panelId property.`);
            tab.panelId = key;
        }

        if (tab.title) {
            const tabId = 'tabs-' + tab.panelId;
            return (
                <li
                    className="slds-tabs--default__item"
                    title={tab.title}
                    role="presentation"
                    data-tabid={tabId}
                    key={tabId}
                >
                    <a
                        className="slds-tabs--default__link"
                        href="javascript:void(0);"
                        role="tab"
                        tabIndex="0"
                        aria-selected="false"
                        aria-controls={'tab-body-' + key}
                        id={tabId}
                    >
                        {tab.title}
                    </a>
                </li>
            );
        }
        return undefined;
    });

    return (
        <ul className="slds-tabs--default__nav" role="tablist">
            {tabs}
            <HelpTab onHelpLinkClick={props.onHelpLinkClick}></HelpTab>
        </ul>
    );
}
