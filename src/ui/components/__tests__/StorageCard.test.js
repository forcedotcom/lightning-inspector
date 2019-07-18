import React from 'react';
import StorageCard from "../StorageCard.js";
import renderer from "react-test-renderer";

/**
 * Storage Card test plan

 * 1. Verify that the card renders as expected.
 * 2. ?
 */

test("Storage Card Snapshot", () => {
    const component = renderer.create(<StorageCard storageId="__storageId__" isExpanded={true} contents="[]"/>);

    let tree = component.toJSON(); 
    expect(tree).toMatchSnapshot();
});