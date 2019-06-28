import EventLogPanel from "../ui/panels/EventLogPanel.js";
import React, { PureComponent } from "react";
import ReactDOM from "react-dom";
import AuraInjectedApi from "../LightningInspectorInjectedScript.js";
import { BrowserTestApi } from "../aura/viewer/BrowserApi.js";
import AuraInspectorOptions from "../devtoolsPanel/optionsProxy.js";

import DevToolsPanel from "../devtoolsPanel/devtoolsPanel.js";



export default class InspectorTestApi {
    listen() {
        window.addEventListener("message", function(message) {
            if(message.origin !== window.location.origin) {
                return;
            }            
            BrowserTestApi.callSubscribers(message.data);
        });

    }

    renderEventLogPanel(container) {
        ReactDOM.render(<EventLogPanel/>, container);
    }

    render(container) {
        const devtoolsPanel = new DevToolsPanel(container);
        devtoolsPanel.init().then(function(){
            // Probably the default we want
            AuraInspectorOptions.getAll({ "activePanel": "component-tree" }, function(options) {
                if(!devtoolsPanel.hasPanel(options["activePanel"])) {
                    // If the panel we are switching to doesn't exist, use the
                    // default which is the transaction panel.
                    options["activePanel"] = "component-tree";
                }
        
                devtoolsPanel.showPanel(options["activePanel"]);
            });
        });

        // Help menu support
        devtoolsPanel.openTab = (url) => {
            window.open(url);
        };

        // These aren't working well at all right now
        // Lets implement them better and bring them back.
        devtoolsPanel.highlightElement = function() {};
        devtoolsPanel.removeHighlightElement = function() {};


    }
}

if(!AuraInjectedApi.Test) {
    AuraInjectedApi.Test = new InspectorTestApi();
}

const event = global.$A.get("e.inspector:testApiReady");
if(event) {
    event.fire();
}