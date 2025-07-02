const TurnManager = require('../utils/TurnManager');
const { createCricketPlayers } = require('../data/cricketPlayers');

class SocketHandler {
  constructor(io, roomManager) {
    this.io = io;
    this.roomManager = roomManager;
    this.turnManager = new TurnManager(io, roomManager);
    this.cricketPlayers = createCricketPlayers(); 
  }

  handleConnection(socket) {
    console.log(`🔌 Socket connected: ${socket.id}`);

    
    socket.on('join-room', (data) => {
      this.handleJoinRoom(socket, data);
    });

    
    socket.on('start-selection', (data) => {
      this.handleStartSelection(socket, data);
    });

  
    socket.on('select-player', (data) => {
      this.handleSelectPlayer(socket, data);
    });

    
    socket.on('get-available-players', () => {
      this.handleGetAvailablePlayers(socket);
    });

  
    socket.on('get-room-info', () => {
      this.handleGetRoomInfo(socket);
    });

  
    socket.on('get-remaining-time', () => {
      this.handleGetRemainingTime(socket);
    });

    socket.on('user-activity', (data) => {
      this.handleUserActivity(socket, data);
    });

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

  
    socket.join(roomId);

    
    socket.emit('join-room-success', {
      user: result.user,
      room: result.room.toJSON()
    });

    
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


    this.io.to(room.id).emit('selection-started', {
      gameState: result.room.getGameSummary(),
      availablePlayers: result.room.availablePlayers,
      timestamp: Date.now()
    });

    
    setTimeout(() => {
      this.turnManager.startTurnTimer(room.id);
    }, 3000);

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
      
      socket.to(result.room.id).emit('user-left', {
        user: {
          id: result.user.id,
          name: result.user.name
        },
        room: result.room.toJSON(),
        timestamp: Date.now()
      });

      
      if (result.room.gameState === 'selecting') {
        const currentUser = result.room.getCurrentTurnUser();
        if (currentUser && currentUser.id === result.user.id) {
        
          setTimeout(() => {
            this.turnManager.handleTurnTimeout(result.room.id, result.user.id);
          }, 1000);
        }
      }

      console.log(`👋 User ${result.user.name} disconnected from room ${result.room.id}`);
    }

    if (result && !result.room) {
  
      this.turnManager.cleanup(result.user ? 'unknown' : 'unknown');
    }
  }

  
  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  
  broadcastToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  
  getStats() {
    return {
      connectedSockets: this.io.engine.clientsCount,
      activeTimers: Object.keys(this.turnManager.getActiveTimers()).length,
      ...this.roomManager.getStats()
    };
  }
}

module.exports = SocketHandler;
