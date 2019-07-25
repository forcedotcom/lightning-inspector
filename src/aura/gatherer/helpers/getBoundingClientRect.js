export default function getBoundingClientRect(element) {
    if (typeof element.getBoundingClientRect === 'function') {
        return element.getBoundingClientRect();
    }

    if (element instanceof Text) {
        if (document.createRange) {
            const range = document.createRange();
            range.selectNodeContents(element);
            if (range.getBoundingClientRect) {
                let rect = range.getBoundingClientRect();
                if (rect) {
                    return rect;
                }
            }
        }
    }

    if (element != null && element.parentElement) {
        return element.parentElement.getBoundingClientRect();
    }

    return { left: 0, right: 0, top: 0, bottom: 0 };
}
