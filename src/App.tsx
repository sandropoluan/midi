import { HashRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import NoteBar from './NoteBar';
import Pitch from './Pitch';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<NoteBar />} />
        <Route path="/pitch" element={<Pitch />} />
      </Routes>
    </HashRouter>
  );
}

