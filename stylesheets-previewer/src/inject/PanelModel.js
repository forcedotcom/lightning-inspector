import Template from './Template';
import CustomStyleRule from './CustomStyleRule';

import {
    WRAPPER_ID,
    CATEGORY_CLASSIC,
    CATEGORY_LIGHTNING,
    CATEGORY_SLDS,
    LINKS_INLINE_STYLES,
    LINKS_CUSTOM_STYLES,
    SELECTOR_CSS_SLDS4VF,
    CATEGORY_NONE
} from './constants';

export default class PanelModel {
    _data = [];
    _isPageReady = false;
    _selectedTheme = null;

    categoryHeaderContent = {
        [CATEGORY_LIGHTNING]: {
            title: 'Lightning Stylesheets for Visualforce',
            description: ''
        },
        [CATEGORY_SLDS]: {
            title: '&lt;apex:slds&gt;',
            description: 'Lightning Design System styles brought in by usage of &lt;apex:slds&gt;'
        },
        [CATEGORY_CLASSIC]: {
            title: 'Salesforce styles',
            description: 'Styles that the platform normally uses in Visualforce pages'
        },
        [LINKS_INLINE_STYLES]: {
            title: 'Style tags',
            description: 'Styles that exist in &lt;style&gt; blocks'
        },
        [LINKS_CUSTOM_STYLES]: {
            title: 'Custom styles',
            description: 'Your custom styles or ones that could not be otherwise identified'
        }
    };

    themePicklistValues = [
        {
            category: CATEGORY_LIGHTNING,
            item_value: 'Lightning Stylesheets'
        },
        {
            category: CATEGORY_CLASSIC,
            item_value: 'Classic Stylesheets'
        },
        {
            category: CATEGORY_NONE,
            item_value: 'No Stylesheets'
        }
    ];

    get themeSelected() {
        if (this._selectedTheme !== null) {
            return this._selectedTheme;
        }

        if (this.isLightningStylesheetsActive) {
            return CATEGORY_LIGHTNING;
        }

        return CATEGORY_CLASSIC;
    }

    set themeSelected(newTheme) {
        this._selectedTheme = newTheme;
    }

    constructor() {
        const getById = id => this._data.find(link => link.id === id);

        // Track page being ready to interact with
        document.addEventListener('domcontentready', () => {
            this._isPageReady = true;
        });
    }

    /**
     * Add a collection of stylesheets (existing as <link> tags).
     * @param {HtmlElement[]} linkStyleTags An array of html elements. Defaults to empty array.
     * @returns True if we added any previously unknown sheets. False otherwise.
     */
    addLinkStyleTags(linkStyleTags = []) {
        let isDirty = false;

        linkStyleTags.forEach(cssLinkTag => {
            if (this.getById(cssLinkTag.id)) {
                console.warn(cssLinkTag.id, 'is already processed', cssLinkTag);
            } else {
                isDirty = true;

                const href = cssLinkTag.getAttribute('href');
                this._data.push(
                    new CustomStyleRule(
                        cssLinkTag,
                        href,
                        href
                            .split(/\.css|\.xcss/)
                            .shift()
                            .split('/')
                            .pop(),
                        this.getCategoryByUrl(href)
                    )
                );
            }
        });

        return isDirty;
    }

    /**
     * Add a collection of <style> blocks on the page.
     * @param {HtmlElement[]} stylesToProcess  An array of html elements.  Defaults to empty array.
     * @returns True if we added any previously unknown sheets. False otherwise.
     */
    addStyleTags(stylesToProcess = []) {
        let isDirty = false;

        stylesToProcess.forEach(styleTag => {
            const styleData = new CustomStyleRule(
                styleTag,
                styleTag.textContent.trim().substring(0, 144),
                '&lt;STYLE tag&gt;',
                'styleTag'
            );

            if (this.getById(styleData.id)) {
                console.warn(
                    `${styledata.id} is already processed, but was attempted to be added again.`,
                    styleData
                );
                return;
            }

            isDirty = true;
            this._data.push(styleData);
        });

        return isDirty;
    }

    /**
     * Add the Lightning Stylsheets link tag that makes the VF page look like lightning to the model.
     * This allows us to track the stylsheet and disable it during the appropriate view modes.
     * Handles null, but reports a warning.
     * @param {*} lightningStylesheetLink
     */
    addLightningStylesheetTag(lightningStylesheetLink) {
        if (!lightningStylesheetLink) {
            console.warn(
                'PanelModel#addLightningStylsheetTag(lightningStylsheetLink) was passed a falsey value for its parameter lightningStylesheetLink. Handled, but this should never happen.'
            );
            return;
        }

        // Tag already being tracked.
        if (!!this.getById(SELECTOR_CSS_SLDS4VF)) {
            return;
        }

        this._data.push(
            new CustomStyleRule(
                lightningStylesheetLink,
                lightningStylesheetLink.href,
                'Lightning Stylesheets',
                CATEGORY_LIGHTNING
            )
        );
    }

    setActivation(cssLinkId, value) {
        const idx = this._data.findIndex(element => element.id == cssLinkId);
        this._data[idx].activated = value;
    }

    getById(id) {
        return this._data.find(link => link.id === id);
    }

    getCategoryById(id) {
        this._data.find(element => element.id == id).category;
    }

    getCategoryByUrl(url) {
        if (RegExp('lightningstylesheets').test(url)) return CATEGORY_LIGHTNING;
        if (RegExp('^/apexpages/slds/|^/slds/css/').test(url)) return CATEGORY_SLDS;
        if (RegExp('^/sCSS/|^/faces/').test(url)) return CATEGORY_CLASSIC;
        return 'custom';
    }

    get isPageReady() {
        return this._isPageReady || document.readyState === 'complete';
    }

    get isLightningStylesheetsActive() {
        return Boolean(
            this._data.find(link => link.category === 'lex4vf' && link.activated === true)
        );
    }

    get hasVisualforceClasses() {
        try {
            return !!window.document.querySelector('.apexp, .bPageBlock, .ext-chrome, .sfdcBody');
        } catch (e) {}
        return false;
    }

    get hasPageContent() {
        try {
            // test for empty page
            return !!window.document.body.innerHTML.trim().length;
        } catch (e) {}
        return false;
    }

    get isVisualforceFrame() {
        return RegExp(/vfFrameId_\d+/).test(window.name); // ||
        // RegExp(/^\/apex\/|\.apexp/).test(window.location.pathname); // test for frame with Visualforce page
    }

    get isValidVisualforcePage() {
        return (
            this.hasPageContent &&
            ((window != top && this.isVisualforceFrame) ||
                (window == top && this.hasVisualforceClasses) || 
                this.hasLightningOut)
        );
    }

    get hasLightningOut() {
        return Array.from(window.document.querySelectorAll('script')).find(item => item.src.endsWith('lightning.out.js'));
    }

    get isPanelOpen() {
        const panel = document.getElementById(WRAPPER_ID);

        if (!panel) {
            return false;
        }

        return panel.classList.contains('is-open');
    }

    toString() {
        return JSON.stringify(data);
    }

    // TODO: Kill this
    get data() {
        return this._data;
    }

    get orgLightningStylesheetsCssPath() {
        return `/slds/css/${new Date().getTime()}/min/lightningstylesheets/one:oneNamespace,force:sldsTokens,force:base,force:oneSalesforceSkin,force:levelTwoDensity,force:themeTokens,force:formFactorLarge/slds.css`;
    }

    get templates() {
        return Template.templates;
    }

    set templates(newTemplates) {
        Template.templates = newTemplates;
    }
}
