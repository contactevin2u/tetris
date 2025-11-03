// Client-side WebSocket connection and multiplayer logic
let ws;
let myPlayerId = -1;
let games = [null, null, null, null];
let isMyGameActive = false;
let isPaused = false;
let dropInterval;
let animationFrameId;
let gameTimer;
let timeRemaining = 120; // 2 minutes in seconds

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
            updatePlayerSizing();
            updatePlayerStatus();
            break;

        case 'playerJoined':
            showNotification(`Player ${data.playerId + 1} joined the game!`, 'info');
            updatePlayerStatus();
            // Show new game button if game is in progress
            if (isMyGameActive) {
                document.getElementById('newGameBtn').style.display = 'inline-block';
            }
            break;

        case 'playerLeft':
            if (games[data.playerId]) {
                games[data.playerId] = null;
            }
            showNotification(`Player ${data.playerId + 1} left the game`, 'warning');
            updatePlayerStatus();
            break;

        case 'gameStart':
            startGame();
            break;

        case 'gameState':
            updateGameState(data.playerId, data.state);
            break;

        case 'playerCount':
            updateStartButton(data.count, data.gameInProgress);
            break;

        case 'gameInProgress':
            // A game is already in progress, disable start button
            document.getElementById('startBtn').disabled = true;
            document.getElementById('startBtn').textContent = 'Game in Progress...';
            break;

        case 'gameEnded':
            // Game has ended, allow new game to start
            updateStartButton(data.playerCount, false);
            break;

        case 'stopGame':
            stopGame();
            break;

        case 'newGame':
            // Server initiated new game for all
            stopGame();
            showNotification('New game session started! Get ready...', 'success');
            break;
    }
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;

    // Auto-hide after 4 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 4000);
}

function updateStartButton(playerCount, gameInProgress) {
    const startBtn = document.getElementById('startBtn');
    const playerCountEl = document.getElementById('playerCount');

    // Update player count display
    playerCountEl.textContent = `${playerCount}/4`;

    if (gameInProgress) {
        startBtn.disabled = true;
        startBtn.textContent = 'Game in Progress...';
    } else if (playerCount < 1) {
        startBtn.disabled = true;
        startBtn.textContent = 'Waiting for players...';
    } else {
        startBtn.disabled = false;
        startBtn.textContent = `Start Game (${playerCount}/4 players)`;
    }
}

function updatePlayerSizing() {
    const mainColumn = document.querySelector('.main-player-column');
    const othersColumn = document.querySelector('.other-players-column');

    if (!mainColumn || !othersColumn) return;

    // Move player containers to appropriate columns
    // Note: appendChild automatically removes from previous parent
    for (let i = 0; i < 4; i++) {
        const container = document.querySelector(`.player-container[data-player-id="${i}"]`);
        if (container) {
            container.classList.remove('my-player', 'other-player');
            container.style.display = 'block';

            if (myPlayerId >= 0 && i === myPlayerId) {
                // This is my player - put in main column
                container.classList.add('my-player');
                if (container.parentElement !== mainColumn) {
                    mainColumn.appendChild(container);
                }
            } else {
                // Other players - put in others column
                container.classList.add('other-player');
                if (container.parentElement !== othersColumn) {
                    othersColumn.appendChild(container);
                }
            }
        }
    }
}

