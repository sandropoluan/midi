import { useRef, useCallback, useMemo } from 'react';
import { ChordEntry, ChordMap } from '../types';
import { createChordFilter } from '../NoteBar/utils';

interface UseGameLogicParams {
  chordMap: ChordMap;
  withChord: boolean;
  showLeftHalf: boolean;
  showRightHalf: boolean;
  withMinor: boolean;
  withInverse1: boolean;
  withInverse2: boolean;
  inverse1Only: boolean;
  inverse2Only: boolean;
  inverseOnly: boolean;
  minorOnly: boolean;
  _7only: boolean;
  with7: boolean;
  _6only: boolean;
  with6: boolean;
  pickedChords: string[];
  _67only: boolean;
  _1octaveOnly: boolean;
  defaultPoolKeys: string[];
  onTimeUpdate: (time: Date) => void;
}

export function useGameLogic({
  chordMap,
  withChord,
  showLeftHalf,
  showRightHalf,
  withMinor,
  withInverse1,
  withInverse2,
  inverse1Only,
  inverse2Only,
  inverseOnly,
  minorOnly,
  _7only,
  with7,
  _6only,
  with6,
  pickedChords,
  _67only,
  _1octaveOnly,
  defaultPoolKeys,
  onTimeUpdate,
}: UseGameLogicParams) {
  
  const defaultPool = useRef<string[]>([]);
  const poolKeys = useRef<string[]>(defaultPoolKeys);
  const selectedIdx = useRef<number>(Math.floor(poolKeys.current.length * Math.random()));
  const defaultPoolChords = useRef<string[]>([]);

  const defaultChordMap = useMemo<string[]>(() => {
    const keys = Object.keys(chordMap);
    return _1octaveOnly ? ([] as string[]).concat(keys, keys, keys, keys) : keys;
  }, [_1octaveOnly, chordMap]);

  const middleCindex = defaultChordMap.indexOf('C4');
  
  const poolChords = useRef<string[]>(
    defaultChordMap.filter(
      createChordFilter(chordMap, {
        withMinor,
        withInverse1,
        withInverse2,
        inverse1Only,
        inverse2Only,
        inverseOnly,
        minorOnly,
        _7only,
        with7,
        _6only,
        with6,
        pickedChords,
        _67only,
        _1octaveOnly,
      })
    )
  );
  
  const selectedChordIdx = useRef<number>(Math.floor(poolChords.current.length * Math.random()));
  const selectedChord = useRef<ChordEntry | null>(
    poolChords.current[selectedChordIdx.current] 
      ? chordMap[poolChords.current[selectedChordIdx.current]] 
      : null
  );

  const cardLeft = poolKeys.current.length || poolChords.current.length;

  const reshuffle = useCallback(() => {
    poolKeys.current = [];
    poolChords.current = [];

    if (withChord) {
      let pool: string[] = [];
      if (showLeftHalf && !showRightHalf) {
        pool = defaultChordMap.slice(0, middleCindex);
      } else if (showRightHalf && !showLeftHalf) {
        pool = defaultChordMap.slice(middleCindex);
      } else {
        pool = [...defaultChordMap];
      }

      pool = pool.filter(
        createChordFilter(chordMap, {
          withMinor,
          withInverse1,
          withInverse2,
          inverse1Only,
          inverse2Only,
          inverseOnly,
          minorOnly,
          _7only,
          with7,
          _6only,
          with6,
          pickedChords,
          _67only,
          _1octaveOnly,
        })
      );
      
      defaultPoolChords.current = pool;
      poolChords.current = pool;
      selectedChordIdx.current = Math.floor(poolChords.current.length * Math.random());
      const chord = poolChords.current[selectedChordIdx.current];
      selectedChord.current = chord ? chordMap[chord] : null;
    } else {
      let pool: string[] = [];
      if (showLeftHalf && !showRightHalf) {
        pool = defaultPoolKeys.slice(0, 34);
      } else if (showRightHalf && !showLeftHalf) {
        pool = defaultPoolKeys.slice(34);
      } else {
        pool = [...defaultPoolKeys];
      }
      
      defaultPool.current = pool;
      poolKeys.current = pool;
      selectedIdx.current = Math.floor(poolKeys.current.length * Math.random());
    }
    
    onTimeUpdate(new Date());
  }, [
    withChord,
    showLeftHalf,
    showRightHalf,
    withMinor,
    withInverse1,
    withInverse2,
    inverse1Only,
    inverse2Only,
    inverseOnly,
    minorOnly,
    _7only,
    with7,
    _6only,
    with6,
    pickedChords,
    _67only,
    _1octaveOnly,
    defaultChordMap,
    middleCindex,
    chordMap,
    defaultPoolKeys,
    onTimeUpdate,
  ]);

  const next = useCallback(() => {
    let state = [...poolKeys.current];
    state.splice(selectedIdx.current, 1);
    if (!state.length) {
      state = [...defaultPool.current];
    }
    selectedIdx.current = Math.floor(state.length * Math.random());
    poolKeys.current = state;
    onTimeUpdate(new Date());
  }, [onTimeUpdate]);

  const nextChord = useCallback(() => {
    if (!withChord) return;
    let state = [...poolChords.current];
    state.splice(selectedChordIdx.current, 1);
    if (!state.length) {
      state = [...defaultPoolChords.current];
    }
    selectedChordIdx.current = Math.floor(state.length * Math.random());
    poolChords.current = state;
    const chord = poolChords.current[selectedChordIdx.current];
    selectedChord.current = chord ? chordMap[chord] : null;
    onTimeUpdate(new Date());
  }, [withChord, chordMap, onTimeUpdate]);

  return {
    poolKeys: poolKeys.current,
    selectedIdx: selectedIdx.current,
    selectedChord: selectedChord.current,
    cardLeft,
    reshuffle,
    next,
    nextChord,
  };
}