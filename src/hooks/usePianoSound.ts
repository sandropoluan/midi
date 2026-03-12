import { useCallback, useEffect, useRef, useState } from 'react';
import { MIDI_CONSTANTS } from '../types';

const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const BASE_URL = 'https://raw.githubusercontent.com/fuhton/piano-mp3/master/piano-mp3';

const globalAudioCache = new Map<number, AudioBuffer>();
let audioContext: AudioContext | null = null;
let isPreloading = false;
let preloadPromise: Promise<void> | null = null;

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
  }, []);

  const playNote = useCallback((midiNumber: number) => {
    const buffer = globalAudioCache.get(midiNumber);
    if (!buffer) return;

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const existingGain = activeNodes.current.get(midiNumber);
    if (existingGain) {
      existingGain.gain.setValueAtTime(0, ctx.currentTime);
      existingGain.disconnect();
      activeNodes.current.delete(midiNumber);
    }

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    
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
