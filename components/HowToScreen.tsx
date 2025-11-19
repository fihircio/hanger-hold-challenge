import React from 'react';
import BackgroundWrapper from './BackgroundWrapper';

interface HowToScreenProps {
  onNext: () => void;
}

const HowToScreen: React.FC<HowToScreenProps> = ({ onNext }) => {
  return (
    <BackgroundWrapper imagePath="./UI/02.howto.png">
      <div className="flex flex-col items-center justify-center h-screen w-screen text-center p-8">
        <div className="mt-32">
          <button
            onClick={onNext}
            className="text-5xl font-bold bg-green-500 hover:bg-green-600 text-white py-8 px-24 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200 drop-shadow-lg"
          >
            GOT IT!
          </button>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default HowToScreen;