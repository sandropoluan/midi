import React from 'react';
import { render, screen } from '@testing-library/react';
import { Key } from '../Key';

describe('Key Component', () => {
  const defaultProps = {
    asset: 'test-asset.png',
    y: 100,
    note: 'C',
    showKey: true,
    i: 0,
  };

  it('renders without crashing', () => {
    render(<Key {...defaultProps} />);
  });

  it('displays the note when showKey is true', () => {
    render(<Key {...defaultProps} showKey={true} />);
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('hides the note when showKey is false', () => {
    render(<Key {...defaultProps} showKey={false} />);
    expect(screen.queryByText('C')).not.toBeInTheDocument();
  });

  it('displays flat symbol when isFlat is true', () => {
    render(<Key {...defaultProps} isFlat={true} />);
    expect(screen.getByText('♭')).toBeInTheDocument();
  });

  it('displays sharp symbol when sharp is true and not blured', () => {
    render(<Key {...defaultProps} sharp={true} blured={false} />);
    expect(screen.getByText('#')).toBeInTheDocument();
  });
});