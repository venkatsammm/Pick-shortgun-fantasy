const TurnManager = require('../utils/TurnManager');
const { createCricketPlayers } = require('../data/cricketPlayers');

class SocketHandler {
  constructor(io, roomManager) {
    this.io = io;
    this.roomManager = roomManager;
    this.turnManager = new TurnManager(io, roomManager);
    this.cricketPlayers = createCricketPlayers(); // Initialize players once
  }

  handleConnection(socket) {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Handle joining a room
    socket.on('join-room', (data) => {
      this.handleJoinRoom(socket, data);
    });

    // Handle starting selection
    socket.on('start-selection', (data) => {
      this.handleStartSelection(socket, data);
    });

    // Handle player selection
    socket.on('select-player', (data) => {
      this.handleSelectPlayer(socket, data);
    });

    // Handle getting available players
    socket.on('get-available-players', () => {
      this.handleGetAvailablePlayers(socket);
    });

    // Handle getting room info
    socket.on('get-room-info', () => {
      this.handleGetRoomInfo(socket);
    });

    // Handle getting remaining time
    socket.on('get-remaining-time', () => {
      this.handleGetRemainingTime(socket);
    });

    // Handle user typing/activity (optional feature)
    socket.on('user-activity', (data) => {
      this.handleUserActivity(socket, data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  handleJoinRoom(socket, data) {
    const { roomId, userName } = data;

    if (!roomId || !userName) {
      socket.emit('join-room-error', { error: 'Room ID and username are required' });
      return;
    }

    if (userName.trim().length < 2 || userName.trim().length > 20) {
      socket.emit('join-room-error', { error: 'Username must be between 2 and 20 characters' });
      return;
    }

    const result = this.roomManager.joinRoom(roomId, socket.id, userName.trim());

    if (!result.success) {
      socket.emit('join-room-error', { error: result.error });
      return;
    }

    // Join the socket room
    socket.join(roomId);

    // Send success response to the user
    socket.emit('join-room-success', {
      user: result.user,
      room: result.room.toJSON()
    });

    // Broadcast to other users in the room
    socket.to(roomId).emit('user-joined', {
      user: {
        id: result.user.id,
        name: result.user.name,
        isHost: result.user.isHost
      },
      room: result.room.toJSON()
    });

    console.log(`✅ User ${userName} joined room ${roomId}`);
  }

  handleStartSelection(socket, data) {
    const room = this.roomManager.getUserRoom(socket.id);
    if (!room) {
      socket.emit('start-selection-error', { error: 'You are not in any room' });
      return;
    }

    const user = room.getUser(socket.id);
    if (!user || !user.isHost) {
      socket.emit('start-selection-error', { error: 'Only the host can start selection' });
      return;
    }

    const result = this.roomManager.startSelection(room.id, socket.id, this.cricketPlayers);

    if (!result.success) {
      socket.emit('start-selection-error', { error: result.error });
      return;
    }

    // Broadcast selection started to all users in the room
    this.io.to(room.id).emit('selection-started', {
      gameState: result.room.getGameSummary(),
      availablePlayers: result.room.availablePlayers,
      timestamp: Date.now()
    });

    // Start the first turn
    setTimeout(() => {
      this.turnManager.startTurnTimer(room.id);
    }, 3000); // 3 second delay to let users see the turn order

    console.log(`🚀 Selection started in room ${room.id} by ${user.name}`);
  }

  handleSelectPlayer(socket, data) {
    const { playerId } = data;

    if (!playerId) {
      socket.emit('select-player-error', { error: 'Player ID is required' });
      return;
    }

    const result = this.turnManager.handlePlayerSelection(socket.id, playerId);

    if (!result.success) {
      socket.emit('select-player-error', { error: result.error });
      return;
    }

    // Success response is handled by TurnManager
    console.log(`⚡ Player selected successfully by ${result.user.name}`);
  }

  handleGetAvailablePlayers(socket) {
    const room = this.roomManager.getUserRoom(socket.id);
    if (!room) {
      socket.emit('available-players-error', { error: 'You are not in any room' });
      return;
    }

    socket.emit('available-players', {
      players: room.availablePlayers,
      timestamp: Date.now()
    });
  }

  handleGetRoomInfo(socket) {
    const room = this.roomManager.getUserRoom(socket.id);
    if (!room) {
      socket.emit('room-info-error', { error: 'You are not in any room' });
      return;
    }

    socket.emit('room-info', {
      room: room.getGameSummary(),
      timestamp: Date.now()
    });
  }

  handleGetRemainingTime(socket) {
    const room = this.roomManager.getUserRoom(socket.id);
    if (!room) {
      socket.emit('remaining-time-error', { error: 'You are not in any room' });
      return;
    }

    const remainingTime = this.turnManager.getRemainingTime(room.id);
    socket.emit('remaining-time', {
      remainingTime,
      timestamp: Date.now()
    });
  }

  handleUserActivity(socket, data) {
    const room = this.roomManager.getUserRoom(socket.id);
    if (!room) {
      return;
    }

    const user = room.getUser(socket.id);
    if (!user) {
      return;
    }

    // Broadcast user activity to other users in the room
    socket.to(room.id).emit('user-activity', {
      user: {
        id: user.id,
        name: user.name
      },
      activity: data.activity,
      timestamp: Date.now()
    });
  }

  handleDisconnection(socket) {
    console.log(`🔌 Socket disconnected: ${socket.id}`);

    const result = this.roomManager.handleDisconnection(socket.id);
    
    if (result && result.room) {
      // Notify other users in the room
      socket.to(result.room.id).emit('user-left', {
        user: {
          id: result.user.id,
          name: result.user.name
        },
        room: result.room.toJSON(),
        timestamp: Date.now()
      });

      // If the game was in progress and this was the current turn user, handle it
      if (result.room.gameState === 'selecting') {
        const currentUser = result.room.getCurrentTurnUser();
        if (currentUser && currentUser.id === result.user.id) {
          // Auto-select for the disconnected user and continue
          setTimeout(() => {
            this.turnManager.handleTurnTimeout(result.room.id, result.user.id);
          }, 1000);
        }
      }

      console.log(`👋 User ${result.user.name} disconnected from room ${result.room.id}`);
    }

    // Clean up any timers for rooms that might be empty now
    if (result && !result.room) {
      // Room was deleted, clean up timers
      this.turnManager.cleanup(result.user ? 'unknown' : 'unknown');
    }
  }

  // Utility method to broadcast to all sockets
  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  // Utility method to broadcast to a specific room
  broadcastToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  // Get connection statistics
  getStats() {
    return {
      connectedSockets: this.io.engine.clientsCount,
      activeTimers: Object.keys(this.turnManager.getActiveTimers()).length,
      ...this.roomManager.getStats()
    };
  }
}

module.exports = SocketHandler;
