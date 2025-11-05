package com.tetris.multiplayer.game

import com.tetris.multiplayer.models.*

class TetrisGame(
    private val onStateChanged: (GameState) -> Unit = {},
    private val onLineAttack: (linesCleared: Int, garbageLines: Int) -> Unit = { _, _ -> },
    private val onCombo: (comboCount: Int) -> Unit = {},
    private val onPerfectClear: () -> Unit = {}
) {
    companion object {
        const val COLS = 10
        const val ROWS = 20
    }

    private var grid = Array(ROWS) { IntArray(COLS) { 0 } }
    private var score = 0
    private var linesCleared = 0
    private var comboCount = 0
    private var gameOver = false
    private var currentPiece: Tetromino? = null
    private var nextPiece: Tetromino? = null
    private var heldPiece: Tetromino? = null
    private var canHold = true
    var scoreSubmitted = false

    init {
        reset()
    }

    fun reset() {
        grid = Array(ROWS) { IntArray(COLS) { 0 } }
        score = 0
        linesCleared = 0
        comboCount = 0
        gameOver = false
        currentPiece = null
        nextPiece = null
        heldPiece = null
        canHold = true
        scoreSubmitted = false
        generateNextPiece()
        spawnPiece()
    }

    private fun generateNextPiece() {
        nextPiece = Tetromino(TetrominoType.random())
        notifyStateChanged()
    }

    private fun spawnPiece() {
        nextPiece?.let { next ->
            currentPiece = Tetromino(
                type = next.type,
                x = COLS / 2 - 1,
                y = 0
            )
            generateNextPiece()
            canHold = true

            currentPiece?.let {
                if (checkCollision(it.x, it.y, it.shape)) {
                    gameOver = true
                    notifyStateChanged()
                }
            }
        }
    }

    private fun checkCollision(x: Int, y: Int, shape: Array<IntArray>): Boolean {
        for (row in shape.indices) {
            for (col in shape[row].indices) {
                if (shape[row][col] != 0) {
                    val newX = x + col
                    val newY = y + row

                    if (newX < 0 || newX >= COLS || newY >= ROWS) {
                        return true
                    }

                    if (newY >= 0 && grid[newY][newX] != 0) {
                        return true
                    }
                }
            }
        }
        return false
    }

    fun move(dx: Int, dy: Int): Boolean {
        if (gameOver) return false
        currentPiece?.let { piece ->
            val newX = piece.x + dx
            val newY = piece.y + dy

            if (!checkCollision(newX, newY, piece.shape)) {
                piece.x = newX
                piece.y = newY
                notifyStateChanged()
                return true
            }

            if (dy > 0) {
                merge()
                clearLines()
                spawnPiece()
            }
        }
        return false
    }

    fun rotate() {
        if (gameOver) return
        currentPiece?.let { piece ->
            val rotated = piece.rotate()
            if (!checkCollision(piece.x, piece.y, rotated)) {
                piece.shape = rotated
                notifyStateChanged()
            }
        }
    }

    fun hardDrop() {
        if (gameOver) return
        while (move(0, 1)) { }
    }

    fun holdPiece() {
        if (!canHold || gameOver) return

        currentPiece?.let { current ->
            if (heldPiece == null) {
                heldPiece = Tetromino(current.type)
                spawnPiece()
            } else {
                val temp = Tetromino(current.type)
                currentPiece = Tetromino(
                    type = heldPiece!!.type,
                    x = COLS / 2 - 1,
                    y = 0
                )
                heldPiece = temp
            }
            canHold = false
            notifyStateChanged()
        }
    }

    private fun merge() {
        currentPiece?.let { piece ->
            piece.shape.forEachIndexed { row, line ->
                line.forEachIndexed { col, value ->
                    if (value != 0) {
                        val gridY = piece.y + row
                        val gridX = piece.x + col
                        if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
                            grid[gridY][gridX] = piece.color
                        }
                    }
                }
            }
        }
    }

    private fun clearLines() {
        var linesClearedNow = 0
        var row = ROWS - 1

        while (row >= 0) {
            if (grid[row].all { it != 0 }) {
                grid = Array(ROWS) { r ->
                    when {
                        r == 0 -> IntArray(COLS) { 0 }
                        r <= row -> grid[r - 1]
                        else -> grid[r]
                    }
                }
                linesClearedNow++
            } else {
                row--
            }
        }

        if (linesClearedNow > 0) {
            linesCleared += linesClearedNow

            var garbageLinesToSend = 0
            when (linesClearedNow) {
                2 -> garbageLinesToSend = 1
                3 -> garbageLinesToSend = 2
                4 -> garbageLinesToSend = 4
            }

            if (linesClearedNow >= 3) {
                comboCount++
                val comboBonus = (50 * (comboCount * 0.2)).toInt()
                score += 50 + comboBonus
                onCombo(comboCount)
            } else {
                comboCount = 0
                score += linesClearedNow * 10
            }

            if (isPerfectClear()) {
                score += 120
                garbageLinesToSend += 4
                onPerfectClear()
            }

            if (garbageLinesToSend > 0) {
                onLineAttack(linesClearedNow, garbageLinesToSend)
            }
        } else {
            comboCount = 0
        }

        notifyStateChanged()
    }

    private fun isPerfectClear(): Boolean {
        return grid.all { row -> row.all { it == 0 } }
    }

    fun addGarbageLines(numLines: Int) {
        if (gameOver || numLines <= 0) return

        // Remove top rows
        grid = Array(ROWS) { r ->
            when {
                r < ROWS - numLines -> grid[r + numLines]
                else -> {
                    val garbageRow = IntArray(COLS) { android.graphics.Color.parseColor("#666666") }
                    val gapPosition = (0 until COLS).random()
                    garbageRow[gapPosition] = 0
                    garbageRow
                }
            }
        }

        currentPiece?.let {
            if (checkCollision(it.x, it.y, it.shape)) {
                gameOver = true
            }
        }

        notifyStateChanged()
    }

    fun getState(): GameState {
        return GameState(
            grid = grid.map { it.clone() }.toTypedArray(),
            score = score,
            linesCleared = linesCleared,
            gameOver = gameOver,
            currentPiece = currentPiece?.let {
                TetrominoData(it.type.name, it.shape, it.x, it.y)
            },
            nextPiece = nextPiece?.let {
                TetrominoData(it.type.name, it.shape, 0, 0)
            },
            heldPiece = heldPiece?.let {
                TetrominoData(it.type.name, it.type.shape, 0, 0)
            },
            comboCount = comboCount
        )
    }

    fun setState(state: GameState) {
        grid = state.grid.map { it.clone() }.toTypedArray()
        score = state.score
        linesCleared = state.linesCleared
        gameOver = state.gameOver
        comboCount = state.comboCount

        currentPiece = state.currentPiece?.let {
            val type = TetrominoType.valueOf(it.type)
            Tetromino(type, it.shape, it.x, it.y)
        }

        nextPiece = state.nextPiece?.let {
            val type = TetrominoType.valueOf(it.type)
            Tetromino(type, it.shape, 0, 0)
        }

        heldPiece = state.heldPiece?.let {
            val type = TetrominoType.valueOf(it.type)
            Tetromino(type, it.shape, 0, 0)
        }

        notifyStateChanged()
    }

    private fun notifyStateChanged() {
        onStateChanged(getState())
    }
}
