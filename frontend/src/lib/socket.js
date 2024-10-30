// src/lib/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Adjust this URL if needed

export default socket;
