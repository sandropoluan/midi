import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the piano component to avoid complex dependencies
jest.mock('react-piano', () => ({
  Piano: () => <div data-testid="mock-piano">Mocked Piano</div>,
  MidiNumbers: {
    fromNote: jest.fn(() => 60),
  },
  KeyboardShortcuts: {
    create: jest.fn(() => ({})),
    HOME_ROW: {},
  },
}));

describe('App Integration', () => {
  it('renders the main application without crashing', () => {
    render(<App />);
    
    // Check if key components are rendered
    expect(screen.getByText(/Midi.*connected/)).toBeInTheDocument();
    expect(screen.getByTestId('mock-piano')).toBeInTheDocument();
  });

  it('displays connection status', () => {
    render(<App />);
    expect(screen.getByText('Midi not connected')).toBeInTheDocument();
  });

  it('displays remaining counter by default', () => {
    render(<App />);
    expect(screen.getByText(/Remaining:/)).toBeInTheDocument();
  });
});