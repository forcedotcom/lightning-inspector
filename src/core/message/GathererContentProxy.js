import { postMessage } from './DOMMessage';

class GathererContentProxy {
    this = new Proxy(
        {},
        {
            get: (target, method) => {
                return (...args) => {
                    return new Promise((resolve, reject) => {
                        postMessage(
                            'ContentDirect',
                            {
                                text: 'ContentInvoke',
                                namespace: this.namespace,
                                method,
                                args
                            },
                            resolve
                        );
                    });
                };
            }
        }
    );

    buckets = new Proxy(
        {},
        {
            get: (target, method) => {
                return (...args) => {
                    return new Promise((resolve, reject) => {
                        postMessage(
                            'ContentDirect',
                            {
                                text: 'ContentBucketsInvoke',
                                namespace: this.namespace,
                                method,
                                args
                            },
                            resolve
                        );
                    });
                };
            }
        }
    );

    _buckets = {};

    bucket(bucket = 'active') {
        if (this._buckets[bucket]) {
            return this._buckets[bucket];
        }
        return (this._buckets[bucket] = new Proxy(
            {},
            {
                get: (target, method) => {
                    return (...args) => {
                        return new Promise((resolve, reject) => {
                            postMessage(
                                'ContentDirect',
                                {
                                    text: 'ContentCollectorInvoke',
                                    bucket,
                                    namespace: this.namespace,
                                    method,
                                    args
                                },
                                resolve
                            );
                        });
                    };
                }
            }
        ));
    }

    _gatherers = {};

    gatherer(namespace, { bucket = 'active', def } = {}) {
        const proxyKey = [namespace, bucket, JSON.stringify(def)].join('');

        if (this._gatherers[proxyKey]) {
            return this._gatherers[proxyKey];
        }

        return (this._gatherers[proxyKey] = new Proxy(
            {},
            {
                get: (target, method) => {
                    return (...args) => {
                        return new Promise((resolve, reject) => {
                            if (bucket) {
                                postMessage(
                                    'ContentDirect',
                                    {
                                        text: 'GathererInvokeAndCollect',
                                        namespace,
                                        method,
                                        args,
                                        bucket
                                    },
                                    resolve
                                );
                                return;
                            }

                            postMessage(
                                'ContentDirect',
                                {
                                    text: 'GathererInvoke',
                                    namespace,
                                    method,
                                    args,
                                    bucket
                                },
                                resolve
                            );
                        });
                    };
                }
            }
        ));
    }
}

window.contentProxy = new GathererContentProxy();

export default window.contentProxy;