function updatePlayerStatus() {
    for (let i = 0; i < 4; i++) {
        const statusEl = document.getElementById(`status-${i}`);
        if (!statusEl) continue; // Skip if element not found

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
    // Play game start sound
    soundManager.playGameStart();
    soundManager.startBackgroundMusic();

    // Initialize all game instances (only if canvas exists)
    for (let i = 0; i < 4; i++) {
        const canvas = document.getElementById(`canvas-${i}`);
        if (canvas) {
            games[i] = new TetrisGame(`canvas-${i}`);
        } else {
            games[i] = null;
        }
    }

    isMyGameActive = true;
    isPaused = false;
    timeRemaining = 120; // Reset timer to 2 minutes

    // Update button states
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('restartBtn').disabled = false;
    document.getElementById('pauseBtn').textContent = 'Pause';

    // Start timer
    updateTimerDisplay();
    if (gameTimer) clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        if (!isPaused && timeRemaining > 0) {
            timeRemaining--;
            updateTimerDisplay();

            // Play warning sound when time is running out
            if (timeRemaining === 30 || timeRemaining === 10) {
                soundManager.playWarning();
            }

            // Play countdown tick in last 5 seconds
            if (timeRemaining <= 5 && timeRemaining > 0) {
                soundManager.playCountdownTick();
            }

            if (timeRemaining <= 0) {
                // Time's up! End game
                endGameByTimer();
            }
        }
    }, 1000);

    // Start game loop
    if (dropInterval) clearInterval(dropInterval);
    dropInterval = setInterval(() => {
        if (isMyGameActive && !isPaused && games[myPlayerId] && !games[myPlayerId].gameOver) {
            games[myPlayerId].move(0, 1);
            sendGameState();
        }
    }, 1000);

    // Draw all games
    function gameLoop() {
        games.forEach((game, index) => {
            if (game) {
                game.draw();

                const scoreEl = document.getElementById(`score-${index}`);
                if (scoreEl) {
                    scoreEl.textContent = game.score;
                }

                if (game.gameOver) {
                    const statusEl = document.getElementById(`status-${index}`);
                    if (statusEl) {
                        statusEl.textContent = 'GAME OVER';
                        statusEl.style.background = '#f44336';
                    }

                    // If it's my game, show leaderboard submission and notify server
                    if (index === myPlayerId && !game.scoreSubmitted) {
                        game.scoreSubmitted = true;
                        soundManager.playGameOver();
                        soundManager.stopBackgroundMusic();
                        showScoreSubmission(game.score, game.linesCleared || 0);

                        // Check if all players are done
                        checkAllPlayersFinished();
                    }
                }
            }
        });
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    gameLoop();
}

function checkAllPlayersFinished() {
    let allFinished = true;
    for (let i = 0; i < games.length; i++) {
        if (games[i] && !games[i].gameOver) {
            allFinished = false;
            break;
        }
    }

    if (allFinished && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'gameEnded' }));
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const timerEl = document.getElementById('timer');
    timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Change color when time is running out
    if (timeRemaining <= 30) {
        timerEl.style.color = '#ff4444';
    } else if (timeRemaining <= 60) {
        timerEl.style.color = '#ffaa00';
    } else {
        timerEl.style.color = '#FFD700';
    }
}

function endGameByTimer() {
    if (!isMyGameActive) return;

    // Force game over for my player
    if (games[myPlayerId] && !games[myPlayerId].gameOver) {
        games[myPlayerId].gameOver = true;

        // Show score submission
        if (!games[myPlayerId].scoreSubmitted) {
            games[myPlayerId].scoreSubmitted = true;
            showScoreSubmission(games[myPlayerId].score, games[myPlayerId].linesCleared || 0);
        }

        // Check if all players are done
        checkAllPlayersFinished();
    }
}

function pauseGame() {
    if (!isMyGameActive || games[myPlayerId].gameOver) return;

    isPaused = !isPaused;
    const pauseBtn = document.getElementById('pauseBtn');

    if (isPaused) {
        pauseBtn.textContent = 'Resume';
        pauseBtn.style.background = '#4CAF50';
    } else {
        pauseBtn.textContent = 'Pause';
        pauseBtn.style.background = '#FF9800';
    }
}

function stopGame() {
    if (!isMyGameActive) return;

    isMyGameActive = false;
    isPaused = false;

    // Stop background music
    soundManager.stopBackgroundMusic();

    if (dropInterval) clearInterval(dropInterval);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (gameTimer) clearInterval(gameTimer);

    // Reset timer display
    timeRemaining = 120;
    updateTimerDisplay();

    // Reset button states
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('restartBtn').disabled = true;
    document.getElementById('newGameBtn').style.display = 'none';
    document.getElementById('pauseBtn').textContent = 'Pause';

    // Clear all games
    for (let i = 0; i < 4; i++) {
        if (games[i]) {
            const canvas = document.getElementById(`canvas-${i}`);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            games[i] = null;
        }
        const scoreEl = document.getElementById(`score-${i}`);
        if (scoreEl) {
            scoreEl.textContent = '0';
        }
        const statusEl = document.getElementById(`status-${i}`);
        if (statusEl) {
            statusEl.textContent = 'Waiting...';
            statusEl.style.background = 'rgba(0,0,0,0.3)';
        }
    }

    // Notify server
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'stopGame' }));
    }

    updatePlayerStatus();
}

