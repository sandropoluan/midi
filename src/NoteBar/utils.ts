import { KeyboardShortcuts, MidiNumbers } from 'react-piano';

export const FIRST_MIDI_NOTE = MidiNumbers.fromNote('c2');
export const LAST_MIDI_NOTE = MidiNumbers.fromNote('D6');
export const PIANO_KEYBOARD_SHORTCUTS = KeyboardShortcuts.create({
    firstNote: FIRST_MIDI_NOTE,
    lastNote: LAST_MIDI_NOTE,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

export const CHORD_WINDOW_MS = 50;

export function areArraysEqual<T>(arr1: T[], arr2: T[]): boolean {
    if (arr1.length !== arr2.length) return false;
    const sorted1 = arr1.slice().sort();
    const sorted2 = arr2.slice().sort();
    for (let i = 0; i < sorted1.length; i++) {
        if (sorted1[i] !== sorted2[i]) return false;
    }
    return true;
}

export function isSubset<T>(arr1: T[], mainArray: T[]): boolean {
    if (arr1.length > mainArray.length) return false;
    let mainCopy = mainArray.slice();
    for (let elem of arr1) {
        let index = mainCopy.indexOf(elem);
        if (index === -1) return false;
        mainCopy.splice(index, 1);
    }
    return true;
}

export function mergeArrays<T>(arr1: T[] = [], arr2: T[] = []): T[] | undefined {
    if (!arr1.length && !arr2.length) return undefined;
    return [...arr1, ...arr2];
}

export function toMidiNumber(key: string | number): number {
    return +(`${key}`.split('-')[0]);
}

export type ChordEntry = {
    symbol: string;
    keys: number[];
    mask?: Array<number | string>;
    rootKeys?: number[];
    rootKeysMask?: Array<number | string>;
};

export type ChordMap = Record<string, ChordEntry>;

export function buildChordMapWithVariants(baseChordMap: ChordMap): ChordMap {
    const newChordMap: ChordMap = {};
    for (const chordKey of Object.keys(baseChordMap)) {
        newChordMap[chordKey] = baseChordMap[chordKey];
        const chord = baseChordMap[chordKey];

        const rootObj: Partial<ChordEntry> = {};
        if (chord.keys[0] - 12 >= 36) {
            rootObj['rootKeys'] = [chord.keys[0] - 12];
            if (chord.mask?.length) {
                rootObj['rootKeysMask'] = [typeof chord.mask[0] === 'string' ? `${+chord.mask[0] - 12}` : chord.mask[0] - 12];
            }
        }
        newChordMap[chordKey] = { ...newChordMap[chordKey], ...rootObj } as ChordEntry;

        if (chord.keys[0] + 12 <= 84) {
            const inverse1Keys = [chord.keys[1], chord.keys[2], chord.keys[0] + 12];
            const inverse1: ChordEntry = {
                symbol: chord.symbol + ' Inv1',
                keys: inverse1Keys,
            };
            if (chord.mask) {
                const maskRoot = chord.mask[0];
                const newMaskRoot = (typeof maskRoot === 'string')
                    ? String(Number(maskRoot) + 12)
                    : (maskRoot as number) + 12;
                inverse1.mask = [chord.mask[1], chord.mask[2], newMaskRoot];
            }
            newChordMap[chordKey + 'Inverse1'] = { ...inverse1, ...rootObj } as ChordEntry;
        }

        if (chord.keys[2] - 12 >= 36) {
            const inverse2Keys = [chord.keys[2] - 12, chord.keys[0], chord.keys[1]];
            const inverse2: ChordEntry = {
                symbol: chord.symbol + ' Inv2',
                keys: inverse2Keys,
            };
            if (chord.mask) {
                const maskA = chord.mask[0];
                const maskB = chord.mask[1];
                const maskC = chord.mask[2];
                const newMaskC = (typeof maskC === 'string')
                    ? String(Number(maskC) - 12)
                    : (maskC as number) - 12;
                inverse2.mask = [newMaskC, maskA, maskB];
            }
            newChordMap[chordKey + 'Inverse2'] = { ...inverse2, ...rootObj } as ChordEntry;
        }

        if (chord.keys[0] - 1 >= 36) {
            const major7: ChordEntry = {
                symbol: chord.symbol + '△7',
                keys: [chord.keys[0] - 1, chord.keys[1], chord.keys[2]],
            }
            if (chord.mask) {
                major7.mask = [chord.keys[0] - 1, chord.mask[1], chord.mask[2]];
            }
            newChordMap[chordKey + '△7'] = { ...major7, ...rootObj } as ChordEntry;
        }

        if (chord.keys[0] - 2 >= 36) {
            const _7: ChordEntry = {
                symbol: chord.symbol + '7',
                keys: [chord.keys[0] - 2, chord.keys[1], chord.keys[2]],
            }
            if (chord.mask) {
                _7.mask = [chord.keys[0] - 2, chord.mask[1], chord.mask[2]];
            }
            newChordMap[chordKey + '7'] = { ..._7, ...rootObj } as ChordEntry;
        }

        let show6: boolean | number = chord.keys[2] + 2 <= 84;
        if (chord.mask && chord.mask[2] !== undefined) {
            // bitwise & here was used to keep boolean; preserve logic by converting back to boolean
            show6 = Boolean(show6 && +chord.mask[2] + 2 <= 84);
        }

        if (show6) {
            const _6: ChordEntry = {
                symbol: chord.symbol + '6',
                keys: [chord.keys[0], chord.keys[1], chord.keys[2], +chord.keys[2] + 2],
            }
            if (chord.mask) {
                _6.mask = [chord.mask[0], chord.mask[1], chord.mask[2], +chord.keys[2] + 2];
            }
            newChordMap[chordKey + '6'] = { ..._6, ...rootObj } as ChordEntry;
        }
    }
    return newChordMap;
}

type FilterParams = {
  withMinor: boolean;
  minorOnly: boolean;
  withInverse1: boolean;
  withInverse2: boolean;
  inverse1Only: boolean;
  inverse2Only: boolean;
  inverseOnly: boolean;
  _7only: boolean;
  with7: boolean;
  _6only: boolean;
  with6: boolean;
  pickedChords: string[];
  _67only: boolean;
  _1octaveOnly: boolean;
};

export const createChordFilter = (chordMap: ChordMap, params: FilterParams) => {
  const { withMinor, minorOnly, withInverse1, withInverse2, inverse1Only, inverse2Only, inverseOnly, _7only, with7, _6only, with6, pickedChords, _67only, _1octaveOnly } = params;
  return (item: string): boolean => {
    if (pickedChords.length) {
      const { symbol } = chordMap[item] ?? {};
      return pickedChords.indexOf(symbol) > -1;
    }

    let show: boolean = true;
    if (!withInverse1) show &&= !item.includes('Inverse1');
    if (!withInverse2) show &&= !item.includes('Inverse2');
    if (inverse1Only || inverse2Only || inverseOnly) show &&= item.includes('Inverse');
    if (!withMinor) show &&= !item.includes('Minor') && !item.includes('m');
    if (minorOnly) show &&= item.includes('Minor') || item.includes('m');
    if (!with7) show &&= !item.includes('7');
    if (_7only) show &&= item.includes('7');
    if (!with6) show &&= !item.includes('6');
    if (_6only) show &&= item.includes('6');
    if (_67only) show &&= item.includes('6') || item.includes('7');
    if (_1octaveOnly) show &&= item.includes('4');
    return show;
  }
}

