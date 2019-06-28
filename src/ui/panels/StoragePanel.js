import React from "react";
import PropTypes from 'prop-types';

import BrowserApi from "../../aura/viewer/BrowserApi.js";
import GlobalEventBus from "../../core/GlobalEventBus.js";

import StorageCard from "../components/StorageCard.js";
import { Button, ButtonIcon, StatefulButton, ExpandableSection, Box } from "react-lds";

export default class StoragePanel extends React.Component {
    static childContextTypes = {
        assetBasePath: PropTypes.string
    };
    
    constructor(props) {
        super(props);

        this.state = {
            storages: new Map()
        };

        this.handleRefreshButtonClick = this.handleRefreshButtonClick.bind(this);
        this.handleDeleteButtonClick = this.handleDeleteButtonClick.bind(this);

        GlobalEventBus.subscribe("AuraInspector:UpdatedStorageData", this.handleStorageDataUpdate.bind(this));
        GlobalEventBus.subscribe("AuraInspector:ModifiedStorageData", this.handleModifiedStorageData.bind(this));
        GlobalEventBus.subscribe("AuraInspector:DeletedStorageData", this.handleDeletedStorageData.bind(this));
    }

    getChildContext() {
        return { 
            'assetBasePath': '/dist/slds/'
        };
    }

    /**
     * Gets the stores state, and sends the udpated data via PostMessage to the listeners.
     */
    async getStoresData(stores) {
        const count = stores && stores.length || 0;

        if(!count) {
            return;
        }

        const commands = [];
        for (let c=0;c<count;c++) {
            let store = stores[c];
            commands.push(`
                    var output = "o_${store}";
                    if(!data["o_${store}"]) {data["o_${store}"] = {}};
                    data["i_${store}"] = $A.storageService.getStorage('${store}');

                    // sync
                    data["o_${store}"].name = data["i_${store}"].getName();
                    data["o_${store}"].maxSize = data["i_${store}"].getMaxSize();
                    data["o_${store}"].version = data["i_${store}"].getVersion();

                    // async
                    data["i_${store}"].getSize()
                        .then(function(size) { if(!data["o_${store}"]) {data["o_${store}"] = {}} data["o_${store}"].size = size; }, function(err) { if(!data["o_${store}"]) {data["o_${store}"] = {}} data["o_${store}"].size = JSON.stringify(err); })
                        .then(function() { return data["i_${store}"].getAll(); })
                        .then(function(all) { if(!data["o_${store}"]) {data["o_${store}"] = {}} data["o_${store}"].all = all; }, function(err) { data["o_${store}"].all = JSON.stringify(err); })
                        // last then() is to post the results to aura inspector
                        .then(function() { window.postMessage({action:'AuraInspector:publish', key: 'AuraInspector:UpdatedStorageData', data:{ id:'${store}', data: JSON.stringify(data["o_${store}"])} }, window.location.href); });

            `);
        }

        const builtCommands = commands.join('\n');
        const command = `
            {
                var data = {};
                ${builtCommands};
                data;
            }
        `;
    
        try {
            await BrowserApi.eval(command);
        } catch(exceptionInfo) {
            console.error(exceptionInfo);
        }
    }

    async getStoresList() {
        // must collect the store names before doing the cache update
        const command = "Object.keys($A.storageService.getStorages());";
        const response = await BrowserApi.eval(command);
        
        if(!response || !response.map) { return; }

        // Replace ' \' '  to '_' so that template strings doesn't break.
        return response.map(function(name){ return name.replace('\'', '_'); });
    }

    async handleRefreshButtonClick() {
        this.update();
    }

