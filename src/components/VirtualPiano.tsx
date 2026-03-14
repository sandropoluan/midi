import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { Piano } from 'react-piano';
import 'react-piano/dist/styles.css';
import { MIDI_CONSTANTS } from '../types';
import { usePianoSound } from '../hooks/usePianoSound';

export interface PreviewKey {
  midi: number;
  positions: number[]; // Array of positions (1-7) for this key
  opacity: number; // 0-1
}

interface VirtualPianoProps {
  showVirtualPiano: boolean;
  highlightedKeys: number[];
  onKeyboardPlayNote: (midiNumber: number) => void;
  keyboardShortcuts: string;
  scaleLabels?: Record<number, string>;
  previewKeys?: PreviewKey[];
  detectedMidi?: number; // Currently detected pitch MIDI number
  isCorrect?: boolean; // Whether the detected pitch matches the target
  playingPreviewMidi?: number | null; // Currently playing preview note
  playingPulseKey?: number; // Key to trigger re-animation on same note
}

export const VirtualPiano: React.FC<VirtualPianoProps> = ({ 
  showVirtualPiano, 
  highlightedKeys, 
  onKeyboardPlayNote, 
  keyboardShortcuts,
  scaleLabels,
  previewKeys,
  detectedMidi,
  isCorrect,
  playingPreviewMidi,
  playingPulseKey
}) => {
  const { playNote, stopNote } = usePianoSound();

  const handlePlayNote = useCallback((midiNumber: number) => {
    playNote(midiNumber);
    onKeyboardPlayNote(midiNumber);
  }, [playNote, onKeyboardPlayNote]);

  const handleStopNote = useCallback((midiNumber: number) => {
    stopNote(midiNumber);
  }, [stopNote]);

  // Combine highlighted keys with preview keys and detected key for highlighting
  const allHighlightedKeys = useMemo(() => {
    const keys = [...highlightedKeys];
    if (previewKeys) {
      previewKeys.forEach(pk => {
        if (!keys.includes(pk.midi)) {
          keys.push(pk.midi);
        }
      });
    }
    // Add detected key to highlighted keys
    if (detectedMidi && detectedMidi > 0 && !keys.includes(detectedMidi)) {
      keys.push(detectedMidi);
    }
    // Add playing preview key
    if (playingPreviewMidi && playingPreviewMidi > 0 && !keys.includes(playingPreviewMidi)) {
      keys.push(playingPreviewMidi);
    }
    return keys;
  }, [highlightedKeys, previewKeys, detectedMidi, playingPreviewMidi]);

  // Create a map of preview keys for quick lookup
  const previewKeyMap = useMemo(() => {
    const map: Record<number, PreviewKey> = {};
    if (previewKeys) {
      previewKeys.forEach(pk => {
        map[pk.midi] = pk;
      });
    }
    return map;
  }, [previewKeys]);

  if (!showVirtualPiano) return null;

  return (
    <div className='Piano-wrapper'>
      <Piano
        noteRange={{ 
          first: MIDI_CONSTANTS.FIRST_MIDI_NOTE, 
          last: MIDI_CONSTANTS.LAST_MIDI_NOTE 
        }}
        highlightedKeys={allHighlightedKeys}
        playNote={handlePlayNote}
        stopNote={handleStopNote}
        width={1000}
        keyWidthToHeight={0.22}
        keyboardShortcuts={keyboardShortcuts}
        renderNoteLabel={({ midiNumber, isActive, isAccidental }) => {
          const previewKey = previewKeyMap[midiNumber];
          const isTargetKey = highlightedKeys.includes(midiNumber);
          const isDetectedKey = detectedMidi === midiNumber;
          const isPlayingPreview = playingPreviewMidi === midiNumber;
          
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
          
          // Show playing preview indicator with pulse animation
          if (isPlayingPreview) {
            return (
              <div 
                key={`playing-${playingPulseKey}`}
                className={classNames('ReactPiano__NoteLabel', 'playing-preview-label', {
                  'ReactPiano__NoteLabel--active': isActive,
                  'ReactPiano__NoteLabel--accidental': isAccidental,
                  'ReactPiano__NoteLabel--natural': !isAccidental,
                })}
              >
                ♫
              </div>
            );
          }
          
          // Show detected pitch indicator (distinct orange/coral color)
          if (isDetectedKey && !isTargetKey) {
            return (
              <div 
                className={classNames('ReactPiano__NoteLabel', 'detected-label', {
                  'ReactPiano__NoteLabel--active': isActive,
                  'ReactPiano__NoteLabel--accidental': isAccidental,
                  'ReactPiano__NoteLabel--natural': !isAccidental,
                })}
              >
                ♪
              </div>
            );
          }
          
          // Show preview key labels with numbers (vertical layout)
          if (previewKey) {
            return (
              <div 
                className={classNames('ReactPiano__NoteLabel', 'preview-label', {
                  'ReactPiano__NoteLabel--active': isActive,
                  'ReactPiano__NoteLabel--accidental': isAccidental,
                  'ReactPiano__NoteLabel--natural': !isAccidental,
                })}
                style={{ 
                  opacity: previewKey.opacity,
                  background: isAccidental 
                    ? `rgba(78, 204, 163, ${previewKey.opacity * 0.9})`
                    : `rgba(78, 204, 163, ${previewKey.opacity * 0.8})`
                }}
              >
                {previewKey.positions.map((pos, idx) => (
                  <span key={idx} className="preview-number">{pos}</span>
                ))}
              </div>
            );
          }
          
          if (scaleLabels && scaleLabels[midiNumber] && !isTargetKey) {
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