
import React, { useState, useCallback } from 'react';
import VirtualKeyboard from './VirtualKeyboard';

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
    <div className="flex flex-col h-screen w-screen p-8">
      <h1 className="text-6xl font-bold text-center mb-8">ENTER YOUR DETAILS</h1>
      <p className="text-3xl text-gray-400 text-center mb-8">Get your name on the leaderboard!</p>
      
      <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6">
        <div>
          <label className="text-3xl text-gray-300 mb-2 block">Name</label>
          <input
            type="text"
            value={name}
            onFocus={() => setActiveInput('name')}
            readOnly
            className={`${inputClasses} ${activeInput === 'name' ? activeInputClasses : 'border-gray-600'}`}
          />
        </div>
        <div>
          <label className="text-3xl text-gray-300 mb-2 block">Email</label>
          <input
            type="email"
            value={email}
            onFocus={() => setActiveInput('email')}
            readOnly
            className={`${inputClasses} ${activeInput === 'email' ? activeInputClasses : 'border-gray-600'}`}
          />
        </div>
        <div>
          <label className="text-3xl text-gray-300 mb-2 block">Phone</label>
          <input
            type="tel"
            value={phone}
            onFocus={() => setActiveInput('phone')}
            readOnly
            className={`${inputClasses} ${activeInput === 'phone' ? activeInputClasses : 'border-gray-600'}`}
          />
        </div>
        <button type="submit" className="w-full text-4xl font-bold bg-green-500 hover:bg-green-600 text-white py-6 rounded-lg shadow-lg">
          SUBMIT
        </button>
      </form>
      
      <div className="flex-grow flex items-end mt-8">
        <VirtualKeyboard
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onEnter={handleSubmit}
        />
      </div>
    </div>
  );
};

export default EnterDetailsScreen;