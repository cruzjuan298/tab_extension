/*will use to make functionality of the opening and closing of tabs 
and editing the window using chrome API

FOR LATER USE
*/

urls = []

chrome.runtime.onMessage.addListener((message) => {
    console.log("message received")
})

chrome.runtime.onInstalled.addListener(({reason}) => {
    if (reason === 'install') {
      chrome.tabs.create({
        url: "onboard.html"
      });
    }
  });

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url){
        console.log("Tab url has changed.")
    }
})

chrome.windows.create({
    url: urls,
    type: "normal",
    focused: true,
    state: "maximized"
}, (window) => {
    console.log("New window Created:", window)
})

/*
Closing a specified window
chrome.windows.remove(windowId, () => {
    console.log("Window Removed")
    })

*/

/*
sending message:
chrome.runtime.sendMessage({action: "greet", message: " data or array"0,)
*/

// combingin method can also be helpful, maybe do not recomemnd for larger sessions.