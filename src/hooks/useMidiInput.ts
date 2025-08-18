import { useEffect, useRef, useCallback } from 'react';
import { ChordEntry } from '../types';
import { MIDI_CONSTANTS } from '../types';
import { areArraysEqual, mergeArrays, toMidiNumber } from '../NoteBar/utils';

interface UseMidiInputParams {
  withChord: boolean;
  selectedChord: ChordEntry | null;
  poolKeys: string[];
  selectedIdx: number;
  onNext: () => void;
  onNextChord: () => void;
  onMidiConnected: (connected: boolean) => void;
}

export function useMidiInput({
  withChord,
  selectedChord,
  poolKeys,
  selectedIdx,
  onNext,
  onNextChord,
  onMidiConnected,
}: UseMidiInputParams) {
  const midiConnectedRef = useRef(false);

  const setupMidiInput = useCallback(() => {
    if (!navigator.requestMIDIAccess) return;

    const activeNotes = new Map<number, number>();
    const chordWindow = MIDI_CONSTANTS.CHORD_WINDOW_MS;
    let disconnectedTimeout: NodeJS.Timeout;
    let retryTimeout: NodeJS.Timeout;
    let inputs: any[] = [];

    const cleanUp = () => {
      clearTimeout(disconnectedTimeout);
      clearTimeout(retryTimeout);
      inputs.forEach((input: any) => {
        if (input?.removeEventListener) {
          input.removeEventListener('midimessage', handleInput);
        }
      });
    };

    const handleInput = (input: any) => {
      if (input) {
        clearTimeout(disconnectedTimeout);
        onMidiConnected(true);
        midiConnectedRef.current = true;
        
        disconnectedTimeout = setTimeout(() => {
          onMidiConnected(false);
          midiConnectedRef.current = false;
          cleanUp();
          requestMIDI();
        }, 3000);
      }

      if (withChord && selectedChord) {
        const [status, note, velocity] = input.data;
        const command = status & 0xf0;
        const now = performance.now();
        
        if (command === 0x90 && velocity > 0) {
          activeNotes.set(note, now);
          const chord: number[] = [];
          activeNotes.forEach((timestamp, key) => {
            if (now - timestamp <= chordWindow) {
              chord.push(key);
            }
          });
          
          const targetKeys = mergeArrays<number>(
            selectedChord.rootKeys, 
            selectedChord.keys
          ) as number[];
          
          if (areArraysEqual(chord, targetKeys)) {
            onNextChord();
          }
        } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
          activeNotes.delete(note);
        }
      } else {
        const [command, note, velocity] = input.data;
        if (command === 144 && velocity > 0) {
          if (note === toMidiNumber(poolKeys[selectedIdx])) {
            onNext();
          }
        }
      }
    };

    const retry = () => {
      if (midiConnectedRef.current) return;
      retryTimeout = setTimeout(() => {
        requestMIDI();
      }, 2000);
    };

    const onSuccess = (midiAccess: any) => {
      inputs = Array.from(midiAccess.inputs.values());
      if (!inputs.length && !midiConnectedRef.current) {
        retry();
      }
      inputs.forEach((input: any) => {
        input.addEventListener('midimessage', handleInput);
      });
    };

    const requestMIDI = () => {
      navigator.requestMIDIAccess()
        .then(onSuccess, retry)
        .catch(retry);
    };

    requestMIDI();
    return cleanUp;
  }, [withChord, selectedChord, poolKeys, selectedIdx, onNext, onNextChord, onMidiConnected]);

  useEffect(() => {
    const cleanup = setupMidiInput();
    return cleanup;
  }, [setupMidiInput]);

  return {
    midiConnectedRef,
  };
}