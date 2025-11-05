package com.tetris.multiplayer.firebase

import com.google.firebase.database.*
import com.google.firebase.database.ktx.database
import com.google.firebase.ktx.Firebase
import com.tetris.multiplayer.models.GameState
import com.tetris.multiplayer.models.PlayerInfo
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow

class MultiplayerManager {
    private val database: DatabaseReference = Firebase.database.reference
    private val gameSessionRef = database.child("gameSession")
    private val playersRef = gameSessionRef.child("players")
    private val gameStateRef = gameSessionRef.child("gameStates")
    private val attacksRef = gameSessionRef.child("attacks")

    private var myPlayerId: Int = -1
    private var playerName: String = "Player"

    suspend fun joinGame(playerName: String): Int {
        this.playerName = playerName

        // Find available player slot (0-3)
        val snapshot = playersRef.get().await()
        val occupiedSlots = mutableSetOf<Int>()

        snapshot.children.forEach { child ->
            val id = child.child("id").getValue(Int::class.java)
            if (id != null) {
                occupiedSlots.add(id)
            }
        }

        for (i in 0 until 4) {
            if (i !in occupiedSlots) {
                myPlayerId = i
                break
            }
        }

        if (myPlayerId == -1) {
            throw IllegalStateException("Game is full (4 players max)")
        }

        // Register player
        val playerData = mapOf(
            "id" to myPlayerId,
            "name" to playerName,
            "connected" to true
        )
        playersRef.child(myPlayerId.toString()).setValue(playerData).await()

        return myPlayerId
    }

    fun leaveGame() {
        if (myPlayerId >= 0) {
            playersRef.child(myPlayerId.toString()).removeValue()
            myPlayerId = -1
        }
    }

    fun observePlayers(): Flow<List<PlayerInfo>> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val players = mutableListOf<PlayerInfo>()
                snapshot.children.forEach { child ->
                    val id = child.child("id").getValue(Int::class.java) ?: return@forEach
                    val name = child.child("name").getValue(String::class.java) ?: "Player"
                    val connected = child.child("connected").getValue(Boolean::class.java) ?: false
                    players.add(PlayerInfo(id, name, connected))
                }
                trySend(players)
            }

            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }

        playersRef.addValueEventListener(listener)

        awaitClose {
            playersRef.removeEventListener(listener)
        }
    }

    suspend fun updateGameState(state: GameState) {
        if (myPlayerId >= 0) {
            val stateMap = mapOf(
                "grid" to state.grid.map { it.toList() },
                "score" to state.score,
                "linesCleared" to state.linesCleared,
                "gameOver" to state.gameOver,
                "currentPiece" to state.currentPiece?.let {
                    mapOf(
                        "type" to it.type,
                        "shape" to it.shape.map { row -> row.toList() },
                        "x" to it.x,
                        "y" to it.y
                    )
                },
                "nextPiece" to state.nextPiece?.let {
                    mapOf(
                        "type" to it.type,
                        "shape" to it.shape.map { row -> row.toList() },
                        "x" to it.x,
                        "y" to it.y
                    )
                },
                "heldPiece" to state.heldPiece?.let {
                    mapOf(
                        "type" to it.type,
                        "shape" to it.shape.map { row -> row.toList() },
                        "x" to it.x,
                        "y" to it.y
                    )
                },
                "comboCount" to state.comboCount
            )
            gameStateRef.child(myPlayerId.toString()).setValue(stateMap).await()
        }
    }

    fun observeGameState(playerId: Int): Flow<GameState?> = callbackFlow {
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                if (!snapshot.exists()) {
                    trySend(null)
                    return
                }

                try {
                    val grid = (snapshot.child("grid").value as? List<*>)?.map { row ->
                        (row as? List<*>)?.map { (it as? Long)?.toInt() ?: 0 }?.toIntArray() ?: intArrayOf()
                    }?.toTypedArray() ?: Array(20) { IntArray(10) }

                    val score = (snapshot.child("score").value as? Long)?.toInt() ?: 0
                    val linesCleared = (snapshot.child("linesCleared").value as? Long)?.toInt() ?: 0
                    val gameOver = snapshot.child("gameOver").value as? Boolean ?: false
                    val comboCount = (snapshot.child("comboCount").value as? Long)?.toInt() ?: 0

                    val state = GameState(
                        grid = grid,
                        score = score,
                        linesCleared = linesCleared,
                        gameOver = gameOver,
                        comboCount = comboCount
                    )

                    trySend(state)
                } catch (e: Exception) {
                    trySend(null)
                }
            }

            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }

        gameStateRef.child(playerId.toString()).addValueEventListener(listener)

        awaitClose {
            gameStateRef.child(playerId.toString()).removeEventListener(listener)
        }
    }

    suspend fun sendLineAttack(linesCleared: Int, garbageLines: Int) {
        if (myPlayerId >= 0) {
            val attackData = mapOf(
                "fromPlayerId" to myPlayerId,
                "linesCleared" to linesCleared,
                "garbageLines" to garbageLines,
                "timestamp" to ServerValue.TIMESTAMP
            )
            attacksRef.push().setValue(attackData).await()
        }
    }

    fun observeAttacks(): Flow<Pair<Int, Int>> = callbackFlow {
        val listener = object : ChildEventListener {
            override fun onChildAdded(snapshot: DataSnapshot, previousChildName: String?) {
                val fromPlayerId = (snapshot.child("fromPlayerId").value as? Long)?.toInt() ?: return
                if (fromPlayerId == myPlayerId) return // Don't attack yourself

                val garbageLines = (snapshot.child("garbageLines").value as? Long)?.toInt() ?: 0
                trySend(Pair(fromPlayerId, garbageLines))

                // Remove the attack after processing
                snapshot.ref.removeValue()
            }

            override fun onChildChanged(snapshot: DataSnapshot, previousChildName: String?) {}
            override fun onChildRemoved(snapshot: DataSnapshot) {}
            override fun onChildMoved(snapshot: DataSnapshot, previousChildName: String?) {}
            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }

        attacksRef.addChildEventListener(listener)

        awaitClose {
            attacksRef.removeEventListener(listener)
        }
    }

    private suspend fun <T> com.google.android.gms.tasks.Task<T>.await(): T {
        return kotlinx.coroutines.tasks.await(this)
    }
}
