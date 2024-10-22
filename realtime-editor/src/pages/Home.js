import React from "react";
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { socket } from "../socket";

const Home = ({username, setUsername, roomId, setRoomId}) => {
  const navigate = useNavigate();
  

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success('created a new room');

  };
  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error('ROOM ID is required');
      return;
    }
    //redirect 
    socket.emit("joinroom",{roomId,username})
    navigate(`/editor/${roomId}`,
      {
        state: {
          username,
        }
      })
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
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
