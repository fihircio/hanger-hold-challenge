import React from 'react';
import { Score } from '../types';
import TimerDisplay from './TimerDisplay';
import BackgroundWrapper from './BackgroundWrapper';

interface LeaderboardScreenProps {
  scores: Score[];
  currentPlayerId: string | null;
  onPlayAgain: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ scores, currentPlayerId, onPlayAgain }) => {

  return (
    <BackgroundWrapper imagePath="./UI/04.gamescreen.png">
      <div className="flex flex-col items-center justify-center h-screen w-screen text-center p-8">
        <div className="w-full max-w-5xl flex flex-col p-8" style={{maxHeight: '70vh'}}>
            <div className="mb-6 flex justify-center">
              <img
                src="./UI/RB_zero_UI_slice_text_10.png"
                alt="LEADERBOARD"
                className="h-auto"
                style={{ maxHeight: '80px' }}
              />
            </div>
            
            <div className="flex-grow overflow-y-auto">
              {scores.length > 0 ? (
                <ul className="space-y-3">
                  {scores.map((score, index) => (
                    <li
                      key={score.id}
                      className={`flex items-center justify-between p-4 rounded-lg text-3xl transition-all duration-500 ${
                        score.id === currentPlayerId ? 'bg-yellow-500 text-gray-900 scale-105 shadow-2xl' : 'bg-gray-700'
                      }`}
                    >
                      <div className="flex items-baseline">
                        <span className="font-bold w-12">{index + 1}.</span>
                        <span className="font-semibold">{score.name}</span>
                      </div>
                      <TimerDisplay time={score.time} className="text-4xl" />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-3xl text-center text-gray-400 py-12">
                  Be the first to set a score!
                </p>
              )}
            </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={onPlayAgain}
            className="transform hover:scale-105 transition-transform duration-200"
          >
            <img
              src="./UI/RB_zero_UI_slice_button_07.png"
              alt="PLAY AGAIN"
              className="h-auto"
              style={{ maxHeight: '80px' }}
            />
          </button>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default LeaderboardScreen;