import { useCallback, useEffect, useRef, useState } from 'react';
import { MIDI_CONSTANTS } from '../types';

const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const BASE_URL = 'https://raw.githubusercontent.com/fuhton/piano-mp3/master/piano-mp3';

const globalAudioCache = new Map<number, AudioBuffer>();
let audioContext: AudioContext | null = null;
let isPreloading = false;
let preloadPromise: Promise<void> | null = null;
let audioContextUnlocked = false;

function midiToNoteName(midiNumber: number): string {
  const octave = Math.floor(midiNumber / 12) - 1;
  const noteIndex = midiNumber % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

async function unlockAudioContext(): Promise<void> {
  if (audioContextUnlocked) return;
  
  const ctx = getAudioContext();
  
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  
  // Play a silent buffer to fully unlock audio on iOS/mobile
  const silentBuffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = silentBuffer;
  source.connect(ctx.destination);
  source.start(0);
  
  audioContextUnlocked = true;
}

async function preloadAllNotes(): Promise<void> {
  if (globalAudioCache.size > 0) return;
  if (preloadPromise) return preloadPromise;
  if (isPreloading) return;

  isPreloading = true;

  preloadPromise = (async () => {
    const ctx = getAudioContext();
    const loadPromises: Promise<void>[] = [];

    for (let midi = MIDI_CONSTANTS.FIRST_MIDI_NOTE; midi <= MIDI_CONSTANTS.LAST_MIDI_NOTE; midi++) {
      const noteName = midiToNoteName(midi);
      const url = `${BASE_URL}/${noteName}.mp3`;

      const loadNote = async () => {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          globalAudioCache.set(midi, audioBuffer);
        } catch {
          // Silently skip notes that fail to load
        }
      };

      loadPromises.push(loadNote());
    }

    await Promise.all(loadPromises);
    isPreloading = false;
  })();

  return preloadPromise;
}

export function usePianoSound() {
  const [isLoaded, setIsLoaded] = useState(globalAudioCache.size > 0);
  const activeNodes = useRef<Map<number, GainNode>>(new Map());

  useEffect(() => {
    preloadAllNotes().then(() => setIsLoaded(true));
    
    // Unlock audio context on first user interaction
    const handleInteraction = () => {
      unlockAudioContext();
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('touchend', handleInteraction);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
    
    document.addEventListener('touchstart', handleInteraction, { passive: true });
    document.addEventListener('touchend', handleInteraction, { passive: true });
    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    
    return () => {
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('touchend', handleInteraction);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  const playNote = useCallback(async (midiNumber: number) => {
    // Ensure audio context is unlocked before playing
    await unlockAudioContext();
    
    const buffer = globalAudioCache.get(midiNumber);
    if (!buffer) return;

    const ctx = getAudioContext();

    const existingGain = activeNodes.current.get(midiNumber);
    if (existingGain) {
      existingGain.gain.setValueAtTime(0, ctx.currentTime);
      existingGain.disconnect();
      activeNodes.current.delete(midiNumber);
    }

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    
    // Boost volume for better audibility on mobile devices
    gainNode.gain.value = 3.0;
    
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    activeNodes.current.set(midiNumber, gainNode);
    
    source.onended = () => {
      activeNodes.current.delete(midiNumber);
    };
    
    source.start(0);
  }, []);

  const stopNote = useCallback((_midiNumber: number) => {
    // Let the note ring out naturally like a real piano
    // The sound will only be cut if the same key is pressed again
  }, []);

  return { playNote, stopNote, isLoaded };
}
