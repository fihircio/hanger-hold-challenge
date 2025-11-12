import React from 'react';
import TimerDisplay from './TimerDisplay';
import { Prize } from '../services/prizeService';

interface GameOverScreenProps {
  finalTime: number;
  prize: Prize | null;
  onNext: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ finalTime, prize, onNext }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen text-center p-8">
      <h1 className="text-8xl font-bold text-white mb-8">GREAT JOB!</h1>
      <p className="text-5xl text-gray-400 mb-16">Your final time is:</p>
      
      <TimerDisplay time={finalTime} className="text-9xl text-cyan-400 mb-24" />

      {prize && (
        <div className="bg-yellow-400 text-gray-900 p-8 rounded-lg mb-16 text-center animate-bounce">
          <h2 className="text-6xl font-bold">{prize.name} Won!</h2>
          <p className="text-4xl mt-4">{prize.message}</p>
        </div>
      )}

      <button
        onClick={onNext}
        className="text-5xl font-bold bg-blue-500 hover:bg-blue-600 text-white py-8 px-24 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
      >
        VIEW LEADERBOARD
      </button>
    </div>
  );
};

export default GameOverScreen;
