import React from 'react';
import Tabs, { TabPane } from './helpers/RCTabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
import Placeholder from './helpers/Placeholder';
import ContentProxy from '../message/ViewerContentProxy';
import _ from 'lodash';
import ControlledRender from './helpers/ControlledRender';
import OptionBar from './OptionBar';
import { from, sync } from '../storage';
import './Viewer.scss';

Tabs.defaultProps.renderTabBar = () => <ScrollableInkTabBar />;
Tabs.defaultProps.renderTabContent = () => <TabContent animated={false}/>;

export class Tab extends React.Component {
  static defaultProps = {
    destroyInactive: false
  };

  render() {
    throw Error('Should never render');
  }
}

export default class Viewer extends React.Component {
  state = {
    activeTab: null,
    requestRerender: 0,
    namespaces: [],
    ready: false
  };

  static defaultProps = {
    showOptionsBar: true,
    destroyInactive: false
  };

  async _calculateState() {
    const { ready } = this.state;

    if (ready) {
      this._setActiveTab(this.getLastActiveTab());
      return;
    }

    let injectedSyncStorage = {};

    try {
      injectedSyncStorage = await ContentProxy.this.getInjectedSyncStorage();
    } catch (e) {
      // ignore
    }

    const theme = await sync.get('default', 'uiTheme');

    this.setState({
      injectedSyncStorage: from(injectedSyncStorage),
      theme: theme === 'dark' ? 'dark' : 'light',
      ready: true
    }, () => this._setActiveTab(this.getLastActiveTab()));
  }

  getLastActiveTab() {
    const { name, children } = this.props;
    const tabs = _.map(_.compact(React.Children.toArray(children)), component => component.props.name);

    if (tabs.indexOf(localStorage[name + 'activeTab']) > -1) {
      return localStorage[name + 'activeTab'];
    }

    return tabs[0];
  }

  componentWillMount() {
    this._calculateState();
  }

  componentWillReceiveProps() {
    this.setState({ requestRerender: new Date() }, () => {
      this._calculateState();
    });
  }

  async _requestRerender() {
    this.setState({ requestRerender: new Date() });
  }

  async _setActiveTab(activeTab) {
    const { optionBar } = this.refs;
    const { injectedSyncStorage } = this.state;
    let { children, showOptionsBar, name } = this.props;

    children = _.compact(React.Children.toArray(children));

    const nextTab = _.find(children, component => component.props.name === activeTab);
    const optionTypes = nextTab.props.content.type.optionTypes || [];
    const requiredOptions = _.filter(optionTypes, optionType => optionType.hasOwnProperty('require'));
    const activeTabPasses = _.reduce(requiredOptions,
      (memo, { key, require, namespace }) => {
        if (Array.isArray(key)) {
          return memo && _.reduce(key, (memo, key, i) => injectedSyncStorage.get(namespace, key) === require[i], true)
        } else {
          return memo && injectedSyncStorage.get(namespace, key) == require;
        }
      }, true);

    this.setState({ activeTab, activeTabPasses });

    localStorage[name + 'activeTab'] = activeTab;

    if (showOptionsBar) {
      optionBar.setOptionTypes(optionTypes);
    }
  }

  async _onOptionChange(namespace, key, value) {
    const keys = Array.isArray(key) ? key : [key];

    for (const key of keys) {
      await sync.set(namespace, key, value);
    }

    this.forceUpdate();
  }

  render() {
    const { injectedSyncStorage, ready, requestRerender, activeTab, activeTabPasses, theme } = this.state;
    let { children, footer, header, namespaces, showOptionsBar, destroyInactiveTabPane, ...props } = this.props;

    if (!ready) {
      return null;
    }

    const tabsHeight = 20;
    const optionsHeight = showOptionsBar ? OptionBar.height : 0;
    const headerHeight = (header && header.type.height) || 0;
    const footerHeight = (footer && footer.type.height) || 0;

    if (injectedSyncStorage == null || activeTab == null) {
      children = <div>Loading</div>
    } else {
      children = React.Children.toArray(children);

      const tabs = _.map(children, component => {
        let content;
        const shouldRender = component.props.destroyInactive ? activeTab === component.props.name : true;

        if (activeTab == null) {
          content = (
            <Placeholder>
              <span>Please click on a tab to begin</span>
            </Placeholder>
          );
        } else if (!activeTabPasses) {
          content = (
            <Placeholder>
              <span>Not all the required permissions are enabled. If they are selected,
                please refresh the tab and reopen the popup</span>
            </Placeholder>
          )
        } else if (shouldRender) {
          content = React.cloneElement(component.props.content, {
            ...props,
            setActiveTab: ::this._setActiveTab,
            options: injectedSyncStorage,
            theme,
            namespaces
          });
        }

        return (
          <TabPane tab={component.props.name}
                   key={component.props.name}>
            <div style={{
              height: `calc(100% - ${optionsHeight}px)`,
              width: '100%',
              position: 'relative',
              top: optionsHeight
            }}>
              { shouldRender ?
                <ControlledRender requestRerender={requestRerender}>
                  {content}
                </ControlledRender> : null }
            </div>
          </TabPane>
        )
      });

      children = (
        <Tabs className='content'
              activeKey={activeTab}
              destroyInactiveTabPane={destroyInactiveTabPane}
              onChange={::this._setActiveTab}>
          {tabs}
        </Tabs>
      );
    }

    header = header ? React.cloneElement(header, {
      ...props,
      requestRerender: ::this._requestRerender,
      theme,
      namespaces
    }) : null;

    footer = footer ? React.cloneElement(footer, {
      ...props,
      requestRerender: ::this._requestRerender,
      theme,
      namespaces
    }) : null;

    return (
      <div className={`viewer full ${theme}`}>
        <div className='header-wrapper'>
          <ControlledRender requestRerender={requestRerender}>
            {header}
          </ControlledRender>
        </div>
        <div style={{ height: `calc(100% - ${headerHeight + footerHeight}px)`, top: headerHeight }}>
          {children}
        </div>
        { showOptionsBar ? <div style={{ top: tabsHeight + headerHeight, position: 'fixed', width: '100%' }}>
          <OptionBar ref='optionBar'
                     namespaces={namespaces}
                     onOptionChange={::this._onOptionChange}/>
        </div> : null }
        <div className='footer-wrapper'>
          <ControlledRender requestRerender={requestRerender}>
            {footer}
          </ControlledRender>
        </div>
      </div>
    )
  }
}
