const { v4: uuidv4 } = require('uuid');

class Room {
  constructor(hostName) {
    this.id = uuidv4().substring(0, 8).toUpperCase();
    this.hostName = hostName;
    this.hostSocketId = null;
    this.users = new Map(); 
    this.gameState = 'waiting'; 
    this.turnOrder = [];
    this.currentTurnIndex = 0;
    this.selectedPlayers = new Map(); 
    this.availablePlayers = [];
    this.turnTimer = null;
    this.turnTimeLimit = 10000; 
    this.maxPlayersPerUser = 5;
    this.createdAt = new Date();
  }

  addUser(socketId, userName) {
    const user = {
      id: uuidv4(),
      socketId,
      name: userName,
      isHost: this.users.size === 0, 
      selectedPlayers: [],
      isReady: false
    };

    if (user.isHost) {
      this.hostSocketId = socketId;
    }

    this.users.set(socketId, user);
    this.selectedPlayers.set(user.id, []);
    return user;
  }

  removeUser(socketId) {
    const user = this.users.get(socketId);
    if (user) {
      this.users.delete(socketId);
      this.selectedPlayers.delete(user.id);
      
      // If host leaves, assign new host
      if (user.isHost && this.users.size > 0) {
        const newHost = this.users.values().next().value;
        newHost.isHost = true;
        this.hostSocketId = newHost.socketId;
      }
      
      return user;
    }
    return null;
  }

  getUser(socketId) {
    return this.users.get(socketId);
  }

  getUserById(userId) {
    for (const user of this.users.values()) {
      if (user.id === userId) {
        return user;
      }
    }
    return null;
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }

  canStartSelection() {
    return this.users.size >= 2 && this.gameState === 'waiting';
  }

  startSelection(availablePlayers) {
    if (!this.canStartSelection()) {
      return false;
    }

    this.availablePlayers = [...availablePlayers];
    this.gameState = 'selecting';
    
    // Create random turn order
    const userIds = Array.from(this.users.values()).map(user => user.id);
    this.turnOrder = this.shuffleArray(userIds);
    this.currentTurnIndex = 0;

    return true;
  }

  getCurrentTurnUser() {
    if (this.turnOrder.length === 0) return null;
    const currentUserId = this.turnOrder[this.currentTurnIndex];
    return this.getUserById(currentUserId);
  }

  selectPlayer(userId, playerId) {
    const user = this.getUserById(userId);
    if (!user) return false;

    const playerIndex = this.availablePlayers.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return false;

    // Remove player from available pool
    const selectedPlayer = this.availablePlayers.splice(playerIndex, 1)[0];
    
    // Add to user's selected players
    const userSelectedPlayers = this.selectedPlayers.get(userId);
    userSelectedPlayers.push(selectedPlayer);
    user.selectedPlayers = userSelectedPlayers;

    return selectedPlayer;
  }

  nextTurn() {
    this.currentTurnIndex = (this.currentTurnIndex + 1) % this.turnOrder.length;
    
    // Check if selection round is complete
    if (this.isSelectionComplete()) {
      this.gameState = 'finished';
      return false;
    }
    
    return true; 
  }

  isSelectionComplete() {
  
    for (const user of this.users.values()) {
      if (user.selectedPlayers.length < this.maxPlayersPerUser) {
        return false;
      }
    }
    return true;
  }

  autoSelectPlayer(userId) {
    if (this.availablePlayers.length === 0) return null;
    
    // Select random available player
    const randomIndex = Math.floor(Math.random() * this.availablePlayers.length);
    const playerId = this.availablePlayers[randomIndex].id;
    
    return this.selectPlayer(userId, playerId);
  }

  getGameSummary() {
    const summary = {
      roomId: this.id,
      gameState: this.gameState,
      users: this.getAllUsers().map(user => ({
        id: user.id,
        name: user.name,
        isHost: user.isHost,
        selectedPlayers: user.selectedPlayers
      })),
      turnOrder: this.turnOrder.map(userId => {
        const user = this.getUserById(userId);
        return { userId, userName: user ? user.name : 'Unknown' };
      }),
      currentTurn: this.getCurrentTurnUser() ? {
        userId: this.getCurrentTurnUser().id,
        userName: this.getCurrentTurnUser().name
      } : null,
      availablePlayersCount: this.availablePlayers.length
    };

    return summary;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  toJSON() {
    return {
      id: this.id,
      hostName: this.hostName,
      gameState: this.gameState,
      userCount: this.users.size,
      users: this.getAllUsers().map(user => ({
        id: user.id,
        name: user.name,
        isHost: user.isHost,
        selectedPlayersCount: user.selectedPlayers.length
      })),
      createdAt: this.createdAt
    };
  }
}

module.exports = Room;
