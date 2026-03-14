const fs = require('fs');

function parseMidi(filePath) {
  const buffer = fs.readFileSync(filePath);
  let offset = 0;

  // Parse header
  const headerChunk = buffer.toString('ascii', 0, 4);
  if (headerChunk !== 'MThd') throw new Error('Invalid MIDI file');
  
  offset = 8;
  const format = buffer.readUInt16BE(offset);
  const numTracks = buffer.readUInt16BE(offset + 2);
  const ticksPerBeat = buffer.readUInt16BE(offset + 4);
  offset += 6;

  console.log(`Format: ${format}, Tracks: ${numTracks}, Ticks/Beat: ${ticksPerBeat}`);

  const tracks = [];

  for (let t = 0; t < numTracks; t++) {
    const trackChunk = buffer.toString('ascii', offset, offset + 4);
    if (trackChunk !== 'MTrk') {
      console.log(`Warning: Expected MTrk at offset ${offset}`);
      break;
    }
    
    const trackLength = buffer.readUInt32BE(offset + 4);
    offset += 8;
    
    const trackEnd = offset + trackLength;
    const notes = [];
    const activeNotes = {};
    let absoluteTime = 0;
    let runningStatus = 0;
    let trackName = `Track ${t}`;

    while (offset < trackEnd) {
      // Read variable-length delta time
      let deltaTime = 0;
      let byte;
      do {
        byte = buffer[offset++];
        deltaTime = (deltaTime << 7) | (byte & 0x7F);
      } while (byte & 0x80);
      
      absoluteTime += deltaTime;

      // Read event
      let status = buffer[offset];
      
      if (status < 0x80) {
        status = runningStatus;
      } else {
        offset++;
        if (status < 0xF0) runningStatus = status;
      }

      const eventType = status & 0xF0;
      const channel = status & 0x0F;

      if (eventType === 0x90) { // Note On
        const note = buffer[offset++];
        const velocity = buffer[offset++];
        
        if (velocity > 0) {
          activeNotes[note] = { time: absoluteTime, velocity };
        } else {
          // Note Off (velocity 0)
          if (activeNotes[note]) {
            notes.push({
              midi: note,
              name: midiToNoteName(note),
              time: activeNotes[note].time,
              duration: absoluteTime - activeNotes[note].time,
              velocity: activeNotes[note].velocity
            });
            delete activeNotes[note];
          }
        }
      } else if (eventType === 0x80) { // Note Off
        const note = buffer[offset++];
        offset++; // velocity
        
        if (activeNotes[note]) {
          notes.push({
            midi: note,
            name: midiToNoteName(note),
            time: activeNotes[note].time,
            duration: absoluteTime - activeNotes[note].time,
            velocity: activeNotes[note].velocity
          });
          delete activeNotes[note];
        }
      } else if (eventType === 0xA0) { // Aftertouch
        offset += 2;
      } else if (eventType === 0xB0) { // Control Change
        offset += 2;
      } else if (eventType === 0xC0) { // Program Change
        offset += 1;
      } else if (eventType === 0xD0) { // Channel Pressure
        offset += 1;
      } else if (eventType === 0xE0) { // Pitch Bend
        offset += 2;
      } else if (status === 0xFF) { // Meta Event
        const metaType = buffer[offset++];
        let metaLength = 0;
        do {
          byte = buffer[offset++];
          metaLength = (metaLength << 7) | (byte & 0x7F);
        } while (byte & 0x80);
        
        if (metaType === 0x03) { // Track Name
          trackName = buffer.toString('ascii', offset, offset + metaLength);
        }
        
        offset += metaLength;
      } else if (status === 0xF0 || status === 0xF7) { // SysEx
        let sysexLength = 0;
        do {
          byte = buffer[offset++];
          sysexLength = (sysexLength << 7) | (byte & 0x7F);
        } while (byte & 0x80);
        offset += sysexLength;
      }
    }

    tracks.push({ name: trackName, channel: t, notes });
    offset = trackEnd;
  }

  return { format, numTracks, ticksPerBeat, tracks };
}

