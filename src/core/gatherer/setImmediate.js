let timemout = 0;
let immediateQueue = [];

export function flushImmediates() {
    clearTimeout(timemout);
    timemout = 0;

    const queue = immediateQueue;
    immediateQueue = [];

    const length = queue.length;
    for (let i = 0; i < length; i++) {
        queue[i]();
    }
}

export default function setImmediate(func) {
    if (timemout !== null) {
        timemout = setTimeout(flushImmediates, 0);
    }

    immediateQueue.push(func);
}
