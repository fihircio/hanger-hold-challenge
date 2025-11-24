import React, { useRef, useEffect } from 'react';

interface IntroVideoScreenProps {
  onContinue: () => void;
}

const IntroVideoScreen: React.FC<IntroVideoScreenProps> = ({ onContinue }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      // Attempt to play; many browsers require muted to autoplay.
      v.muted = true;
      const p = v.play();
      if (p && typeof p.then === 'function') {
        p.catch(() => {
          // ignore autoplay errors — user can tap to start
        });
      }
    }
  }, []);

  const handleTap = () => {
    onContinue();
  };

  return (
    <div
      className="w-screen h-screen flex items-center justify-center bg-black"
      onClick={handleTap}
      onTouchStart={handleTap}
      role="button"
      tabIndex={0}
      aria-label="Intro video — tap to continue"
      style={{ touchAction: 'manipulation' }}
    >
      <video
        ref={videoRef}
        src="./UI/video.mp4"
        loop
        playsInline
        className="w-full h-full object-cover"
      />
      {/* Invisible overlay text for accessibility (optional) */}
    </div>
  );
};

export default IntroVideoScreen;
