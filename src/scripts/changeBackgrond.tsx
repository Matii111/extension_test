async function ChangeBackground(className: string, color: string) {

    let [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        args: [className, color],
        func: (className, color) => {
            document.querySelectorAll(className).forEach((element) => {
                if (element instanceof HTMLElement) {
                    element.style.backgroundColor = color;
                }
            });
        }
    });
    localStorage.setItem('color', color);
    localStorage.setItem('classToSearch', className);
}

export default ChangeBackground;