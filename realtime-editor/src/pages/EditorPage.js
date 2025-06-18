import React, { useState, useEffect } from "react";
import Client from '../components/Client';
import CodeEditor from '../components/CodeEditor';
import { useNavigate, useParams } from "react-router-dom";
import toast from 'react-hot-toast';
import { socket } from '../socket';

const EditorPage = ({ username, avatar }) => {
  const navigate = useNavigate();
  const { roomId: paramRoomId } = useParams();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    console.log('🏠 EditorPage mounted with:', { username, avatar, paramRoomId });
    
    if (username && paramRoomId) {
      console.log('🚀 Attempting to join room:', { username, avatar, roomId: paramRoomId });
      
      socket.emit('joinroom', { username, avatar, roomId: paramRoomId });

      socket.on('userList', (users) => {
        console.log('👥 Received user list update:', users);
        setClients(users);
      });

      socket.on('toast', (message) => {
        console.log('🍞 Received toast message:', message);
        toast.success(message);
      });

      // Debug: Listen for any errors
      socket.on('error', (error) => {
        console.error('❌ Socket error in EditorPage:', error);
      });
    } else {
      console.warn('⚠️ Missing username or roomId:', { username, paramRoomId });
    }

    return () => {
      console.log('🧹 Cleaning up EditorPage socket listeners');
      socket.off('userList');
      socket.off('toast');
      socket.off('error');
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
          <h3>Connected ({clients.length})</h3>
          <div className="clientsLists">
            {clients.map((client, index) => (
              <Client key={index} username={client.username} avatar={client.avatar} />
            ))}
          </div>
        </div>
        <button onClick={() => fallbackCopyTextToClipboard(paramRoomId)} className="btn copyBtn">Copy Room id</button>
        <button onClick={handleLeaveClick} className="btn leaveBtn">Leave</button>
      </div>
      <div className="editorWrap">
        <CodeEditor roomId={paramRoomId} username={username} />
      </div>
    </div>
  );
};

export default EditorPage;
