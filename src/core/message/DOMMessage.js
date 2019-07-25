export function postMessage(event, payload, callback = () => 0) {
    const customEvent = document.createEvent('CustomEvent');
    let data = {
        payload: payload,
        respondEvent: Date.now() + ' ' + Math.random()
    };

    if (typeof cloneInto === 'function') {
        data = cloneInto(data, document.defaultView);
    }

    customEvent.initCustomEvent(event, true, true, data);

    onMessage(data.respondEvent, callback);

    document.documentElement.dispatchEvent(customEvent);
}

export function onMessage(event, callback) {
    let off;

    function handler(event) {
        const data = event.detail;
        const payload = data.payload;
        const respondEvent = data.respondEvent;

        callback(
            payload,
            payload => {
                postMessage(respondEvent, payload);
            },
            off
        );
    }

    off = () => window.removeEventListener(event, handler);

    window.addEventListener(event, handler);

    return off;
}
