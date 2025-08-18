import React from 'react';
import { KeyProps } from '../types';

export const Key: React.FC<KeyProps> = ({ 
  asset, 
  y, 
  bar, 
  note, 
  showKey, 
  sharp, 
  isFlat, 
  i, 
  blured = false 
}) => {
  const width = 53;
  const ratio = 1.81;
  const topBarMap: Record<'top' | 'middle' | 'bottom', number> = { 
    top: -1, 
    middle: 12, 
    bottom: 27 
  } as const;

  return (
    <div 
      style={{ 
        width: width, 
        height: width / ratio, 
        position: 'absolute', 
        left: i % 2 ? 250 : 250, 
        top: y, 
        backgroundImage: `url(${asset})`, 
        backgroundRepeat: 'no-repeat', 
        backgroundSize: 'contain' 
      }}
    >
      {bar && (
        <div 
          style={{ 
            position: 'absolute', 
            width: width + 12, 
            height: 4, 
            left: -8, 
            top: topBarMap[bar], 
            backgroundColor: 'black' 
          }} 
        />
      )}
      {showKey && (
        <span className='Key'>
          {note}{isFlat && '♭'}
        </span>
      )}
      {(sharp || isFlat) && !blured && (
        <span 
          style={{ 
            position: 'absolute', 
            fontSize: isFlat ? 45 : 30, 
            fontWeight: 'bold', 
            left: -20, 
            top: isFlat ? -10 : -5 
          }}
        >
          {isFlat ? '♭' : '#'}
        </span>
      )}
    </div>
  );
};