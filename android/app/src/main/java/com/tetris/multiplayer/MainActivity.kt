package com.tetris.multiplayer

import android.app.AlertDialog
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.firebase.FirebaseApp
import com.tetris.multiplayer.databinding.ActivityMainBinding
import com.tetris.multiplayer.databinding.PlayerSmallBinding
import com.tetris.multiplayer.firebase.LeaderboardManager
import com.tetris.multiplayer.firebase.MultiplayerManager
import com.tetris.multiplayer.game.TetrisGame
import com.tetris.multiplayer.models.GameState
import com.tetris.multiplayer.models.TetrominoType
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var player2Binding: PlayerSmallBinding
    private lateinit var player3Binding: PlayerSmallBinding
    private lateinit var player4Binding: PlayerSmallBinding

    private lateinit var myGame: TetrisGame
    private lateinit var multiplayerManager: MultiplayerManager
    private lateinit var leaderboardManager: LeaderboardManager

    private val handler = Handler(Looper.getMainLooper())
    private var gameRunning = false
    private var myPlayerId = -1
    private var playerName = "Player"

    private val gameLoop = object : Runnable {
        override fun run() {
            if (gameRunning && !myGame.getState().gameOver) {
                myGame.move(0, 1)
                handler.postDelayed(this, getDropInterval())
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize Firebase
        try {
            FirebaseApp.initializeApp(this)
        } catch (e: Exception) {
            // Already initialized
        }

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Bind included layouts
        player2Binding = PlayerSmallBinding.bind(binding.player2.root)
        player3Binding = PlayerSmallBinding.bind(binding.player3.root)
        player4Binding = PlayerSmallBinding.bind(binding.player4.root)

        multiplayerManager = MultiplayerManager()
        leaderboardManager = LeaderboardManager()

        initializeGame()
        setupControls()
        setupFirebase()

        promptForName()
    }

    private fun initializeGame() {
        myGame = TetrisGame(
            onStateChanged = { state ->
                runOnUiThread {
                    updateUI(state)
                    if (!myGame.scoreSubmitted) {
                        lifecycleScope.launch {
                            try {
                                multiplayerManager.updateGameState(state)
                            } catch (e: Exception) {
                                // Ignore sync errors
                            }
                        }
                    }
                }
            },
            onLineAttack = { linesCleared, garbageLines ->
                lifecycleScope.launch {
                    try {
                        multiplayerManager.sendLineAttack(linesCleared, garbageLines)
                    } catch (e: Exception) {
                        // Ignore
                    }
                }
            },
            onCombo = { comboCount ->
                runOnUiThread {
                    Toast.makeText(this, "$comboCount x COMBO!", Toast.LENGTH_SHORT).show()
                }
            },
            onPerfectClear = {
                runOnUiThread {
                    Toast.makeText(this, "PERFECT CLEAR! +120", Toast.LENGTH_LONG).show()
                }
            }
        )
    }

    private fun setupControls() {
        binding.btnLeft.setOnClickListener { myGame.move(-1, 0) }
        binding.btnRight.setOnClickListener { myGame.move(1, 0) }
        binding.btnDown.setOnClickListener { myGame.move(0, 1) }
        binding.btnRotate.setOnClickListener { myGame.rotate() }
        binding.btnDrop.setOnClickListener { myGame.hardDrop() }
        binding.btnHold.setOnClickListener { myGame.holdPiece() }

        binding.btnStartGame.setOnClickListener {
            if (!gameRunning) {
                startGame()
            } else {
                stopGame()
            }
        }

        binding.btnLeaderboard.setOnClickListener {
            showLeaderboard()
        }
    }

    private fun setupFirebase() {
        // Observe players
        lifecycleScope.launch {
            multiplayerManager.observePlayers().collect { players ->
                runOnUiThread {
                    binding.tvPlayerCount.text = "Players: ${players.size}/4"

                    // Hide/show player views
                    player2Binding.root.visibility = if (players.any { it.id == 1 }) View.VISIBLE else View.GONE
                    player3Binding.root.visibility = if (players.any { it.id == 2 }) View.VISIBLE else View.GONE
                    player4Binding.root.visibility = if (players.any { it.id == 3 }) View.VISIBLE else View.GONE
                }
            }
        }

        // Observe attacks
        lifecycleScope.launch {
            multiplayerManager.observeAttacks().collect { (fromPlayerId, garbageLines) ->
                runOnUiThread {
                    if (gameRunning && !myGame.getState().gameOver) {
                        myGame.addGarbageLines(garbageLines)
                        Toast.makeText(
                            this@MainActivity,
                            "Attacked by Player ${fromPlayerId + 1}! +$garbageLines lines",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }
        }
    }

    private fun setupGameStateObservers() {
        // Observe other players' game states (called after joining)
        for (i in 0 until 4) {
            if (i != myPlayerId) {
                lifecycleScope.launch {
                    multiplayerManager.observeGameState(i).collect { state ->
                        runOnUiThread {
                            updateOpponentView(i, state)
                        }
                    }
                }
            }
        }
    }

    private fun promptForName() {
        val editText = EditText(this)
        editText.hint = "Enter your name"
        editText.setText("Player")

        AlertDialog.Builder(this)
            .setTitle("Welcome to Tetris!")
            .setMessage("Enter your player name:")
            .setView(editText)
            .setCancelable(false)
            .setPositiveButton("Join Game") { _, _ ->
                playerName = editText.text.toString().ifEmpty { "Player" }
                joinMultiplayerGame()
            }
            .show()
    }

    private fun joinMultiplayerGame() {
        lifecycleScope.launch {
            try {
                myPlayerId = multiplayerManager.joinGame(playerName)
                runOnUiThread {
                    binding.tvPlayer1Name.text = "$playerName (You)"
                    Toast.makeText(
                        this@MainActivity,
                        "Joined as Player ${myPlayerId + 1}",
                        Toast.LENGTH_SHORT
                    ).show()

                    // Setup game state observers after successfully joining
                    setupGameStateObservers()
                }
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(this@MainActivity, e.message, Toast.LENGTH_LONG).show()
                    finish()
                }
            }
        }
    }

    private fun startGame() {
        myGame.reset()
        gameRunning = true
        binding.btnStartGame.text = "Stop Game"
        handler.post(gameLoop)
    }

    private fun stopGame() {
        gameRunning = false
        binding.btnStartGame.text = "Start Game"
        handler.removeCallbacks(gameLoop)

        if (!myGame.scoreSubmitted) {
            showScoreSubmitDialog()
        }
    }

    private fun updateUI(state: GameState) {
        binding.tetrisView1.updateState(state)
        binding.tvScore1.text = "Score: ${state.score}"
        binding.tvLines1.text = "Lines: ${state.linesCleared}"

        // Update preview views
        state.nextPiece?.let { next ->
            val type = TetrominoType.valueOf(next.type)
            binding.nextView1.setTetromino(next.shape, type.color)
        }

        state.heldPiece?.let { held ->
            val type = TetrominoType.valueOf(held.type)
            binding.holdView1.setTetromino(held.shape, type.color)
        }

        if (state.gameOver && gameRunning) {
            stopGame()
            Toast.makeText(this, "Game Over! Score: ${state.score}", Toast.LENGTH_LONG).show()
        }
    }

    private fun updateOpponentView(playerId: Int, state: GameState?) {
        val playerBinding = when (playerId) {
            1 -> player2Binding
            2 -> player3Binding
            3 -> player4Binding
            else -> return
        }

        if (state == null) {
            playerBinding.root.visibility = View.GONE
            return
        }

        playerBinding.root.visibility = View.VISIBLE
        playerBinding.tetrisView.updateState(state)
        playerBinding.tvScore.text = "Score: ${state.score}"
        playerBinding.tvPlayerName.text = "Player ${playerId + 1}"
    }

    private fun showScoreSubmitDialog() {
        val state = myGame.getState()
        if (state.score == 0) return

        AlertDialog.Builder(this)
            .setTitle("Game Over!")
            .setMessage("Your score: ${state.score}\nSubmit to leaderboard?")
            .setPositiveButton("Submit") { _, _ ->
                submitScore(state.score, state.linesCleared)
            }
            .setNegativeButton("Skip", null)
            .show()
    }

    private fun submitScore(score: Int, linesCleared: Int) {
        lifecycleScope.launch {
            try {
                leaderboardManager.submitScore(playerName, score, linesCleared)
                myGame.scoreSubmitted = true
                runOnUiThread {
                    Toast.makeText(
                        this@MainActivity,
                        "Score submitted successfully!",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(
                        this@MainActivity,
                        "Failed to submit score: ${e.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
    }

    private fun showLeaderboard() {
        lifecycleScope.launch {
            try {
                val entries = leaderboardManager.getTopScores(10)
                val message = entries.mapIndexed { index, entry ->
                    "${index + 1}. ${entry.playerName}: ${entry.score} (${entry.linesCleared} lines)"
                }.joinToString("\n")

                runOnUiThread {
                    AlertDialog.Builder(this@MainActivity)
                        .setTitle("Top 10 Leaderboard")
                        .setMessage(message.ifEmpty { "No scores yet!" })
                        .setPositiveButton("OK", null)
                        .show()
                }
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(
                        this@MainActivity,
                        "Failed to load leaderboard: ${e.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
    }

    private fun getDropInterval(): Long {
        val level = myGame.getState().linesCleared / 10
        return maxOf(100L, 1000L - (level * 50L))
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(gameLoop)
        multiplayerManager.leaveGame()
    }
}
