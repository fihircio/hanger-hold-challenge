import React from 'react';
import BackgroundWrapper from './BackgroundWrapper';

interface HowToScreenProps {
  onNext: () => void;
  onShowLeaderboard?: () => void;
}

const HowToScreen: React.FC<HowToScreenProps> = ({ onNext, onShowLeaderboard }) => {
  return (
    <BackgroundWrapper imagePath="./UI/02.howto.png">
      <div className="relative h-screen w-screen text-center p-8">
        <div className="flex flex-col items-center justify-center h-full">
         
        </div>

        {/* absolutely position the buttons near the lower third, centered */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-[12%] sm:bottom-[10%] md:bottom-[12%] flex gap-4">
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
          {onShowLeaderboard && (
            <button
              onClick={onShowLeaderboard}
              className="transform hover:scale-105 transition-transform duration-200 drop-shadow-lg"
            >
              <img
                src="./UI/RB_zero_UI_slice_button_05.png"
                alt="LEADERBOARD"
                className="h-auto"
                style={{ maxHeight: '80px' }}
              />
            </button>
          )}
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default HowToScreen;