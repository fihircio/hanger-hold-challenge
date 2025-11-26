import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Score } from './types';
import InstructionsScreen from './components/InstructionsScreen';
import IntroVideoScreen from './components/IntroVideoScreen';
import HowToScreen from './components/HowToScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import EnterDetailsScreen from './components/EnterDetailsScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import FullScreenButton from './components/FullScreenButton';
import MaintenancePanel from './components/MaintenancePanel';
import { useIdleTimer } from './hooks/useIdleTimer';
import * as dataService from './services/dataService';
import * as prizeService from './services/prizeService';
import { arduinoSensorService } from './services/arduinoSensorService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.VIDEO);
  const [finalTime, setFinalTime] = useState<number>(0);
  const [prize, setPrize] = useState<prizeService.Prize | null>(null);
  const [leaderboard, setLeaderboard] = useState<Score[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [playerDetails, setPlayerDetails] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [showMaintenance, setShowMaintenance] = useState<boolean>(true);

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

  const handleVideoContinue = useCallback(() => {
    setGameState(GameState.INSTRUCTIONS);
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

  const handleHoldComplete = useCallback(async (duration: number) => {
    if (!playerDetails) {
      console.error("Player details not found. Cannot submit score.");
      resetGame();
      return;
    }

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
    setGameState(GameState.VIDEO);
  };

  // Automatically reset back to the intro video after inactivity
  // Applies on screens where players are expected to be idle (instructions, howto, leaderboard, enter details, game over)
  const idleResetStates = [
    GameState.INSTRUCTIONS,
    GameState.HOWTO,
    GameState.ENTER_DETAILS,
    GameState.LEADERBOARD,
    GameState.GAME_OVER,
  ];

  // Enable the idle timer only when the app is on non-playing screens
  const idleEnabled = idleResetStates.includes(gameState);

  useIdleTimer(() => {
    // Callback only runs when enabled; additional guard to be safe
    if (idleEnabled) {
      resetGame();
    }
  }, 60000, idleEnabled); // 60s timeout — adjust as needed
  
  // Custom hook for managing the hold state and timer start time
  const useHoldTimer = () => {
      const [isHolding, setIsHolding] = useState(false);
      const startTimeRef = React.useRef(0);

        // Accept an optional start timestamp (ms since epoch)
        const start = useCallback((startTimestamp?: number) => {
          startTimeRef.current = typeof startTimestamp === 'number' && startTimestamp > 0 ? startTimestamp : Date.now();
          setIsHolding(true);
          handleHoldStart();
        }, [handleHoldStart]);

        // Accept an optional measured duration (ms). If not provided, compute from startTimeRef.
        // `value` may be either a measured duration (ms) OR an end timestamp (ms since epoch)
        // `isTimestamp` disambiguates the meaning when true.
        const end = useCallback((value?: number, isTimestamp?: boolean) => {
          let duration: number;

          if (isTimestamp && typeof value === 'number' && startTimeRef.current > 0) {
            // value is an end timestamp
            duration = value - startTimeRef.current;
          } else if (typeof value === 'number' && !isTimestamp) {
            // value is a measured duration
            duration = value;
          } else if (startTimeRef.current > 0) {
            duration = Date.now() - startTimeRef.current;
          } else {
            duration = 0;
          }

          // Diagnostics: log measured vs computed duration and startTimeRef
          try {
            console.log('[HOLD TIMER] end called:', { value, isTimestamp, computedFromRef: duration, startTimeRef: startTimeRef.current, timestamp: Date.now() });
          } catch (e) {
            // ignore
          }

          // Fire the completion handler with the resolved duration
          handleHoldComplete(duration);

          setIsHolding(false);
          startTimeRef.current = 0;
        }, [handleHoldComplete]);
      
      return { isHolding, start, end };
  };

  const { isHolding, start, end } = useHoldTimer();

  const renderContent = () => {
    switch (gameState) {
      case GameState.VIDEO:
        return <IntroVideoScreen onContinue={handleVideoContinue} />;
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
      <MaintenancePanel visible={showMaintenance} onClose={() => setShowMaintenance(false)} />
    </div>
  );
};

export default App;