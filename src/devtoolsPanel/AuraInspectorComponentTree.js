import ReactDOM from 'react-dom';
import React from 'react';

import ComponentTreeView from './components/ComponentTreeView.js';

import { AuraInspectorTreeView, TreeNode } from './treeview';
import AuraInspectorOptions from './optionsProxy';
import BrowserApi from '../aura/viewer/BrowserApi.js';
import DevToolsEncodedId from './DevToolsEncodedId';
import JsonSerializer from '../aura/JsonSerializer.js';
import ComponentTreeSerializer from '../aura/viewer/ComponentTreeSerializer.js';

/**
 * Component Tree Panel. Delegates drawing of the tree to the TreeView component in the treeview.js file.
 */
export default function AuraInspectorComponentTree(devtoolsPanel) {
    let treeElement;
    let treeComponent;
    let _items = {};
    let isDirty = false;
    let initial = true;
    let selectedNodeId = null;
    let newTreeContainer = null;
    let tree;

    let labels = {
        refresh: chrome.i18n.getMessage('menu_refresh'),
        expandall: chrome.i18n.getMessage('componenttree_menu_expandall'),
        showids: chrome.i18n.getMessage('componenttree_menu_showids'),
        updateonselect: chrome.i18n.getMessage('componenttree_menu_updateonselect')
    };

    var markup = `
        <div class="grid grid-columns scroll-wrapper">
          <menu type="toolbar" class="flex no-flex">
              <li>
                <button id="refresh-button" class="refresh-status-bar-item status-bar-item" title="${labels.refresh}">
                  <div class="glyph toolbar-button-theme"></div>
                  <div class="glyph shadow"></div>
                </button>
              </li>
              <li>
                <button id="expandall-button" class="text-button">
                  <span>${labels.expandall}</span>
                </button>
              </li>
              <li class="divider"></li>
              <li><input type="checkbox" id="showglobalids-checkbox"><label for="showglobalids-checkbox">${labels.showids}</label></li>
              <li class="divider"></li>
              <li><input type="checkbox" id="updateonselect-checkbox" checked="checked"><label for="updateonselect-checkbox">${labels.updateonselect}</label></li>
          </menu>
          <div class="flex scroll">
            <div class="component-tree source-code" id="tree-react"></div>
            <div class="component-tree source-code" id="tree"></div>
          </div>
        </di>
    `;

    this.init = function(tabBody) {
        tabBody.innerHTML = markup;
        treeElement = tabBody.querySelector('#tree');

        treeComponent = new AuraInspectorTreeView(treeElement);
        treeComponent.attach('onhoverout', TreeComponent_OnHoverOut.bind(this));
        treeComponent.attach('onhover', TreeComponent_OnHover.bind(this));
        treeComponent.attach('onselect', TreeComponent_OnSelect.bind(this));
        treeComponent.attach('ondblselect', TreeComponent_OnDblSelect.bind(this));

        const refreshButton = tabBody.querySelector('#refresh-button');
        refreshButton.addEventListener('click', RefreshButton_OnClick.bind(this));

        const expandAllButton = tabBody.querySelector('#expandall-button');
        expandAllButton.addEventListener('click', ExpandAllButton_OnClick.bind(this));

        const showglobalidsCheckbox = tabBody.querySelector('#showglobalids-checkbox');
        showglobalidsCheckbox.addEventListener('change', ShowGlobalIdsCheckBox_Change.bind(this));

        const updateonselectCheckbox = tabBody.querySelector('#updateonselect-checkbox');
        updateonselectCheckbox.addEventListener('change', UpdateOnSelectCheckbox_Change.bind(this));

        AuraInspectorOptions.getAll({ showGlobalIds: false, updateOnSelect: true }, function(
            options
        ) {
            showglobalidsCheckbox.checked = options.showGlobalIds;
            updateonselectCheckbox.checked = options.updateOnSelect;
        });

        devtoolsPanel.subscribe('AuraInspector:ShowComponentInTree', function(id) {
            selectedNodeId = id;
        });

        newTreeContainer = tabBody.querySelector('#tree-react');
    };

    this.onShowPanel = function(options) {
        // When the user comes back, do nothing special.
    };

    this.onSearch = function(searchTerm) {
        tree.search(searchTerm);
    };

    this.onCancelSearch = function() {
        tree.search(selectedNodeId || '');
    };

    this.render = function(renderingConfig = {}) {
        renderingConfig = Object.assign(
            {
                expandAll: undefined,
                forcedUpdate: false
            },
            renderingConfig
        );

        try {
            devtoolsPanel.showLoading();
            // TODO: Fix the options stuff.
            AuraInspectorOptions.getAll({ showGlobalIds: false }, function(options) {
                ComponentTreeSerializer.getRootComponents().then(function(rootNodes) {
                    if (!rootNodes) {
                        rootNodes = [];
                    }

                    tree = ReactDOM.render(
                        <ComponentTreeView
                            rootComponents={rootNodes}
                            // Event Handlers
                            onClick={ComponentTreeNode_OnClick}
                            onHoverEnter={ComponentTreeNode_OnHoverEnter}
                            onHoverLeave={ComponentTreeNode_OnHoverLeave}
                            // Tree Configuration
                            expandAll={renderingConfig.expandAll}
                            showGlobalIds={options.showGlobalIds}
                        />,
                        newTreeContainer
                    );

                    devtoolsPanel.hideLoading();

                    if (selectedNodeId) {
                        tree.setSelectedId(selectedNodeId);
                    }
                });
            });

            devtoolsPanel.subscribe('AuraInspector:ShowComponentInTree', function(id) {
                if (tree) {
                    tree.setSelectedId(id);
                }

                devtoolsPanel.showComponentByIdInSidebar(id);

                selectedNodeId = id;
            });
        } catch (e) {
            alert([e.message, e.stack]);
        }
    };

    function RefreshButton_OnClick(event) {
        this.render();
        tree.update();
    }

    function ExpandAllButton_OnClick(event) {
        this.render({
            expandAll: true
        });
    }

    function ComponentTreeNode_OnClick(event) {
        selectedNodeId = this.props.globalId;

        tree.setSelectedId(selectedNodeId);

        if (selectedNodeId && selectedNodeId.startsWith('data-')) {
            devtoolsPanel.hideSidebar();
        } else {
            devtoolsPanel.showComponentByIdInSidebar(selectedNodeId);
        }

        BrowserApi.eval(`$auraTemp = $A.getCmp('${selectedNodeId}'); undefined;`);

        AuraInspectorOptions.getAll({ showGlobalIds: false, updateOnSelect: true }, options => {
            if (options.updateOnSelect && this.update) {
                this.update();
            }
        });
    }

    function ComponentTreeNode_OnHoverEnter(event) {
        const globalId = this.props.globalId;

        if (globalId) {
            devtoolsPanel.highlightElement(this.props.globalId);
        }
    }

    function ComponentTreeNode_OnHoverLeave(event) {
        devtoolsPanel.removeHighlightElement();
    }

    function ShowGlobalIdsCheckBox_Change(event) {
        const showGlobalIds = event.srcElement.checked;
        AuraInspectorOptions.set(
            'showGlobalIds',
            showGlobalIds,
            function(options) {
                this.render();
            }.bind(this)
        );
    }

    function UpdateOnSelectCheckbox_Change(event) {
        const updateOnSelect = event.srcElement.checked;
        AuraInspectorOptions.set('updateOnSelect', updateOnSelect);
    }

    function TreeComponent_OnHoverOut(event) {
        devtoolsPanel.removeHighlightElement();
    }

    function TreeComponent_OnHover(event) {
        if (event && event.data) {
            var domNode = event.data.domNode;
            var treeNode = event.data.treeNode;
            var globalId = treeNode && treeNode.getRawLabel() && treeNode.getRawLabel().globalId;

            if (globalId) {
                devtoolsPanel.highlightElement(globalId);
            }
        }
    }

    function TreeComponent_OnSelect(event) {
        if (event && event.data) {
            var domNode = event.data.domNode;
            var treeNode = event.data.treeNode;
            var globalId = treeNode && treeNode.getRawLabel().globalId;

            if (globalId) {
                // Need to include undefined at the end, or devtools can't handle it internally.
                // You'll see this error.
                // "Extension server error: Inspector protocol error: Object has too long reference chain(must not be longer than 1000)"
                var command = "$auraTemp = $A.getCmp('" + globalId + "'); undefined;";
                chrome.devtools.inspectedWindow.eval(command);

                devtoolsPanel.showComponentByIdInSidebar(globalId);
            }
        }
    }

    function TreeComponent_OnDblSelect(event) {
        if (event && event.data) {
            var domNode = event.data.domNode;
            var treeNode = event.data.treeNode;
            var globalId = treeNode && treeNode.getRawLabel().globalId;

            if (globalId) {
                var command = "$auraTemp = $A.getCmp('" + globalId + "'); undefined;";
                chrome.devtools.inspectedWindow.eval(command);
            }
        }
    }
}
