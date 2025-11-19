import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Score } from './types';
import InstructionsScreen from './components/InstructionsScreen';
import HowToScreen from './components/HowToScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import EnterDetailsScreen from './components/EnterDetailsScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import FullScreenButton from './components/FullScreenButton';
import * as dataService from './services/dataService';
import * as prizeService from './services/prizeService';
import { arduinoSensorService } from './services/arduinoSensorService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.INSTRUCTIONS);
  const [finalTime, setFinalTime] = useState<number>(0);
  const [prize, setPrize] = useState<prizeService.Prize | null>(null);
  const [leaderboard, setLeaderboard] = useState<Score[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [playerDetails, setPlayerDetails] = useState<{ name: string; email: string; phone: string } | null>(null);

  useEffect(() => {
    setLeaderboard(dataService.getLeaderboard());
    dataService.initSyncManager();
    
    // Initialize Arduino sensor service globally
    if (window.electronAPI) {
      arduinoSensorService.initialize();
    }
  }, []);

  // Manage Arduino sensor based on game state
  useEffect(() => {
    if (window.electronAPI) {
      // Only enable sensor when in READY or HOLDING states
      const shouldEnable = gameState === GameState.READY || gameState === GameState.HOLDING;
      arduinoSensorService.setEnabled(shouldEnable);
      
      // Reset sensor state when entering READY state
      if (gameState === GameState.READY) {
        arduinoSensorService.reset();
      }
    }
  }, [gameState]);

  const handleStart = useCallback(() => {
    setGameState(GameState.HOWTO);
  }, []);

  const handleHowToNext = useCallback(() => {
    setGameState(GameState.ENTER_DETAILS);
  }, []);
  
  const handleDetailsSubmit = useCallback((details: { name: string; email: string; phone: string }) => {
    setPlayerDetails(details);
    setGameState(GameState.READY);
  }, []);

  const handleHoldStart = useCallback(() => {
    setGameState(GameState.HOLDING);
  }, []);

  const handleHoldEnd = useCallback(async (startTime: number) => {
    if (!playerDetails) {
      console.error("Player details not found. Cannot submit score.");
      resetGame();
      return;
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    setFinalTime(duration);
    
    const awardedPrize = await prizeService.checkAndDispensePrize(duration);
    setPrize(awardedPrize);

    const newScore: Score = {
      id: `score_${Date.now()}`,
      ...playerDetails,
      time: duration,
    };
    const updatedLeaderboard = await dataService.addScore(newScore);
    setLeaderboard(updatedLeaderboard);
    setCurrentPlayerId(newScore.id);

    setGameState(GameState.GAME_OVER);
  }, [playerDetails]);
  
  const handlePlayAgain = useCallback(() => {
    resetGame();
  }, []);


  const resetGame = () => {
    setFinalTime(0);
    setCurrentPlayerId(null);
    setPrize(null);
    setPlayerDetails(null);
    setGameState(GameState.INSTRUCTIONS);
  };
  
  // Custom hook for managing the hold state and timer start time
  const useHoldTimer = () => {
      const [isHolding, setIsHolding] = useState(false);
      const startTimeRef = React.useRef(0);

      const start = useCallback(() => {
          startTimeRef.current = Date.now();
          setIsHolding(true);
          handleHoldStart();
      }, [handleHoldStart]);

      const end = useCallback(() => {
          if (startTimeRef.current > 0) {
              handleHoldEnd(startTimeRef.current);
          }
          setIsHolding(false);
          startTimeRef.current = 0;
      }, [handleHoldEnd]);
      
      return { isHolding, start, end };
  };

  const { isHolding, start, end } = useHoldTimer();

  const renderContent = () => {
    switch (gameState) {
      case GameState.INSTRUCTIONS:
        return <InstructionsScreen onStart={handleStart} />;
      case GameState.HOWTO:
        return <HowToScreen onNext={handleHowToNext} />;
      case GameState.ENTER_DETAILS:
        return <EnterDetailsScreen onSubmit={handleDetailsSubmit} />;
      case GameState.READY:
      case GameState.HOLDING:
        return <GameScreen isHolding={isHolding} onHoldStart={start} onHoldEnd={end} />;
      case GameState.GAME_OVER:
        return <GameOverScreen finalTime={finalTime} prize={prize} onNext={() => setGameState(GameState.LEADERBOARD)} />;
      case GameState.LEADERBOARD:
        return <LeaderboardScreen scores={leaderboard} currentPlayerId={currentPlayerId} onPlayAgain={handlePlayAgain} />;
      default:
        return <InstructionsScreen onStart={handleStart} />;
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-900 text-white font-sans overflow-hidden">
      <FullScreenButton />
      {renderContent()}
    </div>
  );
};

export default App;