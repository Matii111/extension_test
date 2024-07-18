import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [color, setColor] = useState('');
  const [classToSearch, setClassToSearch] = useState('');
  const [originalColor, setOriginalColor] = useState('');

  useEffect(() => {
    //recover temp data
    const storedColor = localStorage.getItem('color');
    const storedClassToSearch = localStorage.getItem('classToSearch');
    const storedOriginalColor = localStorage.getItem('originalColor');

    if (storedColor) {
      setColor(storedColor);
    }
    if (storedClassToSearch) {
      setClassToSearch(storedClassToSearch);
    }
    if (storedOriginalColor) {
      setOriginalColor(storedOriginalColor);
    }
  }, []);

  // change text color
  const changeText = async (className: string, color: string): Promise<void> => {

    let [tab] = await chrome.tabs.query({ active: true }); // --> set focus nav tab

    //start script
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
    //end script

    //save temp data
    localStorage.setItem('color', color);
    localStorage.setItem('classToSearch', className);
  }

  // change background color
  const changeBackground = async (className: string, color: string): Promise<void> => {
    let [tab] = await chrome.tabs.query({ active: true }); // --> set focus nav tab
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

  // restore original color
  const resetColors = async (className: string): Promise<void> => {
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

  // find class color
  const findColor = async (className: string): Promise<void> => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
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
              console.log("colorFinded tiene un valor");
            }
          }
        });
        console.log(colorFinded)
        return colorFinded;
      }
    });
    const originalColor = result[0].result ?? "";

    // rgb to hex 
    const rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
    const match = rgbRegex.exec(originalColor);
    let hexColor = "";
    if (match) {
      hexColor = "#" + ((1 << 24) + (parseInt(match[1]) << 16)
        + (parseInt(match[2]) << 8) + parseInt(match[3])).toString(16).slice(1);
    }

    localStorage.setItem('color', color);
    localStorage.setItem('originalColor', hexColor);
    localStorage.setItem('classToSearch', className);

    setOriginalColor(hexColor);

  }

  return (
    <>
      <div className='content-container'>
        <h1 className='extension-title'>Color tester</h1>
        <div className='extension-container'>
          <h1>
            <input
              type='text'
              placeholder='classToSearch'
              value={classToSearch}
              onChange={
                (e) => {
                  setClassToSearch(e.target.value);
                  findColor(e.target.value);
                }
              }
            />
          </h1>
          <input
            type="color"
            onChange={(e) => setColor(e.currentTarget.value)}
            value={color}
          />
          <button onClick={() => changeText(classToSearch, color)}>Change text</button>
          <button onClick={() => changeBackground(classToSearch, color)}>Change background</button>
          <button onClick={() => resetColors(classToSearch)}>Revertir</button>
          <div className='originalColor' style={{ backgroundColor: originalColor }} />
          <p>{originalColor || '#123456'}</p>
        </div>
      </div>
    </>
  );
}

export default App;
