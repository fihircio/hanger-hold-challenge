
import React from 'react';
import BackgroundWrapper from './BackgroundWrapper';

interface InstructionsScreenProps {
  onStart: () => void;
}

const InstructionsScreen: React.FC<InstructionsScreenProps> = ({ onStart }) => {
  return (
    <BackgroundWrapper imagePath="./UI/01.instructionscreen.png">
      <div className="flex flex-col items-center justify-center h-screen w-screen text-center p-8">
        <div className="mt-32">
          <button
            onClick={onStart}
            className="transform hover:scale-105 transition-transform duration-200 drop-shadow-lg"
          >
            <img
              src="./UI/RB_zero_UI_slice_button_01.png"
              alt="I'M READY!"
              className="h-auto"
              style={{ maxHeight: '80px' }}
            />
          </button>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default InstructionsScreen;
