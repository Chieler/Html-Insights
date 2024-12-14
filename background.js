chrome.commands.onCommand.addListener((command) => {
  if (command === "trigger_getID") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "getID" }, (response) => {
              console.log("Response from content script:", response);
              chrome.runtime.sendMessage({ action: "displayElementInfo", data: response });
          });
      });
  }
});
let domData = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background Received Message:", message.action);

    if (message.action === "storeDOM") {
        console.log("Storing DOM Data", message.data.length);
        domData = message.data || [];
        sendResponse({ 
            status: "DOM stored successfully", 
            dataLength: domData.length 
        });
    }

    if (message.action === "getDOM") {
        console.log("Retrieving DOM Data", domData.length);
        console.log(domData);
        sendResponse({ 
            domTree: domData,
            status: "DOM data retrieved"
        });
    }

    return true;  // Allow async responses
});
