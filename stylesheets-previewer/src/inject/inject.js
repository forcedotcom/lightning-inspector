import "./inject.scss";

console.log("content.js loaded", window == top ? "@ top" : "in frame @", window.location.href);
if(window == top) console.log("is VF page?", Boolean(window.document.querySelector('.apexp')));

const SELECTOR_CSS_PROCESSED = "css__processed";
const SELECTOR_CSS_DEACTIVATED = "css__deactivated";
const SELECTOR_CSS_SLDS4VF = "slds-vf-stylesheet";
const SELECTOR_CSS_LINK = "html link[rel='stylesheet']";
const SELECTOR_STYLE_TAG = "style";
const URL_TEMPLATE = "stylesheets-previewer/template/template.html";
const WRAPPER_ID = "extension-view";
const CATEGORY_CLASSIC = 'salesforce';
const CATEGORY_LIGHTNING = 'lex4vf';
const CATEGORY_SLDS = 'slds';

let port;
let currentStylesheets = [];
let currentStyleTags = [];

const model = (() => {
    const data = [];
    const getById = id => data.find(link => link.id === id);
    const createElementData = (element, url, filename, category) => ({
        id: element.id,
        activated: !element.classList.contains(SELECTOR_CSS_DEACTIVATED),
        url,
        filename,
        category
    });
    let templates;

    return {
        add: cssLinkData => {
            if(getById(cssLinkData.id)) {
                console.warn(cssLinkData.id, "is already processed", cssLinkData);
            } else {
                data.push(cssLinkData)
            }
        },
        categoryHeaderContent: {
            [CATEGORY_LIGHTNING]: {
                title: 'Lightning Stylesheets for Visualforce',
                description: '',
            },
            [CATEGORY_SLDS]: {
                title: '&lt;apex:slds&gt;',
                description: 'Lightning Design System styles brought in by usage of &lt;apex:slds&gt;',
            },
            [CATEGORY_CLASSIC]: {
                title: 'Salesforce styles',
                description: 'Styles that the platform normally uses in Visualforce pages',
            },
            styleTag: {
                title: 'Style tags',
                description: 'Styles that exist in &lt;style&gt; blocks',
            },
            custom: {
                title: 'Custom styles',
                description: 'Your custom styles or ones that could not be otherwise identified',			}
        },
        setActivation: (cssLinkId, value) => {
            const idx = data.findIndex(element => element.id == cssLinkId);
            data[idx].activated = value;
        },
        getById: getById,
        getCategoryById: id => data.find(element => element.id == id).category,
        getCategoryByUrl: url => {
            if(RegExp('lightningstylesheets').test(url)) return CATEGORY_LIGHTNING;
          if(RegExp('^\/apexpages\/slds\/|^\/slds\/css\/').test(url)) return CATEGORY_SLDS;
          if(RegExp('^\/sCSS\/|^\/faces\/').test(url)) return CATEGORY_CLASSIC;
          return 'custom';
        },
        getCssLinkData: cssLink => {
            const href = cssLink.getAttribute("href");
            return createElementData(
                cssLink,
                href,
                href.split(/\.css|\.xcss/).shift().split('/').pop(),
                model.getCategoryByUrl(href)
            )
        },
        getStyleTagData: styleTag => {
            return createElementData(
                styleTag,
                styleTag.textContent.trim().substring(0, 144),
                "&lt;STYLE tag&gt;",
                "styleTag"
            )
        },
        isLightningStylesheetsActive: () => Boolean(data.find(link => link.category ==="lex4vf" && link.activated === true)),
        themePicklistValues: [
            { category: CATEGORY_LIGHTNING, item_value: "Lightning Stylesheets" },
            { category: CATEGORY_CLASSIC, item_value: "Classic Stylesheets" },
            { category: 'none', item_value: "No Stylesheets" }
        ],
        themeSelected: CATEGORY_CLASSIC,
        toString: () => JSON.stringify(data),
        get data () { return data },
        get orgLightningStylesheetsCssPath () {
            return `/slds/css/${(new Date()).getTime()}/min/lightningstylesheets/one:oneNamespace,force:sldsTokens,force:base,force:oneSalesforceSkin,force:levelTwoDensity,force:themeTokens,force:formFactorLarge/slds.css` 
        },
        get templates () { return templates },
        set templates(newTemplates) { templates = newTemplates }
    }
})();

