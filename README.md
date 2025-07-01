# 🏏 Cricket Team Selection Room

A real-time multiplayer web application for cricket team selection using Express.js and Socket.IO. Users can create or join rooms and take turns selecting cricket players to build their dream teams.

## 🌟 Features

- **Real-time Multiplayer**: Multiple users can join the same room and interact in real-time
- **Turn-based Selection**: Players take turns selecting cricket players with a 10-second timer
- **Auto-selection**: If a player doesn't select within the time limit, a random player is auto-selected
- **Comprehensive Player Database**: 60+ international cricket players with ratings and roles
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Room Management**: Create, join, and manage selection rooms with unique codes
- **Live Updates**: Real-time updates of selections, turn order, and game state

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cricket-team-selection
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Development Mode

For development with auto-restart:
```bash
npm run dev
```

## 🎮 How to Play

### 1. Create or Join a Room
- **Create Room**: Enter your name and click "Create Room" to start a new selection room
- **Join Room**: Enter a room code and your name to join an existing room

### 2. Wait for Players
- Minimum 2 players required to start
- Maximum 6 players per room
- Host can start the selection when ready

### 3. Team Selection Process
- Turn order is randomized when selection starts
- Each player gets 10 seconds to select a cricket player
- If time runs out, a random player is auto-selected
- Continue until each player has selected 5 players

### 4. View Results
- See all teams with their selected players
- Compare team ratings and compositions
- Start a new game or return to home

## 🏗️ Architecture

### Backend Structure
```
src/
├── controllers/
│   └── SocketHandler.js      # Socket.IO event handling
├── models/
│   ├── Room.js              # Room data model
│   └── RoomManager.js       # Room management logic
├── utils/
│   └── TurnManager.js       # Turn-based game logic
└── data/
    └── cricketPlayers.js    # Player database
```

### Frontend Structure
```
public/
├── css/
│   ├── style.css           # Main styles
│   └── room.css           # Room-specific styles
├── js/
│   ├── main.js            # Home page logic
│   └── room.js            # Room page logic
├── index.html             # Home page
└── room.html              # Room page
```

## 🔧 API Endpoints

### REST API
- `GET /api/rooms` - Get all active rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:roomId` - Get room details

### Socket.IO Events

#### Client to Server
- `join-room` - Join a room
- `start-selection` - Start team selection (host only)
- `select-player` - Select a cricket player
- `get-available-players` - Get available players
- `get-room-info` - Get current room state

#### Server to Client
- `join-room-success` - Successfully joined room
- `join-room-error` - Failed to join room
- `user-joined` - Another user joined
- `user-left` - User left the room
- `selection-started` - Team selection began
- `turn-started` - Player's turn started
- `player-selected` - Player was selected
- `player-auto-selected` - Player was auto-selected
- `selection-ended` - Team selection completed
- `game-state-updated` - Game state changed

## 🧪 Testing

Run the basic functionality test:
```bash
node test-basic.js
```

This test validates:
- Room creation via API
- Socket connections
- Room joining
- Selection start process
- Real-time event broadcasting

## 🌐 Deployment

### Environment Variables
Create a `.env` file for production:
```env
PORT=3000
NODE_ENV=production
```

### Deployment Platforms

#### Render
1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Deploy

#### Railway
1. Connect repository
2. Railway will auto-detect Node.js
3. Deploy automatically

#### Heroku
1. Create Heroku app
2. Set buildpack to Node.js
3. Deploy via Git or GitHub integration

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🎯 Game Rules

### Room Rules
- 2-6 players per room
- Host controls game start
- Unique room codes for joining

### Selection Rules
- 5 players per team
- 10-second turn timer
- Auto-selection on timeout
- No duplicate selections

### Player Database
- 60+ international cricket players
- Players from 10+ countries
- Roles: Batsman, Bowler, All-rounder, Wicket-keeper
- Rating system (0-100)

## 🔮 Future Enhancements

- [ ] User authentication and profiles
- [ ] Persistent game history with database
- [ ] Custom player pools
- [ ] Tournament mode
- [ ] Team performance analytics
- [ ] Mobile app version
- [ ] Voice chat integration
- [ ] Spectator mode
- [ ] Publisher-Subscriber architecture for better scalability
- [ ] Redis integration for distributed scaling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- Express.js for the web framework
- Font Awesome for icons
- Cricket player data compiled from various sources

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review the test files for examples

---

**Built with ❤️ for cricket fans and real-time gaming enthusiasts!**
