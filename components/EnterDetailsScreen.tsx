
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
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
    
    if (name && (email || phone) && agreedToTerms) {
      onSubmit({ name, email, phone });
    } else if (!agreedToTerms) {
      alert("Sila setuju dengan syarat dan ketentuan.");
    } else {
      alert("Please enter your name and at least one contact method (email or phone).");
    }
  };

  const inputClasses = "w-full text-4xl p-4 bg-white border-2 rounded-md focus:outline-none text-black";
  const activeInputClasses = "border-cyan-400 ring-2 ring-cyan-400";

  return (
    <BackgroundWrapper imagePath="./UI/04.gamescreen.png">
      <div className="flex flex-col items-center justify-center h-screen w-screen text-center p-0 scale-50 origin-center">
        <div className="w-full flex flex-col p-0 justify-center items-center" style={{ maxHeight: '850px', maxWidth: '112rem' }}>
            <div className="mb-1">
              <img
                src="./UI/RB_zero_UI_slice_text_03.png"
                alt="ENTER YOUR DETAILS"
                className="h-auto"
                style={{ maxHeight: '70px' }}
              />
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col w-full h-full justify-between space-y-1">
              <div className="space-y-4">
                <div>
                  <label className="text-2xl text-white mb-2 block">Nama</label>
                  <input
                    type="text"
                    value={name}
                    onFocus={() => setActiveInput('name')}
                    readOnly
                    className={`${inputClasses} ${activeInput === 'name' ? activeInputClasses : 'border-gray-600'}`}
                  />
                </div>
                <div>
                  <label className="text-2xl text-white mb-2 block">Alamat E-mel</label>
                  <input
                    type="email"
                    value={email}
                    onFocus={() => setActiveInput('email')}
                    readOnly
                    className={`${inputClasses} ${activeInput === 'email' ? activeInputClasses : 'border-gray-600'}`}
                  />
                </div>
                <div>
                  <label className="text-2xl text-white mb-2 block">Nombor Telefon</label>
                  <input
                    type="tel"
                    value={phone}
                    onFocus={() => setActiveInput('phone')}
                    readOnly
                    className={`${inputClasses} ${activeInput === 'phone' ? activeInputClasses : 'border-gray-600'}`}
                  />
                </div>
                <div className="flex items-center justify-start mb-4">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-6 h-6 mr-3"
                  />
                  <label htmlFor="terms" className="text-xl text-white">
                    saya setuju dengan syarat dan ketentuan
                  </label>
                </div>
                <button type="submit" className="w-full transform hover:scale-105 transition-transform duration-200 drop-shadow-lg mb-8" style={{ transform: 'scale(1.3)' }}>
                  <img
                    src="./UI/RB_zero_UI_slice_button_06.png"
                    alt="SUBMIT"
                    className="h-auto w-full"
                    style={{ maxHeight: '80px', objectFit: 'contain' }}
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