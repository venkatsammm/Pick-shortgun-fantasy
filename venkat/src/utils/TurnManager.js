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

    // Set timer for auto-selection
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
      // Turn has already changed, ignore timeout
      return;
    }

    // Auto-select a player
    const result = this.roomManager.autoSelectPlayer(currentUser.socketId);
    
    if (result.success) {
      // Emit auto-selection event
      this.io.to(roomId).emit('player-auto-selected', {
        user: {
          id: result.user.id,
          name: result.user.name
        },
        player: result.selectedPlayer,
        timestamp: Date.now()
      });

      // Emit updated game state
      this.io.to(roomId).emit('game-state-updated', room.getGameSummary());

      if (result.isGameComplete) {
        this.handleGameComplete(roomId);
      } else if (result.hasNextTurn) {
        // Start next turn after a brief delay
        setTimeout(() => {
          this.startTurnTimer(roomId);
        }, 2000);
      }
    } else {
      console.error(`Failed to auto-select player: ${result.error}`);
      // Handle error case - maybe end the game or skip turn
      this.handleTurnError(roomId, result.error);
    }

    // Clear the timer
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

    // Clear the current timer since user made a selection
    this.clearTurnTimer(room.id);

    // Process the selection
    const result = this.roomManager.selectPlayer(socketId, playerId);
    
    if (result.success) {
      // Emit player selection event
      this.io.to(room.id).emit('player-selected', {
        user: {
          id: result.user.id,
          name: result.user.name
        },
        player: result.selectedPlayer,
        timestamp: Date.now()
      });

      // Emit updated game state
      this.io.to(room.id).emit('game-state-updated', room.getGameSummary());

      if (result.isGameComplete) {
        this.handleGameComplete(room.id);
      } else if (result.hasNextTurn) {
        // Start next turn after a brief delay
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

    // Clear any active timer
    this.clearTurnTimer(roomId);

    // Emit game completion event
    this.io.to(roomId).emit('selection-ended', {
      finalResults: room.getGameSummary(),
      timestamp: Date.now()
    });
  }

  handleTurnError(roomId, error) {
    console.error(`Turn error in room ${roomId}: ${error}`);
    
    // Clear timer
    this.clearTurnTimer(roomId);

    // Emit error to room
    this.io.to(roomId).emit('turn-error', {
      error,
      timestamp: Date.now()
    });

    // Try to continue with next turn or end game
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
    
    return Math.ceil(remaining / 1000); // Return seconds
  }

  // Cleanup method for when rooms are destroyed
  cleanup(roomId) {
    this.clearAllTimersForRoom(roomId);
  }

  // Get active timer info for debugging
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
