import React from "react";
import PropTypes from 'prop-types';
import SplitPane from "react-split-pane";

import ComponentTreeView from "../../devtoolsPanel/components/ComponentTreeView.js";

import { AuraInspectorTreeView, TreeNode } from "../../devtoolsPanel/treeview";
import AuraInspectorOptions from "../../devtoolsPanel/optionsProxy";
import BrowserApi from "../../aura/viewer/BrowserApi.js";
import DevToolsEncodedId from "../../aura/DevToolsEncodedId.js";
import JsonSerializer from "../../aura/JsonSerializer.js";
import GlobalEventBus from "../../core/GlobalEventBus.js";
import ComponentTreeSerializer from "../../aura/viewer/ComponentTreeSerializer.js";

import { Button, ButtonIcon } from "react-lds";

import "./ComponentTreePanel.css";

export default class ComponentTreePanel extends React.Component {
    static childContextTypes = {
        assetBasePath: PropTypes.string
    };
    
    constructor(props) {
        super(props);

        this.state = {
            selectedNodeId: this.props.selectedNodeId || null,
            rootNodes: [],
            expandAll: false,
            showGlobalIds: false,
            updateOnSelect: true,
            componentData: 'no data'
        };

        this.handleRefresh = this.handleRefresh.bind(this);
        this.handleExpandAll = this.handleExpandAll.bind(this);
        this.handleShowGlobalIdsChanged = this.handleShowGlobalIdsChanged.bind(this);
        this.handleUpdateOnSelectChanged = this.handleUpdateOnSelectChanged.bind(this);
        this.handleComponentTreeNodeOnClick = this.handleComponentTreeNodeOnClick.bind(this);
        this.handleComponentTreeNodeOnHoverEnter = this.handleComponentTreeNodeOnHoverEnter.bind(this);
        this.handleComponentTreeNodeOnHoverLeave = this.handleComponentTreeNodeOnHoverLeave.bind(this);

        GlobalEventBus.subscribe("AuraInspector:ShowComponentInTree", (id) => {
            var isSelectedChanged = this.state.selectedNodeId !== id;
            if(!isSelectedChanged) { return; }

            if(this.refs.tree) {
                this.refs.tree.setSelectedId(id);
            }
            
            // this.props.onSelectedNodeChange(globalId);
            if(isSelectedChanged && this.props.onSelectedNodeChanged) {
                this.props.onSelectedNodeChanged(id);
            }
            
            // Need to make sure this isn't expensive via a rerender later.
            this.setState({selectedNodeId:id});
        });
    }

    updateData() {
        GlobalEventBus.publish("AuraInspector:ShowLoading", "ComponentTreePanel");

        ComponentTreeSerializer
                .getRootComponents()
                .then((rootNodes) => {
                    if(!rootNodes) {
                        rootNodes = [];
                    }

                    GlobalEventBus.publish("AuraInspector:HideLoading", "ComponentTreePanel");

                    this.setState({rootNodes: rootNodes, showGlobalIds: this.state.showGlobalIds });

                    if(this.state.selectedNodeId) {
                        this.refs.tree.setSelectedId(this.state.selectedNodeId);
                    }
                })
                .catch(() => {
                    GlobalEventBus.publish("AuraInspector:HideLoading", "ComponentTreePanel");
                });
    }

    onShowPanel(options) {}

    onSeach(term) {
        return this.refs.tree.search(term);
    }

    onCancelSearch() {
        return this.refs.tree.search(this.state.selectedNodeId || "");
    }

    handleRefresh() {
        this.updateData();
        this.refs.tree.update();
    }

    handleExpandAll() {
        this.setState({
            expandAll: true
        });
    }

    handleShowGlobalIdsChanged(event) {
        const showGlobalIds = event.target.checked;
        AuraInspectorOptions.set("showGlobalIds", showGlobalIds, (options) => {
            //this.render();
            this.setState({showGlobalIds: showGlobalIds});
        });
    }

    handleUpdateOnSelectChanged(event) {
        const updateOnSelect = event.target.checked;
        AuraInspectorOptions.set("updateOnSelect", updateOnSelect);

        this.setState({
            updateOnSelect: updateOnSelect
        });
    }


    handleComponentTreeNodeOnClick(globalId) {
        if(this.state.selectedNodeId === globalId) {
            this.setState({
                selectedNodeId: null
            });
        } else {
            this.setState({
                selectedNodeId: globalId
            });
            this.getComponent(globalId,
                function(data){
                    debugger;
                    this.setState({
                        componentData: JSON.stringify(data)
                    });
                }.bind(this),
            );
        }

        this.refs.tree.setSelectedId(this.state.selectedNodeId);

        // TODO - cleanup these
        // if(this.state.selectedNodeId && this.state.selectedNodeId.startsWith("data-")) { 
        //     this.props.onSelectedNodeChanged(null);
        // } else {
        //     this.props.onSelectedNodeChanged(this.state.selectedNodeId);
        // }


        if(this.state.selectedNodeId) {
            BrowserApi.eval(`$auraTemp = $A.getCmp('${this.state.selectedNodeId}'); undefined;`);

            AuraInspectorOptions.getAll({ "showGlobalIds": false, "updateOnSelect": true }, (options) => {
                if(options.updateOnSelect && this.updateData) {
                    this.updateData();
                }
            });
        }
    }

