import React from 'react';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';
import { AppState } from '../types';

interface ControlPanelProps {
  showControl: boolean;
  state: AppState;
  actions: {
    toggleWithChord: () => void;
    toggleBluredChord: () => void;
    toggleWithInverse1: () => void;
    toggleInverse1Only: () => void;
    toggleWithInverse2: () => void;
    toggleInverse2Only: () => void;
    toggleInverseOnly: () => void;
    toggleWithMinor: () => void;
    toggleMinorOnly: () => void;
    toggleWith7: () => void;
    toggle7Only: () => void;
    toggleWith6: () => void;
    toggle6Only: () => void;
    toggle67Only: () => void;
    toggleShowChordLabel: () => void;
    toggleShowKey: () => void;
    toggleShowLeftHalf: () => void;
    toggleShowRightHalf: () => void;
    toggleVirtualPianoHighlight: () => void;
    toggleShowRemainLabel: () => void;
    toggle1OctaveOnly: () => void;
    setPickedChords: (chords: string[]) => void;
  };
  uniqueChords: string[];
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  showControl,
  state,
  actions,
  uniqueChords
}) => {
  if (!showControl) return null;

  const handleChordSelection = (key: string) => {
    const prevState = [...state.pickedChords];
    const idx = prevState.indexOf(key);
    if (idx === -1) {
      prevState.push(key);
    } else {
      prevState.splice(idx, 1);
    }
    actions.setPickedChords(prevState);
  };

  return (
    <div>
      <div className='Toogle-wrapper'>
        <Toggle id='with-chord' checked={state.withChord} onChange={actions.toggleWithChord} />
        <div> Chord</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='blured-chord' 
          disabled={!state.withChord} 
          checked={state.bluredChord} 
          onChange={actions.toggleBluredChord} 
        />
        <div>blured Chord</div>
      </div>

      <div className='Toogle-wrapper'>
        <Toggle 
          id='1-octave-only' 
          disabled={!state.withChord} 
          checked={state._1octaveOnly} 
          onChange={actions.toggle1OctaveOnly} 
        />
        <div>1 Octave Only</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          disabled={!state.withChord} 
          id='with-inverse1' 
          checked={state.withInverse1} 
          onChange={actions.toggleWithInverse1} 
        />
        <div> Inverse 1</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='inverse1-only' 
          disabled={!state.withChord} 
          checked={state.inverse1Only} 
          onChange={actions.toggleInverse1Only} 
        />
        <div> Inverse 1 Only</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='with-inverse2' 
          disabled={!state.withChord} 
          checked={state.withInverse2} 
          onChange={actions.toggleWithInverse2} 
        />
        <div> Inverse 2</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='inverse2-only' 
          disabled={!state.withChord} 
          checked={state.inverse2Only} 
          onChange={actions.toggleInverse2Only} 
        />
        <div> Inverse 2 Only</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='inverse-only' 
          disabled={!state.withChord} 
          checked={state.inverseOnly} 
          onChange={actions.toggleInverseOnly} 
        />
        <div> Inverse 1 & 2 Only</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='with-minor' 
          disabled={!state.withChord} 
          checked={state.withMinor} 
          onChange={actions.toggleWithMinor} 
        />
        <div>Minor</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='minor-only' 
          disabled={!state.withChord} 
          checked={state.minorOnly} 
          onChange={actions.toggleMinorOnly} 
        />
        <div> Minor Only</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='with-7' 
          disabled={!state.withChord} 
          checked={state.with7} 
          onChange={actions.toggleWith7} 
        />
        <div>With 7</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='seven-only' 
          disabled={!state.withChord} 
          checked={state._7only} 
          onChange={actions.toggle7Only} 
        />
        <div>7 Only</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='with-6' 
          disabled={!state.withChord} 
          checked={state.with6} 
          onChange={actions.toggleWith6} 
        />
        <div>With 6</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='six-only' 
          disabled={!state.withChord} 
          checked={state._6only} 
          onChange={actions.toggle6Only} 
        />
        <div>6 Only</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='six-seven-only' 
          disabled={!state.withChord} 
          checked={state._67only} 
          onChange={actions.toggle67Only} 
        />
        <div>6 and 7 Only</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='show-chord-label' 
          disabled={!state.withChord} 
          checked={state.showChordLabel} 
          onChange={actions.toggleShowChordLabel} 
        />
        <div>Show Chord label</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='cheese-status' 
          checked={state.showKey} 
          onChange={actions.toggleShowKey} 
        />
        <div> Show Key</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='left-half' 
          checked={state.showLeftHalf} 
          onChange={actions.toggleShowLeftHalf} 
        />
        <div> Left Half</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='right-half' 
          checked={state.showRightHalf} 
          onChange={actions.toggleShowRightHalf} 
        />
        <div> Right Half</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='virtual-piano-highlight' 
          checked={state.virtualPianoHighlight} 
          disabled={!state.showVirtualPiano} 
          onChange={actions.toggleVirtualPianoHighlight} 
        />
        <div>Highlight Key</div>
      </div>
      
      <div className='Toogle-wrapper'>
        <Toggle 
          id='remain-label' 
          checked={state.showRemainLabel} 
          onChange={actions.toggleShowRemainLabel} 
        />
        <div>Remaining Cards</div>
      </div>
      
      {state.withChord && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          marginTop: 12, 
          marginBottom: 5 
        }}>
          {uniqueChords.map(key => {
            const selected = state.pickedChords.indexOf(key) > -1;
            return (
              <span
                key={key}
                onClick={() => handleChordSelection(key)}
                style={{ 
                  cursor: 'pointer', 
                  padding: '4px 6px', 
                  backgroundColor: '#FFF', 
                  borderRadius: 8, 
                  marginRight: 6, 
                  marginBottom: 6, 
                  ...(selected ? { backgroundColor: '#ffe2ad' } : {}) 
                }}
              >
                {key}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};