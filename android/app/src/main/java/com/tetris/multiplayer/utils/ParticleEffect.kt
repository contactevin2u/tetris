package com.tetris.multiplayer.utils

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View
import android.view.animation.AccelerateInterpolator
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

class ParticleEffectView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val particles = mutableListOf<Particle>()
    private val paint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    fun createExplosion(x: Float, y: Float, color: Int, count: Int = 20) {
        for (i in 0 until count) {
            val angle = (360.0 / count) * i
            val distance = 100f + Random.nextFloat() * 100f
            val vx = cos(Math.toRadians(angle)).toFloat() * distance
            val vy = sin(Math.toRadians(angle)).toFloat() * distance

            particles.add(Particle(x, y, vx, vy, color))
        }

        val animator = ValueAnimator.ofFloat(0f, 1f)
        animator.duration = 1500
        animator.interpolator = AccelerateInterpolator()
        animator.addUpdateListener {
            val progress = it.animatedValue as Float
            particles.forEach { particle -> particle.update(progress) }
            invalidate()

            if (progress >= 1f) {
                particles.clear()
            }
        }
        animator.start()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        particles.forEach { particle ->
            paint.color = particle.color
            paint.alpha = (255 * (1 - particle.progress)).toInt()
            canvas.drawCircle(particle.currentX, particle.currentY, 8f, paint)
        }
    }

    private data class Particle(
        val startX: Float,
        val startY: Float,
        val velocityX: Float,
        val velocityY: Float,
        val color: Int,
        var currentX: Float = startX,
        var currentY: Float = startY,
        var progress: Float = 0f
    ) {
        fun update(progress: Float) {
            this.progress = progress
            currentX = startX + velocityX * progress
            currentY = startY + velocityY * progress
        }
    }
}
