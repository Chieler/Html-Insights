// Global variable to track the last active tab for element selection
let lastActiveTab = null;

chrome.commands.onCommand.addListener((command) => {
    if (command === "trigger_getID") {
        // Query the active tab in the current window
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                // Store the last active tab
                lastActiveTab = tabs[0];

                // Send message to the content script of the active tab
                chrome.tabs.sendMessage(tabs[0].id, { action: "getID" }, (response) => {
                    console.log("Response from content script:", response);
                    
                    // Broadcast the response to all extension pages
                    chrome.runtime.sendMessage({ 
                        action: "displayElementInfo", 
                        data: response,
                        tabId: tabs[0].id  // Include tab ID for context
                    });
                });
            }
        });
    }
});
let domData = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background Received Message:", message.action);

    switch(message.action) {
        case "storeDOM":
            console.log("Storing DOM Data", message.data.length);
            domData = message.data || [];
            sendResponse({
                status: "DOM stored successfully",
                dataLength: domData.length
            });
            break;

        case "getDOM":
            console.log("Retrieving DOM Data", domData.length);
            sendResponse({
                domTree: domData,
                status: "DOM data retrieved"
            });
            break;
    }

    return true; // Allow async responses
});