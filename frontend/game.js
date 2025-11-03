// Tetris Game Logic
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;

// Particle effect functions
function createParticles(x, y, count, color) {
    const overlay = document.getElementById('particleOverlay');
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.backgroundColor = color;

        const angle = (Math.PI * 2 * i) / count;
        const distance = 100 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        overlay.appendChild(particle);

        setTimeout(() => particle.remove(), 1500);
    }
}

function showSpecialMessage(text, isCombo = false) {
    const message = document.createElement('div');
    message.className = 'special-message';
    if (isCombo) message.classList.add('combo-message');
    message.textContent = text;
    document.body.appendChild(message);

    // Create particles at center
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    createParticles(centerX, centerY, 20, isCombo ? '#FF5722' : '#FFD700');

    setTimeout(() => message.remove(), 2000);
}

// Tetromino shapes
const SHAPES = {
    I: [[1,1,1,1]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1]],
    S: [[0,1,1],[1,1,0]],
    Z: [[1,1,0],[0,1,1]],
    J: [[1,0,0],[1,1,1]],
    L: [[0,0,1],[1,1,1]]
};

const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000'
};

class TetrisGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.playerId = canvasId.split('-')[1];
        this.holdCanvas = document.getElementById(`hold-${this.playerId}`);
        this.nextCanvas = document.getElementById(`next-${this.playerId}`);
        this.holdCtx = this.holdCanvas ? this.holdCanvas.getContext('2d') : null;
        this.nextCtx = this.nextCanvas ? this.nextCanvas.getContext('2d') : null;
        this.reset();
    }

    reset() {
        this.grid = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        this.score = 0;
        this.linesCleared = 0;
        this.comboCount = 0;
        this.gameOver = false;
        this.currentPiece = null;
        this.nextPieceData = null;
        this.heldPiece = null;
        this.canHold = true; // Can only hold once per piece drop
        this.scoreSubmitted = false;
        this.generateNextPiece();
        this.spawnPiece();
    }

    generateRandomPiece() {
        const shapes = Object.keys(SHAPES);
        const shapeKey = shapes[Math.floor(Math.random() * shapes.length)];
        return {
            shapeKey: shapeKey,
            shape: SHAPES[shapeKey],
            color: COLORS[shapeKey]
        };
    }

    generateNextPiece() {
        this.nextPieceData = this.generateRandomPiece();
        this.drawPreview();
    }

    spawnPiece() {
        if (this.nextPieceData) {
            this.currentPiece = {
                shapeKey: this.nextPieceData.shapeKey,
                shape: this.nextPieceData.shape,
                color: this.nextPieceData.color,
                x: Math.floor(COLS / 2) - 1,
                y: 0
            };

            // Generate the next piece for preview
            this.generateNextPiece();

            // Reset hold availability
            this.canHold = true;

            if (this.checkCollision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
                this.gameOver = true;
            }
        }
    }

    nextPiece() {
        this.spawnPiece();
    }

    checkCollision(x, y, shape) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;

                    if (newX < 0 || newX >= COLS || newY >= ROWS) {
                        return true;
                    }

                    if (newY >= 0 && this.grid[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    move(dx, dy) {
        if (this.gameOver) return false;

        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;

        if (!this.checkCollision(newX, newY, this.currentPiece.shape)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;

            // Play move sound only for my player
            if (this.playerId == myPlayerId) {
                soundManager.playMove();
            }

            return true;
        }

        if (dy > 0) {
            this.merge();
            this.clearLines();
            this.nextPiece();
        }

        return false;
    }

    rotate() {
        if (this.gameOver) return;

        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );

        if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y, rotated)) {
            this.currentPiece.shape = rotated;

            // Play rotation sound only for my player
            if (this.playerId == myPlayerId) {
                soundManager.playMove();
            }
        }
    }

    hardDrop() {
        if (this.gameOver) return;

        while (this.move(0, 1)) {}

        // Play hard drop sound only for my player
        if (this.playerId == myPlayerId) {
            soundManager.playDrop();
        }
    }

    merge() {
        this.currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const gridY = this.currentPiece.y + y;
                    const gridX = this.currentPiece.x + x;
                    if (gridY >= 0) {
                        this.grid[gridY][gridX] = this.currentPiece.color;
                    }
                }
            });
        });
    }

    clearLines() {
        let linesClearedNow = 0;

        for (let row = ROWS - 1; row >= 0; row--) {
            if (this.grid[row].every(cell => cell !== 0)) {
                this.grid.splice(row, 1);
                this.grid.unshift(Array(COLS).fill(0));
                linesClearedNow++;
                row++;
            }
        }

        if (linesClearedNow > 0) {
            this.linesCleared += linesClearedNow;

            // New scoring system
            // 1 line = 10 points, 2 lines = 20 points
            // 3+ lines = 50 base points + 20% cumulative combo bonus
            if (linesClearedNow >= 3) {
                // Combo! Increment combo count
                this.comboCount++;
                // Base score 50 + 20% bonus per combo
                const comboBonus = Math.floor(50 * (this.comboCount * 0.2));
                this.score += 50 + comboBonus;

                // Play combo sound and show visual effect only for my player
                if (this.playerId == myPlayerId) {
                    soundManager.playCombo(this.comboCount);
                    showSpecialMessage(`${this.comboCount}x COMBO!`, true);
                }
            } else {
                // Regular clear, reset combo
                this.comboCount = 0;
                this.score += linesClearedNow * 10;

                // Play line clear sound only for my player
                if (this.playerId == myPlayerId) {
                    soundManager.playLineClear(linesClearedNow);
                }
            }

            // Perfect Clear bonus: if all lines are cleared (grid is empty), award 120 points!
            if (this.isPerfectClear()) {
                this.score += 120;
                console.log('PERFECT CLEAR! +120 bonus points!');

                // Play perfect clear sound and show visual effect only for my player
                if (this.playerId == myPlayerId) {
                    soundManager.playPerfectClear();
                    showSpecialMessage('PERFECT CLEAR!', false);
                }
            }
        } else {
            // No lines cleared, reset combo
            this.comboCount = 0;
        }
    }

    isPerfectClear() {
        // Check if the entire grid is empty (all cells are 0)
        return this.grid.every(row => row.every(cell => cell === 0));
    }

    holdPiece() {
        if (!this.canHold || this.gameOver) return;

        if (this.heldPiece === null) {
            // First hold - store current piece and spawn next
            this.heldPiece = {
                shapeKey: this.currentPiece.shapeKey,
                shape: SHAPES[this.currentPiece.shapeKey],
                color: this.currentPiece.color
            };
            this.spawnPiece();
        } else {
            // Swap current piece with held piece
            const temp = {
                shapeKey: this.currentPiece.shapeKey,
                shape: SHAPES[this.currentPiece.shapeKey],
                color: this.currentPiece.color
            };

            this.currentPiece = {
                shapeKey: this.heldPiece.shapeKey,
                shape: this.heldPiece.shape,
                color: this.heldPiece.color,
                x: Math.floor(COLS / 2) - 1,
                y: 0
            };

            this.heldPiece = temp;
        }

        this.canHold = false; // Can't hold again until next piece
        this.drawPreview();
    }

    drawPreview() {
        // Draw next piece
        if (this.nextCtx && this.nextPieceData) {
            this.nextCtx.fillStyle = '#000';
            this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

            const shape = this.nextPieceData.shape;
            const blockSize = 20;
            const offsetX = (this.nextCanvas.width - shape[0].length * blockSize) / 2;
            const offsetY = (this.nextCanvas.height - shape.length * blockSize) / 2;

            this.nextCtx.fillStyle = this.nextPieceData.color;
            shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        this.nextCtx.fillRect(
                            offsetX + x * blockSize,
                            offsetY + y * blockSize,
                            blockSize - 1,
                            blockSize - 1
                        );
                    }
                });
            });
        }

        // Draw held piece
        if (this.holdCtx) {
            this.holdCtx.fillStyle = '#000';
            this.holdCtx.fillRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);

            if (this.heldPiece) {
                const shape = this.heldPiece.shape;
                const blockSize = 20;
                const offsetX = (this.holdCanvas.width - shape[0].length * blockSize) / 2;
                const offsetY = (this.holdCanvas.height - shape.length * blockSize) / 2;

                this.holdCtx.fillStyle = this.heldPiece.color;
                shape.forEach((row, y) => {
                    row.forEach((value, x) => {
                        if (value) {
                            this.holdCtx.fillRect(
                                offsetX + x * blockSize,
                                offsetY + y * blockSize,
                                blockSize - 1,
                                blockSize - 1
                            );
                        }
                    });
                });
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.ctx.fillStyle = value;
                    this.ctx.fillRect(
                        x * BLOCK_SIZE,
                        y * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            });
        });

        // Draw current piece
        if (this.currentPiece) {
            this.ctx.fillStyle = this.currentPiece.color;
            this.currentPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        this.ctx.fillRect(
                            (this.currentPiece.x + x) * BLOCK_SIZE,
                            (this.currentPiece.y + y) * BLOCK_SIZE,
                            BLOCK_SIZE - 1,
                            BLOCK_SIZE - 1
                        );
                    }
                });
            });
        }

        // Draw grid lines
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= COLS; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * BLOCK_SIZE, 0);
            this.ctx.lineTo(i * BLOCK_SIZE, ROWS * BLOCK_SIZE);
            this.ctx.stroke();
        }
        for (let i = 0; i <= ROWS; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * BLOCK_SIZE);
            this.ctx.lineTo(COLS * BLOCK_SIZE, i * BLOCK_SIZE);
            this.ctx.stroke();
        }
    }

    getState() {
        return {
            grid: this.grid,
            score: this.score,
            linesCleared: this.linesCleared,
            gameOver: this.gameOver,
            currentPiece: this.currentPiece,
            nextPieceData: this.nextPieceData,
            heldPiece: this.heldPiece
        };
    }

    setState(state) {
        this.grid = state.grid;
        this.score = state.score;
        this.linesCleared = state.linesCleared || 0;
        this.gameOver = state.gameOver;
        this.currentPiece = state.currentPiece;
        this.nextPieceData = state.nextPieceData;
        this.heldPiece = state.heldPiece;
        this.drawPreview();
    }
}
