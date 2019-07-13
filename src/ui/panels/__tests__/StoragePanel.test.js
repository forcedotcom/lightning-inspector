import React from 'react';
import StoragePanel from "../StoragePanel.js";
import renderer from "react-test-renderer";
import GlobalEventBus from "../../../core/GlobalEventBus.js";


import { Box } from "react-lds";

jest.mock("../../../aura/viewer/BrowserApi.js");
jest.mock("../../../core/GlobalEventBus.js");

/**
    StoragePanel Test Plan

   [x] 1. When you provide an empty data set, a warning message is shown there are no storages on the page.
   [x] 2. When you provide 1 storage, 1 storage shows on the page.
   [x] 3. When you provice X storages, x storages show up on the page.
   [ ] 4. Test "AuraInspector:UpdatedStorageData", "AuraInspector:ModifiedStorageData", "AuraInspector:DeletedStorageData"
   [ ] 5. Test Error condition fetching the data.
   [ ] 6. Calling "AuraInspector:ModifiedStorageData" refetches data for that data store.

    ---
    Notes:
    * Use Mock data for the storages.
    * Can we do some automation for verifying that the data we got from Aura is what we expect?
     - Yes, but we'd need an aura server and webdriver automation.
     - We'll need a CI that can start up an Aura Server, provide our own namespace of components, and run integration tests against them.  
*/


test("Snapshot of StoragePanel", () => {
    const component = renderer.create(<StoragePanel />);
    
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test("Warning Message appears for no storages", () => {
    const component = renderer.create(<StoragePanel />);

    const testInstance = component.root;

    expect(testInstance.findAllByType(Box)).toHaveLength(1);

});


test("Warning message does not appear when storages exist", () => {
    const component = renderer.create(<StoragePanel />);

    GlobalEventBus.publish("AuraInspector:UpdatedStorageData", new StorageData("__test__", "__testname__", 1));

    const testInstance = component.root;

    expect(testInstance.findAllByType(Box)).toHaveLength(0);
});


test("One storage shows", () => {
    const component = renderer.create(<StoragePanel />);

    GlobalEventBus.publish("AuraInspector:UpdatedStorageData", new StorageData("__test__", "__testname__", 1, 2000, 10000));

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test("Add then remove storages shows empty message", () => {
    const component = renderer.create(<StoragePanel />);
    const storageData = new StorageData("__test__", "__testname__", 1);

    GlobalEventBus.publish("AuraInspector:UpdatedStorageData", storageData);
    GlobalEventBus.publish("AuraInspector:DeletedStorageData", storageData);
    const testInstance = component.root;

    expect(testInstance.findAllByType(Box)).toHaveLength(0);
});

test("Calling AuraInspector:ModifiedStorageData updates data for that data store", () => {
    const storageId = "__storageId__";
    const component = renderer.create(<StoragePanel />);
    const mockFunc = jest.fn();
    component.getInstance().getStoresData=mockFunc;

    GlobalEventBus.publish("AuraInspector:ModifiedStorageData", storageId);
    
    expect(mockFunc.mock.calls.length).toBe(1);
    expect(mockFunc.mock.calls[0][0][0]).toBe(storageId);
});



class StorageData {
    constructor(id, name, version, size, maxSize) {
        this.id = id;
        this.data = {
            "name": name,
            "version": version
        };

        if(size !== undefined) {
            this.data.size = size;
        }

        if(maxSize !== undefined) {
            this.data.maxSize = maxSize;
        }

        this.data = JSON.stringify(this.data);
    }
}