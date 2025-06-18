import { io } from 'socket.io-client';
import config from './config.js';

export const socket = io(config.serverURL, {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Debug socket connection status
socket.on('connect', () => {
  console.log('✅ Socket connected successfully!', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket disconnected:', reason);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (error) => {
  console.error('❌ Socket reconnection error:', error);
});

console.log('🔧 Socket initialized with server URL:', config.serverURL);
