class TurnManager {
  constructor(io, roomManager) {
    this.io = io;
    this.roomManager = roomManager;
    this.activeTimers = new Map(); // roomId -> timer
  }

  startTurnTimer(roomId) {
    // Clear any existing timer for this room
    this.clearTurnTimer(roomId);

    const room = this.roomManager.getRoom(roomId);
    if (!room || room.gameState !== 'selecting') {
      return;
    }

    const currentUser = room.getCurrentTurnUser();
    if (!currentUser) {
      return;
    }

    console.log(`⏰ Starting turn timer for ${currentUser.name} in room ${roomId}`);

    // Emit turn start event
    this.io.to(roomId).emit('turn-started', {
      currentUser: {
        id: currentUser.id,
        name: currentUser.name
      },
      timeLimit: room.turnTimeLimit,
      timestamp: Date.now()
    });

    
    const timer = setTimeout(() => {
      this.handleTurnTimeout(roomId, currentUser.id);
    }, room.turnTimeLimit);

    this.activeTimers.set(roomId, {
      timer,
      userId: currentUser.id,
      startTime: Date.now()
    });
  }

  handleTurnTimeout(roomId, userId) {
    console.log(`⏱️ Turn timeout for user ${userId} in room ${roomId}`);

    const room = this.roomManager.getRoom(roomId);
    if (!room || room.gameState !== 'selecting') {
      return;
    }

    const currentUser = room.getCurrentTurnUser();
    if (!currentUser || currentUser.id !== userId) {
      
      return;
    }

  
    const result = this.roomManager.autoSelectPlayer(currentUser.socketId);
    
    if (result.success) {
      
      this.io.to(roomId).emit('player-auto-selected', {
        user: {
          id: result.user.id,
          name: result.user.name
        },
        player: result.selectedPlayer,
        timestamp: Date.now()
      });


      this.io.to(roomId).emit('game-state-updated', room.getGameSummary());

      if (result.isGameComplete) {
        this.handleGameComplete(roomId);
      } else if (result.hasNextTurn) {
        setTimeout(() => {
          this.startTurnTimer(roomId);
        }, 2000);
      }
    } else {
      console.error(`Failed to auto-select player: ${result.error}`);
  
      this.handleTurnError(roomId, result.error);
    }

  
    this.clearTurnTimer(roomId);
  }

  handlePlayerSelection(socketId, playerId) {
    const room = this.roomManager.getUserRoom(socketId);
    if (!room) {
      return { success: false, error: 'User not in any room' };
    }

    const user = room.getUser(socketId);
    if (!user) {
      return { success: false, error: 'User not found in room' };
    }

    const currentUser = room.getCurrentTurnUser();
    if (!currentUser || currentUser.id !== user.id) {
      return { success: false, error: 'Not your turn' };
    }

    
    this.clearTurnTimer(room.id);


    const result = this.roomManager.selectPlayer(socketId, playerId);
    
    if (result.success) {
      
      this.io.to(room.id).emit('player-selected', {
        user: {
          id: result.user.id,
          name: result.user.name
        },
        player: result.selectedPlayer,
        timestamp: Date.now()
      });

    
      this.io.to(room.id).emit('game-state-updated', room.getGameSummary());

      if (result.isGameComplete) {
        this.handleGameComplete(room.id);
      } else if (result.hasNextTurn) {
        
        setTimeout(() => {
          this.startTurnTimer(room.id);
        }, 2000);
      }
    }

    return result;
  }

  handleGameComplete(roomId) {
    console.log(`🎉 Game completed in room ${roomId}`);
    
    const room = this.roomManager.getRoom(roomId);
    if (!room) {
      return;
    }

  
    this.clearTurnTimer(roomId);


    this.io.to(roomId).emit('selection-ended', {
      finalResults: room.getGameSummary(),
      timestamp: Date.now()
    });
  }

  handleError(roomId, error) {
    console.error(`Turn error in room ${roomId}: ${error}`);
    
    // Clear timer
    this.clearTurnTimer(roomId);


    this.io.to(roomId).emit('turn-error', {
      error,
      timestamp: Date.now()
    });


    const room = this.roomManager.getRoom(roomId);
    if (room && room.gameState === 'selecting') {
      const hasNextTurn = room.nextTurn();
      if (hasNextTurn && !room.isSelectionComplete()) {
        setTimeout(() => {
          this.startTurnTimer(roomId);
        }, 3000);
      } else {
        this.handleGameComplete(roomId);
      }
    }
  }

  clearTurnTimer(roomId) {
    const timerData = this.activeTimers.get(roomId);
    if (timerData) {
      clearTimeout(timerData.timer);
      this.activeTimers.delete(roomId);
      console.log(`🧹 Cleared turn timer for room ${roomId}`);
    }
  }

  clearAllTimersForRoom(roomId) {
    this.clearTurnTimer(roomId);
  }

  getRemainingTime(roomId) {
    const timerData = this.activeTimers.get(roomId);
    if (!timerData) {
      return 0;
    }

    const room = this.roomManager.getRoom(roomId);
    if (!room) {
      return 0;
    }

    const elapsed = Date.now() - timerData.startTime;
    const remaining = Math.max(0, room.turnTimeLimit - elapsed);
    
    return Math.ceil(remaining / 1000); 
  }

  
  cleanup(roomId) {
    this.clearAllTimersForRoom(roomId);
  }

  
  getActiveTimers() {
    const timers = {};
    for (const [roomId, timerData] of this.activeTimers.entries()) {
      timers[roomId] = {
        userId: timerData.userId,
        startTime: timerData.startTime,
        remainingTime: this.getRemainingTime(roomId)
      };
    }
    return timers;
  }
}

module.exports = TurnManager;
