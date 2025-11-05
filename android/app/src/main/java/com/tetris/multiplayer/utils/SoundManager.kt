package com.tetris.multiplayer.utils

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool

class SoundManager(private val context: Context) {
    private val soundPool: SoundPool
    private val sounds = mutableMapOf<String, Int>()
    private var enabled = true

    init {
        val audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_GAME)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()

        soundPool = SoundPool.Builder()
            .setMaxStreams(5)
            .setAudioAttributes(audioAttributes)
            .build()

        // Load sounds from raw resources if they exist
        // For now, we'll use system sounds or implement beep tones
    }

    fun playMove() {
        if (!enabled) return
        // Simple beep for move - can be replaced with actual sound file
        playTone(440, 50)
    }

    fun playRotate() {
        if (!enabled) return
        playTone(550, 50)
    }

    fun playDrop() {
        if (!enabled) return
        playTone(330, 100)
    }

    fun playLineClear(lines: Int) {
        if (!enabled) return
        val frequency = 440 + (lines * 50)
        playTone(frequency, 200)
    }

    fun playCombo(comboCount: Int) {
        if (!enabled) return
        val frequency = 600 + (comboCount * 100)
        playTone(frequency, 300)
    }

    fun playPerfectClear() {
        if (!enabled) return
        playTone(880, 500)
    }

    fun playGameOver() {
        if (!enabled) return
        playTone(220, 400)
    }

    private fun playTone(frequency: Int, duration: Int) {
        // Simple tone generation - in a real app, use actual sound files
        // For now, this is a placeholder
    }

    fun setEnabled(enabled: Boolean) {
        this.enabled = enabled
    }

    fun release() {
        soundPool.release()
    }
}
