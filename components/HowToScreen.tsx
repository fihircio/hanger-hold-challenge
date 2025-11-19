import React from 'react';
import BackgroundWrapper from './BackgroundWrapper';

interface HowToScreenProps {
  onNext: () => void;
}

const HowToScreen: React.FC<HowToScreenProps> = ({ onNext }) => {
  return (
    <BackgroundWrapper imagePath="./UI/02.howto.png">
      <div className="flex flex-col items-center justify-center h-screen w-screen text-center p-8">
        <div className="mt-32 space-y-4">
          <div className="flex justify-center">
            <img
              src="./UI/RB_zero_UI_slice_text_01.png"
              alt="Challenge Text"
              className="h-auto"
              style={{ maxHeight: '60px' }}
            />
          </div>
          
          <div className="flex justify-center">
            <img
              src="./UI/RB_zero_UI_slice_text_02.png"
              alt="How To Text"
              className="h-auto"
              style={{ maxHeight: '60px' }}
            />
          </div>
          
          <button
            onClick={onNext}
            className="transform hover:scale-105 transition-transform duration-200 drop-shadow-lg"
          >
            <img
              src="./UI/RB_zero_UI_slice_button_02.png"
              alt="GOT IT!"
              className="h-auto"
              style={{ maxHeight: '80px' }}
            />
          </button>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default HowToScreen;