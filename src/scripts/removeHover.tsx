async function RemoveHovers() {
    let [tab] = await chrome.tabs.query({ active: true });

    if (tab.id !== undefined) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            args: [],
            func: () => {
                const tooltip = document.querySelector('tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            }
        });
    }
}

export default RemoveHovers;