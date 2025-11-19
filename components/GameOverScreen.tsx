import React from 'react';
import TimerDisplay from './TimerDisplay';
import { Prize } from '../services/prizeService';
import BackgroundWrapper from './BackgroundWrapper';

interface GameOverScreenProps {
  finalTime: number;
  prize: Prize | null;
  onNext: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ finalTime, prize, onNext }) => {
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
            <h1 className="text-6xl font-bold text-white mb-6">MANTAP !</h1>
            <p className="text-3xl text-gray-300 mb-12">Your final time is:</p>
            
            <TimerDisplay time={finalTime} className="text-7xl text-cyan-400 mb-12" />

            {prize && (
              <div className="bg-yellow-400 text-gray-900 p-6 rounded-lg mb-12 text-center animate-bounce">
                <h2 className="text-4xl font-bold">{prize.name} Won!</h2>
                <p className="text-2xl mt-2">{prize.message}</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onNext}
          className="text-4xl font-bold bg-blue-500 hover:bg-blue-600 text-white py-6 px-20 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200 mt-8"
        >
          VIEW LEADERBOARD
        </button>
      </div>
    </BackgroundWrapper>
  );
};

export default GameOverScreen;
