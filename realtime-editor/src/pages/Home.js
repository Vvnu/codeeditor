import React from "react";
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { socket } from "../socket";

const Home = ({username, setUsername, roomId, setRoomId, avatar}) => {
  const navigate = useNavigate();
  

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4();
    console.log('🏗️ Creating new room with ID:', id);
    setRoomId(id);
    toast.success('created a new room');

  };
  const joinRoom = () => {
    console.log('🚪 Attempting to join room:', { roomId, username, avatar });
    
    if (!roomId || !username) {
      console.warn('⚠️ Missing roomId or username:', { roomId, username });
      toast.error('ROOM ID and USERNAME are required');
      return;
    }
    
    // Emit joinroom event
    const joinData = { roomId, username, avatar };
    console.log('📤 Emitting joinroom event:', joinData);
    socket.emit("joinroom", joinData);
    
    // Navigate to editor
    console.log('🧭 Navigating to editor page');
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      }
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
      console.log('⌨️ Enter key pressed, joining room');
      joinRoom();
    }
  };
  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img className="homePageLogo" src="logo-removebg.png" alt="" />
        <h4 className="mainLabel">Paste invitation ROOM ID</h4>
        <div className="inputGroup">
          <input type="text" className="inputBox" placeholder="ROOM ID" onChange={(e) => setRoomId(e.target.value)} value={roomId} onKeyUp={handleInputEnter} />
          <input type="text" className="inputBox" placeholder="USERNAME" onChange={(e) => setUsername(e.target.value)} value={username} onKeyUp={handleInputEnter} />

          <button className="btn joinBtn" onClick={joinRoom}>Join</button>
          <span className="createInfo">
            If you don't have an invite then create &nbsp;
            <button
              onClick={createNewRoom}
              className="createNewBtn"
              style={{ 'backgroundColor': 'rgba(0,0,0,0)', 'border': '0', 'cursor': 'pointer' }}>
              new room
            </button>
          </span>
        </div>
      </div>
      <footer>
        <h4> Built with ❤️ by &nbsp;
          <a href=" https://github.com/Vvnu ">VAAG </a> </h4>
      </footer>
    </div>
  );
};

export default Home;
