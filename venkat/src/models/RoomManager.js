const Room = require('./Room');

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Room
    this.userRoomMap = new Map(); // socketId -> roomId
  }

  createRoom(hostName) {
    const room = new Room(hostName);
    this.rooms.set(room.id, room);
    console.log(`📝 Room created: ${room.id} by ${hostName}`);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getAllRooms() {
    return Array.from(this.rooms.values()).map(room => room.toJSON());
  }

  joinRoom(roomId, socketId, userName) {
    const room = this.getRoom(roomId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.gameState === 'selecting') {
      return { success: false, error: 'Game already in progress' };
    }

    if (room.users.size >= 6) {
      return { success: false, error: 'Room is full' };
    }

    
    const existingUser = Array.from(room.users.values()).find(user => user.name === userName);
    if (existingUser) {
      return { success: false, error: 'Username already taken in this room' };
    }

    const user = room.addUser(socketId, userName);
    this.userRoomMap.set(socketId, roomId);

    console.log(`👤 User ${userName} joined room ${roomId}`);
    return { success: true, user, room };
  }

  leaveRoom(socketId) {
    const roomId = this.userRoomMap.get(socketId);
    if (!roomId) {
      return null;
    }

    const room = this.getRoom(roomId);
    if (!room) {
      this.userRoomMap.delete(socketId);
      return null;
    }

    const user = room.removeUser(socketId);
    this.userRoomMap.delete(socketId);

    // If room is empty, delete it
    if (room.users.size === 0) {
      this.rooms.delete(roomId);
      console.log(`🗑️ Room ${roomId} deleted (empty)`);
    }

    if (user) {
      console.log(`👋 User ${user.name} left room ${roomId}`);
    }

    return { user, room: room.users.size > 0 ? room : null };
  }

  getUserRoom(socketId) {
    const roomId = this.userRoomMap.get(socketId);
    return roomId ? this.getRoom(roomId) : null;
  }

  startSelection(roomId, socketId, availablePlayers) {
    const room = this.getRoom(roomId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const user = room.getUser(socketId);
    if (!user || !user.isHost) {
      return { success: false, error: 'Only host can start selection' };
    }

    if (!room.canStartSelection()) {
      return { success: false, error: 'Cannot start selection. Need at least 2 players and room must be in waiting state.' };
    }

    const success = room.startSelection(availablePlayers);
    if (success) {
      console.log(`🎮 Selection started in room ${roomId}`);
      return { success: true, room };
    }

    return { success: false, error: 'Failed to start selection' };
  }

  selectPlayer(socketId, playerId) {
    const room = this.getUserRoom(socketId);
    if (!room) {
      return { success: false, error: 'User not in any room' };
    }

    const user = room.getUser(socketId);
    if (!user) {
      return { success: false, error: 'User not found in room' };
    }

    const currentTurnUser = room.getCurrentTurnUser();
    if (!currentTurnUser || currentTurnUser.id !== user.id) {
      return { success: false, error: 'Not your turn' };
    }

    if (user.selectedPlayers.length >= room.maxPlayersPerUser) {
      return { success: false, error: 'You have already selected maximum players' };
    }

    const selectedPlayer = room.selectPlayer(user.id, playerId);
    if (!selectedPlayer) {
      return { success: false, error: 'Player not available or already selected' };
    }

    console.log(`⚡ Player ${selectedPlayer.name} selected by ${user.name} in room ${room.id}`);
    

    const hasNextTurn = room.nextTurn();
    
    return { 
      success: true, 
      selectedPlayer, 
      user, 
      room,
      hasNextTurn,
      isGameComplete: room.isSelectionComplete()
    };
  }

  autoSelectPlayer(socketId) {
    const room = this.getUserRoom(socketId);
    if (!room) {
      return { success: false, error: 'User not in any room' };
    }

    const user = room.getUser(socketId);
    if (!user) {
      return { success: false, error: 'User not found in room' };
    }

    const selectedPlayer = room.autoSelectPlayer(user.id);
    if (!selectedPlayer) {
      return { success: false, error: 'No players available for auto-selection' };
    }

    console.log(`🤖 Auto-selected player ${selectedPlayer.name} for ${user.name} in room ${room.id}`);
    
    
    const hasNextTurn = room.nextTurn();
    
    return { 
      success: true, 
      selectedPlayer, 
      user, 
      room,
      hasNextTurn,
      isGameComplete: room.isSelectionComplete(),
      isAutoSelected: true
    };
  }

  
  handleDisconnection(socketId) {
    return this.leaveRoom(socketId);
  }

  getStats() {
    return {
      totalRooms: this.rooms.size,
      totalUsers: this.userRoomMap.size,
      activeGames: Array.from(this.rooms.values()).filter(room => room.gameState === 'selecting').length
    };
  }
}

module.exports = RoomManager;
