import React, { useCallback } from 'react';
import classNames from 'classnames';
import { Piano } from 'react-piano';
import 'react-piano/dist/styles.css';
import { MIDI_CONSTANTS } from '../types';
import { usePianoSound } from '../hooks/usePianoSound';

interface VirtualPianoProps {
  showVirtualPiano: boolean;
  highlightedKeys: number[];
  onKeyboardPlayNote: (midiNumber: number) => void;
  keyboardShortcuts: string;
  scaleLabels?: Record<number, string>;
}

export const VirtualPiano: React.FC<VirtualPianoProps> = ({ 
  showVirtualPiano, 
  highlightedKeys, 
  onKeyboardPlayNote, 
  keyboardShortcuts,
  scaleLabels
}) => {
  const { playNote, stopNote } = usePianoSound();

  const handlePlayNote = useCallback((midiNumber: number) => {
    playNote(midiNumber);
    onKeyboardPlayNote(midiNumber);
  }, [playNote, onKeyboardPlayNote]);

  const handleStopNote = useCallback((midiNumber: number) => {
    stopNote(midiNumber);
  }, [stopNote]);

  if (!showVirtualPiano) return null;

  return (
    <div className='Piano-wrapper'>
      <Piano
        noteRange={{ 
          first: MIDI_CONSTANTS.FIRST_MIDI_NOTE, 
          last: MIDI_CONSTANTS.LAST_MIDI_NOTE 
        }}
        highlightedKeys={highlightedKeys}
        playNote={handlePlayNote}
        stopNote={handleStopNote}
        width={1000}
        keyWidthToHeight={0.22}
        keyboardShortcuts={keyboardShortcuts}
        renderNoteLabel={({ midiNumber, isActive, isAccidental }) => {
          if (midiNumber === MIDI_CONSTANTS.CONTROL_KEY_MIDI) {
            return (
              <div 
                className={classNames('ReactPiano__NoteLabel', {
                  'ReactPiano__NoteLabel--active': isActive,
                  'ReactPiano__NoteLabel--accidental': isAccidental,
                  'ReactPiano__NoteLabel--natural': !isAccidental,
                })}
              >
                CP
              </div>
            );
          }
          if (scaleLabels && scaleLabels[midiNumber]) {
            return (
              <div 
                className={classNames('ReactPiano__NoteLabel', 'scale-label', {
                  'ReactPiano__NoteLabel--active': isActive,
                  'ReactPiano__NoteLabel--accidental': isAccidental,
                  'ReactPiano__NoteLabel--natural': !isAccidental,
                })}
              >
                {scaleLabels[midiNumber]}
              </div>
            );
          }
          return null;
        }}
      />
    </div>
  );
};