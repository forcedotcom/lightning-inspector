import Gatherer from './Gatherer';
import * as XHRInspector from './XHRInspector';

export default class DefaultGatherer extends Gatherer {
    static XHRInspector = XHRInspector;

    resourceTimingsStartIndex = 0;
    xhrs = new Map();

    constructor() {
        super('default');

        this.registerArtifact('networkResourceTimings', () => this.getNetworkResourceTimings(), {
            collectMethod: 'push',
            processor: 'FetchHeaders'
        });

        this.registerArtifact('window', () => this.getWindow(), { collectMethod: 'set' });

        XHRInspector.on('done', (xhr, request) => {
            this.xhrs.set(xhr.responseURL, {
                request,
                response: {
                    headers: xhr.getAllResponseHeaders(),
                    body: xhr.responseText
                }
            });
        });

        window.performance.setResourceTimingBufferSize(Number.MAX_SAFE_INTEGER);
    }

    getWindow() {
        return {
            location: JSON.parse(JSON.stringify(window.location)),
            innerHeight: window.innerHeight,
            innerWidth: window.innerWidth
        };
    }

    static clonePerformanceEntry(entry) {
        return {
            name: entry.name,
            entryType: entry.entryType,
            startTime: entry.startTime,
            duration: entry.duration,
            initiatorType: entry.initiatorType,
            workerStart: entry.workerStart,
            redirectStart: entry.redirectStart,
            redirectEnd: entry.redirectEnd,
            fetchStart: entry.fetchStart,
            domainLookupStart: entry.domainLookupStart,
            domainLookupEnd: entry.domainLookupEnd,
            connectStart: entry.connectStart,
            connectEnd: entry.connectEnd,
            secureConnectionStart: entry.secureConnectionStart,
            requestStart: entry.requestStart,
            responseStart: entry.responseStart,
            responseEnd: entry.responseEnd,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize
        };
    }

    getNetworkResourceTimings() {
        const performance = window.performance;

        if (performance != null && typeof performance.getEntriesByType === 'function') {
            const entries = performance
                .getEntriesByType('resource')
                .slice(this.resourceTimingsStartIndex + 1)
                .filter(entry => entry.entryType === 'resource')
                .map(entry => DefaultGatherer.clonePerformanceEntry(entry));

            const xhrs = this.xhrs;
            for (const entry of entries) {
                if (xhrs.has(entry.name)) {
                    Object.assign(entry, xhrs.get(entry.name));

                    xhrs.delete(entry.name);
                }
            }

            if (this.resourceTimingsStartIndex === 0) {
                const documentEntry = JSON.parse(JSON.stringify(performance.timing));

                let minTs = Number.MAX_SAFE_INTEGER;
                for (const k in documentEntry) {
                    if (!documentEntry.hasOwnProperty(k)) {
                        continue;
                    }

                    if (typeof documentEntry[k] === 'number' && documentEntry[k] != 0) {
                        minTs = Math.min(minTs, documentEntry[k]);
                    }
                }

                for (const k in documentEntry) {
                    if (!documentEntry.hasOwnProperty(k)) {
                        continue;
                    }

                    if (typeof documentEntry[k] === 'number' && documentEntry[k] != 0) {
                        documentEntry[k] -= minTs;
                    }
                }

                documentEntry.name = window.location.href;
                documentEntry.entryType = 'resource';
                documentEntry.initiatorType = 'document';
                documentEntry.startTime = documentEntry.navigationStart;
                documentEntry.duration = documentEntry.responseEnd - documentEntry.navigationStart;

                entries.unshift(documentEntry);
            }

            this.resourceTimingsStartIndex = performance.getEntriesByType('resource').length;

            return entries;
        }

        return [];
    }
}
