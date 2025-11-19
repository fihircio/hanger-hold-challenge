import React from 'react';

interface BackgroundWrapperProps {
  imagePath: string;
  children: React.ReactNode;
  className?: string;
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({
  imagePath,
  children,
  className = ''
}) => {
  const backgroundStyle: React.CSSProperties = {
    backgroundImage: `url(${imagePath})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    minHeight: '100vh',
    width: '100vw'
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    minHeight: '100vh',
    width: '100vw'
  };

  return (
    <div className={`background-wrapper ${className}`} style={backgroundStyle}>
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
};

export default BackgroundWrapper;