const togglePanel = (force) => document.getElementById(WRAPPER_ID).classList.toggle('is-open', force);

const getLinks = category => model.data.filter(item => item.category == category);

const renderTemplate = (snippet, container) => {
    const wrapper = container || document.createElement("div");
    wrapper.innerHTML = snippet;
    return container ? wrapper : wrapper.firstElementChild;
}

const hydrateTemplate = (snippet, data) => {
    Object.keys(data).forEach(key => {
        snippet = snippet.replace(RegExp(`{{${key}}}`, 'g'), data[key])
    })
    return snippet;
}

const renderLinkSection = (category) => {
    const { categoryHeaderContent } = model;
    const { description, activated, title } = categoryHeaderContent[category];
    const list = renderTemplate(model.templates.list_body);
    renderTemplate(getLinks(category).map(item => hydrateTemplate(model.templates.list_item, Object.assign(item, { is_checked: item.activated ? 'checked' : '' }))).join(''), list);
    return getLinks(category).length ? [
        hydrateTemplate(
            model.templates.list_header, {
                category,
                title,
                description,
                is_checked: model.data
                    .filter(item => item.category == category)
                    .every(item => item.activated === false) ? '' : 'checked',
            }
        ),
        list.outerHTML
    ].join(''):
        '';
}

const render = () => {
    const { categoryHeaderContent, templates, themePicklistValues, themeSelected } = model;
    if(!document.getElementById(WRAPPER_ID)) document.body.insertAdjacentHTML('beforeend', `<div id="${WRAPPER_ID}"></div>`);
    renderTemplate(templates.container, document.getElementById(WRAPPER_ID));
    const container = renderTemplate([
        templates.content
    ].join(''), document.querySelector(".extension-view-container"));
    const content = renderTemplate([
        templates.header,
        templates.body,
    ].join(''), document.querySelector(".extension-view-content"));
  const sldsLinks = renderLinkSection(CATEGORY_SLDS);
  const customLinks = renderLinkSection('custom');
    const styleTags = renderLinkSection('styleTag');

    const themePicklist = hydrateTemplate(
        templates.theme_picklist,
        {
            selected_value: themePicklistValues.find(option => option.category == themeSelected).item_value
        }
    );

    const picklistOptions = themePicklistValues.map(option =>
        hydrateTemplate(
            templates.theme_picklist_option,
            Object.assign({}, option, {
                is_selected: themeSelected == option.category ? 'slds-is-selected' : '',
                partial_icon_check: templates.icon_check,
                partial_selected_a11y_label: templates.list_item_partial_selected_a11y_label
        })
    ));

    // const items = model.data.map(item => hydrateTemplate(templates.list_item, Object.assign(item, { is_checked: item.activated ? 'checked' : '' })));
    renderTemplate([themePicklist, sldsLinks, customLinks, styleTags].join(''), content.querySelector(".extension-view-body"));
    renderTemplate(picklistOptions.join(''), content.querySelector("#listbox-themes ul"));
}

const applyLightningStylesheetsCss = (contentWindow) => {
  const contentDoc = contentWindow.document;
  if(!contentDoc.querySelector(`.${SELECTOR_CSS_SLDS4VF}`)) {
        model.themeSelected = CATEGORY_LIGHTNING;
    // Array.from(contentDoc.querySelectorAll(`${SELECTOR_CSS_LINK}, ${SELECTOR_STYLE_TAG}`))
    //   .map(cssElement => {
    //     deactivateCSSElement(cssElement);
        // 	});

    const css = contentDoc.createElement("link");
    css.rel = "stylesheet";
    // When testing local SLDS4VF
        // css.href = "https://localhost:4443/styles/extension.css";
    // css.href="https://drive.google.com/a/salesforce.com/uc?authuser=0&id=0B2Qc3WrvwamZY3lvRmNJMWZaeUk&export=download";
    // css.href="https://design-system-visualforce.herokuapp.com/styles/extension.css?token=51828b28843be76b5715105e5a715003";
        // css.href = "http://lex4vf-dev.surge.sh/styles/production.css";
    css.href = model.orgLightningStylesheetsCssPath;
        css.type = "text/css";
    css.id = SELECTOR_CSS_SLDS4VF;
    css.classList.add(SELECTOR_CSS_SLDS4VF);
    contentDoc.head.appendChild(css);
        chrome.runtime.sendMessage({ msg: "lightningStylesheetsActivated", value: true });
        handleCategorySelection(CATEGORY_LIGHTNING);
  }
}

