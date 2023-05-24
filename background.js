// Helpers
const emit = (event, data = null, callback = () => {}) => {
    const currentTab = {
        active: true,
        currentWindow: true,
    };

    const eventData = {
        from: 'background',
        event,
        data,
    };

    chrome.tabs.query(currentTab, (tabs) => {
        if(tabs.length) {
            const currentTabId = tabs[0].id;

            chrome.tabs.sendMessage(
                currentTabId,
                eventData,
                callback,
            );
        }
    });
};

// Methods
const onPopupClose = () => {
    emit('popupClose');
};

// Either tab or window change
chrome.windows.onFocusChanged.addListener(onPopupClose);

// On open port with background
chrome.extension.onConnect.addListener((port) => {
    port.onDisconnect.addListener(onPopupClose);
});

// On change tab
chrome.tabs.onActiveChanged.addListener(onPopupClose);