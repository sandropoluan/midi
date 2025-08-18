import { render, screen } from '@testing-library/react';
import App from './App';

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

test('renders midi application', () => {
  render(<App />);
  const connectionElement = screen.getByText(/Midi.*connected/);
  expect(connectionElement).toBeInTheDocument();
});