const handleCategoryStateFromChildClick = category => {
    const categoryElements = model.data.filter(item => item.category == category);
    const categoryCheckbox = document.getElementById(`checkbox_${category}`);
    if(categoryElements.every(item => item.activated === true)) {
        //turn on category check
        categoryCheckbox.checked = true;
        categoryCheckbox.indeterminate = false;
    } else if(categoryElements.every(item => item.activated === false)) {
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
  console.log("Deactivating:", element.dataset.initCssUrl);
  return element;
}

const activateCSSElement = element => {
    element.removeAttribute('media');
  element.classList.remove(SELECTOR_CSS_DEACTIVATED);
    model.setActivation(element.id, true);
    console.log("Activating:", element.dataset.initCssUrl);
  return element;
}

const createRandomId = () => `${(new Date()).getTime()}-${Math.random()*10**17}`;

const getPageStyleSheets = () => {
    const stylesheetsQuery = document.querySelectorAll(SELECTOR_CSS_LINK);
    if(stylesheetsQuery.length) {
        const prevStylesheets = currentStylesheets.concat([]);
        currentStylesheets = Array.from(stylesheetsQuery);
        currentStylesheets
            .filter(cssLink => !cssLink.classList.contains(SELECTOR_CSS_PROCESSED))
            .map(cssLink => processCssLinks(cssLink));
        if(currentStylesheets.length != prevStylesheets.length) {
            console.log("CSS Found:", document.querySelectorAll(SELECTOR_CSS_LINK));
            render();
        };
    }
}

const getPageStyleTags = () => {
    const styleTagsQuery = document.querySelectorAll(SELECTOR_STYLE_TAG);
    if(styleTagsQuery.length) {
        const prevStyleTags = currentStyleTags.concat([]);
        currentStyleTags = Array.from(styleTagsQuery);
        currentStyleTags
            .filter(styleTag => !styleTag.classList.contains(SELECTOR_CSS_PROCESSED))
            .map(styleTag => processStyleTags(styleTag));
        if(currentStyleTags.length != prevStyleTags.length) {
            console.log("Style Tag Found:", document.querySelectorAll(SELECTOR_STYLE_TAG));
            render();
        };
    }
}

const handleCategorySelection = category => {
    const elementDataSet = model.data.filter(elementData => [CATEGORY_CLASSIC,CATEGORY_LIGHTNING].includes(elementData.category) );
    if(category == CATEGORY_LIGHTNING
        && !elementDataSet.find(elementData => elementData.category == CATEGORY_LIGHTNING))
        applyLightningStylesheetsCss(window);

    elementDataSet.map(elementData => (
        toggleCSSElement(
            document.getElementById(elementData.id),
            elementData.category == category
        )
    ));
    render();
}

const handlePickListSelect = (listItem) => {
    const category = listItem.dataset.category;
    model.themeSelected = category;
    handleCategorySelection(category);
}

const processCssLinks = cssLink => {
  console.log("Processing:", cssLink.getAttribute('href')); //cssLink
    const href = cssLink.getAttribute('href');
    cssLink.id = createRandomId();
    cssLink.dataset.initCssUrl = cssLink.getAttribute('href');
    cssLink.classList.add(SELECTOR_CSS_PROCESSED);
    model.add(model.getCssLinkData(cssLink));
  return cssLink;
}

const processStyleTags = styleTag => {
    console.log("Processing:", styleTag.innerHTML.trim().substring(0, 24) + "…"); //styleTag
    styleTag.id = createRandomId();
    styleTag.classList.add(SELECTOR_CSS_PROCESSED);
    model.add(model.getStyleTagData(styleTag));
    return styleTag;
}

const fetchTemplates = () => {
    return fetch(chrome.runtime.getURL(URL_TEMPLATE))
        .then(response => response.text())
        .then(response => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = response;
            let
                $templates = wrapper.querySelectorAll("template"),
                templates = {};
            Array.from($templates).forEach(function(template){
                templates[template.id] = template.innerHTML.trim();
            });
            model.templates = templates;
        })
}

