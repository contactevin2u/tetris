// Client-side WebSocket connection and multiplayer logic
let ws;
let myPlayerId = -1;
let games = [null, null, null, null];
let isMyGameActive = false;
let dropInterval;

// Configuration - auto-detects environment
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://tetris-backend-ic5y.onrender.com';

const WS_URL = window.location.hostname === 'localhost'
    ? 'ws://localhost:8080'
    : 'wss://tetris-backend-ic5y.onrender.com';

// Connect to WebSocket server
function connect() {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        console.log('Connected to server');
        document.getElementById('status').textContent = 'Connected';
        document.getElementById('status').style.color = '#4CAF50';
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleMessage(data);
    };

    ws.onclose = () => {
        console.log('Disconnected from server');
        document.getElementById('status').textContent = 'Disconnected';
        document.getElementById('status').style.color = '#f44336';
        setTimeout(connect, 3000);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

function handleMessage(data) {
    switch (data.type) {
        case 'init':
            myPlayerId = data.playerId;
            document.getElementById('playerId').textContent = myPlayerId + 1;
            updatePlayerStatus();
            break;

        case 'playerJoined':
            updatePlayerStatus();
            break;

        case 'playerLeft':
            if (games[data.playerId]) {
                games[data.playerId] = null;
            }
            updatePlayerStatus();
            break;

        case 'gameStart':
            startGame();
            break;

        case 'gameState':
            updateGameState(data.playerId, data.state);
            break;

        case 'playerCount':
            document.getElementById('startBtn').disabled = data.count < 1;
            if (data.count >= 1) {
                document.getElementById('startBtn').textContent =
                    `Start Game (${data.count}/4 players)`;
            }
            break;
    }
}

function updatePlayerStatus() {
    for (let i = 0; i < 4; i++) {
        const statusEl = document.getElementById(`status-${i}`);
        if (i === myPlayerId) {
            statusEl.textContent = 'YOU';
            statusEl.style.background = '#4CAF50';
        } else if (games[i]) {
            statusEl.textContent = 'Connected';
            statusEl.style.background = '#2196F3';
        } else {
            statusEl.textContent = 'Waiting...';
            statusEl.style.background = 'rgba(0,0,0,0.3)';
        }
    }
}

function startGame() {
    // Initialize all game instances
    for (let i = 0; i < 4; i++) {
        games[i] = new TetrisGame(`canvas-${i}`);
    }

    isMyGameActive = true;
    document.getElementById('startBtn').disabled = true;

    // Start game loop
    if (dropInterval) clearInterval(dropInterval);
    dropInterval = setInterval(() => {
        if (isMyGameActive && games[myPlayerId] && !games[myPlayerId].gameOver) {
            games[myPlayerId].move(0, 1);
            sendGameState();
        }
    }, 1000);

    // Draw all games
    function gameLoop() {
        games.forEach((game, index) => {
            if (game) {
                game.draw();
                document.getElementById(`score-${index}`).textContent = game.score;

                if (game.gameOver) {
                    const statusEl = document.getElementById(`status-${index}`);
                    statusEl.textContent = 'GAME OVER';
                    statusEl.style.background = '#f44336';

                    // If it's my game, show leaderboard submission
                    if (index === myPlayerId && !game.scoreSubmitted) {
                        game.scoreSubmitted = true;
                        showScoreSubmission(game.score, game.linesCleared || 0);
                    }
                }
            }
        });
        requestAnimationFrame(gameLoop);
    }
    gameLoop();
}

// Leaderboard functions
async function submitScore(playerName, score, linesCleared) {
    try {
        const response = await fetch(`${API_URL}/api/leaderboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player_name: playerName, score, lines_cleared: linesCleared })
        });
        if (response.ok) {
            loadLeaderboard();
        }
    } catch (error) {
        console.error('Error submitting score:', error);
    }
}

async function loadLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/api/leaderboard`);
        const data = await response.json();
        displayLeaderboard(data);
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

function displayLeaderboard(scores) {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';

    scores.slice(0, 10).forEach((entry, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.player_name}</td>
            <td>${entry.score}</td>
            <td>${entry.lines_cleared || 0}</td>
        `;
    });

    document.getElementById('leaderboardModal').style.display = 'block';
}

function showScoreSubmission(score, linesCleared) {
    const name = prompt(`Game Over! Your score: ${score}\n\nEnter your name for the leaderboard:`, 'Player');
    if (name && name.trim()) {
        submitScore(name.trim(), score, linesCleared);
    }
}

// Load leaderboard on page load
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
});

function updateGameState(playerId, state) {
    if (games[playerId] && playerId !== myPlayerId) {
        games[playerId].setState(state);
    }
}

function sendGameState() {
    if (games[myPlayerId] && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'gameState',
            state: games[myPlayerId].getState()
        }));
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!isMyGameActive || !games[myPlayerId] || games[myPlayerId].gameOver) {
        return;
    }

    switch (e.key) {
        case 'ArrowLeft':
            games[myPlayerId].move(-1, 0);
            sendGameState();
            e.preventDefault();
            break;
        case 'ArrowRight':
            games[myPlayerId].move(1, 0);
            sendGameState();
            e.preventDefault();
            break;
        case 'ArrowDown':
            games[myPlayerId].move(0, 1);
            sendGameState();
            e.preventDefault();
            break;
        case 'ArrowUp':
            games[myPlayerId].rotate();
            sendGameState();
            e.preventDefault();
            break;
        case ' ':
            games[myPlayerId].hardDrop();
            sendGameState();
            e.preventDefault();
            break;
    }
});

// Start button
document.getElementById('startBtn').addEventListener('click', () => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'startGame' }));
    }
});

// Initialize connection
connect();
