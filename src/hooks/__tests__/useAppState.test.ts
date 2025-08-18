import { renderHook, act } from '@testing-library/react';
import { useAppState } from '../useAppState';

describe('useAppState', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAppState());
    
    expect(result.current.state.withChord).toBe(true);
    expect(result.current.state.showControl).toBe(false);
    expect(result.current.state.showLeftHalf).toBe(true);
    expect(result.current.state.showRightHalf).toBe(true);
    expect(result.current.state.pickedChords).toEqual([]);
  });

  it('should toggle withChord when toggleWithChord is called', () => {
    const { result } = renderHook(() => useAppState());
    
    act(() => {
      result.current.actions.toggleWithChord();
    });
    
    expect(result.current.state.withChord).toBe(false);
  });

  it('should set picked chords when setPickedChords is called', () => {
    const { result } = renderHook(() => useAppState());
    const testChords = ['C', 'D', 'E'];
    
    act(() => {
      result.current.actions.setPickedChords(testChords);
    });
    
    expect(result.current.state.pickedChords).toEqual(testChords);
  });

  it('should handle complex state transitions for inverse toggles', () => {
    const { result } = renderHook(() => useAppState());
    
    act(() => {
      result.current.actions.toggleInverse1Only();
    });
    
    expect(result.current.state.inverse1Only).toBe(true);
    expect(result.current.state.withInverse1).toBe(true);
    expect(result.current.state.inverse2Only).toBe(false);
    expect(result.current.state.withInverse2).toBe(false);
  });
});