import './index.css'
import frullImage from './full.png';
import { useCallback, useEffect, useRef, useState } from 'react';

const map = {
    36: { // C2
        asset: frullImage,
        y: 471,
        bar: 'middle'
    },
    38: { // D2
        asset: frullImage,
        y: 456,
        bar: 'bottom'
    },
    40: { // E2
        asset: frullImage,
        y: 440,
        bar: 'middle'
    },
    41: { // F2
        asset: frullImage,
        y: 425,
        bar: 'bottom'
    },
    43: { // G2
        asset: frullImage,
        y: 409,
    },
    45: { // A2
        asset: frullImage,
        y: 394,
    },
    47: { // B2
        asset: frullImage,
        y: 378,
    },
    48: { // C3
        asset: frullImage,
        y: 362,
    },
    50: { // D3
        asset: frullImage,
        y: 347,
    },
    52: { // E3
        asset: frullImage,
        y: 330,
    },
    53: { // F3
        asset: frullImage,
        y: 315,
    },
    55: { // G3
        asset: frullImage,
        y: 300,
    },
    57: { // A3
        asset: frullImage,
        y: 284,
    },
    59: { // B3
        asset: frullImage,
        y: 268,
    },
    60: { // C4 (Middle C)
        asset: frullImage,
        y: 198,
        bar: 'middle'
    },
    62: { // D4
        asset: frullImage,
        y: 179,
    },
    64: { // E4
        asset: frullImage,
        y: 165,
    },
    65: { // F4
        asset: frullImage,
        y: 148,
    },
    67: { // G4
        asset: frullImage,
        y: 132,
    },
    69: { // A4
        asset: frullImage,
        y: 116,
    },
    71: { // B4
        asset: frullImage,
        y: 100,
    },
    72: { // C5
        asset: frullImage,
        y: 85,
    },
    74: { // D5
        asset: frullImage,
        y: 69,
    },
    76: { // E5
        asset: frullImage,
        y: 55,
    },
    77: { // F5
        asset: frullImage,
        y: 39,
    },
    79: { // G5
        asset: frullImage,
        y: 23,
        bar: 'top'
    },
    81: { // A5
        asset: frullImage,
        y: 8,
        bar: 'middle'
    },
    83: { // B5
        asset: frullImage,
        y: -8,
        bar: 'top'
    },
    84: { // C6
        asset: frullImage,
        y: -23,
        bar: 'middle'
    }

}

const defaultPoolKeys = Object.keys(map);

export default function NoteBar() {
    const poolKeys = useRef(defaultPoolKeys);
    const selectedIdx = useRef(Math.floor(poolKeys.current.length * Math.random()));

    const [_, setTime] = useState();

    const next = useCallback(() => {
        let state = [...poolKeys.current];
        state.splice(selectedIdx.current, 1);
        if (!state.length) {
            state = [...defaultPoolKeys]
        }

        selectedIdx.current = (Math.floor(state.length * Math.random()));
        poolKeys.current = state;
        setTime(new Date());
    }, []);


    useEffect(() => {
        if (navigator.requestMIDIAccess) {

            const handleInput = (input) => {

                const [command, note, velocity] = input.data;
                if (command === 144 & velocity > 0) {
                    console.log({ command, note, velocity }, poolKeys.current[selectedIdx.current])
                    if (note === +poolKeys.current[selectedIdx.current]) {
                        // console.log('jalan')
                        next();
                    }
                }
            }

            const onSuccess = (midiAccess) => {
                // console.log("Success midi", midiAccess, midiAccess.input)
                const inputs = midiAccess.inputs;
                inputs.forEach(input => {
                    input.addEventListener('midimessage', handleInput);
                })
            }

            const onError = (err) => {
                console.error('Error MIDI', err)
            }
            navigator.requestMIDIAccess().then(onSuccess, onError)
        }
    }, []);


    //  console.log('poolKeys', poolKeys.current.length, selectedIdx.current)

    return <div
        className="Note-Bar"
    // onClick={() => next()}
    >
        {
            poolKeys.current.map((key, i) => {
               if (i !== selectedIdx.current) return null;
                const width = 53;
                const ratio = 1.81;
                const { asset, y, bar } = map[key];

                const topBarMap = {
                    'top': -1,
                    'middle': 12,
                    'bottom': 27,
                }

                return <div key={key} style={{ width: width, height: width / ratio, position: 'absolute', left: i % 2 ? 250 : 250, top: y, backgroundImage: `url(${asset})`, backgroundRepeat:'no-repeat', backgroundSize: 'contain' }}>
                    {bar && <div style={{position: 'absolute', width: width + 12, height: 4, left: -8, top: topBarMap[bar], backgroundColor: 'black'}} />}
                    
                </div>
            })
        }

    </div>
}