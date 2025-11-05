package com.tetris.multiplayer.ui

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Color
import android.util.AttributeSet
import android.view.View
import com.tetris.multiplayer.game.TetrisGame
import com.tetris.multiplayer.models.GameState
import com.tetris.multiplayer.models.TetrominoType

class TetrisView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    companion object {
        private const val COLS = 10
        private const val ROWS = 20
        private const val BLOCK_SIZE = 40f
        private const val GRID_LINE_WIDTH = 1f
    }

    private var gameState: GameState? = null

    private val gridPaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val gridLinePaint = Paint().apply {
        style = Paint.Style.STROKE
        color = Color.parseColor("#646478")
        strokeWidth = GRID_LINE_WIDTH
        alpha = 77 // 30% opacity
    }

    private val backgroundPaint = Paint().apply {
        style = Paint.Style.FILL
        color = Color.BLACK
    }

    init {
        setWillNotDraw(false)
    }

    fun updateState(state: GameState) {
        gameState = state
        invalidate()
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val width = (COLS * BLOCK_SIZE).toInt()
        val height = (ROWS * BLOCK_SIZE).toInt()
        setMeasuredDimension(width, height)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        // Draw background
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), backgroundPaint)

        gameState?.let { state ->
            // Draw grid blocks
            state.grid.forEachIndexed { row, line ->
                line.forEachIndexed { col, colorValue ->
                    if (colorValue != 0) {
                        gridPaint.color = colorValue
                        canvas.drawRect(
                            col * BLOCK_SIZE,
                            row * BLOCK_SIZE,
                            (col + 1) * BLOCK_SIZE - 1,
                            (row + 1) * BLOCK_SIZE - 1,
                            gridPaint
                        )
                    }
                }
            }

            // Draw current piece
            state.currentPiece?.let { piece ->
                val type = TetrominoType.valueOf(piece.type)
                gridPaint.color = type.color

                piece.shape.forEachIndexed { row, line ->
                    line.forEachIndexed { col, value ->
                        if (value != 0) {
                            val x = (piece.x + col) * BLOCK_SIZE
                            val y = (piece.y + row) * BLOCK_SIZE
                            canvas.drawRect(
                                x,
                                y,
                                x + BLOCK_SIZE - 1,
                                y + BLOCK_SIZE - 1,
                                gridPaint
                            )
                        }
                    }
                }
            }

            // Draw grid lines
            for (i in 0..COLS) {
                val x = i * BLOCK_SIZE
                canvas.drawLine(x, 0f, x, height.toFloat(), gridLinePaint)
            }
            for (i in 0..ROWS) {
                val y = i * BLOCK_SIZE
                canvas.drawLine(0f, y, width.toFloat(), y, gridLinePaint)
            }
        }
    }
}

class PreviewView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private var tetrominoShape: Array<IntArray>? = null
    private var tetrominoColor: Int = Color.WHITE

    private val blockPaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val backgroundPaint = Paint().apply {
        style = Paint.Style.FILL
        color = Color.BLACK
    }

    private val blockSize = 30f

    init {
        setWillNotDraw(false)
    }

    fun setTetromino(shape: Array<IntArray>?, color: Int) {
        tetrominoShape = shape
        tetrominoColor = color
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        // Draw background
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), backgroundPaint)

        tetrominoShape?.let { shape ->
            blockPaint.color = tetrominoColor

            val shapeWidth = shape[0].size * blockSize
            val shapeHeight = shape.size * blockSize
            val offsetX = (width - shapeWidth) / 2
            val offsetY = (height - shapeHeight) / 2

            shape.forEachIndexed { row, line ->
                line.forEachIndexed { col, value ->
                    if (value != 0) {
                        val x = offsetX + col * blockSize
                        val y = offsetY + row * blockSize
                        canvas.drawRect(
                            x,
                            y,
                            x + blockSize - 1,
                            y + blockSize - 1,
                            blockPaint
                        )
                    }
                }
            }
        }
    }
}
