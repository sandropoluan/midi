import { useReducer, useCallback } from 'react';
import { AppState, AppAction } from '../types';

const initialState: AppState = {
  // Game mode and display settings
  withChord: true,
  showControl: false,
  showLeftHalf: true,
  showRightHalf: true,
  showKey: false,
  showVirtualPiano: true,
  virtualPianoHighlight: false,
  
  // Chord filtering options
  withMinor: true,
  minorOnly: false,
  withInverse1: true,
  withInverse2: true,
  inverse1Only: false,
  inverse2Only: false,
  inverseOnly: false,
  
  // Chord extensions
  _7only: false,
  with7: true,
  _6only: false,
  with6: true,
  _67only: false,
  _1octaveOnly: true,
  
  // Display preferences
  showChordLabel: true,
  showRemainLabel: true,
  bluredChord: true,
  
  // State management
  pickedChords: [],
  wrongKey: false,
  midiConnected: false,
  time: undefined,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_WITH_CHORD':
      return { ...state, withChord: !state.withChord };
      
    case 'TOGGLE_SHOW_CONTROL':
      return { ...state, showControl: !state.showControl };
      
    case 'TOGGLE_SHOW_LEFT_HALF':
      return { ...state, showLeftHalf: !state.showLeftHalf };
      
    case 'TOGGLE_SHOW_RIGHT_HALF':
      return { ...state, showRightHalf: !state.showRightHalf };
      
    case 'TOGGLE_SHOW_KEY':
      return { ...state, showKey: !state.showKey };
      
    case 'TOGGLE_SHOW_VIRTUAL_PIANO':
      return { ...state, showVirtualPiano: !state.showVirtualPiano };
      
    case 'TOGGLE_VIRTUAL_PIANO_HIGHLIGHT':
      return { ...state, virtualPianoHighlight: !state.virtualPianoHighlight };
      
    case 'TOGGLE_WITH_MINOR':
      return { 
        ...state, 
        withMinor: !state.withMinor,
        minorOnly: state.withMinor ? false : state.minorOnly 
      };
      
    case 'TOGGLE_MINOR_ONLY':
      return { 
        ...state, 
        minorOnly: !state.minorOnly,
        withMinor: !state.minorOnly ? true : state.withMinor
      };
      
    case 'TOGGLE_WITH_INVERSE1':
      return { 
        ...state, 
        withInverse1: !state.withInverse1,
        inverse1Only: state.withInverse1 ? false : state.inverse1Only,
        inverse2Only: !state.withInverse1 ? false : state.inverse2Only,
        inverseOnly: false
      };
      
    case 'TOGGLE_WITH_INVERSE2':
      return { 
        ...state, 
        withInverse2: !state.withInverse2,
        inverse2Only: state.withInverse2 ? false : state.inverse2Only,
        inverse1Only: !state.withInverse2 ? false : state.inverse1Only,
        inverseOnly: false
      };
      
    case 'TOGGLE_INVERSE1_ONLY':
      return { 
        ...state, 
        inverse1Only: !state.inverse1Only,
        withInverse1: !state.inverse1Only ? true : state.withInverse1,
        inverse2Only: !state.inverse1Only ? false : state.inverse2Only,
        withInverse2: !state.inverse1Only ? false : state.withInverse2,
        _67only: false,
        _7only: false,
        _6only: false,
        inverseOnly: false
      };
      
    case 'TOGGLE_INVERSE2_ONLY':
      return { 
        ...state, 
        inverse2Only: !state.inverse2Only,
        withInverse2: !state.inverse2Only ? true : state.withInverse2,
        inverse1Only: !state.inverse2Only ? false : state.inverse1Only,
        withInverse1: !state.inverse2Only ? false : state.withInverse1,
        _67only: false,
        _7only: false,
        _6only: false,
        inverseOnly: false
      };
      
    case 'TOGGLE_INVERSE_ONLY':
      return { 
        ...state, 
        inverseOnly: !state.inverseOnly,
        withInverse1: !state.inverseOnly ? true : state.withInverse1,
        withInverse2: !state.inverseOnly ? true : state.withInverse2,
        inverse1Only: !state.inverseOnly ? false : state.inverse1Only,
        inverse2Only: !state.inverseOnly ? false : state.inverse2Only,
        _67only: false,
        _7only: false,
        _6only: false
      };
      
    case 'TOGGLE_WITH_7':
      return { 
        ...state, 
        with7: !state.with7,
        _7only: state.with7 ? false : state._7only,
        _6only: !state.with7 ? false : state._6only,
        _67only: false
      };
      
    case 'TOGGLE_7_ONLY':
      return { 
        ...state, 
        _7only: !state._7only,
        with7: !state._7only ? true : state.with7,
        _6only: !state._7only ? false : state._6only,
        with6: !state._7only ? false : state.with6,
        inverse1Only: false,
        inverse2Only: false,
        inverseOnly: false
      };
      
    case 'TOGGLE_WITH_6':
      return { 
        ...state, 
        with6: !state.with6,
        _6only: state.with6 ? false : state._6only,
        _7only: !state.with6 ? false : state._7only,
        _67only: false
      };
      
    case 'TOGGLE_6_ONLY':
      return { 
        ...state, 
        _6only: !state._6only,
        with7: !state._6only ? false : state.with7,
        _7only: !state._6only ? false : state._7only,
        with6: !state._6only ? true : state.with6,
        _67only: false,
        inverse1Only: false,
        inverse2Only: false,
        inverseOnly: false
      };
      
    case 'TOGGLE_67_ONLY':
      return { 
        ...state, 
        _67only: !state._67only,
        with7: !state._67only ? true : state.with7,
        with6: !state._67only ? true : state.with6,
        _6only: false,
        _7only: false,
        inverse1Only: false,
        inverse2Only: false,
        inverseOnly: false
      };
      
    case 'TOGGLE_1_OCTAVE_ONLY':
      return { ...state, _1octaveOnly: !state._1octaveOnly };
      
    case 'TOGGLE_SHOW_CHORD_LABEL':
      return { ...state, showChordLabel: !state.showChordLabel };
      
    case 'TOGGLE_SHOW_REMAIN_LABEL':
      return { ...state, showRemainLabel: !state.showRemainLabel };
      
    case 'TOGGLE_BLURED_CHORD':
      return { ...state, bluredChord: !state.bluredChord };
      
    case 'SET_PICKED_CHORDS':
      return { ...state, pickedChords: action.payload };
      
    case 'SET_WRONG_KEY':
      return { ...state, wrongKey: action.payload };
      
    case 'SET_MIDI_CONNECTED':
      return { ...state, midiConnected: action.payload };
      
    case 'SET_TIME':
      return { ...state, time: action.payload };
      
    default:
      return state;
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators for better encapsulation
  const actions = {
    toggleWithChord: useCallback(() => dispatch({ type: 'TOGGLE_WITH_CHORD' }), []),
    toggleShowControl: useCallback(() => dispatch({ type: 'TOGGLE_SHOW_CONTROL' }), []),
    toggleShowLeftHalf: useCallback(() => dispatch({ type: 'TOGGLE_SHOW_LEFT_HALF' }), []),
    toggleShowRightHalf: useCallback(() => dispatch({ type: 'TOGGLE_SHOW_RIGHT_HALF' }), []),
    toggleShowKey: useCallback(() => dispatch({ type: 'TOGGLE_SHOW_KEY' }), []),
    toggleShowVirtualPiano: useCallback(() => dispatch({ type: 'TOGGLE_SHOW_VIRTUAL_PIANO' }), []),
    toggleVirtualPianoHighlight: useCallback(() => dispatch({ type: 'TOGGLE_VIRTUAL_PIANO_HIGHLIGHT' }), []),
    toggleWithMinor: useCallback(() => dispatch({ type: 'TOGGLE_WITH_MINOR' }), []),
    toggleMinorOnly: useCallback(() => dispatch({ type: 'TOGGLE_MINOR_ONLY' }), []),
    toggleWithInverse1: useCallback(() => dispatch({ type: 'TOGGLE_WITH_INVERSE1' }), []),
    toggleWithInverse2: useCallback(() => dispatch({ type: 'TOGGLE_WITH_INVERSE2' }), []),
    toggleInverse1Only: useCallback(() => dispatch({ type: 'TOGGLE_INVERSE1_ONLY' }), []),
    toggleInverse2Only: useCallback(() => dispatch({ type: 'TOGGLE_INVERSE2_ONLY' }), []),
    toggleInverseOnly: useCallback(() => dispatch({ type: 'TOGGLE_INVERSE_ONLY' }), []),
    toggle7Only: useCallback(() => dispatch({ type: 'TOGGLE_7_ONLY' }), []),
    toggleWith7: useCallback(() => dispatch({ type: 'TOGGLE_WITH_7' }), []),
    toggle6Only: useCallback(() => dispatch({ type: 'TOGGLE_6_ONLY' }), []),
    toggleWith6: useCallback(() => dispatch({ type: 'TOGGLE_WITH_6' }), []),
    toggle67Only: useCallback(() => dispatch({ type: 'TOGGLE_67_ONLY' }), []),
    toggle1OctaveOnly: useCallback(() => dispatch({ type: 'TOGGLE_1_OCTAVE_ONLY' }), []),
    toggleShowChordLabel: useCallback(() => dispatch({ type: 'TOGGLE_SHOW_CHORD_LABEL' }), []),
    toggleShowRemainLabel: useCallback(() => dispatch({ type: 'TOGGLE_SHOW_REMAIN_LABEL' }), []),
    toggleBluredChord: useCallback(() => dispatch({ type: 'TOGGLE_BLURED_CHORD' }), []),
    setPickedChords: useCallback((chords: string[]) => dispatch({ type: 'SET_PICKED_CHORDS', payload: chords }), []),
    setWrongKey: useCallback((wrong: boolean) => dispatch({ type: 'SET_WRONG_KEY', payload: wrong }), []),
    setMidiConnected: useCallback((connected: boolean) => dispatch({ type: 'SET_MIDI_CONNECTED', payload: connected }), []),
    setTime: useCallback((time: Date) => dispatch({ type: 'SET_TIME', payload: time }), []),
  };

  return { state, actions };
}