import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';
import { useState, useEffect } from "react";

// Load data from localStorage
const loadData = (key) => {
  return localStorage.getItem(key);
};

// Save data to localStorage
const saveData = (key, value) => {
  localStorage.setItem(key, value);
};

// Generate avatar from username
const generateAvatar = (username) => {
  if (!username) return '';
  const firstLetter = username.charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=200`;
};

function App() {
  const [roomId, setRoomId] = useState(loadData('roomId') || '');
  const [username, setUsername] = useState(loadData('username') || '');
  const [avatar, setAvatar] = useState(loadData('avatar') || '');

  useEffect(() => {
    saveData('roomId', roomId);
  }, [roomId]);

  useEffect(() => {
    saveData('username', username);
    // Generate avatar when username changes
    if (username) {
      const newAvatar = generateAvatar(username);
      setAvatar(newAvatar);
      saveData('avatar', newAvatar);
    }
  }, [username]);

  return (
    <>
      <div>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        />
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home roomId={roomId} setRoomId={setRoomId} username={username} setUsername={setUsername} avatar={avatar} />} />
          <Route path="/editor/:roomId" element={<EditorPage username={username} avatar={avatar} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
