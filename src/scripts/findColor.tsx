async function FindColor(
  className: string,
  color?: string,
  setOriginalColor?: React.Dispatch<React.SetStateAction<string>>
) {

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // color finder function
  const colorsFinded = await chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    args: [className],
    func: (className) => {
      const rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
      const colors: { [key: string]: string } = {};
      const colorProperties = [
        'color',
        'backgroundColor',
        'borderColor',
        'outlineColor',
        'textDecorationColor',
        'caretColor',
        'columnRuleColor'
      ];

      document.querySelectorAll(className).forEach((element) => {
        if (element instanceof HTMLElement) {
          const computedStyle = getComputedStyle(element);
          colorProperties.forEach((property, index) => {
            const key = `color${index + 1}`;
            if (!colors[key]) {
              colors[key] = computedStyle[property as keyof CSSStyleDeclaration] as string;
              const match = rgbRegex.exec(colors[key]);
              if (match) {
                const hexColor = "#" + ((1 << 24) + (parseInt(match[1]) << 16)
                  + (parseInt(match[2]) << 8) + parseInt(match[3])).toString(16).slice(1);
                colors[key] = hexColor;
              }
            }
          });
        }
      });
      return colors;
    }
  });

  const FindedColors = colorsFinded[0].result;

  localStorage.setItem('color', color ?? "");
  localStorage.setItem('originalColor', JSON.stringify(FindedColors));
  localStorage.setItem('classToSearch', className);

  if (setOriginalColor) {
    setOriginalColor(JSON.stringify(FindedColors) || "");
  }
}

export default FindColor;
