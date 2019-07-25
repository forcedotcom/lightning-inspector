export function postMessage(worker, event, payload, callback = () => 0) {
    let data = {
        payload: payload,
        respondEvent: Date.now() + ' ' + Math.random()
    };

    onMessage(worker, data.respondEvent, callback);

    worker.postMessage(`${event};${JSON.stringify(data)}`);
}

export function onMessage(worker, event, callback) {
    let off;

    function handler({ data } = {}) {
        if (data.substring(0, data.indexOf(';')) === event) {
            data = JSON.parse(data.substring(data.indexOf(';') + 1));

            const payload = data.payload;
            const respondEvent = data.respondEvent;

            callback(
                payload,
                payload => {
                    postMessage(worker, respondEvent, payload);
                },
                off
            );
        }
    }

    off = () => worker.removeEventListener('message', handler);

    worker.addEventListener('message', handler);

    return off;
}
