import { useCallback, useEffect, useRef, useState } from 'react';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export interface PitchData {
  frequency: number;
  note: string;
  octave: number;
  midiNumber: number;
  cents: number;
  clarity: number;
}

function frequencyToMidi(frequency: number): number {
  return 12 * Math.log2(frequency / 440) + 69;
}

function midiToNoteName(midiNumber: number): { note: string; octave: number } {
  const octave = Math.floor(midiNumber / 12) - 1;
  const noteIndex = Math.round(midiNumber) % 12;
  return { note: NOTE_NAMES[noteIndex], octave };
}

function getCentsOffset(frequency: number, midiNumber: number): number {
  const exactMidi = frequencyToMidi(frequency);
  return Math.round((exactMidi - Math.round(midiNumber)) * 100);
}

// YIN algorithm for better fundamental frequency detection
function yinPitchDetection(buffer: Float32Array, sampleRate: number): { frequency: number; clarity: number } {
  const SIZE = buffer.length;
  const halfSize = Math.floor(SIZE / 2);
  
  // Calculate RMS
  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / SIZE);

  if (rms < 0.001) {
    return { frequency: -1, clarity: 0 };
  }

  // Step 1: Calculate difference function
  const diff = new Float32Array(halfSize);
  for (let tau = 0; tau < halfSize; tau++) {
    let sum = 0;
    for (let i = 0; i < halfSize; i++) {
      const delta = buffer[i] - buffer[i + tau];
      sum += delta * delta;
    }
    diff[tau] = sum;
  }

  // Step 2: Cumulative mean normalized difference function (CMNDF)
  const cmndf = new Float32Array(halfSize);
  cmndf[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < halfSize; tau++) {
    runningSum += diff[tau];
    cmndf[tau] = diff[tau] * tau / runningSum;
  }

  // Step 3: Absolute threshold - find first tau where cmndf < threshold
  // Use a lower threshold for better fundamental detection
  const threshold = 0.1;
  let tauEstimate = -1;
  
  // Start search from minimum period corresponding to ~2000 Hz
  const minTau = Math.floor(sampleRate / 2000);
  // End search at maximum period corresponding to ~50 Hz (for low notes like C2)
  const maxTau = Math.min(halfSize - 1, Math.floor(sampleRate / 50));

  for (let tau = minTau; tau < maxTau; tau++) {
    if (cmndf[tau] < threshold) {
      // Found a candidate, now find the local minimum
      while (tau + 1 < maxTau && cmndf[tau + 1] < cmndf[tau]) {
        tau++;
      }
      tauEstimate = tau;
      break;
    }
  }

  // If no tau found with threshold, find the global minimum
  if (tauEstimate === -1) {
    let minVal = cmndf[minTau];
    tauEstimate = minTau;
    for (let tau = minTau + 1; tau < maxTau; tau++) {
      if (cmndf[tau] < minVal) {
        minVal = cmndf[tau];
        tauEstimate = tau;
      }
    }
    // If the minimum is too high, no reliable pitch
    if (minVal > 0.5) {
      return { frequency: -1, clarity: 0 };
    }
  }

  // Step 4: Parabolic interpolation for sub-sample accuracy
  if (tauEstimate > 0 && tauEstimate < halfSize - 1) {
    const s0 = cmndf[tauEstimate - 1];
    const s1 = cmndf[tauEstimate];
    const s2 = cmndf[tauEstimate + 1];
    const adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));
    if (Math.abs(adjustment) < 1) {
      tauEstimate = tauEstimate + adjustment;
    }
  }

  const frequency = sampleRate / tauEstimate;
  const clarity = 1 - cmndf[Math.round(tauEstimate)];

  // Validate frequency range (C1 ~32Hz to C7 ~2093Hz)
  if (frequency < 30 || frequency > 2100) {
    return { frequency: -1, clarity: 0 };
  }

  return { frequency, clarity };
}

export function usePitchDetection() {
  const [isListening, setIsListening] = useState(false);
  const [pitchData, setPitchData] = useState<PitchData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const bufferRef = useRef<Float32Array | null>(null);

  const detectPitch = useCallback(() => {
    if (!analyserRef.current || !bufferRef.current || !audioContextRef.current) {
      return;
    }

    // @ts-expect-error TypeScript strict mode issue with Float32Array buffer types
    analyserRef.current.getFloatTimeDomainData(bufferRef.current);
    const { frequency, clarity } = yinPitchDetection(
      bufferRef.current,
      audioContextRef.current.sampleRate
    );

    // YIN clarity is 1 - cmndf, so higher is better
    if (frequency > 0 && clarity > 0.7) {
      const midiNumber = frequencyToMidi(frequency);
      const roundedMidi = Math.round(midiNumber);
      const { note, octave } = midiToNoteName(roundedMidi);
      const cents = getCentsOffset(frequency, roundedMidi);

      setPitchData({
        frequency: Math.round(frequency * 10) / 10,
        note,
        octave,
        midiNumber: roundedMidi,
        cents,
        clarity: Math.round(clarity * 100) / 100,
      });
    } else {
      setPitchData(null);
    }

    rafIdRef.current = requestAnimationFrame(detectPitch);
  }, []);

  const startListening = useCallback(async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      mediaStreamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      // Larger FFT size for better low frequency resolution (needed for C2 ~65Hz)
      analyser.fftSize = 8192;
      analyser.smoothingTimeConstant = 0;
      analyserRef.current = analyser;

      // Add gain node to boost quiet signals
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 2.0;
      gainNodeRef.current = gainNode;

      bufferRef.current = new Float32Array(analyser.fftSize);

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(gainNode);
      gainNode.connect(analyser);

      setIsListening(true);
      rafIdRef.current = requestAnimationFrame(detectPitch);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access microphone';
      setError(message);
      setIsListening(false);
    }
  }, [detectPitch]);

  const stopListening = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    gainNodeRef.current = null;
    bufferRef.current = null;

    setIsListening(false);
    setPitchData(null);
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    pitchData,
    error,
    startListening,
    stopListening,
  };
}
