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

function App() {
  const [roomId, setRoomId] = useState(loadData('roomId') || '');
  const [username, setUsername] = useState(loadData('username') || '');

  useEffect(() => {
    saveData('roomId', roomId);
  }, [roomId]);

  useEffect(() => {
    saveData('username', username);
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
          <Route path="/" element={<Home roomId={roomId} setRoomId={setRoomId} username={username} setUsername={setUsername} />} />
          <Route path="/editor/:roomId" element={<EditorPage username={username} roomId={roomId} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
