
import React from 'react';

interface InstructionsScreenProps {
  onStart: () => void;
}

const InstructionsScreen: React.FC<InstructionsScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 text-center p-8">
      <h1 className="text-8xl font-bold text-cyan-400 mb-8 animate-pulse">HANGER HOLD</h1>
      <h2 className="text-6xl font-light text-white mb-16">CHALLENGE</h2>
      
      <p className="text-5xl max-w-4xl mb-24 leading-tight">
        PRESS AND HOLD THE BUTTON ON SCREEN
        <br/>
        FOR AS LONG AS YOU CAN!
      </p>

      <button
        onClick={onStart}
        className="text-5xl font-bold bg-green-500 hover:bg-green-600 text-white py-8 px-24 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
      >
        I'M READY!
      </button>
    </div>
  );
};

export default InstructionsScreen;
