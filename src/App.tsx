import { useState, useEffect } from 'react';
import './App.css';
import RevertIcon from './icons/revert-icon.svg';
import BackgroundIcon from './icons/background-icon.svg';
import TextIcon from './icons/text-icon.svg';

function App() {
  const [color, setColor] = useState('');
  const [classToSearch, setClassToSearch] = useState('');
  const [originalColor, setOriginalColor] = useState('');
  const [hover, setHover] = useState(false);
  const [code, setCode] = useState(false);


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
  const showHoverClasses = async () => {
    let [tab] = await chrome.tabs.query({ active: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      args: [],
      func: () => {
        let tooltip = document.createElement('div');
        tooltip.style.position = 'fixed';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '5px 10px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.zIndex = '10000';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);

        document.addEventListener('mouseover', (event) => {

          const targetElement = event.target as HTMLElement;
          const classes = targetElement.className;

          document.addEventListener('mousemove', (event) => {
            tooltip.style.top = `${event.clientY + 10}px`;
            tooltip.style.left = `${event.clientX + 10}px`;
          });

          document.addEventListener('mouseout', () => {
            tooltip.style.display = 'none';
          });


          if (classes) {
            tooltip.style.display = 'block';
            tooltip.textContent = `Clases: ${classes}`;
          } else {
            tooltip.style.display = 'none';
          }

        })
      }
    });


  };

  showHoverClasses();

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
      </div>
    </>
  );
}

// TODO: Pasar codigo estilo de hover a archivo css
// TODO: Crear funcion para copiar nombre de la clase
// TODO: Crear funcion para mostrar colores de root
// TODO: Crear funcion para mostrar posibles clases,
//       es decir, que especifique mejor que clase
//       se esta seleccionando
// TODO: Refactorizar

export default App;
