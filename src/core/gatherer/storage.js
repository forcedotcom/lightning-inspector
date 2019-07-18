export function get(options, keys) {
    if (keys === null) {
        return options;
    }

    for (const k in keys) {
        if (keys.hasOwnProperty(k)) {
            if (options.hasOwnProperty(k)) {
                keys[k] = options[k];
            }
        }
    }

    return options;
}
