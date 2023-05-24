const emit = (event, data = null, callback = () => {}) => {
    return new Promise((resolve, reject) => {
        const currentTab = {
            active: true,
            currentWindow: true,
        };

        const eventData = {
            from: 'popup',
            event,
            data,
        };

        chrome.tabs.query(currentTab, (tabs) => {
            const currentTabId = tabs[0].id;

            chrome.tabs.sendMessage(
                currentTabId,
                eventData,
                (responce) => {
                    resolve(responce);
                    callback(responce);
                },
            );
        });
    });
};