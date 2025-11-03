# 4-Player Online Tetris 🎮

A real-time multiplayer Tetris game supporting up to 4 players simultaneously, with cloud deployment and global leaderboard!

![Tetris Game](https://img.shields.io/badge/Players-4-blue) ![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-green) ![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)

## Features

- **Multiplayer**: Up to 4 players can play simultaneously
- **Real-time Sync**: See other players' games in real-time via WebSocket
- **Global Leaderboard**: PostgreSQL-powered leaderboard with top scores
- **Cloud Ready**: Optimized for Render (Singapore) + Vercel deployment
- **Classic Tetris**: All 7 tetromino shapes with proper game mechanics
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL (optional - for leaderboard feature)

### Run Locally

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd Tetris
   ```

2. **Start the backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```
   Backend runs on http://localhost:8080

3. **Open the frontend**:
   - Simply open `frontend/index.html` in your browser, OR
   - Use a local server:
     ```bash
     cd frontend
     npx http-server -p 3000
     ```
   - Open http://localhost:3000

4. **Play**:
   - Open multiple tabs to test multiplayer
   - Click "Start Game" when ready
   - Use arrow keys and space to play

## Cloud Deployment

For production deployment to Render + Vercel, see **[DEPLOY.md](./DEPLOY.md)** for detailed instructions.

### Quick Deploy Summary:

1. **Backend to Render** (Singapore region):
   - Push code to GitHub
   - Connect to Render
   - Deploy using `render.yaml` (auto-creates PostgreSQL + Web Service)

2. **Frontend to Vercel**:
   - Connect GitHub repo to Vercel
   - Set root directory to `frontend`
   - Deploy!

3. **Update frontend config** with your Render backend URL

See [DEPLOY.md](./DEPLOY.md) for step-by-step instructions.

## Project Structure

```
Tetris/
├── backend/              # Node.js backend
│   ├── server.js        # WebSocket + API server
│   ├── package.json     # Backend dependencies
│   └── .gitignore
├── frontend/            # Static frontend
│   ├── index.html       # Main game interface
│   ├── game.js          # Tetris game logic
│   ├── client.js        # WebSocket client + API calls
│   ├── style.css        # Styles
│   ├── vercel.json      # Vercel config
│   └── .gitignore
├── render.yaml          # Render deployment config
├── DEPLOY.md           # Deployment guide
└── README.md           # This file
```

## Game Controls

| Key | Action |
|-----|--------|
| ← → | Move left/right |
| ↑   | Rotate piece |
| ↓   | Soft drop (faster) |
| Space | Hard drop (instant) |

## Tech Stack

### Backend
- **Node.js** - Runtime
- **Express** - REST API
- **WebSocket (ws)** - Real-time multiplayer
- **PostgreSQL (pg)** - Leaderboard database
- **CORS** - Cross-origin support

### Frontend
- **HTML5 Canvas** - Game rendering
- **Vanilla JavaScript** - No framework needed
- **WebSocket API** - Real-time communication
- **Fetch API** - REST API calls

### Infrastructure
- **Render** - Backend hosting (Singapore region)
- **PostgreSQL on Render** - Database (Singapore region)
- **Vercel** - Frontend hosting (global CDN)

## API Endpoints

### REST API

- `GET /api/health` - Health check
- `GET /api/leaderboard` - Get top 100 scores
- `POST /api/leaderboard` - Submit score
  ```json
  {
    "player_name": "string",
    "score": number,
    "lines_cleared": number
  }
  ```

### WebSocket Messages

**Client → Server:**
- `{ type: "startGame" }` - Start the game
- `{ type: "gameState", state: {...} }` - Broadcast game state

**Server → Client:**
- `{ type: "init", playerId: number }` - Player ID assignment
- `{ type: "gameStart" }` - Game started
- `{ type: "gameState", playerId: number, state: {...} }` - Player state update
- `{ type: "playerJoined", playerId: number }` - Player joined
- `{ type: "playerLeft", playerId: number }` - Player left
- `{ type: "playerCount", count: number }` - Current player count

## Features Roadmap

- [ ] Private game rooms
- [ ] Authentication
- [ ] Player rankings
- [ ] Power-ups and special abilities
- [ ] Tournament mode
- [ ] Mobile touch controls
- [ ] Sound effects and music
- [ ] Spectator mode

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or production!

## Troubleshooting

**Connection issues?**
- Check that backend is running
- Verify WebSocket URL in `client.js` matches your backend
- For production: ensure using `wss://` not `ws://`

**Leaderboard not working?**
- Verify PostgreSQL database is connected
- Check `DATABASE_URL` environment variable
- Review backend logs for errors

For more help, see [DEPLOY.md](./DEPLOY.md)

## Credits

Built with ❤️ using Node.js, WebSocket, and PostgreSQL

---

**Ready to play?** Follow the Quick Start guide above or deploy to the cloud with [DEPLOY.md](./DEPLOY.md)!
