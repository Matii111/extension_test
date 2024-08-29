async function FindColor(
    className: string, 
    color?: string, 
    setOriginalColor?: React.Dispatch<React.SetStateAction<string>>
  ) {

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    // color finder function
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      args: [className],
      func: (className) => {
        let colorFinded: string | null = null;
        document.querySelectorAll(className).forEach((element) => {
          let computedStyle = getComputedStyle(element);
          if (element instanceof HTMLElement) {
            if (colorFinded === null) {
              colorFinded = computedStyle.color;
            } else {
              colorFinded = computedStyle.backgroundColor;
            }
          }
        });
        return colorFinded;
      }
    });
  
    // rgb to hex converter
    const originalColor = result[0].result ?? "";
    const rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
    const match = rgbRegex.exec(originalColor);
  
    let hexColor = "";
    if (match) {
      hexColor = "#" + ((1 << 24) + (parseInt(match[1]) << 16)
        + (parseInt(match[2]) << 8) + parseInt(match[3])).toString(16).slice(1);
    }
  
    localStorage.setItem('color', color ?? "");
    localStorage.setItem('originalColor', hexColor);
    localStorage.setItem('classToSearch', className);
  
    if (setOriginalColor) {
      setOriginalColor(hexColor); 
    }
  }
  
  export default FindColor;
  