const toggleCSSElement = (element, isChecked) => (
    element ?
        isChecked ?
            activateCSSElement(element) :
            deactivateCSSElement(element) :
        console.warn("Unable to find the CSS link element to de/activate")
)

chrome.extension.sendMessage({}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

            // ----------------------------------------------------------
            // This part of the script triggers when page is done loading
            console.log("readyState", window.location.href);
            // ----------------------------------------------------------

            let confirmLoadCSS = null;
          const hasVisualforceClasses = Boolean(window.document.querySelector('.apexp, .bPageBlock, .ext-chrome, .sfdcBody'));
          const hasPageContent = Boolean(window.document.body.innerHTML.trim().length); // test for empty page
            const isVisualforceFrame =
                RegExp(/vfFrameId_\d+/).test(window.name); // ||
                // RegExp(/^\/apex\/|\.apexp/).test(window.location.pathname); // test for frame with Visualforce page
            const isValidVisualforcePage =
                hasPageContent &&
                ((window != top && isVisualforceFrame) ||
                (window == top && hasVisualforceClasses ));

            document.body.addEventListener("change", e => {
                const clickedElement = event.target;
                const toggle = (checkbox, value) => {
                    if(value) {
                        if(checkbox.checked !== value) checkbox.click();
                    } else {
                        checkbox.click();
                    }
                    return checkbox;
                }

                if(clickedElement.classList.contains("category-check")) {
                    model.data
                        .filter(elementData => elementData.category == clickedElement.dataset.cssCategory)
                        .map(elementData => (
                            toggleCSSElement(
                                document.getElementById(elementData.id),
                                clickedElement.checked
                            )
                        ));
                    render();
                }

            if(clickedElement.classList.contains("list-item-check")) {
                    toggleCSSElement(
                        document.getElementById(clickedElement.dataset.cssNodeId),
                        clickedElement.checked
                    )
                    handleCategoryStateFromChildClick(clickedElement.dataset.cssCategory);
            }
            })

            document.body.addEventListener("click", e => {
                if(e.target.classList.contains("button-panel-close")) togglePanel();
                if(e.target.classList.contains("button-apply-lss")) applyLightningStylesheetsCss(window);
            })

            document.body.addEventListener("mousedown", e => {
                const target = e.target.classList.contains("slds-listbox__option") ? e.target : e.target.closest(".slds-listbox__option");
                if(target) {
                    handlePickListSelect(target);
                }
            })

            window.addEventListener("focusin", e => {
            if(e.target.id == "combobox-theme-select") {
                    document.querySelector(".slds-combobox").classList.add("slds-is-open");
                }
            })

            window.addEventListener("focusout", e => {
            if(e.target.id == "combobox-theme-select") {
                    document.querySelector(".slds-combobox").classList.remove("slds-is-open");
                }
            })

            chrome.runtime.sendMessage({ msg: "pageActionState", value: isValidVisualforcePage });

          if(isValidVisualforcePage) {
                fetchTemplates().then(() => {
                    console.log("Initializing on:", window.location.pathname);
                    const pollCSSLoaded = setInterval(getPageStyleSheets, 3000);
                    getPageStyleTags();
                    getPageStyleSheets();

                    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                        console.log(sender.tab ?
                            "from a content script:" + sender.tab.url :
                            "from the extension");
                        switch(request.msg) {
                            case "activateSlds4Vf":
                                applyLightningStylesheetsCss(window);
                                return sendResponse({ msg: request.msg, complete: true });
                            case "openPanel":
                                return togglePanel(true);
                            case "isLightningStylesheetsActive":
                                return sendResponse({ msg: request.msg, value: model.isLightningStylesheetsActive() });
                            case "isPanelOpen":
                                return sendResponse({ msg: request.msg, value: document.getElementById(WRAPPER_ID).classList.contains("is-open") });
                            default:
                                return { msg: `No Extension Message Handler for ${request}`}
                        }
                    });
                })
          }
        }
    }, 10);
});
