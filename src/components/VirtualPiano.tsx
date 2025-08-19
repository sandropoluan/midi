import React from 'react';
import classNames from 'classnames';
import { Piano } from 'react-piano';
import 'react-piano/dist/styles.css';
import { MIDI_CONSTANTS } from '../types';

interface VirtualPianoProps {
  showVirtualPiano: boolean;
  highlightedKeys: number[];
  onKeyboardPlayNote: (midiNumber: number) => void;
  keyboardShortcuts: string;
}

export const VirtualPiano: React.FC<VirtualPianoProps> = ({ 
  showVirtualPiano, 
  highlightedKeys, 
  onKeyboardPlayNote, 
  keyboardShortcuts 
}) => {
  if (!showVirtualPiano) return null;

  return (
    <div className='Piano-wrapper'>
      <Piano
        noteRange={{ 
          first: MIDI_CONSTANTS.FIRST_MIDI_NOTE, 
          last: MIDI_CONSTANTS.LAST_MIDI_NOTE 
        }}
        highlightedKeys={highlightedKeys}
        playNote={onKeyboardPlayNote}
        stopNote={() => {}}
        width={1000}
        keyWidthToHeight={0.22}
        keyboardShortcuts={keyboardShortcuts}
        renderNoteLabel={({ keyboardShortcut, midiNumber, isActive, isAccidental }) =>
          midiNumber === MIDI_CONSTANTS.CONTROL_KEY_MIDI ? (
            <div 
              className={classNames('ReactPiano__NoteLabel', {
                'ReactPiano__NoteLabel--active': isActive,
                'ReactPiano__NoteLabel--accidental': isAccidental,
                'ReactPiano__NoteLabel--natural': !isAccidental,
              })}
            >
              CP
            </div>
          ) : null
        }
      />
    </div>
  );
};