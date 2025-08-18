import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import './index.scss';
import { PIANO_KEYBOARD_SHORTCUTS, isSubset, mergeArrays, toMidiNumber, buildChordMapWithVariants, areArraysEqual } from './utils';
import { noteMap as map } from './noteMap';
import { chordMap as baseChordMap } from './chords';
import { useAppState } from '../hooks/useAppState';
import { useMidiInput } from '../hooks/useMidiInput';
import { useGameLogic } from '../hooks/useGameLogic';
import { MIDI_CONSTANTS } from '../types';
import {
  WrongKeyOverlay,
  ConnectionStatus,
  RemainingCounter,
  ChordLabel,
  KeyDisplay,
  VirtualPiano,
  ControlPanel,
} from '../components';

const chordMap = buildChordMapWithVariants(baseChordMap);
const defaultPoolKeys = Object.keys(map).sort((a, b) => +a.split('-')[0] - +b.split('-')[0]);

const uniqueChords: string[] = Array.from(
  new Set(
    Object.values(chordMap).map(chord => chord.symbol)
  )
).sort();

export default function NoteBar() {
  const { state, actions } = useAppState();
  const playedNote = useRef<number[]>([]);

  const { 
    poolKeys, 
    selectedIdx, 
    selectedChord, 
    cardLeft, 
    reshuffle, 
    next, 
    nextChord 
  } = useGameLogic({
    chordMap,
    withChord: state.withChord,
    showLeftHalf: state.showLeftHalf,
    showRightHalf: state.showRightHalf,
    withMinor: state.withMinor,
    withInverse1: state.withInverse1,
    withInverse2: state.withInverse2,
    inverse1Only: state.inverse1Only,
    inverse2Only: state.inverse2Only,
    inverseOnly: state.inverseOnly,
    minorOnly: state.minorOnly,
    _7only: state._7only,
    with7: state.with7,
    _6only: state._6only,
    with6: state.with6,
    pickedChords: state.pickedChords,
    _67only: state._67only,
    _1octaveOnly: state._1octaveOnly,
    defaultPoolKeys,
    onTimeUpdate: actions.setTime,
  });

  useMidiInput({
    withChord: state.withChord,
    selectedChord,
    poolKeys,
    selectedIdx,
    onNext: next,
    onNextChord: nextChord,
    onMidiConnected: actions.setMidiConnected,
  });

  useEffect(() => {
    if (state.wrongKey) {
      setTimeout(() => actions.setWrongKey(false), 100);
    }
  }, [state.wrongKey, actions]);

  useEffect(() => {
    reshuffle();
  }, [
    state.showLeftHalf,
    state.showRightHalf,
    state.withChord,
    state.withMinor,
    state.withInverse1,
    state.withInverse2,
    state.inverse1Only,
    state.inverseOnly,
    state.minorOnly,
    state._7only,
    state.with7,
    state._6only,
    state.with6,
    state.pickedChords,
    state._67only,
    state._1octaveOnly,
    reshuffle,
  ]);

  const highlightedKeys = useMemo(() => {
    if (!state.virtualPianoHighlight) return [] as number[];
    if (state.withChord && selectedChord) {
      return (mergeArrays<number>(selectedChord.rootKeys, selectedChord.keys) || []).map(item => toMidiNumber(item));
    }
    return [toMidiNumber(poolKeys[selectedIdx])];
  }, [state.time, state.withChord, state.virtualPianoHighlight, selectedChord, poolKeys, selectedIdx]);





  const onClick = useCallback(() => {
    state.withChord ? nextChord() : next();
  }, [state.withChord, nextChord, next]);

  const onKeyboardPlayNote = useCallback((midiNumber: number) => {
    if (midiNumber === MIDI_CONSTANTS.CONTROL_KEY_MIDI) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => actions.toggleShowControl(), 500);
      return;
    }
    
    if (state.withChord && selectedChord) {
      playedNote.current.push(midiNumber);
      const targetKeys = mergeArrays<number>(selectedChord.rootKeys, selectedChord.keys) || [];
      
      if (
        !targetKeys.includes(midiNumber) ||
        !isSubset(playedNote.current, targetKeys) ||
        (playedNote.current.length === targetKeys.length && !areArraysEqual(targetKeys, playedNote.current))
      ) {
        playedNote.current = [];
        actions.setWrongKey(true);
        return;
      }
      
      if (playedNote.current.length === targetKeys.length && areArraysEqual(targetKeys, playedNote.current)) {
        playedNote.current = [];
        nextChord();
      }
      return;
    }
    
    if (midiNumber === toMidiNumber(poolKeys[selectedIdx])) {
      next();
    }
  }, [state.withChord, selectedChord, poolKeys, selectedIdx, next, nextChord, actions]);



  return (
    <>
      <WrongKeyOverlay wrongKey={state.wrongKey} />
      <div className='Note-bar-container'>
        <ConnectionStatus midiConnected={state.midiConnected} />
        <RemainingCounter 
          showRemainLabel={state.showRemainLabel} 
          cardLeft={cardLeft} 
        />
        <div className="Note-Bar" onClick={onClick}>
          <ChordLabel 
            withChord={state.withChord}
            showChordLabel={state.showChordLabel}
            selectedChord={selectedChord}
          />
          <KeyDisplay
            withChord={state.withChord}
            selectedChord={selectedChord}
            poolKeys={poolKeys}
            selectedIdx={selectedIdx}
            showKey={state.showKey}
            bluredChord={state.bluredChord}
            noteMap={map}
          />
        </div>

        <VirtualPiano
          showVirtualPiano={state.showVirtualPiano}
          highlightedKeys={highlightedKeys}
          onKeyboardPlayNote={onKeyboardPlayNote}
          keyboardShortcuts={PIANO_KEYBOARD_SHORTCUTS}
        />

        <ControlPanel
          showControl={state.showControl}
          state={state}
          actions={{
            toggleWithChord: actions.toggleWithChord,
            toggleBluredChord: actions.toggleBluredChord,
            toggleWithInverse1: actions.toggleWithInverse1,
            toggleInverse1Only: actions.toggleInverse1Only,
            toggleWithInverse2: actions.toggleWithInverse2,
            toggleInverse2Only: actions.toggleInverse2Only,
            toggleInverseOnly: actions.toggleInverseOnly,
            toggleWithMinor: actions.toggleWithMinor,
            toggleMinorOnly: actions.toggleMinorOnly,
            toggleWith7: actions.toggleWith7,
            toggle7Only: actions.toggle7Only,
            toggleWith6: actions.toggleWith6,
            toggle6Only: actions.toggle6Only,
            toggle67Only: actions.toggle67Only,
            toggleShowChordLabel: actions.toggleShowChordLabel,
            toggleShowKey: actions.toggleShowKey,
            toggleShowLeftHalf: actions.toggleShowLeftHalf,
            toggleShowRightHalf: actions.toggleShowRightHalf,
            toggleVirtualPianoHighlight: actions.toggleVirtualPianoHighlight,
            toggleShowRemainLabel: actions.toggleShowRemainLabel,
            setPickedChords: actions.setPickedChords,
          }}
          uniqueChords={uniqueChords}
        />
      </div>
    </>
  );
}



