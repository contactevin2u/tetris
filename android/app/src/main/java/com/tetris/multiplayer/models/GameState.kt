package com.tetris.multiplayer.models

data class GameState(
    val grid: Array<IntArray> = Array(20) { IntArray(10) { 0 } },
    val score: Int = 0,
    val linesCleared: Int = 0,
    val gameOver: Boolean = false,
    val currentPiece: TetrominoData? = null,
    val nextPiece: TetrominoData? = null,
    val heldPiece: TetrominoData? = null,
    val comboCount: Int = 0
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as GameState

        if (!grid.contentDeepEquals(other.grid)) return false
        if (score != other.score) return false
        if (linesCleared != other.linesCleared) return false
        if (gameOver != other.gameOver) return false
        if (currentPiece != other.currentPiece) return false
        if (nextPiece != other.nextPiece) return false
        if (heldPiece != other.heldPiece) return false
        if (comboCount != other.comboCount) return false

        return true
    }

    override fun hashCode(): Int {
        var result = grid.contentDeepHashCode()
        result = 31 * result + score
        result = 31 * result + linesCleared
        result = 31 * result + gameOver.hashCode()
        result = 31 * result + (currentPiece?.hashCode() ?: 0)
        result = 31 * result + (nextPiece?.hashCode() ?: 0)
        result = 31 * result + (heldPiece?.hashCode() ?: 0)
        result = 31 * result + comboCount
        return result
    }
}

data class TetrominoData(
    val type: String,
    val shape: Array<IntArray>,
    val x: Int = 0,
    val y: Int = 0
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as TetrominoData

        if (type != other.type) return false
        if (!shape.contentDeepEquals(other.shape)) return false
        if (x != other.x) return false
        if (y != other.y) return false

        return true
    }

    override fun hashCode(): Int {
        var result = type.hashCode()
        result = 31 * result + shape.contentDeepHashCode()
        result = 31 * result + x
        result = 31 * result + y
        return result
    }
}

data class LeaderboardEntry(
    val id: String = "",
    val playerName: String = "",
    val score: Int = 0,
    val linesCleared: Int = 0,
    val timestamp: Long = System.currentTimeMillis()
)

data class PlayerInfo(
    val id: Int,
    val name: String,
    val connected: Boolean = true
)
