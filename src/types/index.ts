export interface ChordEntry {
  symbol: string;
  keys: number[];
  mask?: Array<number | string>;
  rootKeys?: number[];
  rootKeysMask?: Array<number | string>;
}

export type ChordMap = Record<string, ChordEntry>;

export interface NoteEntry {
  key: string;
  asset: string;
  y: number;
  bar?: 'top' | 'middle' | 'bottom';
  sharp?: boolean;
  flat?: boolean;
}

export type NoteMap = Record<string, NoteEntry>;

export interface AppState {
  // Game mode and display settings
  withChord: boolean;
  showControl: boolean;
  showLeftHalf: boolean;
  showRightHalf: boolean;
  showKey: boolean;
  showVirtualPiano: boolean;
  virtualPianoHighlight: boolean;
  
  // Chord filtering options
  withMinor: boolean;
  minorOnly: boolean;
  withInverse1: boolean;
  withInverse2: boolean;
  inverse1Only: boolean;
  inverse2Only: boolean;
  inverseOnly: boolean;
  
  // Chord extensions
  _7only: boolean;
  with7: boolean;
  _6only: boolean;
  with6: boolean;
  _67only: boolean;
  _1octaveOnly: boolean;
  
  // Display preferences
  showChordLabel: boolean;
  showRemainLabel: boolean;
  bluredChord: boolean;
  
  // State management
  pickedChords: string[];
  wrongKey: boolean;
  midiConnected: boolean;
  time?: Date;
}

export interface PoolState {
  defaultPool: string[];
  poolKeys: string[];
  selectedIdx: number;
  defaultChordList: string[];
  poolChords: string[];
  defaultPoolChords: string[];
  selectedChordIdx: number;
  selectedChord: ChordEntry | null;
  middleCindex: number;
  cardLeft: number;
}

export interface ChordFilterParams {
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
}

export interface MidiInputData {
  status: number;
  note: number;
  velocity: number;
}

export interface KeyProps {
  asset: string;
  y: number;
  bar?: 'top' | 'middle' | 'bottom';
  note: string;
  showKey: boolean;
  sharp?: boolean;
  isFlat?: boolean;
  i: number;
  blured?: boolean;
}

export type AppAction = 
  | { type: 'TOGGLE_WITH_CHORD' }
  | { type: 'TOGGLE_SHOW_CONTROL' }
  | { type: 'TOGGLE_SHOW_LEFT_HALF' }
  | { type: 'TOGGLE_SHOW_RIGHT_HALF' }
  | { type: 'TOGGLE_SHOW_KEY' }
  | { type: 'TOGGLE_SHOW_VIRTUAL_PIANO' }
  | { type: 'TOGGLE_VIRTUAL_PIANO_HIGHLIGHT' }
  | { type: 'TOGGLE_WITH_MINOR' }
  | { type: 'TOGGLE_MINOR_ONLY' }
  | { type: 'TOGGLE_WITH_INVERSE1' }
  | { type: 'TOGGLE_WITH_INVERSE2' }
  | { type: 'TOGGLE_INVERSE1_ONLY' }
  | { type: 'TOGGLE_INVERSE2_ONLY' }
  | { type: 'TOGGLE_INVERSE_ONLY' }
  | { type: 'TOGGLE_7_ONLY' }
  | { type: 'TOGGLE_WITH_7' }
  | { type: 'TOGGLE_6_ONLY' }
  | { type: 'TOGGLE_WITH_6' }
  | { type: 'TOGGLE_67_ONLY' }
  | { type: 'TOGGLE_1_OCTAVE_ONLY' }
  | { type: 'TOGGLE_SHOW_CHORD_LABEL' }
  | { type: 'TOGGLE_SHOW_REMAIN_LABEL' }
  | { type: 'TOGGLE_BLURED_CHORD' }
  | { type: 'SET_PICKED_CHORDS'; payload: string[] }
  | { type: 'SET_WRONG_KEY'; payload: boolean }
  | { type: 'SET_MIDI_CONNECTED'; payload: boolean }
  | { type: 'SET_TIME'; payload: Date };

export const MIDI_CONSTANTS = {
  FIRST_MIDI_NOTE: 36, // C2
  LAST_MIDI_NOTE: 86,  // D6
  CHORD_WINDOW_MS: 50,
  CONTROL_KEY_MIDI: 86,
} as const;