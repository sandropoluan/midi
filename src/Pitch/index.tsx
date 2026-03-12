import { useState, useEffect, useCallback } from 'react';
import './index.scss';

const generateKeyPool = (): string[] => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const pool: string[] = [];

  for (let octave = 2; octave <= 5; octave++) {
    for (const note of notes) {
      // Skip notes below F2
      if (octave === 2 && notes.indexOf(note) < notes.indexOf('F')) {
        continue;
      }
      // Only include C5, skip everything else in octave 5
      if (octave === 5 && note !== 'C') {
        continue;
      }
      pool.push(`${note}${octave}`);
    }
  }

  return pool;
};

const getRandomKey = (pool: string[]): string => {
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

const formatKeyDisplay = (key: string): { note: string; octave: string } => {
  const match = key.match(/^([A-G]#?)(\d)$/);
  if (match) {
    return { note: match[1], octave: match[2] };
  }
  return { note: key, octave: '' };
};

export default function Pitch() {
  const [keyPool, setKeyPool] = useState<string[]>(() => generateKeyPool());
  const [currentKey, setCurrentKey] = useState<string>('');
  const [isStarted, setIsStarted] = useState(false);

  const pickNextKey = useCallback(() => {
    if (keyPool.length === 0) {
      const newPool = generateKeyPool();
      setKeyPool(newPool);
      const nextKey = getRandomKey(newPool);
      setKeyPool(prev => prev.filter(k => k !== nextKey));
      setCurrentKey(nextKey);
    } else {
      const nextKey = getRandomKey(keyPool);
      setKeyPool(prev => prev.filter(k => k !== nextKey));
      setCurrentKey(nextKey);
    }
    setIsStarted(true);
  }, [keyPool]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        pickNextKey();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pickNextKey]);

  const handleClick = () => {
    pickNextKey();
  };

  const { note, octave } = formatKeyDisplay(currentKey);
  const remaining = keyPool.length;
  const total = generateKeyPool().length;

  return (
    <div className="pitch-container" onClick={handleClick}>
      <div className="pitch-content">
        {!isStarted ? (
          <div className="pitch-start">
            <h2>Pitch Practice</h2>
            <p>Click anywhere or press Space to start</p>
          </div>
        ) : (
          <div className="pitch-display">
            <div className="key-display">
              <span className="note">{note}</span>
              <span className="octave">{octave}</span>
            </div>
          </div>
        )}
        <div className="pitch-counter">
          <span className="remaining">{remaining}</span>
          <span className="separator">/</span>
          <span className="total">{total}</span>
          <span className="label">keys remaining</span>
        </div>
      </div>
      <div className="pitch-instructions">
        Click or press Space for next key
      </div>
    </div>
  );
}
