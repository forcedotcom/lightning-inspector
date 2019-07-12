import GlobalEventBus from "../GlobalEventBus.js";

jest.mock("../../aura/viewer/BrowserApi.js");

/**
 * GlobalEventBus test plan
 * 
 * [x] 1. Publishing a message fires a callback for subscribe.
 * [x] 2. Publishing a message fires multiple callbacks for subscribe.
 * [x] 3. Publishing with no data parameter still calls callbacks
 * [x] 4. Data provided in publishing is provided to the callbacks
 * [X] 5. One subscribe function throwing an exception does not block the others from being called.
 * [ ] 6. Unsubscribing from a key, prevents the handler from being called.
 */

test("Publishing a message fires a callback for subscribe", () => {
    const expected = "__expected__";
    const key = "key";
    const eventManager = new GlobalEventBus();
    let actual;

    eventManager.subscribe(key, (data) => { actual = data; });
    eventManager.publish(key, expected);

    expect(actual).toEqual(expected);
});


test("Publishing a message fires multiple callbacks for subscribe", () => {
    const data = "__data__";
    const expected = [data, data];
    const key = "key";
    const eventManager = new GlobalEventBus();
    let actual = [];

    eventManager.subscribe(key, (param) => { actual.push(param); });
    eventManager.subscribe(key, (param) => { actual.push(param); });
    eventManager.publish(key, data);

    expect(actual).toEqual(expect.arrayContaining(expected));
});

test("Publishing with no data parameter still calls callbacks", () => {
    const expected = 1;
    const key = "key";
    const eventManager = new GlobalEventBus();
    let actual = 0;

    eventManager.subscribe(key, (param) => { actual++; });
    eventManager.publish(key);

    expect(actual).toEqual(actual);
});

test("One subscribe function throwing an exception does not block the others from being called", () => {
    const data = "__data__";
    const expected = [data, data];
    const key = "key";
    const eventManager = new GlobalEventBus();
    let actual = [];
    global.console.error = jest.fn();

    eventManager.subscribe(key, (param) => { actual.push(param); });
    eventManager.subscribe(key, (param) => { throw new Error("Expected error"); });
    eventManager.subscribe(key, (param) => { actual.push(param); });
    eventManager.publish(key, data);

    expect(actual).toEqual(expect.arrayContaining(expected));
});

test("Unsubscribing prevents the handler from being called", () => {
    const key = "key";
    const eventManager = new GlobalEventBus();
    const handler = (param) => { throw new Error('Shouldnt be hit as we unsubscribed'); }
    
    eventManager.subscribe(key, handler);
    eventManager.unsubscribe(key, handler);
    eventManager.publish(key, null);
});