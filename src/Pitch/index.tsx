import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { VirtualPiano } from '../components/VirtualPiano';
import { MIDI_CONSTANTS } from '../types';
import { usePitchDetection } from '../hooks/usePitchDetection';
import './index.scss';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALE_DEGREES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti'];
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const LISTENING_DURATION = 15000;
const ACCURACY_THRESHOLD = 80;

const noteNameToMidi = (noteName: string): number => {
  const match = noteName.match(/^([A-G]#?)(\d)$/);
  if (!match) return -1;
  const [, note, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const noteIndex = NOTES.indexOf(note);
  return (octave + 1) * 12 + noteIndex;
};

const midiToNoteName = (midi: number): string => {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${NOTES[noteIndex]}${octave}`;
};

const midiToFrequency = (midi: number): number => {
  return 440 * Math.pow(2, (midi - 69) / 12);
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
      if (octave === 2 && NOTES.indexOf(note) < NOTES.indexOf('F')) {
        continue;
      }
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
  return { note: '-', octave: '' };
};

type SelectionMode = 'random' | 'manual';

export default function Pitch() {
  const [keyPool, setKeyPool] = useState<string[]>(() => generateKeyPool());
  const [currentKey, setCurrentKey] = useState<string>('');
  const [isStarted, setIsStarted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('random');
  const [timerProgress, setTimerProgress] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [lastResult, setLastResult] = useState<{ success: boolean; accuracy: number } | null>(null);
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerStartRef = useRef<number>(0);
  const correctSamplesRef = useRef<number>(0);
  const totalSamplesRef = useRef<number>(0);
  const currentKeyRef = useRef<string>('');
  const pitchDataRef = useRef<typeof pitchData>(null);

  const { pitchData, error, startListening, stopListening } = usePitchDetection();

  // Keep refs in sync with state
  useEffect(() => {
    currentKeyRef.current = currentKey;
  }, [currentKey]);

  useEffect(() => {
    pitchDataRef.current = pitchData;
  }, [pitchData]);

  const clearAllTimers = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const stopTimer = useCallback((completed: boolean = false) => {
    clearAllTimers();
    
    if (completed && totalSamplesRef.current > 0) {
      const finalAccuracy = Math.round((correctSamplesRef.current / totalSamplesRef.current) * 100);
      const success = finalAccuracy >= ACCURACY_THRESHOLD;
      
      setLastResult({ success, accuracy: finalAccuracy });
      
      if (success) {
        setCorrectCount(prev => prev + 1);
      }
    }
    
    setIsTimerRunning(false);
    setTimerProgress(0);
    stopListening();
  }, [clearAllTimers, stopListening]);

  const startTimer = useCallback(async () => {
    clearAllTimers();
    setLastResult(null);
    setAccuracy(0);
    correctSamplesRef.current = 0;
    totalSamplesRef.current = 0;
    
    await startListening();
    
    timerStartRef.current = Date.now();
    setIsTimerRunning(true);
    setTimerProgress(0);
    
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - timerStartRef.current;
      const progress = Math.min((elapsed / LISTENING_DURATION) * 100, 100);
      setTimerProgress(progress);
      
      // Sample accuracy on every tick (every 50ms)
      const targetKey = currentKeyRef.current;
      if (targetKey) {
        totalSamplesRef.current += 1;
        
        const currentPitch = pitchDataRef.current;
        if (currentPitch) {
          const detectedNote = `${currentPitch.note}${currentPitch.octave}`;
          if (detectedNote === targetKey) {
            correctSamplesRef.current += 1;
          }
        }
        // If no pitch detected (silence), it counts as incorrect (no increment to correctSamples)
        
        const currentAccuracy = totalSamplesRef.current > 0 
          ? Math.round((correctSamplesRef.current / totalSamplesRef.current) * 100)
          : 0;
        setAccuracy(currentAccuracy);
      }
      
      if (elapsed >= LISTENING_DURATION) {
        stopTimer(true);
      }
    }, 50);
  }, [clearAllTimers, startListening, stopTimer]);

  const pickNextKey = useCallback(() => {
    if (selectionMode === 'manual') return;
    
    stopTimer(false);
    setLastResult(null);
    setAccuracy(0);
    
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
  }, [keyPool, selectionMode, stopTimer]);

  const handlePianoKeyClick = useCallback((midiNumber: number) => {
    if (selectionMode !== 'manual') return;
    
    stopTimer(false);
    setLastResult(null);
    setAccuracy(0);
    
    const noteName = midiToNoteName(midiNumber);
    setCurrentKey(noteName);
    setIsStarted(true);
  }, [selectionMode, stopTimer]);


  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && selectionMode === 'random') {
        e.preventDefault();
        pickNextKey();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pickNextKey, selectionMode]);

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      !target.closest('.Piano-wrapper') && 
      !target.closest('.mic-button') &&
      !target.closest('.mode-toggle') &&
      selectionMode === 'random'
    ) {
      pickNextKey();
    }
  };

  const handleMicToggle = useCallback(() => {
    if (isTimerRunning) {
      stopTimer(false);
    } else {
      startTimer();
    }
  }, [isTimerRunning, startTimer, stopTimer]);

  const handleModeChange = useCallback((mode: SelectionMode) => {
    stopTimer(false);
    setSelectionMode(mode);
    setCurrentKey('');
    setIsStarted(false);
    setKeyPool(generateKeyPool());
    setCorrectCount(0);
    setLastResult(null);
    setAccuracy(0);
  }, [stopTimer]);

  const { note, octave } = formatKeyDisplay(currentKey);
  const remaining = keyPool.length;
  const total = generateKeyPool().length;
  const currentMidi = currentKey ? noteNameToMidi(currentKey) : -1;
  
  const detectedMidi = pitchData && isTimerRunning ? pitchData.midiNumber : -1;
  const highlightedKeys = useMemo(() => {
    const keys: number[] = [];
    if (currentMidi > 0) keys.push(currentMidi);
    if (detectedMidi > 0 && detectedMidi !== currentMidi) keys.push(detectedMidi);
    return keys;
  }, [currentMidi, detectedMidi]);
  
  const scaleLabels = useMemo(() => {
    if (currentMidi <= 0) return {};
    return generateScaleLabels(currentMidi);
  }, [currentMidi]);

  const isCurrentlyCorrect = pitchData && isTimerRunning && 
    `${pitchData.note}${pitchData.octave}` === currentKey;

  const targetFrequency = currentMidi > 0 ? midiToFrequency(currentMidi) : 0;
  const hzDifference = pitchData && targetFrequency > 0 
    ? Math.round((pitchData.frequency - targetFrequency) * 10) / 10 
    : 0;

  // Calculate cents offset from TARGET note (not from detected note)
  // 1 semitone = 100 cents, cents = 1200 * log2(f1/f2)
  const centsFromTarget = pitchData && targetFrequency > 0
    ? Math.round(1200 * Math.log2(pitchData.frequency / targetFrequency))
    : 0;

  const accuracyClass = accuracy >= ACCURACY_THRESHOLD ? 'high' : accuracy >= 50 ? 'medium' : 'low';

  return (
    <div className={`pitch-container ${isCurrentlyCorrect ? 'currently-correct' : ''}`} onClick={handleContainerClick}>
      <div className="pitch-content">
        <div className="mode-toggle">
          <button 
            className={selectionMode === 'random' ? 'active' : ''} 
            onClick={() => handleModeChange('random')}
          >
            Random
          </button>
          <button 
            className={selectionMode === 'manual' ? 'active' : ''} 
            onClick={() => handleModeChange('manual')}
          >
            Manual
          </button>
        </div>

        <div className="pitch-display-wrapper">
          {!isStarted ? (
            <div className="pitch-start">
              <h2>Pitch Practice</h2>
              {selectionMode === 'random' ? (
                <p>Click anywhere or press Space to start</p>
              ) : (
                <p>Click a key on the piano below to select</p>
              )}
              <p className="mic-hint">Hold the note for 15 seconds with 80%+ accuracy to succeed</p>
            </div>
          ) : (
            <div className="pitch-display">
              <div className="key-display">
                <span className="note">{note}</span>
                <span className="octave">{octave}</span>
              </div>
              <div className="detected-pitch-wrapper">
                {isTimerRunning && pitchData ? (
                  <div className={`detected-pitch ${isCurrentlyCorrect ? 'matched' : ''}`}>
                    <span className="detected-label">Detected:</span>
                    <span className={`detected-note ${isCurrentlyCorrect ? 'correct' : ''}`}>
                      {pitchData.note}{pitchData.octave}
                    </span>
                    <div className="freq-display">
                      <span className="detected-freq">{pitchData.frequency} Hz</span>
                      <span className={`hz-diff ${hzDifference > 0 ? 'sharp' : hzDifference < 0 ? 'flat' : 'perfect'}`}>
                        {hzDifference > 0 ? '+' : ''}{hzDifference} Hz
                      </span>
                    </div>
                    <div className="cents-indicator">
                      <div 
                        className={`cents-bar ${Math.abs(centsFromTarget) < 10 ? 'in-tune' : centsFromTarget > 0 ? 'sharp' : 'flat'}`}
                        style={{ left: `${Math.max(0, Math.min(100, 50 + centsFromTarget / 2))}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="detected-pitch placeholder">
                    <span className="detected-label">Detected:</span>
                    <span className="detected-note">--</span>
                    <div className="freq-display">
                      <span className="detected-freq">-- Hz</span>
                      <span className="hz-diff">-- Hz</span>
                    </div>
                    <div className="cents-indicator">
                      <div className="cents-bar" />
                    </div>
                  </div>
                )}
              </div>
              
              {isTimerRunning && (
                <div className={`accuracy-display ${accuracyClass}`}>
                  <span className="accuracy-label">Accuracy:</span>
                  <span className="accuracy-value">{accuracy}%</span>
                  <div className="accuracy-bar">
                    <div 
                      className="accuracy-fill" 
                      style={{ width: `${accuracy}%` }}
                    />
                    <div className="accuracy-threshold" style={{ left: `${ACCURACY_THRESHOLD}%` }} />
                  </div>
                </div>
              )}
              
              {lastResult && (
                <div className={`result-badge ${lastResult.success ? 'success' : 'fail'}`}>
                  {lastResult.success ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>Success! {lastResult.accuracy}%</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                      <span>Try again! {lastResult.accuracy}%</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="pitch-stats">
          {selectionMode === 'random' && (
            <div className="pitch-counter">
              <span className="remaining">{remaining}</span>
              <span className="separator">/</span>
              <span className="total">{total}</span>
              <span className="label">keys remaining</span>
            </div>
          )}
          <div className="correct-counter">
            <span className="correct-count">{correctCount}</span>
            <span className="label">passed</span>
          </div>
        </div>
      </div>
      
      <div className="mic-controls">
        <button 
          className={`mic-button ${isTimerRunning ? 'active' : ''}`}
          onClick={handleMicToggle}
          disabled={!currentKey}
          title={!currentKey ? 'Select a key first' : isTimerRunning ? 'Stop listening' : 'Start listening'}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            {isTimerRunning ? (
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            ) : (
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            )}
          </svg>
          <span>{isTimerRunning ? 'Stop' : 'Start'}</span>
        </button>
        
        {isTimerRunning && (
          <div className="timer-bar-container">
            <div 
              className="timer-bar" 
              style={{ width: `${100 - timerProgress}%` }}
            />
            <span className="timer-text">
              {Math.ceil((LISTENING_DURATION - (timerProgress / 100) * LISTENING_DURATION) / 1000)}s
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mic-error">
          {error}
        </div>
      )}
      
      <VirtualPiano
        showVirtualPiano={true}
        highlightedKeys={highlightedKeys}
        onKeyboardPlayNote={handlePianoKeyClick}
        keyboardShortcuts=""
        scaleLabels={scaleLabels}
      />
      
      <div className="pitch-instructions">
        {selectionMode === 'manual' 
          ? 'Click a piano key to select, then press Start'
          : isTimerRunning 
            ? `Hold the note for 15s with ${ACCURACY_THRESHOLD}%+ accuracy` 
            : 'Click or press Space for next key, then press Start'}
      </div>
    </div>
  );
}
