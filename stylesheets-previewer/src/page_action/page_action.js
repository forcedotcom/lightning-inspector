const disableActivationButton = () => {
	document.querySelector(".button-deactivate").setAttribute("disabled", true);
}

const disablePanelToggle = () => {
	document.querySelector(".button-panel-toggle").setAttribute("disabled", true);
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
	chrome.tabs.sendMessage(tabs[0].id, {msg: "isLightningStylesheetsActive"}, response => {
		console.log(response);
		if(response.value) disableActivationButton();
	});
	chrome.tabs.sendMessage(tabs[0].id, {msg: "isPanelOpen"}, response => {
		console.log(response);
		if(response.value) disablePanelToggle();
	});
})
