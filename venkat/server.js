const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

// Import custom modules
const RoomManager = require('./src/models/RoomManager');
const SocketHandler = require('./src/controllers/SocketHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize room manager
const roomManager = new RoomManager();

// Initialize socket handler
const socketHandler = new SocketHandler(io, roomManager);

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/room/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

// API Routes
app.get('/api/rooms', (req, res) => {
  const rooms = roomManager.getAllRooms();
  res.json(rooms);
});

app.post('/api/rooms', (req, res) => {
  const { hostName } = req.body;
  if (!hostName) {
    return res.status(400).json({ error: 'Host name is required' });
  }

  const room = roomManager.createRoom(hostName);
  res.json(room);
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = roomManager.getRoom(roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json(room);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socketHandler.handleConnection(socket);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} to access the application`);
});

module.exports = { app, server, io };
