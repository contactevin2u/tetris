# Firebase Setup Guide - Step by Step

This guide will walk you through setting up Firebase for the Tetris Multiplayer Android app.

## Table of Contents
1. [Create Firebase Project](#1-create-firebase-project)
2. [Add Android App](#2-add-android-app)
3. [Download Configuration File](#3-download-configuration-file)
4. [Enable Realtime Database](#4-enable-realtime-database)
5. [Enable Firestore](#5-enable-firestore)
6. [Configure Security Rules](#6-configure-security-rules)
7. [Test Your Setup](#7-test-your-setup)

---

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project details:
   - **Project name**: `Tetris Multiplayer` (or your choice)
   - Click **Continue**
4. Google Analytics setup (optional):
   - Toggle OFF if you don't need analytics
   - Or select Google Analytics account if you want it
   - Click **Continue**
5. Wait for project creation (takes ~30 seconds)
6. Click **Continue** when ready

✅ **Success**: You now have a Firebase project!

---

## 2. Add Android App

1. In Firebase Console, click the **Android icon** (</>) to add Android app
2. Fill in the registration form:
   - **Android package name**: `com.tetris.multiplayer`
     - ⚠️ Must match exactly - cannot be changed later!
   - **App nickname**: `Tetris Android` (optional)
   - **Debug signing certificate SHA-1**: Leave blank for now (optional for development)
3. Click **Register app**

✅ **Success**: Your Android app is registered with Firebase!

---

## 3. Download Configuration File

1. Download the `google-services.json` file
   - Click **Download google-services.json**
2. Move the file to your project:
   ```
   tetris/android/app/google-services.json
   ```
3. **IMPORTANT**: Add to `.gitignore` to keep it private:
   ```bash
   echo "android/app/google-services.json" >> .gitignore
   ```
4. Click **Next** → **Next** → **Continue to console**

✅ **Success**: Your app is configured to use Firebase!

---

## 4. Enable Realtime Database

### Create Database

1. In Firebase Console sidebar, click **Realtime Database**
2. Click **Create Database**
3. Choose database location:
   - Recommended: `us-central1` (United States)
   - Or choose location closest to your users
4. Click **Next**

### Set Security Rules

1. Choose **Start in test mode** (for development)
   - ⚠️ Test mode allows all reads/writes - only for development!
2. Click **Enable**

✅ **Success**: Realtime Database is ready!

### Database Structure

Your database will automatically create this structure:
```
gameSession/
  ├── players/
  │   ├── 0: { id: 0, name: "Player 1", connected: true }
  │   ├── 1: { id: 1, name: "Player 2", connected: true }
  │   └── ...
  ├── gameStates/
  │   ├── 0: { grid: [...], score: 100, gameOver: false, ... }
  │   ├── 1: { grid: [...], score: 50, gameOver: false, ... }
  │   └── ...
  └── attacks/
      ├── -NXxxx: { fromPlayerId: 0, garbageLines: 2, timestamp: ... }
      └── ...
```

---

## 5. Enable Firestore

### Create Firestore Database

1. In Firebase Console sidebar, click **Firestore Database**
2. Click **Create database**
3. Choose location:
   - ⚠️ **Must match Realtime Database location** for consistency
   - Example: `us-central1`
4. Click **Next**

### Set Security Rules

1. Choose **Start in test mode** (for development)
   - ⚠️ Test mode allows all reads/writes - only for development!
2. Click **Enable**

✅ **Success**: Firestore is ready!

### Database Structure

Firestore will store leaderboard entries:
```
leaderboard/
  ├── docId1: { playerName: "Alice", score: 500, linesCleared: 50, timestamp: 1234567890 }
  ├── docId2: { playerName: "Bob", score: 300, linesCleared: 30, timestamp: 1234567891 }
  └── ...
```

---

## 6. Configure Security Rules

⚠️ **IMPORTANT**: Update these rules before going to production!

### Realtime Database Rules (Production)

1. Go to **Realtime Database** → **Rules** tab
2. Replace with these production rules:

```json
{
  "rules": {
    "gameSession": {
      ".read": true,
      ".write": true,
      "players": {
        "$playerId": {
          ".validate": "newData.hasChildren(['id', 'name', 'connected']) && newData.child('id').isNumber() && newData.child('name').isString() && newData.child('connected').isBoolean()"
        }
      },
      "gameStates": {
        "$playerId": {
          ".validate": "newData.hasChildren(['grid', 'score', 'gameOver']) && newData.child('score').isNumber() && newData.child('gameOver').isBoolean()"
        }
      },
      "attacks": {
        "$attackId": {
          ".validate": "newData.hasChildren(['fromPlayerId', 'garbageLines', 'timestamp']) && newData.child('fromPlayerId').isNumber() && newData.child('garbageLines').isNumber()"
        }
      }
    }
  }
}
```

3. Click **Publish**

### Firestore Rules (Production)

1. Go to **Firestore Database** → **Rules** tab
2. Replace with these production rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Leaderboard collection
    match /leaderboard/{entry} {
      // Anyone can read leaderboard
      allow read: if true;

      // Only allow creating entries with required fields
      allow create: if request.resource.data.keys().hasAll(['playerName', 'score', 'linesCleared', 'timestamp'])
                    && request.resource.data.score is int
                    && request.resource.data.linesCleared is int
                    && request.resource.data.playerName is string
                    && request.resource.data.timestamp is int
                    && request.resource.data.score >= 0
                    && request.resource.data.score <= 100000
                    && request.resource.data.linesCleared >= 0
                    && request.resource.data.linesCleared <= 1000;

      // Prevent updates and deletes
      allow update, delete: if false;
    }
  }
}
```

3. Click **Publish**

✅ **Success**: Your database is now secure for production!

---

## 7. Test Your Setup

### Verify Configuration

1. **Check google-services.json**:
   ```bash
   ls android/app/google-services.json
   # Should show: android/app/google-services.json
   ```

2. **Check project_id**:
   ```bash
   cat android/app/google-services.json | grep project_id
   # Should show your project ID
   ```

### Build and Test

1. **Sync Gradle**:
   ```bash
   cd android
   ./gradlew build
   ```

2. **Run the app**:
   - Open in Android Studio
   - Click Run
   - Or: `./gradlew installDebug`

3. **Test Firebase connection**:
   - Enter your name when prompted
   - App should connect successfully
   - You should see "Joined as Player X"

4. **Verify in Firebase Console**:
   - Go to **Realtime Database** → **Data** tab
   - You should see `gameSession/players/0` with your data
   - Go to **Firestore Database** → **Data** tab
   - Play a game and submit score
   - You should see entry in `leaderboard` collection

✅ **Success**: Firebase is working correctly!

---

## Troubleshooting

### Issue: Build fails with "google-services.json not found"

**Solution**:
```bash
# Verify file location
ls android/app/google-services.json

# If missing, download from Firebase Console:
# Project Settings → Your apps → google-services.json
```

### Issue: "FirebaseApp initialization unsuccessful"

**Solution**:
1. Check `google-services.json` is in correct location
2. Verify package name matches: `com.tetris.multiplayer`
3. Clean and rebuild:
   ```bash
   ./gradlew clean build
   ```

### Issue: "Permission denied" when writing to database

**Solution**:
1. Check Firebase Console → Realtime Database → Rules
2. Verify rules allow write access (test mode or proper rules)
3. Check internet connection

### Issue: Leaderboard submissions fail

**Solution**:
1. Check Firebase Console → Firestore Database → Rules
2. Verify rules allow create access
3. Check data format matches rules (score/linesCleared are integers)

### Issue: "Database not found" error

**Solution**:
1. Verify you enabled both Realtime Database AND Firestore
2. Check database location matches in both services
3. Try refreshing Firebase Console

---

## Next Steps

1. ✅ Firebase is set up and working
2. 📱 Build and test the app
3. 🎮 Play multiplayer games
4. 🏆 Submit scores to leaderboard
5. 🚀 Deploy to production (update security rules!)

---

## Production Checklist

Before releasing to production:

- [ ] Update Realtime Database rules (remove test mode)
- [ ] Update Firestore rules (remove test mode)
- [ ] Enable App Check for abuse prevention
- [ ] Set up Firebase budget alerts
- [ ] Monitor Firebase usage in console
- [ ] Test multiplayer with multiple devices
- [ ] Test leaderboard submissions
- [ ] Add analytics events (optional)

---

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Realtime Database Guide](https://firebase.google.com/docs/database)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Security Rules Guide](https://firebase.google.com/docs/rules)
- [Firebase Pricing](https://firebase.google.com/pricing)

---

Need help? Check the main README.md or open an issue on GitHub!
