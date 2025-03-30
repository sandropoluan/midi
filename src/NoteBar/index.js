import { useCallback, useEffect, useRef, useState } from 'react';
import Toggle from 'react-toggle';
import 'react-toggle/style.css'
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';
import './index.css'
import frullImage from './full.png';

function arraysEqual(arr1, arr2) {
    // If lengths differ, arrays can't be equal.
    if (arr1.length !== arr2.length) return false;
  
    // Create sorted copies of the arrays
    const sorted1 = arr1.slice().sort();
    const sorted2 = arr2.slice().sort();
  
    // Compare each element
    for (let i = 0; i < sorted1.length; i++) {
      if (sorted1[i] !== sorted2[i]) return false;
    }
  
    return true;
  }

const map = {
    36: { // C2
        key: 'C',
        asset: frullImage,
        y: 471,
        bar: 'middle'
    },
    37: { // C#2
        key: 'C#',
        sharp: true,
        asset: frullImage,
        y: 471,
        bar: 'middle'
    },
    38: { // D2
        key: 'D',
        asset: frullImage,
        y: 456,
        bar: 'bottom'
    },
    39: { // D#2
        key: 'D#',
        sharp: true,
        asset: frullImage,
        y: 456,
        bar: 'bottom'
    },
    40: { // E2
        key: 'E',
        asset: frullImage,
        y: 440,
        bar: 'middle'
    },
    41: { // F2
        key: 'F',
        asset: frullImage,
        y: 425,
        bar: 'bottom'
    },
    42: { // F#2
        key: 'F#',
        sharp: true,
        asset: frullImage,
        y: 425,
        bar: 'bottom'
    },
    43: { // G2
        key: 'G',
        asset: frullImage,
        y: 409,
    },
    44: { // G#2
        key: 'G#',
        sharp: true,
        asset: frullImage,
        y: 409,
    },
    45: { // A2
        key: 'A',
        asset: frullImage,
        y: 394,
    },
    46: { // A#2
        key: 'A',
        sharp: true,
        asset: frullImage,
        y: 394,
    },
    47: { // B2
        key: 'B',
        asset: frullImage,
        y: 378,
    },
    48: { // C3
        key: 'C',
        asset: frullImage,
        y: 362,
    },
    49: { // C#3
        key: 'C#',
        sharp: true,
        asset: frullImage,
        y: 362,
    },
    50: { // D3
        key: 'D',
        asset: frullImage,
        y: 347,
    },
    51: { // D#3
        key: 'D#',
        sharp: true,
        asset: frullImage,
        y: 347,
    },
    52: { // E3
        key: 'E',
        asset: frullImage,
        y: 330,
    },
    53: { // F3
        key: 'F',
        asset: frullImage,
        y: 315,
    },
    54: { // F#3
        key: 'F#',
        sharp: true,
        asset: frullImage,
        y: 315,
    },
    55: { // G3
        key: 'G',
        asset: frullImage,
        y: 300,
    },
    56: { // G#3
        key: 'G#',
        sharp: true,
        asset: frullImage,
        y: 300,
    },
    57: { // A3
        key: 'A',
        asset: frullImage,
        y: 284,
    },
    58: { // A#3
        key: 'A#',
        sharp: true,
        asset: frullImage,
        y: 284,
    },
    59: { // B3
        key: 'B',
        asset: frullImage,
        y: 268,
    },
    60: { // C4 (Middle C)
        key: 'C',
        asset: frullImage,
        y: 198,
        bar: 'middle'
    },
    61: { // C#4
        key: 'C#',
        sharp: true,
        asset: frullImage,
        y: 198,
        bar: 'middle'
    },
    62: { // D4
        key: 'D',
        asset: frullImage,
        y: 179,
    },
    63: { // D#4
        key: 'D#',
        sharp: true,
        asset: frullImage,
        y: 179,
    },
    64: { // E4
        key: 'E',
        asset: frullImage,
        y: 165,
    },
    65: { // F4
        key: 'F',
        asset: frullImage,
        y: 148,
    },
    66: { // F#4
        key: 'F#',
        sharp: true,
        asset: frullImage,
        y: 148,
    },
    67: { // G4
        key: 'G',
        asset: frullImage,
        y: 132,
    },
    68: { // G#4
        key: 'G#',
        sharp: true,
        asset: frullImage,
        y: 132,
    },
    69: { // A4
        key: 'A',
        asset: frullImage,
        y: 116,
    },
    70: { // A#4
        key: 'A#',
        sharp: true,
        asset: frullImage,
        y: 116,
    },
    71: { // B4
        key: 'B',
        asset: frullImage,
        y: 100,
    },
    72: { // C5
        key: 'C',
        asset: frullImage,
        y: 85,
    },
    73: { // C#5
        key: 'C#',
        sharp: true,
        asset: frullImage,
        y: 85,
    },
    74: { // D5
        key: 'D',
        asset: frullImage,
        y: 69,
    },
    75: { // D#5
        key: 'D#',
        sharp: true,
        asset: frullImage,
        y: 69,
    },
    76: { // E5
        key: 'E',
        asset: frullImage,
        y: 55,
    },
    77: { // F5
        key: 'F',
        asset: frullImage,
        y: 39,
    },
    78: { // F#5
        key: 'F#',
        sharp: true,
        asset: frullImage,
        y: 39,
    },
    79: { // G5
        key: 'G',
        asset: frullImage,
        y: 23,
        bar: 'top'
    },
    80: { // G#5
        key: 'G#',
        sharp: true,
        asset: frullImage,
        y: 23,
        bar: 'top'
    },
    81: { // A5
        key: 'A',
        asset: frullImage,
        y: 8,
        bar: 'middle'
    },
    82: { // A#5
        key: 'A#',
        sharp: true,
        asset: frullImage,
        y: 8,
        bar: 'middle'
    },
    83: { // B5
        key: 'B',
        asset: frullImage,
        y: -8,
        bar: 'top'
    },
    84: { // C6
        key: 'C',
        asset: frullImage,
        y: -23,
        bar: 'middle'
    }
}
const chordMap = {
    // Octave 2 (base = 12*(2+1)=36)
    'C2': {
        symbol: 'C',
        keys: [36, 36 + 4, 36 + 7], // [36, 40, 43]
    },
    'CMinor2': {
        symbol: 'Cm',
        keys: [36, 36 + 3, 36 + 7], // [36, 39, 43],
        mask: [36, '40', 43],
    },
    'C#2': {
        symbol: 'C#/D♭',
        keys: [36 + 1, 36 + 1 + 4, 36 + 1 + 7], // [37, 41, 44],
        mask: ['38', 41, '45']
    },
    'C#m2': {
        symbol: 'C#m/D♭m',
        keys: [36 + 1, 36 + 1 + 3, 36 + 1 + 7], // [37, 40, 44]
    },
    'D2': {
        symbol: 'D',
        keys: [36 + 2, 36 + 2 + 4, 36 + 2 + 7], // [38, 42, 45]
    },
    'DMinor2': {
        symbol: 'Dm',
        keys: [36 + 2, 36 + 2 + 3, 36 + 2 + 7], // [38, 41, 45]
    },
    'D#2': {
        symbol: 'D#/E♭',
        keys: [36 + 3, 36 + 3 + 4, 36 + 3 + 7], // [39, 43, 46],
        mask: ['40', 43, '47'],
    },
    'D#m2': {
        symbol: 'D#m/E♭m',
        keys: [36 + 3, 36 + 3 + 3, 36 + 3 + 7], // [39, 42, 46]
    },
    'E2': {
        symbol: 'E',
        keys: [36 + 4, 36 + 4 + 4, 36 + 4 + 7], // [40, 44, 47]
    },
    'EMinor2': {  // you could also call it 'Em2'
        symbol: 'Em',
        keys: [36 + 4, 36 + 4 + 3, 36 + 4 + 7], // [40, 43, 47]
    },
    'F2': {
        symbol: 'F',
        keys: [36 + 5, 36 + 5 + 4, 36 + 5 + 7], // [41, 45, 48]
    },
    'FMinor2': {
        symbol: 'Fm',
        keys: [36 + 5, 36 + 5 + 3, 36 + 5 + 7], // [41, 44, 48],
        mask: [41, '45', 48]
    },
    'F#2': {
        symbol: 'F#/G♭',
        keys: [36 + 6, 36 + 6 + 4, 36 + 6 + 7], // [42, 46, 49]
    },
    'F#m2': {
        symbol: 'F#m/G♭m',
        keys: [36 + 6, 36 + 6 + 3, 36 + 6 + 7], // [42, 45, 49]
    },
    'G2': {
        symbol: 'G',
        keys: [36 + 7, 36 + 7 + 4, 36 + 7 + 7], // [43, 47, 50]
    },
    'GMinor2': {
        symbol: 'Gm',
        keys: [36 + 7, 36 + 7 + 3, 36 + 7 + 7], // [43, 46, 50],
        mask: [43, '47', 50],
    },
    'G#2': {
        symbol: 'G#/A♭',
        keys: [36 + 8, 36 + 8 + 4, 36 + 8 + 7], // [44, 48, 51],
        mask: ['45', 48, '52']
    },
    'G#m2': {
        symbol: 'G#m,A♭m',
        keys: [36 + 8, 36 + 8 + 3, 36 + 8 + 7], // [44, 47, 51]
    },
    'A2': {
        symbol: 'A',
        keys: [36 + 9, 36 + 9 + 4, 36 + 9 + 7], // [45, 49, 52]
    },
    'AMinor2': {
        symbol: 'Am',
        keys: [36 + 9, 36 + 9 + 3, 36 + 9 + 7], // [45, 48, 52]
    },
    'A#2': {
        symbol: 'A#/B♭',
        keys: [36 + 10, 36 + 10 + 4, 36 + 10 + 7], // [46, 50, 53],
        mask: ['47', 50, 53],
    },
    'A#m2': {
        symbol: 'A#m/B♭m',
        keys: [36 + 10, 36 + 10 + 3, 36 + 10 + 7], // [46, 49, 53],
        mask: ['47', '50', 53],
    },
    'B2': {
        symbol: 'B',
        keys: [36 + 11, 36 + 11 + 4, 36 + 11 + 7], // [47, 51, 54]
    },
    'BMinor2': {
        symbol: 'Bm',
        keys: [36 + 11, 36 + 11 + 3, 36 + 11 + 7], // [47, 50, 54]
    },

    // Octave 3 (base = 12*(3+1)=48)
    'C3': {
        symbol: 'C',
        keys: [48, 48 + 4, 48 + 7], // [48, 52, 55]
    },
    'CMinor3': {
        symbol: 'Cm',
        keys: [48, 48 + 3, 48 + 7], // [48, 51, 55],
        mask: [48, '52', 55]
    },
    'C#3': {
        symbol: 'C#/D♭',
        keys: [48 + 1, 48 + 1 + 4, 48 + 1 + 7], // [49, 53, 56]
        mask: ['50', 53, '57']
    },
    'C#m3': {
       symbol: 'C#m/D♭m',
        keys: [48 + 1, 48 + 1 + 3, 48 + 1 + 7], // [49, 52, 56]
    },
    'D3': {
        symbol: 'D',
        keys: [48 + 2, 48 + 2 + 4, 48 + 2 + 7], // [50, 54, 57]
    },
    'DMinor3': {
        symbol: 'Dm',
        keys: [48 + 2, 48 + 2 + 3, 48 + 2 + 7], // [50, 53, 57]
    },
    'D#3': {
        symbol: 'D#/E♭',
        keys: [48 + 3, 48 + 3 + 4, 48 + 3 + 7], // [51, 55, 58],
        mask: ['52', 55, '59']
    },
    'D#m3': {
         symbol: 'D#m/E♭m',
        keys: [48 + 3, 48 + 3 + 3, 48 + 3 + 7], // [51, 54, 58]
    },
    'E3': {
        symbol: 'E',
        keys: [48 + 4, 48 + 4 + 4, 48 + 4 + 7], // [52, 56, 59]
    },
    'EMinor3': {
        symbol: 'Em',
        keys: [48 + 4, 48 + 4 + 3, 48 + 4 + 7], // [52, 55, 59]
    },
    'F3': {
        symbol: 'F',
        keys: [48 + 5, 48 + 5 + 4, 48 + 5 + 7], // [53, 57, 60]
    },
    'FMinor3': {
        symbol: 'Fm',
        keys: [48 + 5, 48 + 5 + 3, 48 + 5 + 7], // [53, 56, 60],
        mask: [53, '57', 60],
    },
    'F#3': {
        symbol: 'F#/G♭',
        keys: [48 + 6, 48 + 6 + 4, 48 + 6 + 7], // [54, 58, 61]
    },
    'F#m3': {
        symbol: 'F#m/G♭m',
        keys: [48 + 6, 48 + 6 + 3, 48 + 6 + 7], // [54, 57, 61]
    },
    'G3': {
        symbol: 'G',
        keys: [48 + 7, 48 + 7 + 4, 48 + 7 + 7], // [55, 59, 62]
    },
    'GMinor3': {
        symbol: 'Gm',
        keys: [48 + 7, 48 + 7 + 3, 48 + 7 + 7], // [55, 58, 62],
        mask: [55, '59', 62],
    },
    'G#3': {
        symbol: 'G#/A♭',
        keys: [48 + 8, 48 + 8 + 4, 48 + 8 + 7], // [56, 60, 63],
        mask: ['57', 60, '64'],
    },
    'G#m3': {
        symbol: 'G#m/A♭m',
        keys: [48 + 8, 48 + 8 + 3, 48 + 8 + 7], // [56, 59, 63]
    },
    'A3': {
        symbol: 'A',
        keys: [48 + 9, 48 + 9 + 4, 48 + 9 + 7], // [57, 61, 64]
    },
    'AMinor3': {
        symbol: 'Am',
        keys: [48 + 9, 48 + 9 + 3, 48 + 9 + 7], // [57, 60, 64]
    },
    'A#3': {
        symbol: 'A#/B♭',
        keys: [48 + 10, 48 + 10 + 4, 48 + 10 + 7], // [58, 62, 65],
        mask: ['59', 62, 65],
    },
    'A#m3': {
        symbol: 'A#m/B♭m',
        keys: [48 + 10, 48 + 10 + 3, 48 + 10 + 7], // [58, 61, 65],
        mask: ['59', '62', 65],
    },
    'B3': {
        symbol: 'B',
        keys: [48 + 11, 48 + 11 + 4, 48 + 11 + 7], // [59, 63, 66]
    },
    'BMinor3': {
        symbol: 'Bm',
        keys: [48 + 11, 48 + 11 + 3, 48 + 11 + 7], // [59, 62, 66]
    },

    // Octave 4 (base = 12*(4+1)=60)
    'C4': {
        symbol: 'C',
        keys: [60, 60 + 4, 60 + 7], // [60, 64, 67]
    },
    'CMinor4': {
        symbol: 'Cm',
        keys: [60, 60 + 3, 60 + 7], // [60, 63, 67],
        mask: [60, '64', 67]
    },
    'C#4': {
        symbol: 'C#/D♭',
        keys: [60 + 1, 60 + 1 + 4, 60 + 1 + 7], // [61, 65, 68],
        mask: ['62', 65, '69']
    },
    'C#m4': {
       symbol: 'C#m/D♭m',
        keys: [60 + 1, 60 + 1 + 3, 60 + 1 + 7], // [61, 64, 68]
    },
    'D4': {
        symbol: 'D',
        keys: [60 + 2, 60 + 2 + 4, 60 + 2 + 7], // [62, 66, 69]
    },
    'DMinor4': {
        symbol: 'Dm',
        keys: [60 + 2, 60 + 2 + 3, 60 + 2 + 7], // [62, 65, 69]
    },
    'D#4': {
        symbol: 'D#/E♭',
        keys: [60 + 3, 60 + 3 + 4, 60 + 3 + 7], // [63, 67, 70],
        mask: ['64', 67, '71'],
    },
    'D#m4': {
         symbol: 'D#m/E♭m',
        keys: [60 + 3, 60 + 3 + 3, 60 + 3 + 7], // [63, 66, 70]
    },
    'E4': {
        symbol: 'E',
        keys: [60 + 4, 60 + 4 + 4, 60 + 4 + 7], // [64, 68, 71]
    },
    'EMinor4': {
        symbol: 'Em',
        keys: [60 + 4, 60 + 4 + 3, 60 + 4 + 7], // [64, 67, 71]
    },
    'F4': {
        symbol: 'F',
        keys: [60 + 5, 60 + 5 + 4, 60 + 5 + 7], // [65, 69, 72]
    },
    'FMinor4': {
        symbol: 'Fm',
        keys: [60 + 5, 60 + 5 + 3, 60 + 5 + 7], // [65, 68, 72],
        mask: [65, '69', 72],
    },
    'F#4': {
        symbol: 'F#/G♭',
        keys: [60 + 6, 60 + 6 + 4, 60 + 6 + 7], // [66, 70, 73]
    },
    'F#m4': {
        symbol: 'F#m/G♭m',
        keys: [60 + 6, 60 + 6 + 3, 60 + 6 + 7], // [66, 69, 73]
    },
    'G4': {
        symbol: 'G',
        keys: [60 + 7, 60 + 7 + 4, 60 + 7 + 7], // [67, 71, 74]
    },
    'GMinor4': {
        symbol: 'Gm',
        keys: [60 + 7, 60 + 7 + 3, 60 + 7 + 7], // [67, 70, 74],
        mask: [67, '71', 74],
    },
    'G#4': {
        symbol: 'G#/A♭',
        keys: [60 + 8, 60 + 8 + 4, 60 + 8 + 7], // [68, 72, 75],
        mask: ['69', 72, '76'],
    },
    'G#m4': {
        symbol: 'G#m/A♭m',
        keys: [60 + 8, 60 + 8 + 3, 60 + 8 + 7], // [68, 71, 75]
    },
    'A4': {
        symbol: 'A',
        keys: [60 + 9, 60 + 9 + 4, 60 + 9 + 7], // [69, 73, 76]
    },
    'AMinor4': {
        symbol: 'Am',
        keys: [60 + 9, 60 + 9 + 3, 60 + 9 + 7], // [69, 72, 76]
    },
    'A#4': {
        symbol: 'A#/B♭',
        keys: [60 + 10, 60 + 10 + 4, 60 + 10 + 7], // [70, 74, 77],
        mask: ['71', 74, 77],
    },
    'A#m4': {
        symbol: 'A#m/B♭m',
        keys: [60 + 10, 60 + 10 + 3, 60 + 10 + 7], // [70, 73, 77],
        mask: ['71', '74', 77]
    },
    'B4': {
        symbol: 'B',
        keys: [60 + 11, 60 + 11 + 4, 60 + 11 + 7], // [71, 75, 78]
    },
    'BMinor4': {
        symbol: 'Bm',
        keys: [60 + 11, 60 + 11 + 3, 60 + 11 + 7], // [71, 74, 78]
    },

    // Octave 5 (base = 12*(5+1)=72) -- only include notes up to F (offsets 0 to 5)
    'C5': {
        symbol: 'C',
        keys: [72, 72 + 4, 72 + 7], // [72, 76, 79]
    },
    'CMinor5': {
        symbol: 'Cm',
        keys: [72, 72 + 3, 72 + 7], // [72, 75, 79],
        mask: [72, '76', 79]
    },
    'C#5': {
        symbol: 'C#/D♭',
        keys: [72 + 1, 72 + 1 + 4, 72 + 1 + 7], // [73, 77, 80],
        mask: ['74', 77, '81']
    },
    'C#m5': {
       symbol: 'C#m/D♭m',
        keys: [72 + 1, 72 + 1 + 3, 72 + 1 + 7], // [73, 76, 80]
    },
    'D5': {
        symbol: 'D',
        keys: [72 + 2, 72 + 2 + 4, 72 + 2 + 7], // [74, 78, 81]
    },
    'DMinor5': {
        symbol: 'Dm',
        keys: [72 + 2, 72 + 2 + 3, 72 + 2 + 7], // [74, 77, 81]
    },
    'D#5': {
        symbol: 'D#/E♭',
        keys: [72 + 3, 72 + 3 + 4, 72 + 3 + 7], // [75, 79, 82],
        mask: ['76', 79, '83']
    },
    'D#m5': {
         symbol: 'D#m/E♭m',
        keys: [72 + 3, 72 + 3 + 3, 72 + 3 + 7], // [75, 78, 82]
    },
    'E5': {
        symbol: 'E',
        keys: [72 + 4, 72 + 4 + 4, 72 + 4 + 7], // [76, 80, 83]
    },
    'EMinor5': {
        symbol: 'Em',
        keys: [72 + 4, 72 + 4 + 3, 72 + 4 + 7], // [76, 79, 83]
    },
    'F5': {
        symbol: 'F',
        keys: [72 + 5, 72 + 5 + 4, 72 + 5 + 7], // [77, 81, 84]
    },
    'FMinor5': {
        symbol: 'Fm',
        keys: [72 + 5, 72 + 5 + 3, 72 + 5 + 7], // [77, 80, 84],
        mask: [77, '81', 84],
    },
};

