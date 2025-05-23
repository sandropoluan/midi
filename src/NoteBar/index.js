import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Toggle from 'react-toggle';
import classNames from 'classnames';
import 'react-toggle/style.css'
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';
import './index.scss'
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

function isSubArray(arr1, mainArray) {
    // If arr1 has more elements than mainArray, it cannot be a subarray.
    if (arr1.length > mainArray.length) return false;

    // Create a copy of mainArray to avoid modifying the original array.
    let mainCopy = mainArray.slice();

    // Check each element in arr1:
    for (let elem of arr1) {
        // Find index of the element in mainCopy.
        let index = mainCopy.indexOf(elem);

        // If not found, arr1 is not a subset.
        if (index === -1) return false;

        // If found, remove the element so it isn’t used twice.
        mainCopy.splice(index, 1);
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
    "37-sharp": { // C#2
        key: 'C#',
        sharp: true,
        asset: frullImage,
        y: 471,
        bar: 'middle'
    },
    "37-flat": { // D♭2
        key: 'D♭',
        flat: true,
        asset: frullImage,
        y: 456, // using D2's y and bar
        bar: 'bottom'
    },
    38: { // D2
        key: 'D',
        asset: frullImage,
        y: 456,
        bar: 'bottom'
    },
    "39-sharp": { // D#2
        key: 'D#',
        sharp: true,
        asset: frullImage,
        y: 456,
        bar: 'bottom'
    },
    "39-flat": { // E♭2
        key: 'E♭',
        flat: true,
        asset: frullImage,
        y: 440, // using E2's y and bar
        bar: 'middle'
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
    "42-sharp": { // F#2
        key: 'F#',
        sharp: true,
        asset: frullImage,
        y: 425,
        bar: 'bottom'
    },
    "42-flat": { // G♭2
        key: 'G♭',
        flat: true,
        asset: frullImage,
        y: 409, // using G2's y (and note 43 has no bar so it’s omitted)
    },
    43: { // G2
        key: 'G',
        asset: frullImage,
        y: 409
    },
    "44-sharp": { // G#2
        key: 'G#',
        sharp: true,
        asset: frullImage,
        y: 409
    },
    "44-flat": { // A♭2
        key: 'A♭',
        flat: true,
        asset: frullImage,
        y: 394, // using A2's y
    },
    45: { // A2
        key: 'A',
        asset: frullImage,
        y: 394
    },
    "46-sharp": { // A#2
        key: 'A#',
        sharp: true,
        asset: frullImage,
        y: 394
    },
    "46-flat": { // B♭2
        key: 'B♭',
        flat: true,
        asset: frullImage,
        y: 378, // using B2's y
    },
    47: { // B2
        key: 'B',
        asset: frullImage,
        y: 378
    },
    48: { // C3
        key: 'C',
        asset: frullImage,
        y: 362
    },
    "49-sharp": { // C#3
        key: 'C#',
        sharp: true,
        asset: frullImage,
        y: 362
    },
    "49-flat": { // D♭3
        key: 'D♭',
        flat: true,
        asset: frullImage,
        y: 347, // using D3's y
    },
    50: { // D3
        key: 'D',
        asset: frullImage,
        y: 347
    },
    "51-sharp": { // D#3
        key: 'D#',
        sharp: true,
        asset: frullImage,
        y: 347
    },
    "51-flat": { // E♭3
        key: 'E♭',
        flat: true,
        asset: frullImage,
        y: 330, // using E3's y
    },
    52: { // E3
        key: 'E',
        asset: frullImage,
        y: 330
    },
    53: { // F3
        key: 'F',
        asset: frullImage,
        y: 315
    },
    "54-sharp": { // F#3
        key: 'F#',
        sharp: true,
        asset: frullImage,
        y: 315
    },
    "54-flat": { // G♭3
        key: 'G♭',
        flat: true,
        asset: frullImage,
        y: 300, // using G3's y
    },
    55: { // G3
        key: 'G',
        asset: frullImage,
        y: 300
    },
    "56-sharp": { // G#3
        key: 'G#',
        sharp: true,
        asset: frullImage,
        y: 300
    },
    "56-flat": { // A♭3
        key: 'A♭',
        flat: true,
        asset: frullImage,
        y: 284, // using A3's y
    },
    57: { // A3
        key: 'A',
        asset: frullImage,
        y: 284
    },
    "58-sharp": { // A#3
        key: 'A#',
        sharp: true,
        asset: frullImage,
        y: 284
    },
    "58-flat": { // B♭3
        key: 'B♭',
        flat: true,
        asset: frullImage,
        y: 268, // using B3's y
    },
    59: { // B3
        key: 'B',
        asset: frullImage,
        y: 268
    },
    60: { // C4 (Middle C)
        key: 'C',
        asset: frullImage,
        y: 198,
        bar: 'middle'
    },
    "61-sharp": { // C#4
        key: 'C#',
        sharp: true,
        asset: frullImage,
        y: 198,
        bar: 'middle'
    },
    "61-flat": { // D♭4
        key: 'D♭',
        flat: true,
        asset: frullImage,
        y: 179, // using D4's y
    },
    62: { // D4
        key: 'D',
        asset: frullImage,
        y: 179
    },
    "63-sharp": { // D#4
        key: 'D#',
        sharp: true,
        asset: frullImage,
        y: 179
    },
    "63-flat": { // E♭4
        key: 'E♭',
        flat: true,
        asset: frullImage,
        y: 165, // using E4's y
    },
    64: { // E4
        key: 'E',
        asset: frullImage,
        y: 165
    },
    65: { // F4
        key: 'F',
        asset: frullImage,
        y: 148
    },
    "66-sharp": { // F#4
        key: 'F#',
        sharp: true,
        asset: frullImage,
        y: 148
    },
    "66-flat": { // G♭4
        key: 'G♭',
        flat: true,
        asset: frullImage,
        y: 132, // using G4's y
    },
    67: { // G4
        key: 'G',
        asset: frullImage,
        y: 132
    },
    "68-sharp": { // G#4
        key: 'G#',
        sharp: true,
        asset: frullImage,
        y: 132
    },
    "68-flat": { // A♭4
        key: 'A♭',
        flat: true,
        asset: frullImage,
        y: 116, // using A4's y
    },
    69: { // A4
        key: 'A',
        asset: frullImage,
        y: 116
    },
    "70-sharp": { // A#4
        key: 'A#',
        sharp: true,
        asset: frullImage,
        y: 116
    },
    "70-flat": { // B♭4
        key: 'B♭',
        flat: true,
        asset: frullImage,
        y: 100, // using B4's y
    },
    71: { // B4
        key: 'B',
        asset: frullImage,
        y: 100
    },
    72: { // C5
        key: 'C',
        asset: frullImage,
        y: 85
    },
    "73-sharp": { // C#5
        key: 'C#',
        sharp: true,
        asset: frullImage,
        y: 85
    },
    "73-flat": { // D♭5
        key: 'D♭',
        flat: true,
        asset: frullImage,
        y: 69, // using D5's y
    },
    74: { // D5
        key: 'D',
        asset: frullImage,
        y: 69
    },
    "75-sharp": { // D#5
        key: 'D#',
        sharp: true,
        asset: frullImage,
        y: 69
    },
    "75-flat": { // E♭5
        key: 'E♭',
        flat: true,
        asset: frullImage,
        y: 55,  // using E5's y
    },
    76: { // E5
        key: 'E',
        asset: frullImage,
        y: 55
    },
    77: { // F5
        key: 'F',
        asset: frullImage,
        y: 39
    },
    "78-sharp": { // F#5
        key: 'F#',
        sharp: true,
        asset: frullImage,
        y: 39
    },
    "78-flat": { // G♭5
        key: 'G♭',
        flat: true,
        asset: frullImage,
        y: 23, // using G5's y
        bar: 'top'
    },
    79: { // G5
        key: 'G',
        asset: frullImage,
        y: 23,
        bar: 'top'
    },
    "80-sharp": { // G#5
        key: 'G#',
        sharp: true,
        asset: frullImage,
        y: 23,
        bar: 'top'
    },
    "80-flat": { // A♭5
        key: 'A♭',
        flat: true,
        asset: frullImage,
        y: 8, // using A5's y
        bar: 'middle'
    },
    81: { // A5
        key: 'A',
        asset: frullImage,
        y: 8,
        bar: 'middle'
    },
    "82-sharp": { // A#5
        key: 'A#',
        sharp: true,
        asset: frullImage,
        y: 8,
        bar: 'middle'
    },
    "82-flat": { // B♭5
        key: 'B♭',
        flat: true,
        asset: frullImage,
        y: -8, // using B5's y
        bar: 'top'
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
};

let chordMap = {
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
        symbol: 'G#m/A♭m',
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

const newChordMap = {};
for (const chordKey of Object.keys(chordMap)) {
    // Add the original chord first
    newChordMap[chordKey] = chordMap[chordKey];

    const chord = chordMap[chordKey];

    if (chord.keys[0] + 12 <= 84) {
        // Calculate first inversion: [second, third, root+12]
        const inverse1Keys = [chord.keys[1], chord.keys[2], chord.keys[0] + 12];
        const inverse1 = {
            symbol: chord.symbol + ' Inv1',
            keys: inverse1Keys,
        };
        if (chord.mask) {
            const maskRoot = chord.mask[0];
            const newMaskRoot = (typeof maskRoot === 'string')
                ? String(Number(maskRoot) + 12)
                : maskRoot + 12;
            inverse1.mask = [chord.mask[1], chord.mask[2], newMaskRoot];
        }
        newChordMap[chordKey + 'Inverse1'] = inverse1;
    }

    if (chord.keys[2] - 12 >= 36) {
        // Second inversion: [c - 12, a, b]
        // This takes the fifth and drops it an octave, then the root and third remain.
        const inverse2Keys = [chord.keys[2] - 12, chord.keys[0], chord.keys[1]];
        const inverse2 = {
            symbol: chord.symbol + ' Inv2',
            keys: inverse2Keys,
        };
        if (chord.mask) {
            const maskA = chord.mask[0];
            const maskB = chord.mask[1];
            const maskC = chord.mask[2];
            const newMaskC = (typeof maskC === 'string')
                ? String(Number(maskC) - 12)
                : maskC - 12;
            inverse2.mask = [newMaskC, maskA, maskB];
        }
        newChordMap[chordKey + 'Inverse2'] = inverse2;
    }

    if (chord.keys[0] - 1 >= 36) {
        const major7 = {
            symbol: chord.symbol + '△7',
            keys: [chord.keys[0] - 1, chord.keys[1], chord.keys[2]],
        }
        if (chord.mask) {
            major7.mask = [chord.keys[0] - 1, chord.mask[1], chord.mask[2]];
        }
        newChordMap[chordKey + '△7'] = major7;
    }

    if (chord.keys[0] - 2 >= 36) {
        const _7 = {
            symbol: chord.symbol + '7',
            keys: [chord.keys[0] - 2, chord.keys[1], chord.keys[2]],
        }
        if (chord.mask) {
            _7.mask = [chord.keys[0] - 2, chord.mask[1], chord.mask[2]];
        }
        newChordMap[chordKey + '7'] = _7;
    }


    if (chord.keys[0] - 3 >= 36) {
        const _6 = {
            symbol: chord.symbol + '6',
            keys: [chord.keys[0] - 3, chord.keys[1], chord.keys[2]],
        }
        if (chord.mask) {
            _6.mask = [chord.keys[0] - 3, chord.mask[1], chord.mask[2]];
        }
        newChordMap[chordKey + '6'] = _6;
    }
}

// Optionally, replace the original chordMap with the new ordered chordMap
chordMap = newChordMap;

const defaultChordMap = Object.keys(chordMap);
const defaultPoolKeys = Object.keys(map).sort((a, b) => {
    const A = +(a.split('-')[0]);
    const B = +(b.split('-')[0]);
    return A - B;
});

const middleCindex = defaultChordMap.indexOf('C4');

const chordFilter = ({ withMinor, minorOnly, withInverse1, withInverse2, inverse1Only, inverse2Only, inverseOnly, _7only, with7, _6only, with6, pickedChords, _67only }) => {
    return (item) => {

        if (pickedChords.length) {
            const { symbol } = chordMap[item];
            return pickedChords.indexOf(symbol) > -1;
        }

        let show = true;
        if (!withInverse1) {
            show &= !item.includes('Inverse1')
        }

        if (!withInverse2) {
            show &= !item.includes('Inverse2')
        }

        if (inverse1Only || inverse2Only || inverseOnly) {
            show &= item.includes('Inverse');
        }

        if (!withMinor) {
            show &= !item.includes('Minor') && !item.includes('m');
        }

        if (minorOnly) {
            show &= item.includes('Minor') || item.includes('m')
        }

        if (!with7) {
            show &= !item.includes('7');
        }

        if (_7only) {
            show &= item.includes('7')
        }

        if (!with6) {
            show &= !item.includes('6');
        }

        if (_6only) {
            show &= item.includes('6');
        }

        if(_67only){
             show &= item.includes('6') || item.includes('7')
        }

        return show;
    }
}

let uniqueChords = [];

for (let key in chordMap) {
    const { symbol } = chordMap[key];
    if (uniqueChords.indexOf(symbol) === -1) {
        uniqueChords.push(symbol);
    }
}

uniqueChords = uniqueChords.sort();

export default function NoteBar() {



    const [pickedChords, setPickedChords] = useState([]);

    const [showControl, setShowControl] = useState(false);

    const [showLeftHalf, setShowLeftHalf] = useState(true);
    const [showRightHalf, setShowRightHalf] = useState(true);

    const [withMinor, setWithMinor] = useState(true);

    const [minorOnly, setMinorOnly] = useState(false);

    const [withChord, setWithChord] = useState(true);

    const [withInverse1, setWithInverse1] = useState(true);

    const [inverse2Only, setInverse2Only] = useState(false);

    const [withInverse2, setWithInverse2] = useState(true);

    const [inverse1Only, setInverse1Only] = useState(false);

    const [inverseOnly, setInverseOnly] = useState(false);

    const [showChordLabel, setShowChordLabel] = useState(true);

    const [showRemainLabel, setShowRemainLabel] = useState(true);

    const [_7only, set_7Only] = useState(false);
    const [_6only, set_6Only] = useState(false);
    const [with7, setWith7] = useState(true);
    const [with6, setWith6] = useState(true);

    const [_67only, set_67Only] = useState(false);

    const [wrongKey, setWrongKey] = useState(false);

    const [showVirtualPiano, setShowVirtualPiano] = useState(true);
    const [virtualPianoHighlight, setVirtualPianoHighlight] = useState(false);

    const [midiConnected, setMidiConnected] = useState(false);
    const midiConnectedRef = useRef(midiConnected);

    const dafaultPool = useRef([])
    const poolKeys = useRef(defaultPoolKeys);
    const selectedIdx = useRef(Math.floor(poolKeys.current.length * Math.random()));

    const defaultPollChords = useRef([]);
    const pollChords = useRef(defaultChordMap.filter(chordFilter({ withMinor, withInverse1, withInverse2, inverse1Only, inverse2Only, inverseOnly, minorOnly, _7only, with7, _6only, with6, pickedChords, _67only })));
    const selectedChordIdx = useRef(Math.floor(pollChords.current.length * Math.random()));
    const selectedChord = useRef(chordMap[pollChords.current[selectedChordIdx.current]]);

    const playedNote = useRef([]);

    const cardLeft = poolKeys.current.length || pollChords.current.length;

    const [time, setTime] = useState();

    useEffect(() => {
        if (wrongKey) {
            setTimeout(() => {
                setWrongKey(false);
            }, 100);
        }
    }, [wrongKey]);

    useEffect(() => {
        poolKeys.current = [];
        pollChords.current = [];

        if (withChord) {
            let pool = [];
            if (showLeftHalf && !showRightHalf) {
                pool = defaultChordMap.slice(0, middleCindex);
            } else if (showRightHalf && !showLeftHalf) {
                pool = defaultChordMap.slice(middleCindex);
            } else {
                pool = [...defaultChordMap];
            }

            pool = pool.filter(chordFilter({ withMinor, withInverse1, withInverse2, inverse1Only, inverse2Only, inverseOnly, minorOnly, _7only, with7, _6only, with6, pickedChords, _67only }));

            defaultPollChords.current = pool;
            pollChords.current = pool;
            selectedChordIdx.current = Math.floor(pollChords.current.length * Math.random());
            const chord = pollChords.current[selectedChordIdx.current];
            selectedChord.current = chordMap[chord];
        } else {
            let pool = [];
            if (showLeftHalf && !showRightHalf) {
                pool = defaultPoolKeys.slice(0, 34);
            } else if (showRightHalf && !showLeftHalf) {
                pool = defaultPoolKeys.slice(34);
            } else {
                pool = [...defaultPoolKeys];
            }

            dafaultPool.current = pool;
            poolKeys.current = pool;
            selectedIdx.current = Math.floor(poolKeys.current.length * Math.random());
        }


        setTime(new Date())

    }, [showLeftHalf, showRightHalf, withChord, withMinor, withInverse1, withInverse2, inverse1Only, inverseOnly, minorOnly, _7only, with7, _6only, with6, pickedChords, _67only]);


    const highlightedKeys = useMemo(() => {
        if (!virtualPianoHighlight) return [];
        if (withChord) return (selectedChord.current?.keys || []).map(item => +(`${item}`.split("-")[0]));

        return [+(`${poolKeys.current[selectedIdx.current]}`.split("-")[0])];

    }, [time, withChord, virtualPianoHighlight]);

    console.log({ highlightedKeys });

    const firstNote = MidiNumbers.fromNote('c2');
    const lastNote = MidiNumbers.fromNote('D6');
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
            const activeNotes = new Map();

            const chordWindow = 50;

            let disconnectedTimeout;
            let retryTimeout;
            let requestMIDI;
            let inputs;
            let handleInput;

            const cleanUp = () => {
                clearTimeout(disconnectedTimeout);
                clearTimeout(retryTimeout);
                (inputs || []).forEach(input => {
                    input.removeEventListener('midimessage', handleInput);
                });
            }

            handleInput = (input) => {
                if (input) {
                    clearTimeout(disconnectedTimeout);
                    setMidiConnected(true);
                    midiConnectedRef.current = true;
                    disconnectedTimeout = setTimeout(() => {
                        console.error('Midi Disconnected')
                        setMidiConnected(false);
                        midiConnectedRef.current = false;
                        cleanUp();
                        if (typeof requestMIDI == 'function') {
                            requestMIDI();
                        }
                    }, 3000);
                }
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

                        if (arraysEqual(chord, selectedChord.current.keys)) {
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
                        if (note === +(poolKeys.current[selectedIdx.current]).split("-")[0]) {
                            next();
                        }
                    }
                }
            }


            const retry = () => {
                console.info('Retrying midi connection');
                if (midiConnectedRef.current) return;
                retryTimeout = setTimeout(() => {
                    requestMIDI();
                }, 2000);
            }


            const onSuccess = (midiAccess) => {
                const inputs = midiAccess.inputs;
                if (!inputs?.length && !midiConnectedRef.current) {
                    retry();
                }
                inputs.forEach(input => {
                    input.addEventListener('midimessage', handleInput);
                })
            }

            requestMIDI = function () {
                navigator.requestMIDIAccess().then(onSuccess, (err) => {
                    console.error('Error MIDI', err);
                    retry()
                }).catch(error => {
                    console.error('Error MIDI 2', error);
                    retry();
                });
            }

            requestMIDI();

            return () => {
                cleanUp();
            }

        }
    }, [withChord]);

    const onWithChordChange = useCallback(() => {
        setWithChord(prev => !prev)
    }, []);

    const onWithMinorChange = useCallback(() => {
        if (withMinor) {
            setMinorOnly(false);
        }
        setWithMinor(prev => !prev)
    }, [withMinor]);

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

    const onToggleVirtualPianoChange = useCallback(() => {
        setShowVirtualPiano(prev => !prev);
    }, []);

    const onToggleRemainLabelChange = useCallback(() => {
        setShowRemainLabel(prev => !prev);
    }, []);


    const onToggleVirtualPianoHighlightChange = useCallback(() => {
        setVirtualPianoHighlight(prev => !prev);
    }, []);

    const onClick = useCallback(() => {
        if (withChord) {
            nextChord()
        } else {
            next()
        }
    }, [withChord]);

    const onKeyboardPlayNote = useCallback((midiNumber) => {
        if (midiNumber === 86) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            })
            setTimeout(() => {
                setShowControl(state => !state);
            }, 500);

            return;
        }
        if (withChord) {

            playedNote.current.push(midiNumber);
            const targetKeys = selectedChord.current.keys
            if (
                !targetKeys.includes(midiNumber) ||
                !isSubArray(playedNote.current, targetKeys) ||
                (playedNote.current.length === targetKeys.length && !arraysEqual(targetKeys, playedNote.current))) {
                playedNote.current = [];
                setWrongKey(true);
                //failed
                return;
            }

            if (playedNote.current.length === targetKeys.length && arraysEqual(targetKeys, playedNote.current)) {
                playedNote.current = [];
                //success;
                nextChord();
            }


            return;
        };
        if (midiNumber === +(poolKeys.current[selectedIdx.current].split("-")[0])) {
            next();
        }
    }, [withChord, next, nextChord]);

    const showedSymbol = useMemo(() => {
        if(!withChord || !showChordLabel) return null;
        const text = selectedChord.current.symbol;
        const isMinor = text.includes('m');
        const color = isMinor ? 'yellow': 'white';
        if(text.includes('△')){

            const chord = text.split('△')[0];
            return <span style={{color}}>{chord}<span style={{color: 'red'}}>△</span>7</span>
        } else if(text.includes('6')) {
            const chord = text.split('6')[0];
            return <span style={{color}}>{chord}<span style={{color: '#e28743'}}>6</span></span>;
        } else {
            return <span style={{color}}>{text}</span>;
        }

    }, [withChord, showChordLabel, selectedChord.current.symbol])

    return <>
        <div id="wrong-key-everlay" className={wrongKey ? 'show' : undefined}></div>
        <div className='Note-bar-container'>
            <div id="connection" className={midiConnected ? 'connected' : undefined}>
                Midi {midiConnected ? 'connected' : 'not connected'}
            </div>
            {showRemainLabel && <div id="remaining">Remaining: {cardLeft}</div>}
            <div
                className="Note-Bar"
                onClick={onClick}
            >
                {withChord && showChordLabel && <span style={{
                    position: 'absolute',
                    top: 50,
                    left: 500,
                    width: 300,
                    display: 'flex',
                    fontSize: 30,
                    fontWeight: 'bold',
                    color: '#FFF',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    padding: '10px 12px',
                    borderRadius: '10px'
                }}>{showedSymbol}</span>}
                {
                    (withChord && (selectedChord.current?.mask || selectedChord.current?.keys).map(keyNumber => {
                        const isFlat = typeof keyNumber === 'string';
                        const { asset, y, bar, key: note, sharp } = map[keyNumber] || map[`${keyNumber}-sharp`];
                        return <Key key={keyNumber} bar={bar} note={note} asset={asset} y={y} showKey={showKey} sharp={sharp && !isFlat} isFlat={isFlat} i={0} />
                    }))
                }
                {
                    (!withChord && poolKeys.current.map((key, i) => {
                        if (i !== selectedIdx.current) return null;
                        const { asset, y, bar, key: note, sharp, flat } = map[key];
                        return <Key kay={key} bar={bar} note={note} asset={asset} y={y} showKey={showKey} isFlat={flat} sharp={sharp} i={i} />
                    }))
                }
            </div>
            {showVirtualPiano && <div className='Piano-wrapper'>
                <Piano
                    noteRange={{ first: firstNote, last: lastNote }}
                    highlightedKeys={highlightedKeys}
                    playNote={onKeyboardPlayNote}
                    stopNote={() => { }}
                    width={1000}
                    keyWidthToHeight={0.22}
                    keyboardShortcuts={keyboardShortcuts}
                    renderNoteLabel={({ keyboardShortcut, midiNumber, isActive, isAccidental }) =>
                        midiNumber === 86 ? (
                            <div
                                className={classNames('ReactPiano__NoteLabel', {
                                    'ReactPiano__NoteLabel--active': isActive,
                                    'ReactPiano__NoteLabel--accidental': isAccidental,
                                    'ReactPiano__NoteLabel--natural': !isAccidental,
                                })}
                            >
                                CP
                            </div>
                        ) : null}
                />
            </div>}

            {showControl && <div>
                <div className='Toogle-wrapper'>
                    <Toggle
                        id='with-chord'
                        checked={withChord}
                        onChange={onWithChordChange} />
                    <div htmlFor='with-chord'> Chord</div>
                </div>

                <div className='Toogle-wrapper'>
                    <Toggle
                        disabled={!withChord}
                        id='with-inverse1'
                        checked={withInverse1}
                        onChange={() => {
                            if (withInverse1) {
                                setInverse1Only(false);
                            } else {
                                setInverse2Only(false);
                            }
                            setWithInverse1(state => !state);
                            setInverseOnly(false);
                        }} />
                    <div htmlFor='with-inverse1'> Inverse 1</div>
                </div>


                <div className='Toogle-wrapper'>
                    <Toggle
                        id='inverse1-only'
                        disabled={!withChord}
                        checked={inverse1Only}
                        onChange={() => {
                            if (!inverse1Only) {
                                setWithInverse1(true);
                                setInverse2Only(false);
                                setWithInverse2(false);
                            }
                            set_67Only(false);
                            set_7Only(false);
                            set_6Only(false);
                            setInverse1Only(state => !state);
                            setInverseOnly(false);
                        }} />
                    <div htmlFor='with-inverse1'> Inverse 1 Only</div>
                </div>

                <div className='Toogle-wrapper'>
                    <Toggle
                        id='with-inverse2'
                        disabled={!withChord}
                        checked={withInverse2}
                        onChange={() => {
                            if (withInverse2) {
                                setInverse2Only(false);
                            } else {
                                setInverse1Only(false);
                            }
                            setWithInverse2(state => !state);
                            setInverseOnly(false);
                        }} />
                    <div htmlFor='with-inverse2'> Inverse 2</div>
                </div>


                <div className='Toogle-wrapper'>
                    <Toggle
                        id='inverse2-only'
                        disabled={!withChord}
                        checked={inverse2Only}
                        onChange={() => {
                            if (!inverse2Only) {
                                setWithInverse2(true);
                                setInverse1Only(false);
                                setWithInverse1(false);
                            }
                            set_67Only(false);
                            set_7Only(false);
                            set_6Only(false);
                            setInverse2Only(state => !state);
                            setInverseOnly(false);
                        }} />
                    <div htmlFor='with-inverse2'> Inverse 2 Only</div>
                </div>


                <div className='Toogle-wrapper'>
                    <Toggle
                        id='inverse-only'
                        disabled={!withChord}
                        checked={inverseOnly}
                        onChange={() => {
                            if (!inverseOnly) {
                                setWithInverse1(true);
                                setWithInverse2(true);
                                setInverse1Only(false);
                                setInverse2Only(false);
                            }
                            set_67Only(false);
                            set_7Only(false);
                            set_6Only(false);
                            setInverseOnly(state => !state);
                        }} />
                    <div htmlFor='with-inverse2'> Inverse 1 & 2 Only</div>
                </div>

                <div className='Toogle-wrapper'>
                    <Toggle
                        id='with-minor'
                        disabled={!withChord}
                        checked={withMinor}
                        onChange={onWithMinorChange} />
                    <div htmlFor='with-minor'>Minor</div>
                </div>

                <div className='Toogle-wrapper'>
                    <Toggle
                        id='minor-only'
                        disabled={!withChord}
                        checked={minorOnly}
                        onChange={() => {
                            if (!minorOnly) {
                                setWithMinor(true);
                            }
                            setMinorOnly(state => !state);
                        }} />
                    <div htmlFor='with-minor'> Minor Only</div>
                </div>


                <div className='Toogle-wrapper'>
                    <Toggle
                        id='with-7'
                        disabled={!withChord}
                        checked={with7}
                        onChange={() => {
                            if (with7) {
                                set_7Only(false);
                            } else {
                                set_6Only(false);
                            }
                            set_67Only(false);
                            setWith7(state => !state);
                        }} />
                    <div htmlFor='with-7'>With 7</div>
                </div>

                <div className='Toogle-wrapper'>
                    <Toggle
                        id='seven-only'
                        disabled={!withChord}
                        checked={_7only}
                        onChange={() => {
                            if (!_7only) {
                                setWith7(true);
                                set_6Only(false);
                                setWith6(false);
                            }
                            setInverse1Only(false);
                            setInverse2Only(false);
                            setInverseOnly(false);
                            set_7Only(state => !state);
                        }} />
                    <div htmlFor='seven-only'>7 Only</div>
                </div>


                <div className='Toogle-wrapper'>
                    <Toggle
                        id='with-6'
                        disabled={!withChord}
                        checked={with6}
                        onChange={() => {
                            if (with6) {
                                set_6Only(false);
                            } else {
                                set_7Only(false);
                            }
                            set_67Only(false);
                            setWith6(state => !state);
                        }} />
                    <div htmlFor='with-six'>With 6</div>
                </div>

                <div className='Toogle-wrapper'>
                    <Toggle
                        id='six-only'
                        disabled={!withChord}
                        checked={_6only}
                        onChange={() => {
                            if (!_6only) {
                                setWith7(false);
                                set_7Only(false);
                                setWith6(true);
                            }
                            set_67Only(false);
                            setInverse1Only(false);
                            setInverse2Only(false);
                            setInverseOnly(false);
                            set_6Only(state => !state);
                        }} />
                    <div htmlFor='six-only'>6 Only</div>
                </div>

                <div className='Toogle-wrapper'>
                    <Toggle
                        id='six-seven-only'
                        disabled={!withChord}
                        checked={_67only}
                        onChange={() => {
                            if (!_67only) {
                                setWith7(true);
                                setWith6(true);
                            }
                            set_6Only(false);
                            set_7Only(false);
                            setInverse1Only(false);
                            setInverse2Only(false);
                            setInverseOnly(false);
                            set_67Only(state => !state);
                        }} />
                    <div htmlFor='six-seven-only'>6 and 7 Only</div>
                </div>

                <div className='Toogle-wrapper'>
                    <Toggle
                        id='show-chord-label'
                        disabled={!withChord}
                        checked={showChordLabel}
                        onChange={onShowChordLabelChange} />
                    <div htmlFor='show-chord-label'>Show Chord label</div>
                </div>

                <div className='Toogle-wrapper'>
                    <Toggle
                        id='cheese-status'
                        checked={showKey}
                        onChange={onToggleChange} />
                    <div htmlFor='cheese-status'> Show Key</div>
                </div>

                <div className='Toogle-wrapper'>
                    <Toggle
                        id='left-half'
                        checked={showLeftHalf}
                        onChange={onToggleLeftChange} />
                    <div htmlFor='left-half'> Left Half</div>
                </div>

                <div className='Toogle-wrapper'>
                    <Toggle
                        id='right-half'
                        checked={showRightHalf}
                        onChange={onToggleRightChange} />
                    <div htmlFor='right-half'> Right Half</div>
                </div>
                {/* <div className='Toogle-wrapper'>
                    <Toggle
                        id='virtual-piano'
                        checked={showVirtualPiano}
                        onChange={onToggleVirtualPianoChange} />
                    <div htmlFor='right-half'>Show Virtual Piano</div>
                </div> */}
                <div className='Toogle-wrapper'>
                    <Toggle
                        id='virtual-piano-highlight'
                        checked={virtualPianoHighlight}
                        disabled={!showVirtualPiano}
                        onChange={onToggleVirtualPianoHighlightChange} />
                    <div htmlFor='right-half'>Highlight Key</div>
                </div>
                <div className='Toogle-wrapper'>
                    <Toggle
                        id='remain-label'
                        checked={showRemainLabel}
                        onChange={onToggleRemainLabelChange} />
                    <div htmlFor='right-half'>Remaining Cards</div>
                </div>

                {withChord && <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, marginBottom: 5 }}>
                    {
                        uniqueChords.map(key => {
                            const selected = pickedChords.indexOf(key) > -1;
                            return <span
                                onClick={() => {
                                    setPickedChords(prev => {
                                        const prevState = [...prev];
                                        const idx = prevState.indexOf(key);
                                        if (idx === -1) {
                                            prevState.push(key)
                                        } else {
                                            prevState.splice(idx, 1);
                                        }

                                        return prevState;
                                    });

                                    // set_6Only(false);
                                    // set_7Only(false);
                                    // setInverseOnly(false);
                                    // setInverse1Only(false);
                                    // setInverse2Only(false);
                                    // setMinorOnly(false);
                                }}

                                style={{
                                    cursor: 'pointer',
                                    padding: '4px 6px',
                                    backgroundColor: '#FFF',
                                    borderRadius: 8,
                                    marginRight: 6,
                                    marginBottom: 6,
                                    ...(selected ? { backgroundColor: '#ffe2ad', } : {})
                                }}>{key}</span>
                        })
                    }
                </div>}
            </div>}

        </div></>
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