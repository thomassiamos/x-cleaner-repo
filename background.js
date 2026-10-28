// Clicking the extension's toolbar icon reopens the panel on the current X tab.
chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  chrome.tabs.sendMessage(tab.id, { type: "x-cleaner-open" }).catch(() => {});
});
