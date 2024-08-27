import { useState, useEffect } from 'react';
import './App.css';
import RevertIcon from './icons/revert-icon.svg';
import BackgroundIcon from './icons/background-icon.svg';
import TextIcon from './icons/text-icon.svg';
import Dropdown from './icons/dropdown-arrow.svg';

const handleCheckboxChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  setOption: React.Dispatch<React.SetStateAction<boolean>>,
  storageKey: string
) => {
  const isChecked = event.target.checked;
  setOption(isChecked);
  localStorage.setItem(storageKey, JSON.stringify(isChecked));
};


function App() {
  const [color, setColor] = useState('');
  const [classToSearch, setClassToSearch] = useState('');
  const [originalColor, setOriginalColor] = useState('');
  const [hover, setHover] = useState(false);
  const [code, setCode] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [option1Checked, setIsOption1Checked] = useState(false);
  const [option2Checked, setIsOption2Checked] = useState(false);

  useEffect(() => {
    //recover temp data
    const storedColor = localStorage.getItem('color');
    const storedClassToSearch = localStorage.getItem('classToSearch');
    const storedOriginalColor = localStorage.getItem('originalColor');

    const storedOption1 = localStorage.getItem('option1Stored');
    const storedOption2 = localStorage.getItem('option2Stored');

    if (storedColor) {
      setColor(storedColor);
    }
    if (storedClassToSearch) {
      setClassToSearch(storedClassToSearch);
    }
    if (storedOriginalColor) {
      setOriginalColor(storedOriginalColor);
    }
    if (storedOption1) {
      setIsOption1Checked(JSON.parse(storedOption1));
    }
    if (storedOption2) {
      setIsOption2Checked(JSON.parse(storedOption2));
    }
    if (option1Checked) {
      showHoverClasses(option2Checked);
    } else {
      removeHoverClasses();
    }
    return () => {
      removeHoverClasses();
    };
  }, [option1Checked, option2Checked]);

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

  //change background color
  const changeBackground = async (className: string, color: string): Promise<void> => {
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

  //restore original color
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
            }
          }
        });
        return colorFinded;
      }
    });
    const originalColor = result[0].result ?? "";

    //rgb to hex 
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

  //show css classes at hover 
  const showHoverClasses = async (option2Checked: Boolean) => {
    let [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      args: [option2Checked],
      func: (option2Checked) => {
        let tooltip = document.createElement('tooltip');
        //tooltip styles
        tooltip.style.position = 'fixed';
        tooltip.style.backgroundColor = 'rgba(30, 30, 30)';
        tooltip.style.padding = '5px 10px';
        tooltip.style.border = '1px solid rgba(207, 207, 234)';
        tooltip.style.fontSize = '12px';
        tooltip.style.color = 'rgba(207, 207, 234)'
        tooltip.style.zIndex = '10000';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.display = 'none';

        document.body.appendChild(tooltip);
        document.addEventListener('mouseover', (event) => {
          const targetElement = event.target as HTMLElement;
          //shows last 2 component classes to edit style
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
            //function to copy class
            {
              option2Checked ? (
                document.addEventListener('click', function () {
                  navigator.clipboard.writeText(`${hierarchy}`);
                  tooltip.textContent = `Clase copiada`;
                })
              ) : null
            }

          } else {
            tooltip.style.display = 'none';
          }
        });

      }
    });
  };

  const removeHoverClasses = async () => {
    let [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      args: [],
      func: () => {
        const tooltip = document.querySelector('tooltip');
        if (tooltip) {
          tooltip.remove();
        }
      }
    });
  };

  return (

    <>
      <div className='content-container'>
        <h1 className='extension-title'>Color Tester</h1>
        <div className='extension-container'>
          <input
            className='text-input'
            type='text'
            placeholder='Ingresar clase a buscar'
            value={classToSearch}
            onChange={
              (e) => {
                setClassToSearch(e.target.value);
                findColor(e.target.value);
              }
            }
          />
          <div className='test-options'>
            <div className='color-selector'>
              <div className='color-selector-title'>
                <hr />
                <p>Seleccionar color</p>
                <hr />
              </div>
              <input
                type="color"
                onChange={(e) => setColor(e.currentTarget.value)}
                value={color}
              />
            </div>
            <div className='color-modificator'>
              <div>
                <button
                  onClick={() => resetColors(classToSearch)}
                ><img src={RevertIcon} />
                </button>
                <p>Limpiar</p>
              </div>
              <div>
                <button
                  onClick={() => changeText(classToSearch, color)}
                ><img src={TextIcon} />
                </button>
                <p>Texto</p>
              </div>
              <div>
                <button
                  onClick={() => changeBackground(classToSearch, color)}
                ><img src={BackgroundIcon} />
                </button>
                <p>Fondo</p>
              </div>
              <div>
                <button
                  onClick={() => setDropdown((prevState) => !prevState)}
                ><img
                    src={Dropdown}
                    className={`dropdown-button ${dropdown ? 'dropdown-active' : ''}`} />
                </button>
                <div className={`dropdown-content-hidden  ${dropdown ? 'dropdown-content-active' : ''}`}>

                  <div className='options'>
                    <div className='options-boxes'>
                      <div>
                        <p>
                          Hover de clases
                        </p>
                      </div>
                      <div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={option1Checked}
                            onChange={(e) => handleCheckboxChange(e, setIsOption1Checked, 'option1Stored')}
                          />
                          <span className="slider" />
                        </label>

                      </div>
                    </div>
                    <hr />
                    <div className='options-boxes'>
                      <div>
                        <p>
                          Copiar clase al clickear
                        </p>
                      </div>
                      <div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={option2Checked}
                            onChange={(e) => handleCheckboxChange(e, setIsOption2Checked, 'option2Stored')}
                          />
                          <span className="slider" />
                        </label>
                      </div>
                    </div>
                    <hr />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='originalColor-container'>
            <div className='originalColorTitle'>
              <hr />
              <p>Color Original</p>
              <hr />
            </div>
            <div>
              <div
                className='originalColor'
                style={{ backgroundColor: originalColor }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={() => {
                  setCode(true);
                  navigator.clipboard.writeText(originalColor);
                  setTimeout(() => setCode(false), 2000);
                }
                }
              />
              <p className={`copy-color-code ${hover ? 'hover' : ''}`}>Copiar código de color</p>
              <p className={`copied-color-code ${code ? 'active' : ''}`}>Código copiado</p>
              <h1>{originalColor || '#FFFFFF'}</h1>
            </div>
          </div>

        </div>
      </div >
    </>
  );
}

// TODO: Pasar codigo estilo de hover a archivo css
// TODO: Refactorizar

export default App;
