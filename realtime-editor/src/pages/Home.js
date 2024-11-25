import React from "react";
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { socket } from "../socket";

const Home = ({ username, setUsername, roomId, setRoomId }) => {
  const navigate = useNavigate();

  // Create a new room with a generated ID
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);  // Set the generated room ID
    toast.success('Created a new room');
  };

  // Join an existing room with the given room ID
  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error('Both ROOM ID and USERNAME are required');
      return;
    }

    // Emit the 'joinroom' event to the server
    socket.emit("joinroom", { roomId, username });

    // Navigate to the editor page and pass the username via state
    navigate(`/editor/${roomId}`, {
      state: { username }
    });
  };

  // Handle Enter key press to join the room
  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
      joinRoom();
    }
  };

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img className="homePageLogo" src="logo-removebg.png" alt="logo" />
        <h4 className="mainLabel">Paste invitation ROOM ID</h4>
        <div className="inputGroup">
          <input
            type="text"
            className="inputBox"
            placeholder="ROOM ID"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
            onKeyUp={handleInputEnter}
          />
          <input
            type="text"
            className="inputBox"
            placeholder="USERNAME"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyUp={handleInputEnter}
          />

          <button className="btn joinBtn" onClick={joinRoom}>Join</button>
          <span className="createInfo">
            If you don't have an invite, then create a new room&nbsp;
            <button
              onClick={createNewRoom}
              className="createNewBtn"
              style={{ backgroundColor: 'rgba(0,0,0,0)', border: '0', cursor: 'pointer' }}
            >
              new room
            </button>
          </span>
        </div>
      </div>
      <footer>
        <h4> Built with ❤️ by &nbsp;
          <a href="https://github.com/Vvnu">VAAG</a>
        </h4>
      </footer>
    </div>
  );
};

export default Home;
