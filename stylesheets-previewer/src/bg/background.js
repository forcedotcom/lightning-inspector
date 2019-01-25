//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  (request, sender, sendResponse)=> {
    switch (request.msg) {
      case "pageActionState":
        if(request.value) {
          chrome.pageAction.show(sender.tab.id);
          console.log("Activating extension on", sender.tab.url);
        }
        break;
      default:
        sendResponse();
    }
  }
);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    console.log('Tab %d got new URL: %s', tabId, changeInfo.url);
    chrome.pageAction.hide(tabId);
  }
});
