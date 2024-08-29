async function ChangeText(className: string, color: string) {

    let [tab] = await chrome.tabs.query({ active: true }); // --> set focus nav tab

    chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        args: [className, color],
        func: (className, color) => {
            document.querySelectorAll(className).forEach((element) => {
                if (element instanceof HTMLElement) {
                    element.style.color = color;
                }
            });
        }
    });

    //save temp data
    localStorage.setItem('color', color);
    localStorage.setItem('classToSearch', className);

}

export default ChangeText;