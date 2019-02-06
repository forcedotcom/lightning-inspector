import "./inject.scss";
import Template from "./Template";
import PanelModel from "./PanelModel";

import {
    SELECTOR_CSS_PROCESSED, 
    SELECTOR_CSS_DEACTIVATED, 
    SELECTOR_CSS_SLDS4VF, 
    SELECTOR_CSS_LINK, 
    SELECTOR_STYLE_TAG, 
    WRAPPER_ID, 
    CATEGORY_CLASSIC, 
    CATEGORY_LIGHTNING, 
    CATEGORY_SLDS,
    LINKS_INLINE_STYLES, 
    LINKS_CUSTOM_STYLES
} from "./constants";


if (!window.LightningStylesheets) {
    // Lets attach all our logic to this top level namespace
    window.LightningStylesheets = window.LightningStylesheets || {};

    class Panel {
        constructor() {
            this.renderDebounced = debounce(this.render, 500);
        }
        _intervalId = null;

        startPolling() {
            this._intervalId = setInterval(getPageStyleSheets, 3000);
        }

        stopPolling() {
            clearInterval(this._intervalId);
        }

        async toggle(force) {
            if (!document.getElementById(WRAPPER_ID)) {
                await this.render();
            }
            const panel = document.getElementById(WRAPPER_ID);
            panel.classList.toggle('is-open', force);
    
            if(panel.classList.contains('is-open')) {
                this.startPolling();
            } else {
                this.stopPolling();
            }
        }

        async render() {
            console.log("TRACE: panel.render()");
    
            await Template.fetchTemplates();
            const {
                categoryHeaderContent,
                templates,
                themePicklistValues,
                themeSelected
            } = model;
    
            // If we haven't injected the wrapper yet, inject it.
            if (!document.getElementById(WRAPPER_ID)) {
                document.body.insertAdjacentHTML('beforeend', `<div id="${WRAPPER_ID}"></div>`);
            } else {
                document.getElementById(WRAPPER_ID).innerHTML = '';
            }
    
            const containerElement = document.getElementById(WRAPPER_ID);
            const containerTemplate = new Template('container');
            containerTemplate.renderTo(containerElement);
    
            const extensionViewContainerElement = containerElement.querySelector(".extension-view-container");
            const contentTemplate = new Template('content');
            contentTemplate.renderTo(extensionViewContainerElement);
            
            const extensionViewContentElement = containerElement.querySelector(".extension-view-content");
            const headerTemplate = new Template('header');
            const bodyTemplate = new Template('body');
            headerTemplate.renderTo(extensionViewContentElement);
            bodyTemplate.renderTo(extensionViewContentElement);
            
            const sldsLinks = renderLinkSection(CATEGORY_SLDS);
            const customLinks = renderLinkSection(LINKS_CUSTOM_STYLES);
            const styleTags = renderLinkSection(LINKS_INLINE_STYLES);
    
            const themePicklistTemplate = new Template('theme_picklist');
            const themePicklist = themePicklistTemplate.render({
                selected_value: themePicklistValues.find(option => option.category == themeSelected).item_value
            });
    
            const themesDropdown = themePicklist.querySelector("#listbox-themes ul");
            const themePicklistOptionTemplate = new Template('theme_picklist_option');
            
            themePicklistValues.map(option =>
                themePicklistOptionTemplate.renderTo(themesDropdown,             
                    Object.assign({}, option, {
                        is_selected: themeSelected == option.category ? 'slds-is-selected' : '',
                        partial_icon_check: templates.icon_check,
                        partial_selected_a11y_label: templates.list_item_partial_selected_a11y_label
                    }))
            );
    
            const dropdownContainer = containerElement.querySelector(".extension-view-dropdown");
            dropdownContainer.appendChild(themePicklist);
    
            const extensionViewCustomStyles = containerElement.querySelector(".extension-view-custom-styles");
            extensionViewCustomStyles.appendChild(sldsLinks);
            extensionViewCustomStyles.appendChild(customLinks);
            extensionViewCustomStyles.appendChild(styleTags);
        }

        /**
         * Using one of the constants in PanelModel#themePicklistValues
         *  CATEGORY_LIGHTNING, 
         *  CATEGORY_NONE, 
         *  CATEGORY_CLASSIC 
         * Set the dropdown to one of these values.
         * 
         * @param {String} targetCategory One of the Categories specified in PanelModel#themePicklistValues
         */
        async setCategory(targetCategory) {
            model.themeSelected = targetCategory;
            const elementDataSet = model.data.filter(elementData => [CATEGORY_CLASSIC, CATEGORY_LIGHTNING].includes(elementData.category));
        
            const hasLightningStylesheetsCssBeenApplied = elementDataSet.find(elementData => elementData.category == CATEGORY_LIGHTNING);
            if (targetCategory == CATEGORY_LIGHTNING && !hasLightningStylesheetsCssBeenApplied) {
                applyLightningStylesheetsCss(window);
            }

            elementDataSet.map(elementData => (
                toggleCSSElement(
                    document.getElementById(elementData.id),
                    elementData.category == targetCategory
                )
            ));

            return this.render();
        }
    }
    
    const panel = new Panel();
    const model = new PanelModel();

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        switch (request.msg) {
            case "getLightningStylesheetState":
                return sendResponse({
                    "isLightningStylesheetsActive": model.isLightningStylesheetsActive,
                    "isPanelOpen": model.isPanelOpen,
                    "isValidVisualForcePage": model.isValidVisualforcePage
                });
            case "activateSlds4Vf":
                panel.setCategory(CATEGORY_LIGHTNING);
                return sendResponse({
                    msg: request.msg,
                    complete: true
                });
            case "openPanel":
                return panel.toggle(true);
            case "isLightningStylesheetsActive":
                return sendResponse({
                    msg: request.msg,
                    value: model.isLightningStylesheetsActive
                });
            case "isPanelOpen":
                return sendResponse({
                    msg: request.msg,
                    // value: document.getElementById(WRAPPER_ID).classList.contains("is-open")
                    value: model.isPanelOpen
                });
            default:
                return {
                    msg: `No Extension Message Handler for ${request}`
                }
        }
    });

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    const getLinks = category => model.data.filter(item => item.category == category);

    const renderTemplate = (snippet, container) => {
        const wrapper = container || document.createElement("div");
        wrapper.innerHTML = snippet;
        return container ? wrapper : wrapper.firstElementChild;
    }

    const renderLinkSection = (category) => {
        const returnFragment = document.createDocumentFragment();
        const { categoryHeaderContent } = model;
        const {
            description,
            activated,
            title
        } = categoryHeaderContent[category];
        
        // Items to show in the link section
        const linksList = getLinks(category);

        // No links, return a blank fragment
        if (linksList.length === 0) {
            return returnFragment;
        }

        const listHeaderTemplate = new Template('list_header');
        listHeaderTemplate.renderTo(returnFragment, {
            category,
            title,
            description,
            is_checked: model.data
                .filter(item => item.category == category)
                .every(item => item.activated === false) ? '' : 'checked',
        });

        // Render the List Container
        const listBodyTemplate = new Template('list_body');
        listBodyTemplate.renderTo(returnFragment);

        const listBodyElement = returnFragment.querySelector(".extension-view-list-body");
        
        // Get all the links for the current category and for each one
        // append to the list container
        const linkItemTemplate = new Template('list_item');
        linksList.map(link => linkItemTemplate.renderTo(listBodyElement, Object.assign(link, {
            is_checked: link.activated ? 'checked' : ''
        })));

        return returnFragment;
    }

    const applyLightningStylesheetsCss = (contentWindow) => {
        const contentDoc = contentWindow.document;
        const lightningStylesheetLink = contentDoc.querySelector(`.${SELECTOR_CSS_SLDS4VF}`);
        if (lightningStylesheetLink) {
            return;
        }

        model.themeSelected = CATEGORY_LIGHTNING;

        const link = contentDoc.createElement("link");
        link.rel = "stylesheet";
        link.href = model.orgLightningStylesheetsCssPath;
        link.type = "text/css";
        link.id = SELECTOR_CSS_SLDS4VF;
        link.classList.add(SELECTOR_CSS_SLDS4VF);
        contentDoc.head.appendChild(link);

        // Track the script tag
        model.addLightningStylesheetTag(link);

        chrome.runtime.sendMessage({
            msg: "lightningStylesheetsActivated",
            value: true
        });
    }

    const handleCategoryStateFromChildClick = category => {
        const categoryElements = model.data.filter(item => item.category == category);
        const categoryCheckbox = document.getElementById(`checkbox_${category}`);
        if (categoryElements.every(item => item.activated === true)) {
            //turn on category check
            categoryCheckbox.checked = true;
            categoryCheckbox.indeterminate = false;
        } else if (categoryElements.every(item => item.activated === false)) {
            //turn off category check
            categoryCheckbox.checked = false;
            categoryCheckbox.indeterminate = false;
        } else {
            //turn on mixed
            categoryCheckbox.indeterminate = true;
        }
    };

    const deactivateCSSElement = element => {
        element.setAttribute("media", "max-width: 1px");
        element.classList.add(SELECTOR_CSS_DEACTIVATED);
        model.setActivation(element.id, false);
        console.log("Deactivating:", element.dataset.initCssUrl || element.href);
        return element;
    }

    const activateCSSElement = element => {
        element.removeAttribute('media');
        element.classList.remove(SELECTOR_CSS_DEACTIVATED);
        model.setActivation(element.id, true);
        console.log("Activating:", element.dataset.initCssUrl || element.href);
        return element;
    }

    const createRandomId = () => `${(new Date()).getTime()}-${Math.random()*10**17}`;

    const getPageStyleSheets = () => {
        const stylesheetsQuery = Array.from(document.querySelectorAll(SELECTOR_CSS_LINK));
        if (stylesheetsQuery.length) {
            const toProcessStyleSheets = stylesheetsQuery
                .filter(cssLink => !cssLink.classList.contains(SELECTOR_CSS_PROCESSED))
                .map(cssLink => {
                    const href = cssLink.getAttribute('href');
                    if (!cssLink.id) {
                        cssLink.id = createRandomId();
                    }
                    cssLink.dataset.initCssUrl = cssLink.getAttribute('href');
                    cssLink.classList.add(SELECTOR_CSS_PROCESSED);
                    //model.add(model.getCssLinkData(cssLink));
                    return cssLink;
                });
            return toProcessStyleSheets;
        }
        return [];
    }

    /**
     * Returns the style tags on the page that are not filtered out 
     * and have not been handled by the extension already.
     */
    const getPageStyleTags = () => {
        const styleTagsQuery = Array.from(document.querySelectorAll(SELECTOR_STYLE_TAG));
        if (styleTagsQuery.length) {
            const toProcessStyleTags = styleTagsQuery
                .filter(styleTag => {
                    const isExtensionCss = styleTag.textContent.includes('sfdc-lightning-stylesheets-extension-view');
                    const hasBeenProcessByExtension = styleTag.classList.contains(SELECTOR_CSS_PROCESSED);
                    return !isExtensionCss && !hasBeenProcessByExtension;
                })
                .map((styleTag) => {
                    if (!   styleTag.id) {
                        styleTag.id = createRandomId();
                    }
                    styleTag.classList.add(SELECTOR_CSS_PROCESSED);
                    return styleTag;
                });

            return toProcessStyleTags;
        }
        return [];
    }

    const handlePickListSelect = (listItem) => {
        const category = listItem.dataset.category;
        panel.setCategory(category);
    }

    const toggleCSSElement = (element, isChecked) => {
        if (!element) {
            console.warn("Unable to find the CSS link element to de/activate")
            return;
        }
        
        isChecked ?
            activateCSSElement(element) :
            deactivateCSSElement(element);
    };

    const isExtensionOwned = (element) => {
        const className = ".sfdc-lightning-stylesheets-extension-view";
        let current = element;
        while (current && current instanceof Element) {
            if (current.matches(className)) {
                return true;
            }
            current = current.parentNode;
        }
        return false;
    }

    //chrome.extension.sendMessage({}, async function (response) {
    var readyStateCheckInterval = setInterval(function () {
        if (model.isPageReady) {
            clearInterval(readyStateCheckInterval);

            // ----------------------------------------------------------
            // This part of the script triggers when page is done loading
            console.log("readyState", window.location.href);
            // ----------------------------------------------------------

            try {
                let confirmLoadCSS = null;
                const { hasVisualforceClasses, hasPageContent, isVisualforceFrame, isValidVisualforcePage } = model;

                document.body.addEventListener("change", e => {
                    if (!isExtensionOwned(e.target)) {
                        return;
                    }
                    const clickedElement = event.target;
                    if (clickedElement.classList.contains("category-check")) {
                        model.data
                            .filter(elementData => elementData.category == clickedElement.dataset.cssCategory)
                            .map(elementData => (
                                toggleCSSElement(
                                    document.getElementById(elementData.id),
                                    clickedElement.checked
                                )
                            ));
                            panel.render();
                    }

                    if (clickedElement.classList.contains("list-item-check")) {
                        toggleCSSElement(
                            document.getElementById(clickedElement.dataset.cssNodeId),
                            clickedElement.checked
                        )
                        handleCategoryStateFromChildClick(clickedElement.dataset.cssCategory);
                    }
                })

                document.body.addEventListener("click", e => {
                    if (!isExtensionOwned(e.target)) {
                        return;
                    }
                    if (e.target.classList.contains("button-panel-close")) {
                        panel.toggle(false);
                    }
                })

                document.body.addEventListener("mousedown", e => {
                    if (!isExtensionOwned(e.target)) {
                        return;
                    }
                    const target = e.target.classList.contains("slds-listbox__option") ? e.target : e.target.closest(".slds-listbox__option");
                    if (target) {
                        handlePickListSelect(target);
                    }
                })

                window.addEventListener("focusin", e => {
                    if (!isExtensionOwned(e.target)) {
                        return;
                    }
                    if (e.target.id == "combobox-theme-select") {
                        document.querySelector(".slds-combobox").classList.add("slds-is-open");
                    }
                })

                window.addEventListener("focusout", e => {
                    if (!isExtensionOwned(e.target)) {
                        return;
                    }
                    if (e.target.id == "combobox-theme-select") {
                        document.querySelector(".slds-combobox").classList.remove("slds-is-open");
                    }
                })

                if (isValidVisualforcePage) {                    
                    if (model.addStyleTags(getPageStyleTags())) {
                        panel.renderDebounced();
                    }
                    
                    if (model.addLinkStyleTags(getPageStyleSheets())) {
                        panel.renderDebounced();
                    }
                }
            } catch (e) {
                console.error(e);

                // Interacting with the page threw an exception. 
                // Lets just bail.
                return;
            }
        }
    }, 10);

    
}

