import logo from './logo.svg';
import './App.css';
import LoginSignup from './components/LoginSignUp';
import Home from './components/Home';
import Navbar from './components/Navbar'; // Import Navbar component
import AudioRecorder from './components/AudioRecorder';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div>
        <Navbar /> {/* Add Navbar here to make it available on every page */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/loginSignUp" element={<LoginSignup />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/audio" element={<AudioRecorder />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