const defaultChordMap = Object.keys(chordMap);
const defaultPoolKeys = Object.keys(map);

const nonMinorFilter = chord => (!chord.includes('Minor') && !chord.includes('m'));

export default function NoteBar() {

    const [showLeftHalf, setShowLeftHalf] = useState(true);
    const [showRightHalf, setShowRightHalf] = useState(true);

    const [withMinor, setWithMinor] = useState(false);

    const [withChord, setWithChord] = useState(true);

    const [showChordLabel, setShowChordLabel] = useState(true);

    const dafaultPool = useRef([])
    const poolKeys = useRef(defaultPoolKeys);
    const selectedIdx = useRef(Math.floor(poolKeys.current.length * Math.random()));

    const defaultPollChords = useRef([]);
    const pollChords = useRef(withMinor ? defaultChordMap : defaultChordMap.filter(nonMinorFilter));
    const selectedChordIdx = useRef(Math.floor(pollChords.current.length * Math.random()));
    const selectedChord = useRef(chordMap[pollChords.current[selectedChordIdx.current]]);



    const [_, setTime] = useState();

    useEffect(() => {

        if(withChord){
            let pool = [];
            if (showLeftHalf && !showRightHalf) {
                pool = defaultChordMap.slice(0, 48);
            } else if (showRightHalf && !showLeftHalf) {
                pool = defaultChordMap.slice(48);
            } else {
                pool = [...defaultChordMap];
            }

            if(!withMinor){
                pool = pool.filter(nonMinorFilter);
            }
    
            defaultPollChords.current = pool;
            pollChords.current = pool;
            selectedIdx.current = Math.floor(pollChords.current.length * Math.random());

        } else {
            let pool = [];
            if (showLeftHalf && !showRightHalf) {
                pool = defaultPoolKeys.slice(0, 14);
            } else if (showRightHalf && !showLeftHalf) {
                pool = defaultPoolKeys.slice(14);
            } else {
                pool = [...defaultPoolKeys];
            }
    
            dafaultPool.current = pool;
            poolKeys.current = pool;
            selectedIdx.current = Math.floor(poolKeys.current.length * Math.random());
        }


        setTime(new Date())

    }, [showLeftHalf, showRightHalf, withChord, withMinor]);


    const firstNote = MidiNumbers.fromNote('c2');
    const lastNote = MidiNumbers.fromNote('c6');
    const keyboardShortcuts = KeyboardShortcuts.create({
        firstNote: firstNote,
        lastNote: lastNote,
        keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });
    const [showKey, setShowKey] = useState(false);

    const next = useCallback(() => {
        let state = [...poolKeys.current];
        state.splice(selectedIdx.current, 1);
        if (!state.length) {
            state = [...dafaultPool.current]
        }

        selectedIdx.current = (Math.floor(state.length * Math.random()));
        poolKeys.current = state;
        setTime(new Date());
    }, []);

    const nextChord = useCallback(() => {
        if (!withChord) return;
        let state = [...pollChords.current];
        state.splice(selectedChordIdx.current, 1);
        if (!state.length) {
            state = [...defaultPollChords.current]
        }

        selectedChordIdx.current = (Math.floor(state.length * Math.random()));
        pollChords.current = state;
        const chord = pollChords.current[selectedChordIdx.current];

        selectedChord.current = chordMap[chord];

        setTime(new Date());


    }, [withChord]);


    useEffect(() => {
        if (navigator.requestMIDIAccess) {

            // Map to store active note events with their timestamps
            const activeNotes = new Map();
            // Define a time window in milliseconds to group notes as a chord
            const chordWindow = 50;

            const handleInput = (input) => {
                if (withChord) {

                    const [status, note, velocity] = input.data;
                    const command = status & 0xf0;
                    const now = performance.now();

                    // Note On (0x90) with velocity > 0 indicates a key press.
                    if (command === 0x90 && velocity > 0) {
                        // Record the note with the current timestamp
                        activeNotes.set(note, now);

                        // Group notes that were pressed within the chordWindow
                        const chord = [];
                        activeNotes.forEach((timestamp, key) => {
                            if (now - timestamp <= chordWindow) {
                                chord.push(key);
                            }
                        });

                        if(arraysEqual(chord, selectedChord.current.keys)){
                            nextChord();
                        }
                        
                    }

                    // Note Off (0x80) or Note On with velocity 0 indicates key release.
                    else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
                        activeNotes.delete(note);
                    }

                } else {
                    const [command, note, velocity] = input.data;
                    if (command === 144 & velocity > 0) {
                        if (note === +poolKeys.current[selectedIdx.current]) {
                            next();
                        }
                    }
                }
            }

            const onSuccess = (midiAccess) => {
                const inputs = midiAccess.inputs;
                inputs.forEach(input => {
                    input.addEventListener('midimessage', handleInput);
                })
            }

            const onError = (err) => {
                console.error('Error MIDI', err)
            }
            navigator.requestMIDIAccess().then(onSuccess, onError);
        }
    }, [withChord]);

    const onWithChordChange = useCallback(() => {
        setWithChord(prev => !prev)
    }, []);

    const onWithMinorChange = useCallback(() => {
        setWithMinor(prev => !prev)
    }, []);

    const onShowChordLabelChange = useCallback(() => {
        setShowChordLabel(prev => !prev);
    }, []);    

    const onToggleChange = useCallback(() => {
        setShowKey(prev => !prev)
    }, []);

    const onToggleLeftChange = useCallback(() => {
        setShowLeftHalf(prev => !prev)
    }, []);

    const onToggleRightChange = useCallback(() => {
        setShowRightHalf(prev => !prev)
    }, []);

    const onClick = useCallback(() => {
        if (withChord) {
            nextChord()
        } else {
            next()
        }
    }, [withChord]);

    return <div className='Note-bar-container'>
        <div
            className="Note-Bar"
            onClick={onClick}
        >
            {withChord && showChordLabel && <span style={{
                position: 'absolute',
                top: 50,
                right: -100,
                fontSize: 30,
                fontWeight: 'bold',
                color: '#FFF',
                backgroundColor: '#000',
                padding: '10px 12px',
                borderRadius: '10px'
            }}>{selectedChord.current.symbol}</span>}
            {
                (withChord && (selectedChord.current?.mask || selectedChord.current?.keys).map(keyNumber => {
                    const isFlat = typeof keyNumber === 'string';
                    const { asset, y, bar, key: note, sharp } = map[keyNumber];
                    return <Key key={keyNumber} bar={bar} note={note} asset={asset} y={y} showKey={showKey} sharp={sharp && !isFlat} isFlat={isFlat} i={0} />
                }))
            }
            {
                (!withChord && poolKeys.current.map((key, i) => {
                    if (i !== selectedIdx.current) return null;
                    const { asset, y, bar, key: note, sharp } = map[key];
                    return <Key kay={key} bar={bar} note={note} asset={asset} y={y} showKey={showKey} sharp={sharp} i={i} />
                }))
            }
        </div>
        <div className='Piano-wrapper'>
            <Piano
                noteRange={{ first: firstNote, last: lastNote }}
                playNote={(midiNumber) => {
                    if (midiNumber === +poolKeys.current[selectedIdx.current]) {
                        next();
                    }
                }}
                stopNote={() => { }}
                width={1000}
                keyboardShortcuts={keyboardShortcuts}
            />
        </div>

        <div className='Toogle-wrapper'>
            <Toggle
                id='with-chord'
                defaultChecked={withChord}
                onChange={onWithChordChange} />
            <div htmlFor='with-chord'> Chord</div>
        </div>

        <div className='Toogle-wrapper'>
            <Toggle
                id='with-minor'
                defaultChecked={withMinor}
                onChange={onWithMinorChange} />
            <div htmlFor='with-minor'> Minor</div>
        </div>

        <div className='Toogle-wrapper'>
            <Toggle
                id='show-chord-label'
                defaultChecked={showChordLabel}
                onChange={onShowChordLabelChange} />
            <div htmlFor='show-chord-label'>Show Chord label</div>
        </div>

        <div className='Toogle-wrapper'>
            <Toggle
                id='cheese-status'
                defaultChecked={showKey}
                onChange={onToggleChange} />
            <div htmlFor='cheese-status'> Show Key</div>
        </div>

        <div className='Toogle-wrapper'>
            <Toggle
                id='left-half'
                defaultChecked={showLeftHalf}
                onChange={onToggleLeftChange} />
            <div htmlFor='left-half'> Left Half</div>
        </div>

        <div className='Toogle-wrapper'>
            <Toggle
                id='right-half'
                defaultChecked={showRightHalf}
                onChange={onToggleRightChange} />
            <div htmlFor='right-half'> Right Half</div>
        </div>

    </div>
}

function Key(props) {
    const width = 53;
    const ratio = 1.81;
    const { asset, y, bar, note, showKey, sharp, isFlat, i } = props;

    const topBarMap = {
        'top': -1,
        'middle': 12,
        'bottom': 27,
    }

    return <div style={{ width: width, height: width / ratio, position: 'absolute', left: i % 2 ? 250 : 250, top: y, backgroundImage: `url(${asset})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain' }}>
        {bar && <div style={{ position: 'absolute', width: width + 12, height: 4, left: -8, top: topBarMap[bar], backgroundColor: 'black' }} />}
        {showKey && <span className='Key'>{note}{isFlat && '♭'}</span>}
        {(sharp || isFlat) && <span style={{ position: 'absolute', fontSize: isFlat ? 45 : 30, fontWeight: 'bold', left: -20, top: isFlat ? -10 : -5 }}>{isFlat ? '♭' : '#'}</span>}
    </div>
}