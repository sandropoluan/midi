declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

// Minimal Web MIDI API typings to satisfy TS
interface Navigator {
  requestMIDIAccess?: (options?: { sysex?: boolean }) => Promise<any>;
}

