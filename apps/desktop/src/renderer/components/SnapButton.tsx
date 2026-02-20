import React from 'react';

interface SnapButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const SnapButton: React.FC<SnapButtonProps> = ({ onClick, isLoading }) => {
  return (
    <button 
      className={`snap-button ${isLoading ? 'loading' : ''}`}
      onClick={onClick}
      disabled={isLoading}
    >
      <span className="snap-icon">📸</span>
      {isLoading ? 'Saving Context...' : 'SNAP Current Context'}
    </button>
  );
};
