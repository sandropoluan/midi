import React from 'react';

interface ConnectionStatusProps {
  midiConnected: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ midiConnected }) => {
  return (
    <div id="connection" className={midiConnected ? 'connected' : undefined}>
      Midi {midiConnected ? 'connected' : 'not connected'}
    </div>
  );
};