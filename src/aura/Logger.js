export default class Logger {
    static error(...msg) {
        console.error(msg);
    }

    static warn(...msg) {
        console.warn(msg);
    }

    static info(...msg) {
        console.info(msg);
    }
}