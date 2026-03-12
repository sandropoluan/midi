import { useState, useEffect, useCallback, useMemo } from 'react';
import { VirtualPiano } from '../components/VirtualPiano';
import { MIDI_CONSTANTS } from '../types';
import './index.scss';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALE_DEGREES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti'];
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

const noteNameToMidi = (noteName: string): number => {
  const match = noteName.match(/^([A-G]#?)(\d)$/);
  if (!match) return -1;
  const [, note, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const noteIndex = NOTES.indexOf(note);
  return (octave + 1) * 12 + noteIndex;
};

const generateScaleLabels = (rootMidi: number): Record<number, string> => {
  const labels: Record<number, string> = {};
  const rootNoteIndex = rootMidi % 12;
  
  for (let midi = MIDI_CONSTANTS.FIRST_MIDI_NOTE; midi <= MIDI_CONSTANTS.LAST_MIDI_NOTE; midi++) {
    const noteIndex = midi % 12;
    const intervalFromRoot = (noteIndex - rootNoteIndex + 12) % 12;
    const scaleIndex = MAJOR_SCALE_INTERVALS.indexOf(intervalFromRoot);
    
    if (scaleIndex !== -1) {
      labels[midi] = SCALE_DEGREES[scaleIndex];
    }
  }
  
  return labels;
};

const generateKeyPool = (): string[] => {
  const pool: string[] = [];

  for (let octave = 2; octave <= 5; octave++) {
    for (const note of NOTES) {
      // Skip notes below F2
      if (octave === 2 && NOTES.indexOf(note) < NOTES.indexOf('F')) {
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

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.Piano-wrapper')) {
      pickNextKey();
    }
  };

  const handleKeyboardPlayNote = useCallback(() => {
    // No-op for pitch practice - we just want to play sounds
  }, []);

  const { note, octave } = formatKeyDisplay(currentKey);
  const remaining = keyPool.length;
  const total = generateKeyPool().length;
  const currentMidi = currentKey ? noteNameToMidi(currentKey) : -1;
  const highlightedKeys = currentMidi > 0 ? [currentMidi] : [];
  
  const scaleLabels = useMemo(() => {
    if (currentMidi <= 0) return {};
    return generateScaleLabels(currentMidi);
  }, [currentMidi]);

  return (
    <div className="pitch-container" onClick={handleContainerClick}>
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
      
      <VirtualPiano
        showVirtualPiano={true}
        highlightedKeys={highlightedKeys}
        onKeyboardPlayNote={handleKeyboardPlayNote}
        keyboardShortcuts=""
        scaleLabels={scaleLabels}
      />
      
      <div className="pitch-instructions">
        Click or press Space for next key
      </div>
    </div>
  );
}
