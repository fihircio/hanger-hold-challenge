
import React, { useState } from 'react';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onEnter: (e: any) => void;
}

const Key: React.FC<{
  value: string;
  display?: string;
  onClick: (value: string) => void;
  className?: string;
}> = ({ value, display, onClick, className = '' }) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    className={`flex items-center justify-center h-20 rounded-lg text-3xl font-semibold transition-colors duration-150 text-black ${className}`}
  >
    {display || value}
  </button>
);

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ onKeyPress, onBackspace, onEnter }) => {
  const [shift, setShift] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [layout, setLayout] = useState<'alpha' | 'numeric'>('alpha');

  const isUpperCase = shift || capsLock;

  const alphaKeys = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];

  const numericKeys = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
    ['.', ',', '?', '!', "'"],
  ];
  
  const handleKeyPress = (key: string) => {
    onKeyPress(isUpperCase ? key.toUpperCase() : key);
    if (shift) setShift(false);
  };

  const handleShift = () => {
    setShift(!shift);
  };
  
  const handleCapsLock = () => {
    setCapsLock(!capsLock);
    setShift(false);
  };

  const renderAlphaLayout = () => (
    <div className="space-y-2">
      {alphaKeys.map((row, rowIndex) => (
        <div key={rowIndex} className={`grid gap-2 ${rowIndex === 1 ? 'px-6': ''} ${rowIndex === 2 ? 'px-16': ''}`} style={{gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`}}>
          {row.map(key => <Key key={key} value={key} display={isUpperCase ? key.toUpperCase() : key} onClick={handleKeyPress} className="bg-white hover:bg-gray-200"/>)}
        </div>
      ))}
    </div>
  );

  const renderNumericLayout = () => (
     <div className="space-y-2">
      {numericKeys.map((row, rowIndex) => (
        <div key={rowIndex} className={`grid gap-2 ${rowIndex === 2 ? 'px-24': ''}`} style={{gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`}}>
          {row.map(key => <Key key={key} value={key} onClick={onKeyPress} className="bg-white hover:bg-gray-200"/>)}
        </div>
      ))}
    </div>
  );
  
  return (
    <div className="w-full bg-white p-2 rounded-lg shadow-lg mt-8">
      {layout === 'alpha' ? renderAlphaLayout() : renderNumericLayout()}
      <div className="grid grid-cols-10 gap-2 mt-2">
        <Key value="caps" display={capsLock ? 'CAPS' : 'caps'} onClick={handleCapsLock} className="col-span-2 bg-white hover:bg-gray-200 border border-gray-300"/>
        <Key value="shift" display={shift ? 'SHIFT' : 'shift'} onClick={handleShift} className="col-span-2 bg-white hover:bg-gray-200 border border-gray-300"/>
        <Key value=" " display="space" onClick={() => onKeyPress(' ')} className="col-span-6 bg-white hover:bg-gray-200 border border-gray-300"/>
      </div>
      <div className="grid grid-cols-10 gap-2 mt-2">
        <Key value="layout" display={layout === 'alpha' ? '123' : 'ABC'} onClick={() => setLayout(l => l === 'alpha' ? 'numeric' : 'alpha')} className="col-span-2 bg-white hover:bg-gray-200 border border-gray-300"/>
        <Key value="backspace" display="⌫" onClick={onBackspace} className="col-span-4 bg-white hover:bg-gray-200 border border-gray-300"/>
        <Key value="enter" display="enter" onClick={onEnter} className="col-span-4 bg-white hover:bg-gray-200 border border-gray-300"/>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
