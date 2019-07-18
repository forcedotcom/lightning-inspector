import { SELECTOR_CSS_DEACTIVATED } from './constants';

export default class CustomStyleRule {
    constructor(element, url, filename, category) {
        this.id = element.id;
        this.activated = !element.classList.contains(SELECTOR_CSS_DEACTIVATED);
        this.url = url;
        this.filename = filename;
        this.category = category;
    }
}
