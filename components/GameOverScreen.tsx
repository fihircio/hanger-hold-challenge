import React, { useState, useEffect } from 'react';
import TimerDisplay from './TimerDisplay';
import { Prize } from '../services/prizeService';
import BackgroundWrapper from './BackgroundWrapper';
import MaintenancePanel from './MaintenancePanel';

interface GameOverScreenProps {
  finalTime: number;
  prize: Prize | null;
  onNext: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ finalTime, prize, onNext }) => {
  const [showMaintenance, setShowMaintenance] = useState<boolean>(false);

  // Keyboard activation: Ctrl+M opens maintenance, Esc closes it
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (e.ctrlKey && key === 'm') {
        setShowMaintenance(true);
      } else if (key === 'escape') {
        setShowMaintenance(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  return (
    <BackgroundWrapper imagePath="./UI/04.gamescreen.png">
      <div className="flex flex-col items-center justify-center h-screen w-screen text-center p-8">
        <div className="relative w-full max-w-4xl">
          <img
            src="./UI/04.gamescreen_bg.png"
            alt="Panel Background"
            className="w-full h-auto"
            style={{ maxHeight: '70vh' }}
          />
          <div className="absolute inset-0 flex flex-col p-12 justify-center items-center">
            <div className="mb-6 flex justify-center">
              <img
                src="./UI/RB_zero_UI_slice_text_08.png"
                alt="MANTAP !"
                className="h-auto"
                style={{ maxHeight: '80px' }}
              />
            </div>
            
            <div className="mb-12 flex justify-center">
              <img
                src="./UI/RB_zero_UI_slice_text_09.png"
                alt="Your final time is:"
                className="h-auto"
                style={{ maxHeight: '60px' }}
              />
            </div>
            
            <TimerDisplay time={finalTime} className="text-7xl text-cyan-400 mb-12" />

            {prize && (
              <div className="bg-yellow-400 text-gray-900 p-6 rounded-lg mb-12 text-center animate-bounce">
                <h2 className="text-4xl font-bold">{prize.name} Won!</h2>
                <p className="text-2xl mt-2">{prize.message}</p>
              </div>
            )}

            <button
              onClick={onNext}
              className="transform hover:scale-105 transition-transform duration-200"
            >
              <img
                src="./UI/RB_zero_UI_slice_button_05.png"
                alt="VIEW LEADERBOARD"
                className="h-auto"
                style={{ maxHeight: '80px' }}
              />
            </button>

            <MaintenancePanel visible={showMaintenance} onClose={() => setShowMaintenance(false)} />
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default GameOverScreen;
