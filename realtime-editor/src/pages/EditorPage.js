import React, { useState, useEffect } from "react";
import Client from '../components/Client';
import CodeEditor from '../components/CodeEditor';
import { useNavigate, useParams } from "react-router-dom";
import { socket } from '../socket';

const EditorPage = ({ username, avatar, roomId }) => {
  const navigate = useNavigate();
  const { roomId: paramRoomId } = useParams();
  const [clients, setClients] = useState([]);
  const [messages, setMessages] = useState([]); // State to store messages
  const [typingMessage, setTypingMessage] = useState(''); // State to store the typing message
  const [codeContent, setCodeContent] = useState(''); // State to store the code content

  useEffect(() => {
    if (username && paramRoomId) {
      socket.emit('joinroom', { username, avatar, roomId: paramRoomId });

      // Listen for updated user list
      socket.on('userList', (users) => {
        setClients(users);
      });

      // Listen for code updates (received from other users)
      socket.on('receiveCodeUpdate', (data) => {
        const { roomId, codeContent } = data;
        if (roomId === paramRoomId) {
          // Update the code content for the current room
          setCodeContent(codeContent);
        }
      });

      // Listen for messages from the server
      socket.on('receiveMessage', (data) => {
        const { username, message } = data;

        // Update the messages state to display it on the UI
        setMessages((prevMessages) => [...prevMessages, { username, message }]);
      });

      // Listen for typing updates
      socket.on('typing', (data) => {
        const { username, message } = data;
        setTypingMessage(`${username} is typing: ${message}`);
      });

      // Listen for toast notifications about user joining or leaving
      socket.on('toast', (message) => {
        console.log(message); // For debugging
      });

      // Emit user data (e.g., username, avatar, roomId)
      socket.emit('sendUserData', { username, avatar, roomId: paramRoomId });
    }

    return () => {
      socket.off('toast');
      socket.off('userList');
      socket.off('receiveCodeUpdate');
      socket.off('receiveMessage');
      socket.off('typing');
    };
  }, [username, avatar, paramRoomId]);

  const handleTyping = (message) => {
    // Emit typing event to other users in the room
    socket.emit('typing', { roomId: paramRoomId, username, message });

    // Optionally, update the local state with the message
    setTypingMessage(`${username} is typing: ${message}`);
  };

  const handleSendMessage = (message) => {
    // Emit the 'sendMessage' event when the user sends a message
    socket.emit('sendMessage', { roomId: paramRoomId, message });

    // Update the message list immediately in UI
    setMessages((prevMessages) => [...prevMessages, { username, message }]);

    // Clear the typing message
    setTypingMessage('');
  };

  const handleCodeChange = (newCodeContent) => {
    // Emit the updated code content to all users in the room
    socket.emit('sendCodeUpdate', { roomId: paramRoomId, codeContent: newCodeContent });

    // Update the local state with the new code content
    setCodeContent(newCodeContent);
  };

  const handleLeaveClick = () => {
    const confirmLeave = confirm("Do you want to leave?");
    if (confirmLeave) {
      // Emit disconnect event when the user leaves
      socket.emit('disconnect');
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
        <button onClick={handleLeaveClick} className="leaveBtn">
          Leave Room
        </button>
      </div>

      <div className="editor">
        <CodeEditor
          codeContent={codeContent}
          onCodeChange={handleCodeChange}
          onTyping={handleTyping}
        />
        <div>
          {typingMessage && <p>{typingMessage}</p>}
          <div className="chat">
            {messages.map((msg, index) => (
              <div key={index} className="chatMessage">
                <strong>{msg.username}:</strong> {msg.message}
              </div>
            ))}
            <textarea onChange={(e) => handleTyping(e.target.value)} />
            <button onClick={() => handleSendMessage(typingMessage)}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
