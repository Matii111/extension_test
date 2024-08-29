async function ResetColors(className: string) {

    let [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        args: [className],
        func: (className) => {
            document.querySelectorAll(className).forEach((element) => {
                if (element instanceof HTMLElement) {
                    element.style.color = '';
                    element.style.backgroundColor = '';
                }
            });
        }
    });
    localStorage.removeItem('color');
    localStorage.removeItem('classToSearch');

}

export default ResetColors;