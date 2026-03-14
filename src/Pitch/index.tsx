import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { VirtualPiano } from '../components/VirtualPiano';
import { MIDI_CONSTANTS } from '../types';
import { usePitchDetection } from '../hooks/usePitchDetection';
import { perfectMelodyWithTiming, MelodyNote } from '../data/perfectMelody';
import './index.scss';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALE_DEGREES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti'];
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const LISTENING_DURATION = 15000;
const SONG_NOTE_DURATION = 3000;
const ACCURACY_THRESHOLD = 80;

interface SongData {
  name: string;
  artist: string;
  notes: MelodyNote[];
}

const AVAILABLE_SONGS: SongData[] = [
  { name: 'Perfect', artist: 'Ed Sheeran', notes: perfectMelodyWithTiming },
];

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

type SelectionMode = 'random' | 'manual' | 'song';

interface FloatingHeart {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

interface ToastMessage {
  id: number;
  message: string;
}

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
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isKeyLocked, setIsKeyLocked] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedSong, setSelectedSong] = useState<SongData | null>(null);
  const [songNoteIndex, setSongNoteIndex] = useState(0);
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const [songScore, setSongScore] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayIndex, setAutoPlayIndex] = useState(0);
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const toastIdRef = useRef<number>(0);
  const timerStartRef = useRef<number>(0);
  const correctSamplesRef = useRef<number>(0);
  const totalSamplesRef = useRef<number>(0);
  const currentKeyRef = useRef<string>('');
  const pitchDataRef = useRef<typeof pitchData>(null);
  const heartIdRef = useRef<number>(0);
  const lastHeartTimeRef = useRef<number>(0);
  const consecutiveCorrectRef = useRef<number>(0);
  const songNoteIndexRef = useRef<number>(0);

  const { pitchData, error, startListening, stopListening } = usePitchDetection();

  // Keep refs in sync with state
  useEffect(() => {
    currentKeyRef.current = currentKey;
  }, [currentKey]);

  useEffect(() => {
    pitchDataRef.current = pitchData;
  }, [pitchData]);

  useEffect(() => {
    songNoteIndexRef.current = songNoteIndex;
  }, [songNoteIndex]);

  const clearAllTimers = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playNote = useCallback((noteName: string, duration: number = 0.4) => {
    const audioContext = getAudioContext();
    const midi = noteNameToMidi(noteName);
    if (midi < 0) return;
    
    const frequency = midiToFrequency(midi);
    const now = audioContext.currentTime;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.15, now + duration * 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
  }, [getAudioContext]);

  const spawnHearts = useCallback((count: number, isBurst: boolean = false) => {
    const now = Date.now();
    if (!isBurst && now - lastHeartTimeRef.current < 200) return;
    lastHeartTimeRef.current = now;

    const newHearts: FloatingHeart[] = [];
    for (let i = 0; i < count; i++) {
      newHearts.push({
        id: heartIdRef.current++,
        left: 5 + Math.random() * 90,
        delay: isBurst ? Math.random() * 0.5 : Math.random() * 0.3,
        duration: isBurst ? 2.5 + Math.random() * 2 : 2 + Math.random() * 1.5,
        size: isBurst ? 35 + Math.random() * 35 : 30 + Math.random() * 25,
      });
    }
    setFloatingHearts(prev => [...prev, ...newHearts]);

    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
    }, 5000);
  }, []);

  const stopTimer = useCallback((completed: boolean = false) => {
    clearAllTimers();
    consecutiveCorrectRef.current = 0;
    
    if (completed && totalSamplesRef.current > 0) {
      const finalAccuracy = Math.round((correctSamplesRef.current / totalSamplesRef.current) * 100);
      const success = finalAccuracy >= ACCURACY_THRESHOLD;
      
      setLastResult({ success, accuracy: finalAccuracy });
      
      if (success) {
        setCorrectCount(prev => prev + 1);
        setShowCelebration(true);
        // Big burst of hearts on success
        spawnHearts(15, true);
        for (let i = 1; i <= 8; i++) {
          setTimeout(() => spawnHearts(8, true), i * 150);
        }
        setTimeout(() => setShowCelebration(false), 4000);
      }
    }
    
    setIsTimerRunning(false);
    setTimerProgress(0);
    stopListening();
  }, [clearAllTimers, stopListening, spawnHearts]);

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
        let isCorrectNow = false;
        if (currentPitch) {
          const detectedNote = `${currentPitch.note}${currentPitch.octave}`;
          if (detectedNote === targetKey) {
            correctSamplesRef.current += 1;
            isCorrectNow = true;
          }
        }
        
        // Spawn hearts when maintaining correct pitch
        if (isCorrectNow) {
          consecutiveCorrectRef.current += 1;
          // Spawn hearts every ~0.75 second of correct pitch (15 ticks at 50ms)
          if (consecutiveCorrectRef.current > 0 && consecutiveCorrectRef.current % 15 === 0) {
            spawnHearts(3);
          }
        } else {
          consecutiveCorrectRef.current = 0;
        }
        
        const currentAccuracy = totalSamplesRef.current > 0 
          ? Math.round((correctSamplesRef.current / totalSamplesRef.current) * 100)
          : 0;
        setAccuracy(currentAccuracy);
      }
      
      if (elapsed >= LISTENING_DURATION) {
        stopTimer(true);
      }
    }, 50);
  }, [clearAllTimers, startListening, stopTimer, spawnHearts]);

  const stopSong = useCallback(() => {
    clearAllTimers();
    setIsSongPlaying(false);
    setTimerProgress(0);
    stopListening();
  }, [clearAllTimers, stopListening]);

  const advanceToNextSongNote = useCallback(() => {
    if (!selectedSong) return;
    
    const nextIndex = songNoteIndexRef.current + 1;
    if (nextIndex >= selectedSong.notes.length) {
      stopSong();
      setShowCelebration(true);
      spawnHearts(20, true);
      for (let i = 1; i <= 10; i++) {
        setTimeout(() => spawnHearts(10, true), i * 150);
      }
      setTimeout(() => setShowCelebration(false), 4000);
      return;
    }
    
    setSongNoteIndex(nextIndex);
    setCurrentKey(selectedSong.notes[nextIndex].note);
    correctSamplesRef.current = 0;
    totalSamplesRef.current = 0;
    setAccuracy(0);
    timerStartRef.current = Date.now();
    setTimerProgress(0);
  }, [selectedSong, stopSong, spawnHearts]);

  const startSong = useCallback(async () => {
    if (!selectedSong) return;
    
    clearAllTimers();
    setSongNoteIndex(0);
    setSongScore(0);
    setCurrentKey(selectedSong.notes[0].note);
    setLastResult(null);
    setAccuracy(0);
    correctSamplesRef.current = 0;
    totalSamplesRef.current = 0;
    
    await startListening();
    
    timerStartRef.current = Date.now();
    setIsSongPlaying(true);
    setTimerProgress(0);
    
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - timerStartRef.current;
      const progress = Math.min((elapsed / SONG_NOTE_DURATION) * 100, 100);
      setTimerProgress(progress);
      
      const targetKey = currentKeyRef.current;
      if (targetKey) {
        totalSamplesRef.current += 1;
        
        const currentPitch = pitchDataRef.current;
        let isCorrectNow = false;
        if (currentPitch) {
          const detectedNote = `${currentPitch.note}${currentPitch.octave}`;
          if (detectedNote === targetKey) {
            correctSamplesRef.current += 1;
            isCorrectNow = true;
          }
        }
        
        if (isCorrectNow) {
          consecutiveCorrectRef.current += 1;
          if (consecutiveCorrectRef.current > 0 && consecutiveCorrectRef.current % 10 === 0) {
            spawnHearts(2);
          }
        } else {
          consecutiveCorrectRef.current = 0;
        }
        
        const currentAccuracy = totalSamplesRef.current > 0 
          ? Math.round((correctSamplesRef.current / totalSamplesRef.current) * 100)
          : 0;
        setAccuracy(currentAccuracy);
      }
      
      if (elapsed >= SONG_NOTE_DURATION) {
        const finalAccuracy = totalSamplesRef.current > 0 
          ? Math.round((correctSamplesRef.current / totalSamplesRef.current) * 100)
          : 0;
        
        if (finalAccuracy >= ACCURACY_THRESHOLD) {
          setSongScore(prev => prev + 1);
          spawnHearts(5, true);
        }
        
        advanceToNextSongNote();
      }
    }, 50);
  }, [selectedSong, clearAllTimers, startListening, spawnHearts, advanceToNextSongNote]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayIntervalRef.current) {
      clearTimeout(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
    setIsAutoPlaying(false);
    setAutoPlayIndex(0);
  }, []);

  const startAutoPlay = useCallback(() => {
    if (!selectedSong) return;
    
    stopSong();
    setIsAutoPlaying(true);
    setAutoPlayIndex(0);
    
    const firstNote = selectedSong.notes[0];
    setCurrentKey(firstNote.note);
    playNote(firstNote.note, firstNote.durationMs / 1000);
    
    const scheduleNextNote = (index: number) => {
      if (index >= selectedSong.notes.length - 1) {
        const lastNoteDuration = selectedSong.notes[index].durationMs;
        autoPlayIntervalRef.current = setTimeout(() => {
          stopAutoPlay();
        }, lastNoteDuration);
        return;
      }
      
      const currentNote = selectedSong.notes[index];
      const nextNote = selectedSong.notes[index + 1];
      const delay = nextNote.timeMs - currentNote.timeMs;
      
      autoPlayIntervalRef.current = setTimeout(() => {
        const newIndex = index + 1;
        setAutoPlayIndex(newIndex);
        setCurrentKey(nextNote.note);
        playNote(nextNote.note, nextNote.durationMs / 1000);
        scheduleNextNote(newIndex);
      }, delay);
    };
    
    scheduleNextNote(0);
  }, [selectedSong, stopSong, playNote, stopAutoPlay]);

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
    if (isKeyLocked) return;
    
    stopTimer(false);
    setLastResult(null);
    setAccuracy(0);
    
    const noteName = midiToNoteName(midiNumber);
    setCurrentKey(noteName);
    setIsStarted(true);
  }, [selectionMode, stopTimer, isKeyLocked]);


  useEffect(() => {
    return () => {
      clearAllTimers();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
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
    stopSong();
    stopAutoPlay();
    setSelectionMode(mode);
    setCurrentKey('');
    setIsStarted(false);
    setKeyPool(generateKeyPool());
    setCorrectCount(0);
    setLastResult(null);
    setAccuracy(0);
    setSelectedSong(null);
    setSongNoteIndex(0);
    setSongScore(0);
  }, [stopTimer, stopSong, stopAutoPlay]);

  const showToast = useCallback((message: string) => {
    const id = toastIdRef.current++;
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const handleDisabledStartClick = useCallback(() => {
    if (!currentKey) {
      if (selectionMode === 'manual') {
        showToast('Click a piano key to select, then press Start');
      } else {
        showToast('Click anywhere or press Space for next key, then press Start');
      }
    }
  }, [currentKey, selectionMode, showToast]);

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

  const isCurrentlyCorrect = pitchData && (isTimerRunning || isSongPlaying) && 
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
    <div className={`pitch-container ${isCurrentlyCorrect ? 'currently-correct' : ''} ${showCelebration ? 'celebrating' : ''}`} onClick={handleContainerClick}>
      <div className="wave-background">
        <div className="wave" />
        <div className="wave" />
        <div className="wave" />
      </div>
      <div className="sound-waves">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="bar" />
        ))}
      </div>
      
      <div className="floating-hearts">
        {floatingHearts.map(heart => (
          <div
            key={heart.id}
            className="heart"
            style={{
              left: `${heart.left}%`,
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`,
              fontSize: `${heart.size}px`,
            }}
          >
            💚
          </div>
        ))}
      </div>
      
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
          <button 
            className={selectionMode === 'song' ? 'active' : ''} 
            onClick={() => handleModeChange('song')}
          >
            Song
          </button>
        </div>

        <div className="pitch-display-wrapper">
          {selectionMode === 'song' && !selectedSong ? (
            <div className="song-selection">
              <h2>Select a Song</h2>
              <p>Practice singing along with the melody</p>
              <div className="song-list">
                {AVAILABLE_SONGS.map((song, index) => (
                  <button 
                    key={index}
                    className="song-item"
                    onClick={() => {
                      setSelectedSong(song);
                      setIsStarted(true);
                      setCurrentKey(song.notes[0].note);
                    }}
                  >
                    <span className="song-name">{song.name}</span>
                    <span className="song-artist">{song.artist}</span>
                    <span className="song-notes">{song.notes.length} notes</span>
                  </button>
                ))}
              </div>
            </div>
          ) : !isStarted ? (
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
                {(isTimerRunning || isSongPlaying) && pitchData ? (
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
              
              {(isTimerRunning || isSongPlaying) && (
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
          {selectionMode === 'song' && selectedSong && (
            <div className="song-progress">
              <span className="song-title">{selectedSong.name}</span>
              <div className="note-progress">
                <span className="current-note">{isAutoPlaying ? autoPlayIndex + 1 : songNoteIndex + 1}</span>
                <span className="separator">/</span>
                <span className="total-notes">{selectedSong.notes.length}</span>
              </div>
              {!isAutoPlaying && (
                <div className="song-score">
                  <span className="score-value">{songScore}</span>
                  <span className="score-label">correct</span>
                </div>
              )}
              {isAutoPlaying && (
                <div className="song-score listening">
                  <span className="score-label">Listening...</span>
                </div>
              )}
            </div>
          )}
          {selectionMode !== 'song' && (
            <div className="correct-counter">
              <span className="correct-count">{correctCount}</span>
              <span className="label">passed</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mic-controls">
        {selectionMode === 'song' ? (
          <>
            <button 
              className={`mic-button listen-button ${isAutoPlaying ? 'active' : ''} ${!selectedSong ? 'disabled' : ''}`}
              onClick={() => {
                if (!selectedSong) {
                  showToast('Select a song first');
                } else if (isAutoPlaying) {
                  stopAutoPlay();
                } else {
                  startAutoPlay();
                }
              }}
              title={!selectedSong ? 'Select a song first' : isAutoPlaying ? 'Stop listening' : 'Listen to melody'}
              disabled={isSongPlaying}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                {isAutoPlaying ? (
                  <path d="M6 6h12v12H6z"/>
                ) : (
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                )}
              </svg>
              <span>{isAutoPlaying ? 'Stop' : 'Listen'}</span>
            </button>
            
            <button 
              className={`mic-button ${isSongPlaying ? 'active' : ''} ${!selectedSong ? 'disabled' : ''}`}
              onClick={() => {
                if (!selectedSong) {
                  showToast('Select a song first');
                } else if (isSongPlaying) {
                  stopSong();
                } else {
                  stopAutoPlay();
                  startSong();
                }
              }}
              title={!selectedSong ? 'Select a song first' : isSongPlaying ? 'Stop practicing' : 'Start practicing'}
              disabled={isAutoPlaying}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                {isSongPlaying ? (
                  <path d="M6 6h12v12H6z"/>
                ) : (
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                )}
              </svg>
              <span>{isSongPlaying ? 'Stop' : 'Practice'}</span>
            </button>
            
            {(isSongPlaying || isAutoPlaying) && (
              <div className="timer-bar-container song-timer">
                <div 
                  className="timer-bar" 
                  style={{ width: `${isAutoPlaying ? (100 - (autoPlayIndex / (selectedSong?.notes.length || 1)) * 100) : (100 - timerProgress)}%` }}
                />
                <span className="timer-text">
                  {isAutoPlaying 
                    ? `${autoPlayIndex + 1}/${selectedSong?.notes.length}`
                    : `${Math.ceil((SONG_NOTE_DURATION - (timerProgress / 100) * SONG_NOTE_DURATION) / 1000)}s`
                  }
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <button 
              className={`mic-button ${isTimerRunning ? 'active' : ''} ${!currentKey ? 'disabled' : ''}`}
              onClick={() => {
                if (!currentKey) {
                  handleDisabledStartClick();
                } else {
                  handleMicToggle();
                }
              }}
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
          </>
        )}
      </div>
      
      {error && (
        <div className="mic-error">
          {error}
        </div>
      )}
      
      <div className="piano-section">
        <div className="piano-scroll-container">
          <VirtualPiano
            showVirtualPiano={true}
            highlightedKeys={highlightedKeys}
            onKeyboardPlayNote={handlePianoKeyClick}
            keyboardShortcuts=""
            scaleLabels={scaleLabels}
          />
        </div>
        <div className="piano-scroll-hint">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>
          </svg>
          <span>Swipe to scroll piano</span>
        </div>
        {selectionMode === 'manual' && (
          <button 
            className={`lock-toggle-mini ${isKeyLocked ? 'locked' : ''}`}
            onClick={() => currentKey && setIsKeyLocked(prev => !prev)}
            disabled={!currentKey}
            title={!currentKey ? 'Select a key first' : isKeyLocked ? 'Unlock key selection' : 'Lock current key'}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              {isKeyLocked ? (
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              ) : (
                <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/>
              )}
            </svg>
            <span>{isKeyLocked ? 'Locked' : 'Unlocked'}</span>
          </button>
        )}
      </div>
      
      <div className="pitch-instructions">
        {selectionMode === 'song'
          ? isAutoPlaying
            ? 'Listening to the melody...'
            : isSongPlaying
              ? `Sing each note for 3s with ${ACCURACY_THRESHOLD}%+ accuracy`
              : selectedSong
                ? 'Press Listen to hear the melody, or Practice to sing along'
                : 'Select a song to practice'
          : selectionMode === 'manual' 
            ? 'Click a piano key to select, then press Start'
            : isTimerRunning 
              ? `Hold the note for 15s with ${ACCURACY_THRESHOLD}%+ accuracy` 
              : 'Click or press Space for next key, then press Start'}
      </div>
      
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
