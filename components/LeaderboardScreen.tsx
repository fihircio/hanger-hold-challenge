import React from 'react';
import { Score } from '../types';
import TimerDisplay from './TimerDisplay';

interface LeaderboardScreenProps {
  scores: Score[];
  currentPlayerId: string | null;
  onPlayAgain: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ scores, currentPlayerId, onPlayAgain }) => {

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen p-8">
      <h1 className="text-8xl font-bold text-cyan-400 mb-12">LEADERBOARD</h1>

      <div className="w-full max-w-5xl bg-gray-800 rounded-lg shadow-lg p-8 mb-12 overflow-y-auto" style={{maxHeight: '60vh'}}>
        {scores.length > 0 ? (
          <ul className="space-y-4">
            {scores.map((score, index) => (
              <li
                key={score.id}
                className={`flex items-center justify-between p-6 rounded-lg text-4xl transition-all duration-500 ${
                  score.id === currentPlayerId ? 'bg-yellow-500 text-gray-900 scale-105 shadow-2xl' : 'bg-gray-700'
                }`}
              >
                <div className="flex items-baseline">
                  <span className="font-bold w-16">{index + 1}.</span>
                  <span className="font-semibold">{score.name}</span>
                </div>
                <TimerDisplay time={score.time} className="text-5xl" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-4xl text-center text-gray-400 py-16">
            Be the first to set a score!
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onPlayAgain}
          className="text-5xl font-bold bg-green-500 hover:bg-green-600 text-white py-8 px-24 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
};

export default LeaderboardScreen;