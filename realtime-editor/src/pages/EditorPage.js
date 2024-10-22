import React, { useState, useEffect } from "react";
import Client from '../components/Client';
import CodeEditor from '../components/CodeEditor';
import { useNavigate, useParams } from "react-router-dom";
import toast from 'react-hot-toast';
import { socket } from '../socket';

const EditorPage = ({ username, avatar, roomId }) => {
  const navigate = useNavigate();
  const { roomId: paramRoomId } = useParams();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (username && paramRoomId) {
      socket.emit('joinRoom', { username, avatar, roomId: paramRoomId });

      socket.on('userList', (users) => {
        console.log(users);
        setClients(users);
      });

      socket.emit('sendUserData', { username, avatar, roomId: paramRoomId });
    }

    return () => {
      socket.off('userList');
    };
  }, [username, avatar, paramRoomId]);

  // Add beforeunload event listener
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ''; // Chrome requires returnValue to be set
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const fallbackCopyTextToClipboard = (text) => {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
      if (successful) {
        toast.success('Room ID copied successfully', {
          duration: 3000,
          position: 'top-right',
        });
      } else {
        toast.error('Failed to copy Room ID', {
          duration: 3000,
          position: 'top-right',
        });
      }
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      toast.error('Failed to copy Room ID', {
        duration: 3000,
        position: 'top-right',
      });
    }
    document.body.removeChild(textArea);
  };

  const handleLeaveClick = () => {
    const confirmLeave = confirm("Do you want to leave?");
    if (confirmLeave) {
      navigate('/');
    }
  };

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImage" src="/logo-removebg.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="clientsLists">
            {clients.map((client, index) => (
              <Client key={index} username={client.username} avatar={client.avatar} />
            ))}
          </div>
        </div>
        <button onClick={() => fallbackCopyTextToClipboard(roomId)} className="btn copyBtn">Copy Room id</button>
        <button onClick={handleLeaveClick} className="btn leaveBtn">Leave</button>
      </div>
      <div className="editorWrap">
        <CodeEditor roomId={roomId} username={username} />
      </div>
    </div>
  );
};

export default EditorPage;