    handleDeleteButtonClick() {
        const storageSelected = this.refs["storages-list"].selectedOptions;
        if(storageSelected.length === 0 || !storageSelected[0].value) {
            return;
        }

        const storageId = storageSelected[0].value;
        const command = `
            $A.storageService.deleteStorage('${storageId}').then(() => {
                window[Symbol.for('AuraDevTools')].Inspector.publish('AuraInspector:DeletedStorageData', '${storageId}');
            }).catch((error) => {
                window[Symbol.for('AuraDevTools')].Inspector.reportError(error);
            });
        `;

        return BrowserApi.eval(command);
    }

    async update() {
        const stores = await this.getStoresList();
        this.getStoresData(stores);
    }

    handleStorageDataUpdate(storageData) {
        const storageId = storageData.id;
        const storageContents = storageData.data;

        const storages = this.state.storages;
        storages.set(storageId, storageContents);

        this.setState({
            storages: storages
        });
    }

    handleModifiedStorageData(updatedStoreId) {
        this.getStoresData([updatedStoreId]);
    }

    handleDeletedStorageData(deletedStoreId) {
        this.state.storages.delete(deletedStoreId);

        this.setState({
            storages: this.state.storages
        });
    }

    getStorageElements() {
        const elements = [];
        const isExpanded = this.state.storages.size < 5;

        this.state.storages.forEach((storageContents, storageId) => {
            const preFormatted = JSON.parse(storageContents);
            const formatted = {};

            formatted.Adapter = preFormatted.name;
            formatted.sizeEstimate = "";

            if (preFormatted.size !== undefined) {
                const sizeAsPercent = (preFormatted.size / preFormatted.maxSize * 100).toFixed(0);
                formatted.sizeEstimate = preFormatted.size.toFixed(1) + " KB (" + sizeAsPercent + "% of " + preFormatted.maxSize.toFixed(0) + " KB)";
            }

            formatted.Version = preFormatted.version;
            formatted.Items = preFormatted.all || {};

            elements.push(<StorageCard key={storageId} storageId={storageId} isExpanded={isExpanded} rawContents={storageContents} contents={formatted}/>);
        });

        if(!elements.length) {
            return (<Box theme="warning" className="slds-m-around_large">{BrowserApi.getLabel("storage_empty")}</Box>);
        }

        return elements;
    }

    getStorageListElements() {
        const elements = [];
        this.state.storages.forEach((storageContents, storageId) => {
            elements.push(<option key={storageId} value={storageId}>{storageId}</option>);
        });
        return elements;
    }

    componentDidMount() {
        this.update();
    }

    render() {
        const labels = {
            "refresh": BrowserApi.getLabel("menu_refresh"),
            "kb": BrowserApi.getLabel("kb"), // Kilobytes not knowledgebase
            "delete": BrowserApi.getLabel("menu_delete"),
            "select_label": BrowserApi.getLabel("storage_selecttodestroy"),
            "delete_tooltip": BrowserApi.getLabel("storage_delete_tooltip")
        };

        const Fragment = React.Fragment;

        return (
            <Fragment>
                <menu type="toolbar" className="slds-col">
                    <li className="slds-p-right_xx-small">
                        <Button className="slds-p-around_xx-small" onClick={this.handleRefreshButtonClick} title={labels.refresh} tooltip={labels.refresh}>
                          <ButtonIcon sprite="utility" icon="refresh" />
                        </Button>
                    </li>
                    <li className="divider"></li>
                    <li className="slds-p-left_xx-small slds-p-right_xx-small">
                        <select className="slds-select" ref="storages-list">
                            <option>{labels.select_label}</option>
                            <option>--------------------------</option>
                            {
                                this.getStorageListElements()                                
                            }
                        </select>
                    </li>
                    <li>
                        <Button title={labels.delete} flavor={["destructive"]} tooltip={labels.delete_tooltip} onClick={this.handleDeleteButtonClick} />
                    </li>
                </menu>
                <div className="slds-col slds-scrollable_y slds-p-bottom_large inspector-tab-body-content">
                    {
                        this.getStorageElements()
                    }
                </div>
            </Fragment>
            );
    }

}