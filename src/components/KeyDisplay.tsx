import React from 'react';
import { Key } from './Key';
import { ChordEntry, NoteMap } from '../types';
import { mergeArrays } from '../NoteBar/utils';

interface KeyDisplayProps {
  withChord: boolean;
  selectedChord: ChordEntry | null;
  poolKeys: string[];
  selectedIdx: number;
  showKey: boolean;
  bluredChord: boolean;
  noteMap: NoteMap;
}

export const KeyDisplay: React.FC<KeyDisplayProps> = ({
  withChord,
  selectedChord,
  poolKeys,
  selectedIdx,
  showKey,
  bluredChord,
  noteMap,
}) => {
  if (withChord && selectedChord) {
    const keyNumbers = mergeArrays(
      selectedChord.rootKeysMask,
      selectedChord.mask
    ) || mergeArrays(selectedChord.rootKeys, selectedChord.keys);

    return (
      <>
        {keyNumbers?.map((keyNumber) => {
          const isFlat = typeof keyNumber === 'string';
          const noteKey = isFlat ? keyNumber : `${keyNumber}`;
          const noteEntry = noteMap[noteKey] || noteMap[`${keyNumber}-sharp`];
          
          if (!noteEntry) return null;
          
          const { asset, y, bar, key: note, sharp } = noteEntry;
          
          return (
            <Key
              key={keyNumber}
              bar={bar}
              note={note}
              asset={asset}
              y={y}
              showKey={showKey}
              sharp={sharp && !isFlat}
              isFlat={isFlat}
              i={0}
              blured={bluredChord}
            />
          );
        })}
      </>
    );
  }

  if (!withChord && poolKeys.length > 0) {
    return (
      <>
        {poolKeys.map((key, i) => {
          if (i !== selectedIdx) return null;
          
          const noteEntry = noteMap[key];
          if (!noteEntry) return null;
          
          const { asset, y, bar, key: note, sharp, flat } = noteEntry;
          
          return (
            <Key
              key={key}
              bar={bar}
              note={note}
              asset={asset}
              y={y}
              showKey={showKey}
              isFlat={flat}
              sharp={sharp}
              i={i}
            />
          );
        })}
      </>
    );
  }

  return null;
};