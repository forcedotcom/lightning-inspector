import getBoundingClientRect from './getBoundingClientRect';

export default function getInnerBoundingClientRect(element) {
    const rect = getBoundingClientRect(element);

    if (element instanceof Element) {
        const styles = window.getComputedStyle(element);
        const paddingLeft = parseFloat(styles.paddingLeft);
        const paddingRight = parseFloat(styles.paddingRight);
        const paddingTop = parseFloat(styles.paddingTop);
        const paddingBottom = parseFloat(styles.paddingBottom);

        // TODO margins if box-sizing: border-box
        // TODO borders
        return {
            left: rect.left + paddingLeft,
            right: rect.right - paddingRight,
            top: rect.top + paddingTop,
            bottom: rect.bottom - paddingBottom
        };
    }

    return rect;
}