function restartGame() {
    if (!isMyGameActive) return;

    stopGame();

    // Wait a bit then send start command
    setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'startGame' }));
        }
    }, 500);
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
    if (!isMyGameActive || isPaused || !games[myPlayerId] || games[myPlayerId].gameOver) {
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
        case 'Shift':
            games[myPlayerId].holdPiece();
            sendGameState();
            e.preventDefault();
            break;
    }
});

// Button event listeners
document.getElementById('startBtn').addEventListener('click', () => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'startGame' }));
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    pauseGame();
});

document.getElementById('stopBtn').addEventListener('click', () => {
    stopGame();
});

document.getElementById('restartBtn').addEventListener('click', () => {
    restartGame();
});

document.getElementById('newGameBtn').addEventListener('click', () => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'newGame' }));
    }
});

// Initialize player layout and connection on load
document.addEventListener('DOMContentLoaded', () => {
    // Load leaderboard
    loadLeaderboard();
    // Connect to server after DOM is ready (updatePlayerSizing will be called when we receive init message)
    connect();
});

// Sound toggle function
function toggleSound() {
    const enabled = soundManager.toggle();
    const btn = document.getElementById('soundBtn');
    if (enabled) {
        btn.textContent = '🔊 Sound ON';
        soundManager.playBeep(440, 0.1);
    } else {
        btn.textContent = '🔇 Sound OFF';
    }
}

// Mobile Controls
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth <= 968;
}

// Show mobile controls if on mobile device
if (isMobile()) {
    const mobileControls = document.querySelector('.mobile-controls');
    if (mobileControls) {
        mobileControls.classList.add('visible');
    }
}

// Touch control handlers
function handleMobileControl(action) {
    if (!isMyGameActive || isPaused || !games[myPlayerId] || games[myPlayerId].gameOver) {
        return;
    }

    switch (action) {
        case 'left':
            games[myPlayerId].move(-1, 0);
            sendGameState();
            break;
        case 'right':
            games[myPlayerId].move(1, 0);
            sendGameState();
            break;
        case 'down':
            games[myPlayerId].move(0, 1);
            sendGameState();
            break;
        case 'up':
        case 'rotate':
            games[myPlayerId].rotate();
            sendGameState();
            break;
        case 'drop':
            games[myPlayerId].hardDrop();
            sendGameState();
            break;
        case 'hold':
            games[myPlayerId].holdPiece();
            sendGameState();
            break;
    }
}

// Add event listeners for mobile controls
document.getElementById('left-btn')?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleMobileControl('left');
});

document.getElementById('right-btn')?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleMobileControl('right');
});

document.getElementById('down-btn')?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleMobileControl('down');
});

document.getElementById('up-btn')?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleMobileControl('up');
});

document.getElementById('rotate-btn')?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleMobileControl('rotate');
});

document.getElementById('drop-btn')?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleMobileControl('drop');
});

document.getElementById('hold-btn')?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleMobileControl('hold');
});

// Swipe gesture detection on canvas
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function handleSwipeGesture() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 30;

    // Determine if it's a horizontal or vertical swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                handleMobileControl('right');
            } else {
                handleMobileControl('left');
            }
        }
    } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                handleMobileControl('down');
            } else {
                handleMobileControl('drop'); // Swipe up for hard drop
            }
        }
    }
}

// Add swipe listeners to main canvas
const mainCanvas = document.getElementById('canvas-0');
if (mainCanvas && isMobile()) {
    mainCanvas.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, false);

    mainCanvas.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipeGesture();
    }, false);

    // Tap to rotate
    mainCanvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            // Two finger tap for hold
            e.preventDefault();
            handleMobileControl('hold');
        }
    }, false);
}

// Update mobile controls visibility when window resizes
window.addEventListener('resize', () => {
    const mobileControls = document.querySelector('.mobile-controls');
    if (mobileControls) {
        if (isMobile()) {
            mobileControls.classList.add('visible');
        } else {
            mobileControls.classList.remove('visible');
        }
    }
});
