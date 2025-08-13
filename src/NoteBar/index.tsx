import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Toggle from 'react-toggle';
import classNames from 'classnames';
import 'react-toggle/style.css';
import { Piano } from 'react-piano';
import 'react-piano/dist/styles.css';
import './index.scss';
import { FIRST_MIDI_NOTE, LAST_MIDI_NOTE, PIANO_KEYBOARD_SHORTCUTS, CHORD_WINDOW_MS, areArraysEqual, isSubset, mergeArrays, toMidiNumber, buildChordMapWithVariants, createChordFilter, ChordMap } from './utils';
import { noteMap as map } from './noteMap';
import { chordMap as baseChordMap } from './chords';

let chordMap: ChordMap = buildChordMapWithVariants(baseChordMap);

const defaultPoolKeys = Object.keys(map).sort((a, b) => +a.split('-')[0] - +b.split('-')[0]);
const createChordPredicate = (params: any) => createChordFilter(chordMap, params);

let uniqueChords: string[] = [];
for (let key in chordMap) {
  const { symbol } = (chordMap as any)[key];
  if (!uniqueChords.includes(symbol)) uniqueChords.push(symbol);
}
uniqueChords = uniqueChords.sort();

export default function NoteBar() {
  const [pickedChords, setPickedChords] = useState<string[]>([]);
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
  const [bluredChord, setBluredCorld] = useState(true);
  const [_7only, set_7Only] = useState(false);
  const [_6only, set_6Only] = useState(false);
  const [with7, setWith7] = useState(true);
  const [with6, setWith6] = useState(true);
  const [_1octaveOnly, set_1octaveOnly] = useState(true);
  const [_67only, set_67Only] = useState(false);
  const [wrongKey, setWrongKey] = useState(false);
  const [showVirtualPiano, setShowVirtualPiano] = useState(true);
  const [virtualPianoHighlight, setVirtualPianoHighlight] = useState(false);
  const [midiConnected, setMidiConnected] = useState(false);
  const midiConnectedRef = useRef(midiConnected);

  const defaultPool = useRef<string[]>([]);
  const poolKeys = useRef<string[]>(defaultPoolKeys);
  const selectedIdx = useRef<number>(Math.floor(poolKeys.current.length * Math.random()));
  const defaultPoolChords = useRef<string[]>([]);

  const defaultChordMap = useMemo<string[]>(() => {
    const keys = Object.keys(chordMap);
    return _1octaveOnly ? ([] as string[]).concat(keys, keys, keys, keys) : keys;
  }, [_1octaveOnly]);

  const middleCindex = defaultChordMap.indexOf('C4');
  const poolChords = useRef<string[]>(defaultChordMap.filter(createChordPredicate({ withMinor, withInverse1, withInverse2, inverse1Only, inverse2Only, inverseOnly, minorOnly, _7only, with7, _6only, with6, pickedChords, _67only, _1octaveOnly })));
  const selectedChordIdx = useRef<number>(Math.floor(poolChords.current.length * Math.random()));
  const selectedChord = useRef<any>(chordMap[poolChords.current[selectedChordIdx.current]]);

  const playedNote = useRef<number[]>([]);
  const cardLeft = poolKeys.current.length || poolChords.current.length;
  const [time, setTime] = useState<Date | undefined>();

  useEffect(() => {
    if (wrongKey) setTimeout(() => setWrongKey(false), 100);
  }, [wrongKey]);

  useEffect(() => {
    poolKeys.current = [];
    poolChords.current = [];

    if (withChord) {
      let pool: string[] = [];
      if (showLeftHalf && !showRightHalf) pool = defaultChordMap.slice(0, middleCindex);
      else if (showRightHalf && !showLeftHalf) pool = defaultChordMap.slice(middleCindex);
      else pool = [...defaultChordMap];

      pool = pool.filter(createChordPredicate({ withMinor, withInverse1, withInverse2, inverse1Only, inverse2Only, inverseOnly, minorOnly, _7only, with7, _6only, with6, pickedChords, _67only, _1octaveOnly }));
      defaultPoolChords.current = pool;
      poolChords.current = pool;
      selectedChordIdx.current = Math.floor(poolChords.current.length * Math.random());
      const chord = poolChords.current[selectedChordIdx.current];
      selectedChord.current = (chordMap as any)[chord];
    } else {
      let pool: string[] = [];
      if (showLeftHalf && !showRightHalf) pool = defaultPoolKeys.slice(0, 34);
      else if (showRightHalf && !showLeftHalf) pool = defaultPoolKeys.slice(34);
      else pool = [...defaultPoolKeys];
      defaultPool.current = pool;
      poolKeys.current = pool;
      selectedIdx.current = Math.floor(poolKeys.current.length * Math.random());
    }
    setTime(new Date());
  }, [showLeftHalf, showRightHalf, withChord, withMinor, withInverse1, withInverse2, inverse1Only, inverseOnly, minorOnly, _7only, with7, _6only, with6, pickedChords, _67only, _1octaveOnly]);

  const highlightedKeys = useMemo(() => {
    if (!virtualPianoHighlight) return [] as number[];
    if (withChord) return (mergeArrays<number>(selectedChord.current?.rootKeys, selectedChord.current?.keys) || []).map(item => toMidiNumber(item));
    return [toMidiNumber(poolKeys.current[selectedIdx.current])];
  }, [time, withChord, virtualPianoHighlight]);

  const [showKey, setShowKey] = useState(false);

  const next = useCallback(() => {
    let state = [...poolKeys.current];
    state.splice(selectedIdx.current, 1);
    if (!state.length) state = [...defaultPool.current];
    selectedIdx.current = Math.floor(state.length * Math.random());
    poolKeys.current = state;
    setTime(new Date());
  }, []);

  const nextChord = useCallback(() => {
    if (!withChord) return;
    let state = [...poolChords.current];
    state.splice(selectedChordIdx.current, 1);
    if (!state.length) state = [...defaultPoolChords.current];
    selectedChordIdx.current = Math.floor(state.length * Math.random());
    poolChords.current = state;
    const chord = poolChords.current[selectedChordIdx.current];
    selectedChord.current = (chordMap as any)[chord];
    setTime(new Date());
  }, [withChord]);

  useEffect(() => {
    if (!navigator.requestMIDIAccess) return;
    const activeNotes = new Map<number, number>();
    const chordWindow = CHORD_WINDOW_MS;
    let disconnectedTimeout: any;
    let retryTimeout: any;
    let requestMIDI: any;
    let inputs: any;
    let handleInput: any;

    const cleanUp = () => {
      clearTimeout(disconnectedTimeout);
      clearTimeout(retryTimeout);
      (inputs || []).forEach((input: any) => input.removeEventListener('midimessage', handleInput));
    };

    handleInput = (input: any) => {
      if (input) {
        clearTimeout(disconnectedTimeout);
        setMidiConnected(true);
        midiConnectedRef.current = true;
        disconnectedTimeout = setTimeout(() => {
          setMidiConnected(false);
          midiConnectedRef.current = false;
          cleanUp();
          if (typeof requestMIDI === 'function') requestMIDI();
        }, 3000);
      }
      if (withChord) {
        const [status, note, velocity] = input.data;
        const command = status & 0xf0;
        const now = performance.now();
        if (command === 0x90 && velocity > 0) {
          activeNotes.set(note, now);
          const chord: number[] = [];
          activeNotes.forEach((timestamp, key) => { if (now - timestamp <= chordWindow) chord.push(key); });
          if (areArraysEqual(chord, mergeArrays<number>(selectedChord.current.rootKeys, selectedChord.current.keys) as number[])) nextChord();
        } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
          activeNotes.delete(note);
        }
      } else {
        const [command, note, velocity] = input.data;
        if (command === 144 && velocity > 0) {
          if (note === toMidiNumber(poolKeys.current[selectedIdx.current])) next();
        }
      }
    };

    const retry = () => {
      if (midiConnectedRef.current) return;
      retryTimeout = setTimeout(() => { requestMIDI(); }, 2000);
    };

    const onSuccess = (midiAccess: any) => {
      const inputs = midiAccess.inputs;
      if (!inputs?.length && !midiConnectedRef.current) retry();
      inputs.forEach((input: any) => input.addEventListener('midimessage', handleInput));
    };

    requestMIDI = function () {
      navigator.requestMIDIAccess().then(onSuccess, retry).catch(retry);
    };
    requestMIDI();
    return () => { cleanUp(); };
  }, [withChord]);

  const onWithChordChange = useCallback(() => { setWithChord(prev => !prev); }, []);
  const onWithMinorChange = useCallback(() => { if (withMinor) setMinorOnly(false); setWithMinor(prev => !prev); }, [withMinor]);
  const onShowChordLabelChange = useCallback(() => { setShowChordLabel(prev => !prev); }, []);
  const onToggleChange = useCallback(() => { setShowKey(prev => !prev); }, []);
  const onToggleLeftChange = useCallback(() => { setShowLeftHalf(prev => !prev); }, []);
  const onToggleRightChange = useCallback(() => { setShowRightHalf(prev => !prev); }, []);
  const onToggleVirtualPianoChange = useCallback(() => { setShowVirtualPiano(prev => !prev); }, []);
  const onToggleRemainLabelChange = useCallback(() => { setShowRemainLabel(prev => !prev); }, []);
  const onToggleVirtualPianoHighlightChange = useCallback(() => { setVirtualPianoHighlight(prev => !prev); }, []);
  const onClick = useCallback(() => { withChord ? nextChord() : next(); }, [withChord]);

  const onKeyboardPlayNote = useCallback((midiNumber: number) => {
    if (midiNumber === 86) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setShowControl(state => !state), 500);
      return;
    }
    if (withChord) {
      playedNote.current.push(midiNumber);
      const targetKeys = mergeArrays<number>(selectedChord.current.rootKeys, selectedChord.current.keys) || [];
      if (!targetKeys.includes(midiNumber) || !isSubset(playedNote.current, targetKeys) || (playedNote.current.length === targetKeys.length && !areArraysEqual(targetKeys, playedNote.current))) {
        playedNote.current = [];
        setWrongKey(true);
        return;
      }
      if (playedNote.current.length === targetKeys.length && areArraysEqual(targetKeys, playedNote.current)) {
        playedNote.current = [];
        nextChord();
      }
      return;
    }
    if (midiNumber === toMidiNumber(poolKeys.current[selectedIdx.current])) next();
  }, [withChord, next, nextChord]);

  const showedSymbol = useMemo(() => {
    if (!withChord || !showChordLabel) return null;
    const text = selectedChord.current.symbol as string;
    const isMinor = text.includes('m');
    const color = isMinor ? 'yellow' : 'white';
    if (text.includes('△')) {
      const chord = text.split('△')[0];
      return <span style={{ color }}>{chord}<span style={{ color: 'red' }}>△</span>7</span>;
    } else if (text.includes('6')) {
      const chord = text.split('6')[0];
      return <span style={{ color }}>{chord}<span style={{ color: '#e28743' }}>6</span></span>;
    } else {
      return <span style={{ color }}>{text}</span>;
    }
  }, [withChord, showChordLabel, (selectedChord.current as any).symbol]);

  return (
    <>
      <div id="wrong-key-everlay" className={wrongKey ? 'show' : undefined}></div>
      <div className='Note-bar-container'>
        <div id="connection" className={midiConnected ? 'connected' : undefined}>
          Midi {midiConnected ? 'connected' : 'not connected'}
        </div>
        {showRemainLabel && <div id="remaining">Remaining: {cardLeft}</div>}
        <div className="Note-Bar" onClick={onClick}>
          {withChord && showChordLabel && (
            <span style={{ position: 'absolute', top: 50, left: 500, width: 300, display: 'flex', fontSize: 30, fontWeight: 'bold', color: '#FFF', backgroundColor: 'rgba(0, 0, 0, 0.4)', padding: '10px 12px', borderRadius: '10px' }}>{showedSymbol}</span>
          )}
          {withChord && (
            (mergeArrays<any>(selectedChord.current?.rootKeysMask, selectedChord.current?.mask) || mergeArrays<any>(selectedChord.current?.rootKeys, selectedChord.current?.keys))?.map((keyNumber: any) => {
              const isFlat = typeof keyNumber === 'string';
              const { asset, y, bar, key: note, sharp } = (map as any)[keyNumber] || (map as any)[`${keyNumber}-sharp`];
              return <Key key={keyNumber} bar={bar} note={note} asset={asset} y={y} showKey={showKey} sharp={sharp && !isFlat} isFlat={isFlat} i={0} blured={bluredChord} />
            })
          )}
          {!withChord && (
            poolKeys.current.map((key, i) => {
              if (i !== selectedIdx.current) return null;
              const { asset, y, bar, key: note, sharp, flat } = (map as any)[key];
              return <Key key={key} bar={bar} note={note} asset={asset} y={y} showKey={showKey} isFlat={flat} sharp={sharp} i={i} />
            })
          )}
        </div>

        {showVirtualPiano && (
          <div className='Piano-wrapper'>
            <Piano
              noteRange={{ first: FIRST_MIDI_NOTE, last: LAST_MIDI_NOTE }}
              highlightedKeys={highlightedKeys}
              playNote={onKeyboardPlayNote}
              stopNote={() => { }}
              width={1000}
              keyWidthToHeight={0.22}
              keyboardShortcuts={PIANO_KEYBOARD_SHORTCUTS}
              renderNoteLabel={({ keyboardShortcut, midiNumber, isActive, isAccidental }) =>
                midiNumber === 86 ? (
                  <div className={classNames('ReactPiano__NoteLabel', {
                    'ReactPiano__NoteLabel--active': isActive,
                    'ReactPiano__NoteLabel--accidental': isAccidental,
                    'ReactPiano__NoteLabel--natural': !isAccidental,
                  })}>CP</div>
                ) : null}
            />
          </div>
        )}

        {showControl && (
          <div>
            <div className='Toogle-wrapper'>
              <Toggle id='with-chord' checked={withChord} onChange={onWithChordChange} />
              <div> Chord</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='blured-chord' disabled={!withChord} checked={bluredChord} onChange={() => { setBluredCorld(state => !state); }} />
              <div>blured Chord</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle disabled={!withChord} id='with-inverse1' checked={withInverse1} onChange={() => {
                if (withInverse1) setInverse1Only(false); else setInverse2Only(false);
                setWithInverse1(state => !state);
                setInverseOnly(false);
              }} />
              <div> Inverse 1</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='inverse1-only' disabled={!withChord} checked={inverse1Only} onChange={() => {
                if (!inverse1Only) { setWithInverse1(true); setInverse2Only(false); setWithInverse2(false); }
                set_67Only(false); set_7Only(false); set_6Only(false);
                setInverse1Only(state => !state); setInverseOnly(false);
              }} />
              <div> Inverse 1 Only</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='with-inverse2' disabled={!withChord} checked={withInverse2} onChange={() => {
                if (withInverse2) setInverse2Only(false); else setInverse1Only(false);
                setWithInverse2(state => !state);
                setInverseOnly(false);
              }} />
              <div> Inverse 2</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='inverse2-only' disabled={!withChord} checked={inverse2Only} onChange={() => {
                if (!inverse2Only) { setWithInverse2(true); setInverse1Only(false); setWithInverse1(false); }
                set_67Only(false); set_7Only(false); set_6Only(false);
                setInverse2Only(state => !state); setInverseOnly(false);
              }} />
              <div> Inverse 2 Only</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='inverse-only' disabled={!withChord} checked={inverseOnly} onChange={() => {
                if (!inverseOnly) { setWithInverse1(true); setWithInverse2(true); setInverse1Only(false); setInverse2Only(false); }
                set_67Only(false); set_7Only(false); set_6Only(false);
                setInverseOnly(state => !state);
              }} />
              <div> Inverse 1 & 2 Only</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='with-minor' disabled={!withChord} checked={withMinor} onChange={onWithMinorChange} />
              <div>Minor</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='minor-only' disabled={!withChord} checked={minorOnly} onChange={() => { if (!minorOnly) setWithMinor(true); setMinorOnly(state => !state); }} />
              <div> Minor Only</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='with-7' disabled={!withChord} checked={with7} onChange={() => { if (with7) set_7Only(false); else set_6Only(false); set_67Only(false); setWith7(state => !state); }} />
              <div>With 7</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='seven-only' disabled={!withChord} checked={_7only} onChange={() => { if (!_7only) { setWith7(true); set_6Only(false); setWith6(false); } setInverse1Only(false); setInverse2Only(false); setInverseOnly(false); set_7Only(state => !state); }} />
              <div>7 Only</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='with-6' disabled={!withChord} checked={with6} onChange={() => { if (with6) set_6Only(false); else set_7Only(false); set_67Only(false); setWith6(state => !state); }} />
              <div>With 6</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='six-only' disabled={!withChord} checked={_6only} onChange={() => { if (!_6only) { setWith7(false); set_7Only(false); setWith6(true); } set_67Only(false); setInverse1Only(false); setInverse2Only(false); setInverseOnly(false); set_6Only(state => !state); }} />
              <div>6 Only</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='six-seven-only' disabled={!withChord} checked={_67only} onChange={() => { if (!_67only) { setWith7(true); setWith6(true); } set_6Only(false); set_7Only(false); setInverse1Only(false); setInverse2Only(false); setInverseOnly(false); set_67Only(state => !state); }} />
              <div>6 and 7 Only</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='show-chord-label' disabled={!withChord} checked={showChordLabel} onChange={onShowChordLabelChange} />
              <div>Show Chord label</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='cheese-status' checked={showKey} onChange={onToggleChange} />
              <div> Show Key</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='left-half' checked={showLeftHalf} onChange={onToggleLeftChange} />
              <div> Left Half</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='right-half' checked={showRightHalf} onChange={onToggleRightChange} />
              <div> Right Half</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='virtual-piano-highlight' checked={virtualPianoHighlight} disabled={!showVirtualPiano} onChange={onToggleVirtualPianoHighlightChange} />
              <div>Highlight Key</div>
            </div>
            <div className='Toogle-wrapper'>
              <Toggle id='remain-label' checked={showRemainLabel} onChange={onToggleRemainLabelChange} />
              <div>Remaining Cards</div>
            </div>
            {withChord && (
              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, marginBottom: 5 }}>
                {uniqueChords.map(key => {
                  const selected = pickedChords.indexOf(key) > -1;
                  return (
                    <span
                      key={key}
                      onClick={() => {
                        setPickedChords(prev => {
                          const prevState = [...prev];
                          const idx = prevState.indexOf(key);
                          if (idx === -1) prevState.push(key); else prevState.splice(idx, 1);
                          return prevState;
                        });
                      }}
                      style={{ cursor: 'pointer', padding: '4px 6px', backgroundColor: '#FFF', borderRadius: 8, marginRight: 6, marginBottom: 6, ...(selected ? { backgroundColor: '#ffe2ad' } : {}) }}
                    >
                      {key}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function Key(props: { asset: string; y: number; bar?: 'top' | 'middle' | 'bottom'; note: string; showKey: boolean; sharp?: boolean; isFlat?: boolean; i: number; blured?: boolean; }) {
  const width = 53;
  const ratio = 1.81;
  const { asset, y, bar, note, showKey, sharp, isFlat, i, blured } = props;
  const topBarMap: Record<'top' | 'middle' | 'bottom', number> = { top: -1, middle: 12, bottom: 27 } as const;
  return (
    <div style={{ width: width, height: width / ratio, position: 'absolute', left: i % 2 ? 250 : 250, top: y, backgroundImage: `url(${asset})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain' }}>
      {bar && <div style={{ position: 'absolute', width: width + 12, height: 4, left: -8, top: topBarMap[bar], backgroundColor: 'black' }} />}
      {showKey && <span className='Key'>{note}{isFlat && '♭'}</span>}
      {(sharp || isFlat) && !blured && <span style={{ position: 'absolute', fontSize: isFlat ? 45 : 30, fontWeight: 'bold', left: -20, top: isFlat ? -10 : -5 }}>{isFlat ? '♭' : '#'}</span>}
    </div>
  );
}

