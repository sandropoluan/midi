import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChordLabel } from '../ChordLabel';

describe('ChordLabel Component', () => {
  const mockChord = {
    symbol: 'C',
    keys: [60, 64, 67],
  };

  it('renders chord label when conditions are met', () => {
    render(
      <ChordLabel
        withChord={true}
        showChordLabel={true}
        selectedChord={mockChord}
      />
    );

    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('does not render when withChord is false', () => {
    const { container } = render(
      <ChordLabel
        withChord={false}
        showChordLabel={true}
        selectedChord={mockChord}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('does not render when showChordLabel is false', () => {
    const { container } = render(
      <ChordLabel
        withChord={true}
        showChordLabel={false}
        selectedChord={mockChord}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders triangle symbol for major 7th chords', () => {
    const major7Chord = { ...mockChord, symbol: 'C△7' };
    
    render(
      <ChordLabel
        withChord={true}
        showChordLabel={true}
        selectedChord={major7Chord}
      />
    );

    expect(screen.getByText('△')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders 6 symbol for sixth chords', () => {
    const sixthChord = { ...mockChord, symbol: 'C6' };
    
    render(
      <ChordLabel
        withChord={true}
        showChordLabel={true}
        selectedChord={sixthChord}
      />
    );

    expect(screen.getByText('6')).toBeInTheDocument();
  });
});