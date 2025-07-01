// Room page JavaScript
class CricketRoom {
    constructor() {
        this.socket = null;
        this.roomId = null;
        this.userName = null;
        this.isHost = false;
        this.currentUser = null;
        this.gameState = 'waiting';
        this.availablePlayers = [];
        this.roomData = null;
        this.turnTimer = null;
        
        this.init();
    }

    init() {
        this.extractUrlParams();
        this.initializeSocket();
        this.bindEvents();
        this.joinRoom();
    }

    extractUrlParams() {
        const pathParts = window.location.pathname.split('/');
        this.roomId = pathParts[pathParts.length - 1];
        
        const urlParams = new URLSearchParams(window.location.search);
        this.userName = urlParams.get('name');
        this.isHost = urlParams.get('host') === 'true';

        if (!this.roomId || !this.userName) {
            this.showToast('Invalid room or missing name. Redirecting to home...', 'error');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            return;
        }

        // Update room ID display
        document.getElementById('roomId').textContent = this.roomId;
    }

    initializeSocket() {
        this.socket = io();
        
        // Connection events
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.showToast('Connection lost. Trying to reconnect...', 'warning');
        });

        // Room events
        this.socket.on('join-room-success', (data) => this.handleJoinRoomSuccess(data));
        this.socket.on('join-room-error', (data) => this.handleJoinRoomError(data));
        this.socket.on('user-joined', (data) => this.handleUserJoined(data));
        this.socket.on('user-left', (data) => this.handleUserLeft(data));

        // Game events
        this.socket.on('selection-started', (data) => this.handleSelectionStarted(data));
        this.socket.on('turn-started', (data) => this.handleTurnStarted(data));
        this.socket.on('player-selected', (data) => this.handlePlayerSelected(data));
        this.socket.on('player-auto-selected', (data) => this.handlePlayerAutoSelected(data));
        this.socket.on('game-state-updated', (data) => this.handleGameStateUpdated(data));
        this.socket.on('selection-ended', (data) => this.handleSelectionEnded(data));

        // Error events
        this.socket.on('start-selection-error', (data) => this.handleStartSelectionError(data));
        this.socket.on('select-player-error', (data) => this.handleSelectPlayerError(data));
        this.socket.on('turn-error', (data) => this.handleTurnError(data));
    }

    bindEvents() {
        // Start selection button
        const startBtn = document.getElementById('startSelection');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startSelection());
        }

        // Leave room button
        const leaveBtn = document.getElementById('leaveRoom');
        if (leaveBtn) {
            leaveBtn.addEventListener('click', () => this.leaveRoom());
        }

        // Share room button
        const shareBtn = document.getElementById('shareRoom');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareRoom());
        }

        // Filter events
        const roleFilter = document.getElementById('roleFilter');
        const countryFilter = document.getElementById('countryFilter');
        
        if (roleFilter) {
            roleFilter.addEventListener('change', () => this.filterPlayers());
        }
        
        if (countryFilter) {
            countryFilter.addEventListener('change', () => this.filterPlayers());
        }

        // Results screen buttons
        const newGameBtn = document.getElementById('newGame');
        const backToHomeBtn = document.getElementById('backToHome');
        
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.newGame());
        }
        
        if (backToHomeBtn) {
            backToHomeBtn.addEventListener('click', () => this.backToHome());
        }

        // Modal events
        const confirmYes = document.getElementById('confirmYes');
        const confirmNo = document.getElementById('confirmNo');
        
        if (confirmYes) {
            confirmYes.addEventListener('click', () => this.handleConfirmYes());
        }
        
        if (confirmNo) {
            confirmNo.addEventListener('click', () => this.hideModal());
        }

        // Prevent accidental page refresh during game
        window.addEventListener('beforeunload', (e) => {
            if (this.gameState === 'selecting') {
                e.preventDefault();
                e.returnValue = 'Are you sure you want to leave? The game is in progress.';
            }
        });
    }

    joinRoom() {
        this.showLoading('Joining room...');
        this.socket.emit('join-room', {
            roomId: this.roomId,
            userName: this.userName
        });
    }

    handleJoinRoomSuccess(data) {
        this.hideLoading();
        this.currentUser = data.user;
        this.roomData = data.room;
        this.gameState = data.room.gameState;
        
        this.showToast(`Welcome to room ${this.roomId}!`, 'success');
        this.updateRoomDisplay();
        this.updatePlayersDisplay(data.room.users);
        
        // Show appropriate screen
        if (this.gameState === 'waiting') {
            this.showWaitingScreen();
        } else if (this.gameState === 'selecting') {
            this.showSelectionScreen();
            this.requestGameState();
        } else if (this.gameState === 'finished') {
            this.showResultsScreen();
            this.requestGameState();
        }
    }

    handleJoinRoomError(data) {
        this.hideLoading();
        this.showToast(data.error, 'error');
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
    }

    handleUserJoined(data) {
        this.showToast(`${data.user.name} joined the room`, 'info');
        this.roomData = data.room;
        this.updateRoomDisplay();
        this.updatePlayersDisplay(data.room.users);
    }

    handleUserLeft(data) {
        this.showToast(`${data.user.name} left the room`, 'info');
        this.roomData = data.room;
        this.updateRoomDisplay();
        this.updatePlayersDisplay(data.room.users);
    }

    startSelection() {
        this.socket.emit('start-selection', {});
        this.showLoading('Starting selection...');
    }

    handleSelectionStarted(data) {
        this.hideLoading();
        this.gameState = 'selecting';
        this.roomData = data.gameState;
        this.availablePlayers = data.availablePlayers;
        
        this.showToast('Team selection has started!', 'success');
        this.showSelectionScreen();
        this.updateGameDisplay();
    }

    handleStartSelectionError(data) {
        this.hideLoading();
        this.showToast(data.error, 'error');
    }

    handleTurnStarted(data) {
        this.updateCurrentTurn(data.currentUser);
        this.startTurnTimer(data.timeLimit);
        
        if (data.currentUser.id === this.currentUser.id) {
            this.showToast("It's your turn! Select a player.", 'info');
            this.enablePlayerSelection();
        } else {
            this.showToast(`${data.currentUser.name}'s turn`, 'info');
            this.disablePlayerSelection();
        }
    }

    selectPlayer(playerId) {
        this.socket.emit('select-player', { playerId });
        this.disablePlayerSelection();
    }

    handlePlayerSelected(data) {
        this.showToast(`${data.user.name} selected ${data.player.name}`, 'success');
        this.removePlayerFromAvailable(data.player.id);
        this.stopTurnTimer();
    }

    handlePlayerAutoSelected(data) {
        this.showToast(`${data.player.name} was auto-selected for ${data.user.name}`, 'warning');
        this.removePlayerFromAvailable(data.player.id);
        this.stopTurnTimer();
    }

    handleGameStateUpdated(data) {
        this.roomData = data;
        this.updateGameDisplay();
    }

    handleSelectionEnded(data) {
        this.gameState = 'finished';
        this.roomData = data.finalResults;
        this.stopTurnTimer();
        this.showToast('Team selection completed!', 'success');
        this.showResultsScreen();
        this.displayFinalResults();
    }

    handleSelectPlayerError(data) {
        this.showToast(data.error, 'error');
        this.enablePlayerSelection();
    }

    handleTurnError(data) {
        this.showToast(`Turn error: ${data.error}`, 'error');
        this.stopTurnTimer();
    }

    // UI Update Methods
    updateRoomDisplay() {
        if (!this.roomData) return;
        
        const gameStatus = document.getElementById('gameStatus');
        const playerCount = document.getElementById('playerCount');
        
        if (gameStatus) {
            gameStatus.textContent = this.formatGameState(this.gameState);
            gameStatus.className = `status-badge ${this.gameState}`;
        }
        
        if (playerCount) {
            playerCount.textContent = `${this.roomData.userCount || this.roomData.users?.length || 0} players`;
        }
    }

    updatePlayersDisplay(users) {
        const playersList = document.getElementById('playersList');
        if (!playersList || !users) return;

        playersList.innerHTML = users.map(user => `
            <div class="player-card ${user.isHost ? 'host' : ''} ${user.id === this.currentUser?.id ? 'current-user' : ''}">
                <i class="fas ${user.isHost ? 'fa-crown' : 'fa-user'}"></i>
                <h4>${user.name}</h4>
                <div class="player-role">${user.isHost ? 'Host' : 'Player'}</div>
                ${user.selectedPlayersCount !== undefined ? `<div class="selected-count">${user.selectedPlayersCount}/5 selected</div>` : ''}
            </div>
        `).join('');
    }

    showWaitingScreen() {
        this.hideAllScreens();
        document.getElementById('waitingScreen').classList.remove('hidden');
        
        // Show host controls if user is host
        if (this.currentUser?.isHost) {
            document.getElementById('hostControls').classList.remove('hidden');
            document.getElementById('playerWaiting').classList.add('hidden');
        } else {
            document.getElementById('hostControls').classList.add('hidden');
            document.getElementById('playerWaiting').classList.remove('hidden');
        }
    }

    showSelectionScreen() {
        this.hideAllScreens();
        document.getElementById('selectionScreen').classList.remove('hidden');
    }

    showResultsScreen() {
        this.hideAllScreens();
        document.getElementById('resultsScreen').classList.remove('hidden');
    }

    hideAllScreens() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.add('hidden'));
    }

    // Utility methods will be continued in the next part...
    formatGameState(state) {
        switch (state) {
            case 'waiting':
                return 'Waiting for players';
            case 'selecting':
                return 'Selection in progress';
            case 'finished':
                return 'Selection completed';
            default:
                return state;
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);

        toast.addEventListener('click', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }

    getToastIcon(type) {
        switch (type) {
            case 'success':
                return 'fas fa-check-circle';
            case 'error':
                return 'fas fa-exclamation-circle';
            case 'warning':
                return 'fas fa-exclamation-triangle';
            default:
                return 'fas fa-info-circle';
        }
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const text = document.getElementById('loadingText');
        if (text) {
            text.textContent = message;
        }
        overlay.classList.remove('hidden');
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.add('hidden');
    }

    // Additional methods for game functionality
    updateCurrentTurn(currentUser) {
        const currentPlayerElement = document.getElementById('currentPlayer');
        if (currentPlayerElement) {
            currentPlayerElement.textContent = currentUser.name;
        }
    }

    startTurnTimer(timeLimit) {
        this.stopTurnTimer();

        let timeRemaining = Math.ceil(timeLimit / 1000);
        const timerElement = document.getElementById('timeRemaining');
        const turnTimerElement = document.getElementById('turnTimer');

        if (timerElement) {
            timerElement.textContent = timeRemaining;
        }

        this.turnTimer = setInterval(() => {
            timeRemaining--;
            if (timerElement) {
                timerElement.textContent = timeRemaining;
            }

            if (timeRemaining <= 3 && turnTimerElement) {
                turnTimerElement.classList.add('warning');
            }

            if (timeRemaining <= 0) {
                this.stopTurnTimer();
            }
        }, 1000);
    }

    stopTurnTimer() {
        if (this.turnTimer) {
            clearInterval(this.turnTimer);
            this.turnTimer = null;
        }

        const turnTimerElement = document.getElementById('turnTimer');
        if (turnTimerElement) {
            turnTimerElement.classList.remove('warning');
        }
    }

    enablePlayerSelection() {
        const playerCards = document.querySelectorAll('.cricket-player-card');
        playerCards.forEach(card => {
            card.classList.add('selectable');
            card.classList.remove('disabled');
        });
    }

    disablePlayerSelection() {
        const playerCards = document.querySelectorAll('.cricket-player-card');
        playerCards.forEach(card => {
            card.classList.remove('selectable');
            card.classList.add('disabled');
        });
    }

    removePlayerFromAvailable(playerId) {
        this.availablePlayers = this.availablePlayers.filter(p => p.id !== playerId);
        this.renderAvailablePlayers();
    }

    renderAvailablePlayers() {
        const container = document.getElementById('availablePlayersList');
        if (!container) return;

        const filteredPlayers = this.getFilteredPlayers();

        container.innerHTML = filteredPlayers.map(player => `
            <div class="cricket-player-card" data-player-id="${player.id}" onclick="room.selectPlayer('${player.id}')">
                <h5>${player.name}</h5>
                <div class="player-country">${player.country}</div>
                <div class="player-role">${player.role}</div>
                <div class="player-rating">Rating: ${player.rating}</div>
            </div>
        `).join('');
    }

    getFilteredPlayers() {
        const roleFilter = document.getElementById('roleFilter')?.value;
        const countryFilter = document.getElementById('countryFilter')?.value;

        return this.availablePlayers.filter(player => {
            const roleMatch = !roleFilter || player.role === roleFilter;
            const countryMatch = !countryFilter || player.country === countryFilter;
            return roleMatch && countryMatch;
        });
    }

    filterPlayers() {
        this.renderAvailablePlayers();
    }

    updateGameDisplay() {
        if (!this.roomData) return;

        this.updateTurnOrder();
        this.updateTeamsDisplay();
        this.renderAvailablePlayers();
    }

    updateTurnOrder() {
        const container = document.getElementById('turnOrderList');
        if (!container || !this.roomData.turnOrder) return;

        container.innerHTML = this.roomData.turnOrder.map((turn, index) => {
            let className = 'turn-order-item';
            if (this.roomData.currentTurn && turn.userId === this.roomData.currentTurn.userId) {
                className += ' current';
            }
            return `<div class="${className}">${turn.userName}</div>`;
        }).join('');
    }

    updateTeamsDisplay() {
        const container = document.getElementById('teamsDisplay');
        if (!container || !this.roomData.users) return;

        container.innerHTML = this.roomData.users.map(user => `
            <div class="team-card ${user.id === this.currentUser?.id ? 'current-user' : ''}">
                <div class="team-header">
                    <div class="team-name">${user.name}</div>
                    <div class="team-progress">${user.selectedPlayers?.length || 0}/5</div>
                </div>
                <div class="team-players">
                    ${(user.selectedPlayers || []).map(player => `
                        <div class="team-player">
                            <span class="team-player-name">${player.name}</span>
                            <span class="team-player-role">${player.role}</span>
                        </div>
                    `).join('') || '<div class="no-players">No players selected yet</div>'}
                </div>
            </div>
        `).join('');
    }

    displayFinalResults() {
        const container = document.getElementById('finalResults');
        if (!container || !this.roomData) return;

        container.innerHTML = `
            <div class="final-teams">
                ${this.roomData.users.map(user => `
                    <div class="final-team">
                        <h3>${user.name}'s Team</h3>
                        <div class="final-team-players">
                            ${user.selectedPlayers.map(player => `
                                <div class="final-player">
                                    <strong>${player.name}</strong> (${player.country}) - ${player.role}
                                    <span class="rating">Rating: ${player.rating}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="team-stats">
                            Total Rating: ${user.selectedPlayers.reduce((sum, p) => sum + p.rating, 0)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    requestGameState() {
        this.socket.emit('get-room-info');
        this.socket.emit('get-available-players');
    }

    shareRoom() {
        const roomUrl = window.location.origin + '/room/' + this.roomId;

        if (navigator.share) {
            navigator.share({
                title: 'Join my Cricket Team Selection Room',
                text: `Join room ${this.roomId} for cricket team selection!`,
                url: roomUrl
            });
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(`Join my cricket team selection room: ${roomUrl}`);
            this.showToast('Room link copied to clipboard!', 'success');
        } else {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = `Join my cricket team selection room: ${roomUrl}`;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Room link copied to clipboard!', 'success');
        }
    }

    leaveRoom() {
        this.showModal('Leave Room', 'Are you sure you want to leave the room?', () => {
            window.location.href = '/';
        });
    }

    newGame() {
        this.showModal('New Game', 'Start a new game? This will reset the current room.', () => {
            // For now, just redirect to home to create a new room
            window.location.href = '/';
        });
    }

    backToHome() {
        window.location.href = '/';
    }

    showModal(title, message, onConfirm) {
        const modal = document.getElementById('confirmModal');
        const titleElement = document.getElementById('confirmTitle');
        const messageElement = document.getElementById('confirmMessage');

        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;

        this.confirmCallback = onConfirm;
        modal.classList.remove('hidden');
    }

    hideModal() {
        const modal = document.getElementById('confirmModal');
        modal.classList.add('hidden');
        this.confirmCallback = null;
    }

    handleConfirmYes() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
        this.hideModal();
    }
}

// Initialize the room when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.room = new CricketRoom();
});
