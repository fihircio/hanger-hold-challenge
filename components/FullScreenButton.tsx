import React, { useState, useEffect } from 'react';

const FullScreenButton: React.FC = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if we're running in Electron
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsElectron(true);
      
      // Get initial fullscreen state
      window.electronAPI.isFullscreen().then(setIsFullScreen);
    }
  }, []);

  const toggleFullScreen = async () => {
    if (!isElectron || !window.electronAPI) return;
    
    try {
      const result = await window.electronAPI.toggleFullscreen();
      setIsFullScreen(result.isFullScreen);
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
    }
  };

  // Don't render if not in Electron
  if (!isElectron) {
    return null;
  }

  return (
    <button
      onClick={toggleFullScreen}
      className="fixed top-4 right-4 z-50 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg transition-colors duration-200"
      title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
    >
      {isFullScreen ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      )}
    </button>
  );
};

export default FullScreenButton;