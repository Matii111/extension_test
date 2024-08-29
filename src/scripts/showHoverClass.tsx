async function ShowHoverClass(option2Checked: Boolean) {
    let [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        args: [option2Checked],
        func: (option2Checked) => {
            let tooltip = document.createElement('tooltip');
            // tooltip style
            tooltip.style.position = 'fixed';
            tooltip.style.backgroundColor = 'rgba(30, 30, 30)';
            tooltip.style.padding = '5px 10px';
            tooltip.style.border = '1px solid rgba(207, 207, 234)';
            tooltip.style.fontSize = '12px';
            tooltip.style.color = 'rgba(207, 207, 234)';
            tooltip.style.zIndex = '10000';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.display = 'none';
            document.body.appendChild(tooltip);
            document.addEventListener('mouseover', (event) => {
                const targetElement = event.target as HTMLElement;
                const getElementHierarchyWithClasses = (element: HTMLElement): string => {
                    let hierarchy = `${element.tagName.toLowerCase()}${element.className ? '.' + element.className.split(' ').join('.') : ''}`;
                    let count = 1;

                    while (element.parentElement && element.parentElement.tagName.toLowerCase() !== 'body' && count < 2) {
                        element = element.parentElement;
                        hierarchy = `${element.tagName.toLowerCase()}${element.className ? '.' + element.className.split(' ').join('.') : ''}>${hierarchy}`;
                        count++;
                    }
                    return hierarchy;
                };

                const hierarchy = getElementHierarchyWithClasses(targetElement);
                document.addEventListener('mousemove', (event) => {
                    tooltip.style.top = `${event.clientY + 10}px`;
                    tooltip.style.left = `${event.clientX + 10}px`;
                });
                document.addEventListener('mouseout', () => {
                    tooltip.style.display = 'none';
                });
                if (hierarchy) {
                    tooltip.style.display = 'block';
                    tooltip.textContent = `Clase: ${hierarchy}`;
                    if (option2Checked) {
                        document.addEventListener('click', function () {
                            navigator.clipboard.writeText(`${hierarchy}`);
                            tooltip.textContent = `Clase copiada`;
                        });
                    }
                } else {
                    tooltip.style.display = 'none';
                }
            });
        }
    });
};

export default ShowHoverClass;