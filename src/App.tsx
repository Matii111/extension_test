import React, { useState, useEffect } from 'react';
import './App.css';
import RevertIcon from './icons/revert-icon.svg';
import BackgroundIcon from './icons/background-icon.svg';
import TextIcon from './icons/text-icon.svg';
import Dropdown from './icons/dropdown-arrow.svg';
import ChangeText from './scripts/changeText';
import ChangeBackground from './scripts/changeBackgrond';
import ResetColors from './scripts/resetColors';
import FindColor from './scripts/findColor';
import RemoveHover from './scripts/removeHover';
import ShowHoverClass from './scripts/showHoverClass';

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
    // temp files
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
      ShowHoverClass(option2Checked);
    } else {
      RemoveHover();
    }
    return () => {
      RemoveHover();
    };
  }, [option1Checked, option2Checked]);

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
                FindColor(e.target.value, color, setOriginalColor);
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
                  onClick={() => ResetColors(classToSearch)}
                ><img src={RevertIcon} />
                </button>
                <p>Limpiar</p>
              </div>
              <div>
                <button
                  onClick={() => ChangeText(classToSearch, color)}
                ><img src={TextIcon} />
                </button>
                <p>Texto</p>
              </div>
              <div>
                <button
                  onClick={() => ChangeBackground(classToSearch, color)}
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
                }}
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

// TODO: Pasar código estilo de hover a archivo CSS
// TODO: Refactorizar

export default App;