    handleComponentTreeNodeOnHoverEnter(globalId) {
        if(globalId &&this.props.onNodeHoverEnter) {
            this.props.onNodeHoverEnter(globalId);
        }
    }

    handleComponentTreeNodeOnHoverLeave(globalId) {
        if(this.props.onNodeHoverLeave) {
            this.props.onNodeHoverLeave(globalId);
        }
    }

    getChildContext() {
        return { 
            'assetBasePath': '/dist/slds/'
        };
    }

    shouldComponentUpdate() {
        return true;
    }

    
    componentDidMount() {
        AuraInspectorOptions.getAll({ "showGlobalIds": false }, (options) => {
            this.setState({
                showGlobalIds: options.showGlobalIds
            });
            this.updateData();
        });
    }

    getComponent(globalId, callback, configuration) {
        debugger;
        if(typeof callback !== "function") { throw new Error("callback is required for - getComponent(globalId, callback)"); }
        if(DevToolsEncodedId.isComponentId(globalId)) { globalId = DevToolsEncodedId.getCleanId(globalId); }
        var command;

        if(configuration && typeof configuration === "object") {
            var configParameter = JSON.stringify(configuration);
            command = `window[Symbol.for('AuraDevTools')].Inspector.getComponent('${globalId}', ${configParameter});`;
        } else {
            command = `window[Symbol.for('AuraDevTools')].Inspector.getComponent('${globalId}');`;
        }

        BrowserApi.devtools.inspectedWindow.eval(command, function(response, exceptionInfo) {
            if(exceptionInfo) {
                console.error(command, " resulted in ", exceptionInfo);
            }
            if(!response) { return; }

            const component = JsonSerializer.parse(response);

            callback(component);
        });
    };

    render() {
        let labels = {
            refresh: BrowserApi.getLabel("menu_refresh"),
            expandall: BrowserApi.getLabel("componenttree_menu_expandall"),
            showids: BrowserApi.getLabel("componenttree_menu_showids"),
            updateonselect: BrowserApi.getLabel("componenttree_menu_updateonselect")
        };

        const Fragment = React.Fragment;
                
        return (
            <Fragment>
                <div className="componentTreePanel">
                <menu type="toolbar">
                    <li className="slds-p-right--x-small">
                        <Button icon="refresh" sprite="utility" className="" onClick={this.handleRefresh} title={labels.refresh} tooltip={labels.refresh}>
                          
                        </Button>
                    </li>
                    <li>
                        <Button onClick={this.handleExpandAll} title={labels.expandall} tooltip={labels.expandall} neutral="true"/>
                    </li>
                    <li className="divider"></li>
                    <li>
                        <input 
                            type="checkbox" 
                            id="showglobalids-checkbox" 
                            onChange={this.handleShowGlobalIdsChanged} 
                            checked={this.state.showGlobalIds}
                            />
                        <label htmlFor="showglobalids-checkbox">{labels.showids}</label></li>
                    <li className="divider"></li>
                    <li>
                        <input 
                            type="checkbox" 
                            id="updateonselect-checkbox" 
                            onChange={this.handleUpdateOnSelectChanged} 
                            checked={this.state.updateOnSelect}/>
                        <label htmlFor="updateonselect-checkbox">{labels.updateonselect}</label></li>
                </menu>
                <div className="inspector-tab-body-content">
                    <SplitPane split="vertical" minSize={350} defaultSize="50%" maxSize={-200} allowResize={true}>
                        <div className="container">
                            <div className="component-tree source-code slds-scrollable_y" id="tree-react">
                                <ComponentTreeView 
                                    ref="tree"
                                    rootComponents={this.state.rootNodes} 

                                    // Event Handlers
                                    onClick={this.handleComponentTreeNodeOnClick}
                                    onHoverEnter={this.handleComponentTreeNodeOnHoverEnter}
                                    onHoverLeave={this.handleComponentTreeNodeOnHoverLeave}

                                    // Tree Configuration
                                    expandAll={this.state.expandAll} 
                                    showGlobalIds={this.state.showGlobalIds}/>
                            </div>
                        </div>
                        <div>
                            <div id="devtools-sidebar" className="source-code slds-scrollable_y">
                                <br/>
                                <span>{this.state.selectedNodeId}</span>
                                <div>
                                    {this.state.componentData}
                                </div>
                            </div>
                        </div>
                    </SplitPane>
                </div>
                </div>
            </Fragment>);
    }

}