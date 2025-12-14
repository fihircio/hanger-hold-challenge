
import React from 'react';
import BackgroundWrapper from './BackgroundWrapper';

interface InstructionsScreenProps {
  onStart: () => void;
}

const InstructionsScreen: React.FC<InstructionsScreenProps> = ({ onStart }) => {
  return (
    <BackgroundWrapper imagePath="./UI/01.instructionscreen.png">
      <div className="relative h-screen w-screen text-center p-8">
        <div className="flex flex-col items-center justify-center h-full">
          {/* keep center area available if needed */}
        </div>

        {/* absolutely position start button near the lower third, centered */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-8 sm:bottom-4 md:bottom-8">
          <button
            onClick={onStart}
            className="transform hover:scale-105 transition-transform duration-200 drop-shadow-lg"
          >
            <img
              src="./UI/RB_zero_UI_slice_button_01.png"
              alt="I'M READY!"
              className="h-auto"
              style={{ maxHeight: '60px' }}
            />
          </button>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default InstructionsScreen;
