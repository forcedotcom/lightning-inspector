
import WebExtensionsRuntime from "../../../src/devtoolsPanel/WebExtensionsRuntime.js";


const runtime = new WebExtensionsRuntime("LightningStylesheetsBrowserAction");

const disableActivationButton = () => {
    document.querySelector(".button-deactivate").setAttribute("disabled", true);
}

const disablePanelToggle = () => {
    document.querySelector(".button-panel-toggle").setAttribute("disabled", true);
}

const showVfPanel = () => {
    const vfPanel = document.querySelector('.visualforce-detected');
    vfPanel.classList.add('slds-show');
    vfPanel.classList.remove('slds-hide');

    const emptyMessage = document.querySelector('.visualforce-not-present');
    emptyMessage.classList.add('slds-hide');
    emptyMessage.classList.remove('slds-show');
}

const hideVfPanel = () => {
    const vfPanel = document.querySelector('.visualforce-detected');
    vfPanel.classList.remove('slds-show');
    vfPanel.classList.add('slds-hide');

    const emptyMessage = document.querySelector('.visualforce-not-present');
    emptyMessage.classList.remove('slds-hide');
    emptyMessage.classList.add('slds-show');
}

document.querySelector(".button-deactivate").addEventListener("click", () => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {msg: "activateSlds4Vf"}, response => {
            console.log(response);
            if(response.complete) disableActivationButton();
        });
    })
});

document.querySelector(".button-panel-toggle").addEventListener("click", () => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {msg: "openPanel"}, response => {
            console.log(response);
        });
    })
    disablePanelToggle();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.msg) {
        case "lightningStylesheetsActivated":
            if(request.value) disableActivationButton();
            break;
    }
});

chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    // Injects the Content Script if necessary.
    runtime.connect(function(){}, tabs[0].id);

    chrome.tabs.sendMessage(tabs[0].id, { msg: 'getLightningStylesheetState'}, response => {
        if (response === undefined) {
            return;
        }
        if (response.isValidVisualForcePage) {
            showVfPanel();
        } else {
            hideVfPanel();
        }
    });
    
    chrome.tabs.sendMessage(tabs[0].id, { msg: "isLightningStylesheetsActive" }, response => {
        //console.log("isLightningStylesheetsActive", response.value);
        if(response && response.value) disableActivationButton();
    });
    chrome.tabs.sendMessage(tabs[0].id, {msg: "isPanelOpen"}, response => {
        console.log(response);
        if(response && response.value) disablePanelToggle();
    });
})

