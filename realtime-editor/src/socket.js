import { io } from 'socket.io-client';
import config from './config.js';

const serverURL = config.serverURL;
export const socket = io(serverURL);

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transport: ['websocket'],
    };
    return io(serverURL, options);
};

// Debounce function to limit the rate of sending messages
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

// Function to send keystroke data
const sendKeystroke = (data) => {
    socket.emit('send', data);
};

// Debounced send function
const debouncedSendKeystroke = debounce(sendKeystroke, 30000); // Adjust the delay as needed

// Example usage: Call debouncedSendKeystroke instead of socket.emit directly
document.addEventListener('keydown', (event) => {
    const data = { key: event.key, roomId: 'room1' }; // Example data structure
    debouncedSendKeystroke(data);
});