function midiToNoteName(midi) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const note = noteNames[midi % 12];
  return `${note}${octave}`;
}

// Parse the file
const midiData = parseMidi('/Users/sandro.brayen/Downloads/Perfect.mid');

console.log('\n=== TRACK SUMMARY ===');
console.log(`Ticks per beat: ${midiData.ticksPerBeat}`);
midiData.tracks.forEach((track, i) => {
  console.log(`\nTrack ${i}: "${track.name}" - ${track.notes.length} notes`);
  if (track.notes.length > 0) {
    const pitches = track.notes.map(n => n.midi);
    console.log(`  Pitch range: ${midiToNoteName(Math.min(...pitches))} - ${midiToNoteName(Math.max(...pitches))}`);
  }
});

// Find the melody track (usually the one with notes in vocal range ~C4-C6)
const melodyTrack = midiData.tracks.find(t => {
  if (t.notes.length === 0) return false;
  const avgPitch = t.notes.reduce((sum, n) => sum + n.midi, 0) / t.notes.length;
  return avgPitch >= 60 && avgPitch <= 84; // C4 to C6 range
}) || midiData.tracks.find(t => t.notes.length > 0);

if (melodyTrack) {
  console.log(`\n=== MELODY TRACK: "${melodyTrack.name}" ===`);
  console.log(`Total notes: ${melodyTrack.notes.length}`);
  console.log(`Ticks per beat: ${midiData.ticksPerBeat}`);
  
  // BPM from the MIDI file (typically around 63-68 for Perfect)
  const BPM = 68;
  const ticksPerBeat = midiData.ticksPerBeat;
  const msPerTick = (60000 / BPM) / ticksPerBeat;
  
  console.log(`\nAssuming BPM: ${BPM}`);
  console.log(`Ms per tick: ${msPerTick.toFixed(2)}`);
  
  // Convert to milliseconds and calculate gaps
  const notesWithMs = melodyTrack.notes.map((n, i) => {
    const timeMs = Math.round(n.time * msPerTick);
    const durationMs = Math.round(n.duration * msPerTick);
    const nextNote = melodyTrack.notes[i + 1];
    const gapMs = nextNote ? Math.round((nextNote.time - n.time) * msPerTick) : 0;
    
    return {
      note: n.name,
      midi: n.midi,
      timeMs,
      durationMs,
      gapToNextMs: gapMs
    };
  });
  
  console.log('\n=== MELODY WITH TIMING (MS) ===');
  console.log(JSON.stringify(notesWithMs.slice(0, 50), null, 2));
  
  // Show timing statistics
  const gaps = notesWithMs.filter(n => n.gapToNextMs > 0).map(n => n.gapToNextMs);
  console.log('\n=== TIMING STATISTICS ===');
  console.log(`Min gap: ${Math.min(...gaps)}ms`);
  console.log(`Max gap: ${Math.max(...gaps)}ms`);
  console.log(`Avg gap: ${Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)}ms`);
  
  // Group by common gap values
  const gapCounts = {};
  gaps.forEach(g => {
    const rounded = Math.round(g / 50) * 50;
    gapCounts[rounded] = (gapCounts[rounded] || 0) + 1;
  });
  console.log('\nGap distribution (rounded to 50ms):');
  Object.entries(gapCounts).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).forEach(([gap, count]) => {
    console.log(`  ${gap}ms: ${count} occurrences`);
  });
  
  // Output the full array with timing for TypeScript
  console.log('\n=== TYPESCRIPT EXPORT ===');
  const tsExport = notesWithMs.map(n => ({
    note: n.note,
    midi: n.midi,
    timeMs: n.timeMs,
    durationMs: n.durationMs
  }));
  console.log('export const perfectMelodyWithTiming = ' + JSON.stringify(tsExport, null, 2) + ' as const;');
}
