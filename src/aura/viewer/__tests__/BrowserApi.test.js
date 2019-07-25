import BrowserApi from '../BrowserApi.js';

/**
 * BrowserApi Test Plan
 *
 * [x] 0. Test eval will use browser property first, and chrome property second for WebExtension api support.
 * [x] 1. Test Eval tries to execute on the parent window.
 * [x] 2. Test Eval Success returns value.
 * [x] 3. Test Eval error throws exception
 * [x] 4. Test getLabel tries to access browser API for label file.
 * [ ] 5. Test getLabel result returns bracketed [key] if no label was found.
 * [x] 6. Usage in an environement without WebExtension or Chrome api throws exception.
 */

test('eval uses browser as the default browser Api', async () => {
    const expected = 'var statement;';
    global.browser = mockBrowser();

    const actual = await BrowserApi.eval(expected);

    expect(actual).toBe(expected);
});

test('eval uses browser before chrome as the browser api', async () => {
    const expected = 'var statement;';
    global.browser = mockBrowser();
    global.browser.devtools.inspectedWindow.eval = (command, callback) => {
        callback(expected);
    };
    global.chrome = mockBrowser();

    const actual = await BrowserApi.eval('var notExpected;');

    // Should be expected as thats what the browser api would return, vs chrome which would return what was passed in.
    expect(actual).toBe(expected);
});

test('eval uses chrome as the browser Api when window.browser is not available (chrome)', async () => {
    const expected = 'var statement;';
    global.chrome = mockBrowser();
    delete global.browser;

    const actual = await BrowserApi.eval(expected);

    expect(actual).toBe(expected);
});

test('Eval executes on the inspected window', async () => {
    const expected = 'var statement;';
    global.browser = mockBrowser();
    global.browser.devtools.inspectedWindow.eval = (command, callback) => {
        callback(expected);
    };

    const actual = await BrowserApi.eval();

    expect(actual).toBe(expected);
});

test('Eval exception in browser causes exception thrown in browser API', async () => {
    const expected = 'var statement;';
    global.browser = mockBrowser();
    global.browser.devtools.inspectedWindow.eval = (command, callback) => {
        callback(expected, new Error('Expected Error Thrown'));
    };

    let error;

    try {
        const actual = await BrowserApi.eval();
    } catch (e) {
        error = e;
    }

    expect(error).toBeDefined();
});

test('BrowserAPI usage outside of webextension of chrome throws exception.', async () => {
    delete global.browser;
    delete global.chrome;

    let error;
    try {
        await BrowserApi.eval('');
    } catch (e) {
        error = e;
    }

    expect(error).toBeDefined();
});

test('getLabel uses i18n API to retrieve localized labels', () => {
    const expected = 'label_data';
    global.browser = mockBrowser();
    global.browser.i18n.getMessage = () => {
        return expected;
    };

    const actual = BrowserApi.getLabel('key');

    expect(actual).toEqual(expected);
});

test('getLabel returns bracketed key when no label is found', () => {
    const expected = '[label_key]';
    global.browser = mockBrowser();

    const actual = BrowserApi.getLabel('label_key');

    expect(actual).toEqual(expected);
});

function mockBrowser() {
    return {
        devtools: {
            inspectedWindow: {
                eval: (command, callback) => {
                    callback(command);
                }
            }
        },
        i18n: {
            getMessage: () => {}
        }
    };
}
