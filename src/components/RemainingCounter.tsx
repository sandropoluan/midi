import React from 'react';

interface RemainingCounterProps {
  showRemainLabel: boolean;
  cardLeft: number;
}

export const RemainingCounter: React.FC<RemainingCounterProps> = ({ 
  showRemainLabel, 
  cardLeft 
}) => {
  if (!showRemainLabel) return null;

  return (
    <div id="remaining">Remaining: {cardLeft}</div>
  );
};