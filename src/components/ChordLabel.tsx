import React from 'react';
import { ChordEntry } from '../types';

interface ChordLabelProps {
  withChord: boolean;
  showChordLabel: boolean;
  selectedChord: ChordEntry | null;
}

export const ChordLabel: React.FC<ChordLabelProps> = ({ 
  withChord, 
  showChordLabel, 
  selectedChord 
}) => {
  if (!withChord || !showChordLabel || !selectedChord) return null;

  const text = selectedChord.symbol;
  const isMinor = text.includes('m');
  const color = isMinor ? 'yellow' : 'white';

  let renderedSymbol: React.ReactNode = <span style={{ color }}>{text}</span>;

  if (text.includes('△')) {
    const chord = text.split('△')[0];
    renderedSymbol = (
      <span style={{ color }}>
        {chord}
        <span style={{ color: 'red' }}>△</span>
        7
      </span>
    );
  } else if (text.includes('6')) {
    const chord = text.split('6')[0];
    renderedSymbol = (
      <span style={{ color }}>
        {chord}
        <span style={{ color: '#e28743' }}>6</span>
      </span>
    );
  }

  return (
    <span 
      style={{ 
        position: 'absolute', 
        top: 50, 
        left: 500, 
        width: 300, 
        display: 'flex', 
        fontSize: 30, 
        fontWeight: 'bold', 
        color: '#FFF', 
        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
        padding: '10px 12px', 
        borderRadius: '10px' 
      }}
    >
      {renderedSymbol}
    </span>
  );
};