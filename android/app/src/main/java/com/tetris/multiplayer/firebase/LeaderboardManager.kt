package com.tetris.multiplayer.firebase

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.tetris.multiplayer.models.LeaderboardEntry
import kotlinx.coroutines.tasks.await

class LeaderboardManager {
    private val firestore: FirebaseFirestore = Firebase.firestore
    private val leaderboardCollection = firestore.collection("leaderboard")

    suspend fun submitScore(playerName: String, score: Int, linesCleared: Int): LeaderboardEntry {
        val entry = LeaderboardEntry(
            playerName = playerName,
            score = score,
            linesCleared = linesCleared,
            timestamp = System.currentTimeMillis()
        )

        val docRef = leaderboardCollection.add(entry).await()
        return entry.copy(id = docRef.id)
    }

    suspend fun getTopScores(limit: Int = 100): List<LeaderboardEntry> {
        val snapshot = leaderboardCollection
            .orderBy("score", Query.Direction.DESCENDING)
            .limit(limit.toLong())
            .get()
            .await()

        return snapshot.documents.mapNotNull { doc ->
            try {
                LeaderboardEntry(
                    id = doc.id,
                    playerName = doc.getString("playerName") ?: "Unknown",
                    score = doc.getLong("score")?.toInt() ?: 0,
                    linesCleared = doc.getLong("linesCleared")?.toInt() ?: 0,
                    timestamp = doc.getLong("timestamp") ?: 0L
                )
            } catch (e: Exception) {
                null
            }
        }
    }

    suspend fun getPlayerRank(score: Int): Int {
        val snapshot = leaderboardCollection
            .whereGreaterThan("score", score)
            .get()
            .await()

        return snapshot.size() + 1
    }
}
