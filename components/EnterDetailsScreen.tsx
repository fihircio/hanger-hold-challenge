
import React, { useState, useCallback } from 'react';
import VirtualKeyboard from './VirtualKeyboard';
import BackgroundWrapper from './BackgroundWrapper';

interface EnterDetailsScreenProps {
  onSubmit: (details: { name: string; email: string; phone: string }) => void;
}

const EnterDetailsScreen: React.FC<EnterDetailsScreenProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [activeInput, setActiveInput] = useState<'name' | 'email' | 'phone'>('name');

  const setters = {
    name: setName,
    email: setEmail,
    phone: setPhone,
  };

  const values = { name, email, phone };

  const handleKeyPress = useCallback((key: string) => {
    setters[activeInput](prev => prev + key);
  }, [activeInput, setters]);

  const handleBackspace = useCallback(() => {
    setters[activeInput](prev => prev.slice(0, -1));
  }, [activeInput, setters]);

  const handleSubmit = (e?: React.FormEvent) => {
    // This function can be called from the form's onSubmit (with a FormEvent)
    // or from the virtual keyboard's onEnter (without a proper event).
    // We check for preventDefault to avoid errors.
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    
    if (name && (email || phone)) {
      onSubmit({ name, email, phone });
    } else {
      alert("Please enter your name and at least one contact method (email or phone).");
    }
  };

  const inputClasses = "w-full text-4xl p-4 bg-gray-700 border-2 rounded-md focus:outline-none";
  const activeInputClasses = "border-cyan-400 ring-2 ring-cyan-400";

  return (
    <BackgroundWrapper imagePath="./UI/04.gamescreen.png">
      <div className="flex flex-col items-center justify-center h-screen w-screen text-center p-8">
        <div className="w-full max-w-4xl flex flex-col px-6 py-4 justify-center items-center" style={{ maxHeight: '850px' }}>
            <div className="mb-1">
              <img
                src="./UI/RB_zero_UI_slice_text_03.png"
                alt="ENTER YOUR DETAILS"
                className="h-auto"
                style={{ maxHeight: '70px' }}
              />
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col w-full h-full justify-between space-y-1 transform scale-[0.9] origin-top">
              <div className="space-y-4">
                <div>
                  <label className="text-2xl text-gray-300 mb-2 block">Name</label>
                  <input
                    type="text"
                    value={name}
                    onFocus={() => setActiveInput('name')}
                    readOnly
                    className={`${inputClasses} ${activeInput === 'name' ? activeInputClasses : 'border-gray-600'}`}
                  />
                </div>
                <div>
                  <label className="text-2xl text-gray-300 mb-2 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onFocus={() => setActiveInput('email')}
                    readOnly
                    className={`${inputClasses} ${activeInput === 'email' ? activeInputClasses : 'border-gray-600'}`}
                  />
                </div>
                <div>
                  <label className="text-2xl text-gray-300 mb-2 block">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onFocus={() => setActiveInput('phone')}
                    readOnly
                    className={`${inputClasses} ${activeInput === 'phone' ? activeInputClasses : 'border-gray-600'}`}
                  />
                </div>
                <button type="submit" className="w-full transform hover:scale-105 transition-transform duration-200 drop-shadow-lg">
                  <img
                    src="./UI/RB_zero_UI_slice_button_06.png"
                    alt="SUBMIT"
                    className="h-auto mx-auto"
                    style={{ maxHeight: '80px' }}
                  />
                </button>
              </div>
              
              <div className="mt-auto">
                <VirtualKeyboard
                  onKeyPress={handleKeyPress}
                  onBackspace={handleBackspace}
                  onEnter={handleSubmit}
                />
              </div>
            </form>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default EnterDetailsScreen;