// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock navigator.requestMIDIAccess  
Object.defineProperty(global.navigator, 'requestMIDIAccess', {
  value: jest.fn(() => Promise.resolve({
    inputs: new Map(),
    outputs: new Map(),
  })),
  writable: true,
});

// Ensure the function exists in all test environments
if (!global.navigator.requestMIDIAccess) {
  global.navigator.requestMIDIAccess = jest.fn(() => Promise.resolve({
    inputs: new Map(),
    outputs: new Map(),
  }));
}

// Mock performance.now
Object.defineProperty(global.performance, 'now', {
  value: jest.fn(() => Date.now()),
  writable: true,
});