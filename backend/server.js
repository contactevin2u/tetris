const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database
async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS leaderboard (
                id SERIAL PRIMARY KEY,
                player_name VARCHAR(50) NOT NULL,
                score INTEGER NOT NULL,
                lines_cleared INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database initialized');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

initDB();

// REST API endpoints
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM leaderboard ORDER BY score DESC LIMIT 100'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Submit score
app.post('/api/leaderboard', async (req, res) => {
    const { player_name, score, lines_cleared } = req.body;

    if (!player_name || score === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO leaderboard (player_name, score, lines_cleared) VALUES ($1, $2, $3) RETURNING *',
            [player_name, score, lines_cleared || 0]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error submitting score:', error);
        res.status(500).json({ error: 'Failed to submit score' });
    }
});

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
    console.log(`HTTP Server running on port ${PORT}`);
});

// WebSocket server
const wss = new WebSocket.Server({ server });

const players = new Map();
let gameInProgress = false;

wss.on('connection', (ws) => {
    // Find available player slot (0-3)
    let playerId = -1;
    for (let i = 0; i < 4; i++) {
        if (!Array.from(players.values()).some(p => p.id === i)) {
            playerId = i;
            break;
        }
    }

    if (playerId === -1) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Game is full (4 players max)'
        }));
        ws.close();
        return;
    }

    // Add player
    players.set(ws, { id: playerId, ws });
    console.log(`Player ${playerId + 1} connected. Total players: ${players.size}`);

    // Send player their ID
    ws.send(JSON.stringify({
        type: 'init',
        playerId: playerId
    }));

    // Notify all players about player count
    broadcastPlayerCount();

    // Notify all players that a new player joined
    broadcast({
        type: 'playerJoined',
        playerId: playerId
    });

    // If game is in progress, notify the new player
    if (gameInProgress) {
        ws.send(JSON.stringify({
            type: 'gameInProgress'
        }));
    }

    // Handle messages from client
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'startGame':
                    if (!gameInProgress && players.size >= 1) {
                        gameInProgress = true;
                        broadcast({ type: 'gameStart' });
                        broadcastPlayerCount();
                        console.log('Game started with', players.size, 'players');
                    } else if (gameInProgress) {
                        // Game already in progress
                        ws.send(JSON.stringify({
                            type: 'gameInProgress'
                        }));
                    }
                    break;

                case 'gameState':
                    const player = players.get(ws);
                    if (player) {
                        // Broadcast game state to all other players
                        broadcast({
                            type: 'gameState',
                            playerId: player.id,
                            state: data.state
                        }, ws);
                    }
                    break;

                case 'stopGame':
                    gameInProgress = false;
                    broadcast({ type: 'stopGame' });
                    broadcastPlayerCount();
                    console.log('Game stopped');
                    break;

                case 'gameEnded':
                    gameInProgress = false;
                    broadcast({
                        type: 'gameEnded',
                        playerCount: players.size
                    });
                    broadcastPlayerCount();
                    console.log('Game ended - all players finished');
                    break;

                case 'newGame':
                    // Reset game for all players
                    gameInProgress = false;
                    broadcast({ type: 'newGame' });
                    broadcastPlayerCount();
                    console.log('New game session initiated by a player');
                    break;

                case 'gameOver':
                    // Player can submit their score
                    console.log(`Player ${data.playerId} game over with score: ${data.score}`);
                    break;
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    // Handle disconnection
    ws.on('close', () => {
        const player = players.get(ws);
        if (player) {
            console.log(`Player ${player.id + 1} disconnected`);
            players.delete(ws);

            broadcast({
                type: 'playerLeft',
                playerId: player.id
            });

            broadcastPlayerCount();

            // Reset game if not enough players
            if (players.size < 1 && gameInProgress) {
                gameInProgress = false;
            }
        }
    });
});

function broadcast(data, exclude = null) {
    const message = JSON.stringify(data);
    players.forEach((player) => {
        if (player.ws !== exclude && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(message);
        }
    });
}

function broadcastPlayerCount() {
    broadcast({
        type: 'playerCount',
        count: players.size,
        gameInProgress: gameInProgress
    });
}

console.log('WebSocket server ready for connections');
