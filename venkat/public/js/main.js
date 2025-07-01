// Main page JavaScript
class CricketApp {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadActiveRooms();
    }

    bindEvents() {
        // Create room form
        const createRoomForm = document.getElementById('createRoomForm');
        if (createRoomForm) {
            createRoomForm.addEventListener('submit', (e) => this.handleCreateRoom(e));
        }

        // Join room form
        const joinRoomForm = document.getElementById('joinRoomForm');
        if (joinRoomForm) {
            joinRoomForm.addEventListener('submit', (e) => this.handleJoinRoom(e));
        }

        // Refresh rooms button
        const refreshRoomsBtn = document.getElementById('refreshRooms');
        if (refreshRoomsBtn) {
            refreshRoomsBtn.addEventListener('click', () => this.loadActiveRooms());
        }

        // Auto-refresh rooms every 30 seconds
        setInterval(() => this.loadActiveRooms(), 30000);
    }

    async handleCreateRoom(e) {
        e.preventDefault();
        
        const hostName = document.getElementById('hostName').value.trim();
        
        if (!hostName) {
            this.showToast('Please enter your name', 'error');
            return;
        }

        if (hostName.length < 2 || hostName.length > 20) {
            this.showToast('Name must be between 2 and 20 characters', 'error');
            return;
        }

        this.showLoading('Creating room...');

        try {
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ hostName })
            });

            const data = await response.json();

            if (response.ok) {
                this.showToast('Room created successfully!', 'success');
                // Redirect to room with host name in URL params
                window.location.href = `/room/${data.id}?name=${encodeURIComponent(hostName)}&host=true`;
            } else {
                this.showToast(data.error || 'Failed to create room', 'error');
            }
        } catch (error) {
            console.error('Error creating room:', error);
            this.showToast('Failed to create room. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleJoinRoom(e) {
        e.preventDefault();
        
        const roomCode = document.getElementById('roomCode').value.trim().toUpperCase();
        const playerName = document.getElementById('playerName').value.trim();
        
        if (!roomCode) {
            this.showToast('Please enter a room code', 'error');
            return;
        }

        if (!playerName) {
            this.showToast('Please enter your name', 'error');
            return;
        }

        if (playerName.length < 2 || playerName.length > 20) {
            this.showToast('Name must be between 2 and 20 characters', 'error');
            return;
        }

        this.showLoading('Joining room...');

        try {
            // First check if room exists
            const response = await fetch(`/api/rooms/${roomCode}`);
            
            if (response.ok) {
                const roomData = await response.json();
                
                if (roomData.gameState === 'selecting') {
                    this.showToast('This room is already in game. Cannot join now.', 'error');
                    return;
                }

                if (roomData.userCount >= 6) {
                    this.showToast('This room is full. Cannot join.', 'error');
                    return;
                }

                // Redirect to room
                window.location.href = `/room/${roomCode}?name=${encodeURIComponent(playerName)}`;
            } else {
                const errorData = await response.json();
                this.showToast(errorData.error || 'Room not found', 'error');
            }
        } catch (error) {
            console.error('Error joining room:', error);
            this.showToast('Failed to join room. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadActiveRooms() {
        const roomsList = document.getElementById('activeRoomsList');
        
        try {
            const response = await fetch('/api/rooms');
            const rooms = await response.json();

            if (rooms.length === 0) {
                roomsList.innerHTML = `
                    <div class="no-rooms">
                        <i class="fas fa-inbox"></i>
                        <p>No active rooms found. Create one to get started!</p>
                    </div>
                `;
                return;
            }

            roomsList.innerHTML = rooms.map(room => `
                <div class="room-item">
                    <div class="room-info">
                        <h4>Room ${room.id}</h4>
                        <p>Host: ${room.hostName} • ${room.userCount} player${room.userCount !== 1 ? 's' : ''}</p>
                    </div>
                    <div class="room-status">
                        <span class="status-badge ${room.gameState}">${this.formatGameState(room.gameState)}</span>
                        ${room.gameState === 'waiting' ? `
                            <button class="btn btn-outline btn-sm" onclick="app.quickJoinRoom('${room.id}')">
                                <i class="fas fa-sign-in-alt"></i> Join
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading rooms:', error);
            roomsList.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load rooms. Please try again.</p>
                </div>
            `;
        }
    }

    quickJoinRoom(roomId) {
        const playerName = prompt('Enter your name to join this room:');
        
        if (!playerName) {
            return;
        }

        if (playerName.trim().length < 2 || playerName.trim().length > 20) {
            this.showToast('Name must be between 2 and 20 characters', 'error');
            return;
        }

        window.location.href = `/room/${roomId}?name=${encodeURIComponent(playerName.trim())}`;
    }

    formatGameState(state) {
        switch (state) {
            case 'waiting':
                return 'Waiting';
            case 'selecting':
                return 'In Progress';
            case 'finished':
                return 'Finished';
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

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);

        // Remove on click
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
        const text = overlay.querySelector('p');
        if (text) {
            text.textContent = message;
        }
        overlay.classList.remove('hidden');
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.add('hidden');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CricketApp();
});

// Add some CSS for elements created dynamically
const style = document.createElement('style');
style.textContent = `
    .no-rooms, .error-message {
        text-align: center;
        padding: 40px 20px;
        color: #666;
    }
    
    .no-rooms i, .error-message i {
        font-size: 3rem;
        margin-bottom: 15px;
        display: block;
        opacity: 0.5;
    }
    
    .btn-sm {
        padding: 6px 12px;
        font-size: 0.8rem;
    }
`;
document.head.appendChild(style);
