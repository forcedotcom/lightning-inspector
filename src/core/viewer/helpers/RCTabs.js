import React from 'react';
import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
import './RCTabs.scss';

Tabs.defaultProps.renderTabBar = () => <ScrollableInkTabBar />;
Tabs.defaultProps.renderTabContent = () => <TabContent animated={false}
                                                       animatedWithMargin={false}/>;

export default Tabs;
export { Tabs, TabPane };
