# Tetris Backend

WebSocket server and REST API for multiplayer Tetris game with PostgreSQL leaderboard.

## Features

- WebSocket server for real-time multiplayer (up to 4 players)
- REST API for leaderboard
- PostgreSQL database integration
- CORS enabled
- Health check endpoint

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables**:
   ```bash
   export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
   export PORT=8080
   ```

3. **Run the server**:
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | 8080 |
| `NODE_ENV` | Environment (production/development) | development |

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status.

### Get Leaderboard
```
GET /api/leaderboard
```
Returns top 100 scores ordered by score descending.

**Response**:
```json
[
  {
    "id": 1,
    "player_name": "Alice",
    "score": 12500,
    "lines_cleared": 25,
    "created_at": "2025-01-01T00:00:00.000Z"
  }
]
```

### Submit Score
```
POST /api/leaderboard
Content-Type: application/json

{
  "player_name": "Alice",
  "score": 12500,
  "lines_cleared": 25
}
```

**Response**:
```json
{
  "id": 1,
  "player_name": "Alice",
  "score": 12500,
  "lines_cleared": 25,
  "created_at": "2025-01-01T00:00:00.000Z"
}
```

## WebSocket Protocol

### Connection
```javascript
const ws = new WebSocket('ws://localhost:8080');
```

### Client → Server Messages

**Start Game**:
```json
{
  "type": "startGame"
}
```

**Send Game State**:
```json
{
  "type": "gameState",
  "state": {
    "grid": [[...]],
    "score": 1000,
    "linesCleared": 10,
    "gameOver": false,
    "currentPiece": {...}
  }
}
```

### Server → Client Messages

**Init (Connection)**:
```json
{
  "type": "init",
  "playerId": 0
}
```

**Player Count Update**:
```json
{
  "type": "playerCount",
  "count": 2
}
```

**Game Start**:
```json
{
  "type": "gameStart"
}
```

**Player State Update**:
```json
{
  "type": "gameState",
  "playerId": 1,
  "state": {...}
}
```

**Player Joined**:
```json
{
  "type": "playerJoined",
  "playerId": 2
}
```

**Player Left**:
```json
{
  "type": "playerLeft",
  "playerId": 3
}
```

## Database Schema

### leaderboard Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| player_name | VARCHAR(50) | NOT NULL |
| score | INTEGER | NOT NULL |
| lines_cleared | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

## Deployment

See [DEPLOY.md](../DEPLOY.md) for deployment instructions to Render.

## Development

**Run with auto-reload**:
```bash
npm run dev
```

**Check logs**:
```bash
# Render logs
render logs -s <service-name>
```

## License

MIT
