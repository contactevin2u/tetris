package com.tetris.multiplayer.models

import android.graphics.Color

enum class TetrominoType(val color: Int, val shape: Array<IntArray>) {
    I(Color.parseColor("#00F0F0"), arrayOf(
        intArrayOf(1, 1, 1, 1)
    )),
    O(Color.parseColor("#F0F000"), arrayOf(
        intArrayOf(1, 1),
        intArrayOf(1, 1)
    )),
    T(Color.parseColor("#A000F0"), arrayOf(
        intArrayOf(0, 1, 0),
        intArrayOf(1, 1, 1)
    )),
    S(Color.parseColor("#00F000"), arrayOf(
        intArrayOf(0, 1, 1),
        intArrayOf(1, 1, 0)
    )),
    Z(Color.parseColor("#F00000"), arrayOf(
        intArrayOf(1, 1, 0),
        intArrayOf(0, 1, 1)
    )),
    J(Color.parseColor("#0000F0"), arrayOf(
        intArrayOf(1, 0, 0),
        intArrayOf(1, 1, 1)
    )),
    L(Color.parseColor("#F0A000"), arrayOf(
        intArrayOf(0, 0, 1),
        intArrayOf(1, 1, 1)
    ));

    companion object {
        fun random() = values().random()
    }
}

data class Tetromino(
    val type: TetrominoType,
    var shape: Array<IntArray> = type.shape.map { it.clone() }.toTypedArray(),
    var x: Int = 0,
    var y: Int = 0
) {
    val color: Int get() = type.color

    fun rotate(): Array<IntArray> {
        val rows = shape.size
        val cols = shape[0].size
        return Array(cols) { col ->
            IntArray(rows) { row ->
                shape[rows - 1 - row][col]
            }
        }
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Tetromino

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
