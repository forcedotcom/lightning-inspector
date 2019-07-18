export default function mergeWith(obj, src, customizer) {
    if (typeof obj !== 'object') {
        return obj;
    }

    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }

        obj[key] = customizer(obj[key], src[key]);
    }

    return obj;
}
