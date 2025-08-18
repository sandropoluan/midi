import React from 'react';

interface WrongKeyOverlayProps {
  wrongKey: boolean;
}

export const WrongKeyOverlay: React.FC<WrongKeyOverlayProps> = ({ wrongKey }) => {
  return (
    <div id="wrong-key-everlay" className={wrongKey ? 'show' : undefined}></div>
  );
};