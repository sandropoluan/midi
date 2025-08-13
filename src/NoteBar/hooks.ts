import { useCallback, useMemo, useRef, useState } from 'react';
import { createChordFilter, toMidiNumber, ChordMap } from './utils';

export function usePools({
    chordMap,
    withChord,
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
}: {
    chordMap: ChordMap;
    withChord: boolean;
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
}) {
    const defaultPool = useRef<string[]>([]);
    const poolKeys = useRef<string[]>(defaultPoolKeys);
    const selectedIdx = useRef<number>(Math.floor(poolKeys.current.length * Math.random()));

    const defaultChordList = useMemo<string[]>(() => {
        const keys = Object.keys(chordMap);
        return _1octaveOnly ? ([] as string[]).concat(keys, keys, keys, keys) : keys;
    }, [_1octaveOnly, chordMap]);

    const middleCindex = defaultChordList.indexOf('C4');

    const poolChords = useRef<string[]>(
        defaultChordList.filter(
            createChordFilter(chordMap, { withMinor, withInverse1, withInverse2, inverse1Only, inverse2Only, inverseOnly, minorOnly, _7only, with7, _6only, with6, pickedChords, _67only, _1octaveOnly })
        )
    );
    const defaultPoolChords = useRef<string[]>([]);
    const selectedChordIdx = useRef<number>(Math.floor(poolChords.current.length * Math.random()));
    const selectedChord = useRef(chordMap[poolChords.current[selectedChordIdx.current]]);

    const [time, setTime] = useState<Date | undefined>();

    const reshuffle = useCallback(({ showLeftHalf, showRightHalf }: { showLeftHalf: boolean; showRightHalf: boolean; }) => {
        poolKeys.current = [];
        poolChords.current = [];

        if (withChord) {
            let pool: string[] = [];
            if (showLeftHalf && !showRightHalf) {
                pool = defaultChordList.slice(0, middleCindex);
            } else if (showRightHalf && !showLeftHalf) {
                pool = defaultChordList.slice(middleCindex);
            } else {
                pool = [...defaultChordList];
            }

            pool = pool.filter(
                createChordFilter(chordMap, { withMinor, withInverse1, withInverse2, inverse1Only, inverse2Only, inverseOnly, minorOnly, _7only, with7, _6only, with6, pickedChords, _67only, _1octaveOnly })
            );

            defaultPoolChords.current = pool;
            poolChords.current = pool;
            selectedChordIdx.current = Math.floor(poolChords.current.length * Math.random());
            const chord = poolChords.current[selectedChordIdx.current];
            selectedChord.current = chordMap[chord];
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

        setTime(new Date());
    }, [withChord, withMinor, withInverse1, withInverse2, inverse1Only, inverse2Only, inverseOnly, minorOnly, _7only, with7, _6only, with6, pickedChords, _67only, _1octaveOnly, defaultChordList, middleCindex, chordMap, defaultPoolKeys]);

    const next = useCallback(() => {
        let state = [...poolKeys.current];
        state.splice(selectedIdx.current, 1);
        if (!state.length) {
            state = [...defaultPool.current]
        }
        selectedIdx.current = Math.floor(state.length * Math.random());
        poolKeys.current = state;
        setTime(new Date());
    }, []);

    const nextChord = useCallback(() => {
        if (!withChord) return;
        let state = [...poolChords.current];
        state.splice(selectedChordIdx.current, 1);
        if (!state.length) {
            state = [...defaultPoolChords.current]
        }
        selectedChordIdx.current = Math.floor(state.length * Math.random());
        poolChords.current = state;
        const chord = poolChords.current[selectedChordIdx.current];
        selectedChord.current = chordMap[chord];
        setTime(new Date());
    }, [withChord, chordMap]);

    const cardLeft = poolKeys.current.length || poolChords.current.length;

    return {
        state: {
            defaultPool,
            poolKeys,
            selectedIdx,
            defaultChordList,
            poolChords,
            defaultPoolChords,
            selectedChordIdx,
            selectedChord,
            time,
            middleCindex,
            cardLeft,
        },
        actions: {
            reshuffle,
            next,
            nextChord,
        }
    } as const;
}

