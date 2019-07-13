import React from "react";
import ComponentTreePanel from "./ComponentTreePanel"
import EventLogPanel from "./EventLogPanel"
import ActionsPanel from "./ActionsPanel"
import StoragePanel from "./StoragePanel"
import "./DevtoolsPanel.css";
import {
  IconSettings,
  Tabs,
  TabsPanel
} from "@salesforce/design-system-react";

export default class DevtoolsPanel extends React.Component {
  constructor(props) {
    super(props);
  }
 
  render() {
    return (
      <div className="App">
          <IconSettings iconPath="/icons">
            <Tabs className="tabPanel">
              <TabsPanel label="Components"><ComponentTreePanel/></TabsPanel>
              <TabsPanel label="Events"><EventLogPanel /></TabsPanel>
              <TabsPanel label="Actions"><ActionsPanel /></TabsPanel>
              <TabsPanel label="Storage"><StoragePanel /></TabsPanel>
              <TabsPanel label="Performance">Performance</TabsPanel>
            </Tabs>
          </IconSettings>
      </div>
    );
  }
}
