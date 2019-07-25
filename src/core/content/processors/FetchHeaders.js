export default class FetchHeaders {
    name = 'FetchHeaders';

    ignore = new Set();

    getHeaders(name) {
        const xhr = new XMLHttpRequest();

        xhr.withCredentials = true;
        xhr.open('HEAD', name, true);
        xhr.setRequestHeader('pragma', 'no-cache'); //Bypass cache to get headers
        xhr.timeout = 1500;

        this.ignore.add(name);

        return new Promise(resolve => {
            xhr.onreadystatechange = () => {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    if (200 <= xhr.status && xhr.status < 300) {
                        resolve(xhr.getAllResponseHeaders());
                    } else {
                        resolve(`RequestFailure:${xhr.status}`);
                    }
                }
            };

            xhr.ontimeout = e => {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(`Timeout ${name}`, e);
                }

                resolve(`FetchHeadersTimeout:${name}`);
            };

            xhr.send();
        });
    }

    process(entries) {
        return new Promise(resolve => {
            entries = entries.filter(entry => !this.ignore.has(entry.name));

            const resources = entries.filter(
                ({ entryType, initiatorType, name }) =>
                    entryType === 'resource' &&
                    ['link', 'script', 'img', 'use', 'css', 'document'].indexOf(initiatorType) > -1
            );

            const headers = Promise.all(resources.map(resource => this.getHeaders(resource.name)));

            headers.then(headers => {
                for (let i = 0; i < headers.length; i++) {
                    resources[i].response = { headers: headers[i] };
                }

                for (const entry of entries) {
                    entry.response = entry.response || {};
                    entry.response.headers = entry.response.headers || '';

                    const headers = {};
                    const headersStr = entry.response.headers;
                    const nameValues = headersStr
                        .trim()
                        .split('\n')
                        .map(header => [
                            header.substring(0, header.indexOf(':')),
                            header.substring(header.indexOf(':') + 1)
                        ]);

                    for (const [name, value] of nameValues) {
                        headers[name.toLowerCase()] = value.trim();
                    }

                    entry.response.headers = headers;

                    entry.request = entry.request || {};
                    entry.request.headers = entry.request.headers || {
                        usingBrowserDefault: 'true',
                        withCredentials: 'true'
                    };
                }

                resolve(entries);
            });
        });
    }
}
