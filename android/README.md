# Tetris Multiplayer - Android App 🎮

A real-time multiplayer Tetris game for Android built with Kotlin, Gradle, and Firebase. Supports up to 4 players simultaneously with cloud sync and global leaderboard!

![Android](https://img.shields.io/badge/Platform-Android-green) ![Kotlin](https://img.shields.io/badge/Language-Kotlin-blue) ![Firebase](https://img.shields.io/badge/Backend-Firebase-orange)

## Features

- **Real-time Multiplayer**: Up to 4 players via Firebase Realtime Database
- **Global Leaderboard**: Cloud-based leaderboard using Firebase Firestore
- **Classic Tetris**: All 7 tetromino shapes with proper mechanics
- **Attack System**: Send garbage lines to opponents when clearing multiple lines
- **Combo System**: Build combos for bonus points
- **Perfect Clear**: Earn 120 bonus points for clearing the entire board
- **Hold & Preview**: Hold pieces and preview next piece
- **Responsive UI**: Touch controls optimized for mobile
- **Modern Architecture**: MVVM pattern with Kotlin Coroutines

## Tech Stack

- **Language**: Kotlin 1.9.20
- **Build System**: Gradle 8.1.4
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 34 (Android 14)
- **Backend**: Firebase
  - Realtime Database (multiplayer sync)
  - Firestore (leaderboard)
  - Analytics (optional)

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Enter project name: "Tetris Multiplayer" (or your choice)
4. Disable Google Analytics (optional) or configure it
5. Click "Create project"

### 2. Add Android App to Firebase

1. In Firebase Console, click the Android icon
2. Enter package name: `com.tetris.multiplayer`
3. App nickname: "Tetris Android" (optional)
4. Debug signing certificate SHA-1 (optional for development)
5. Click "Register app"

### 3. Download google-services.json

1. Download the `google-services.json` file
2. Place it in `android/app/` directory
3. **IMPORTANT**: Add `google-services.json` to `.gitignore`

```bash
# Add to .gitignore
android/app/google-services.json
```

### 4. Enable Firebase Services

#### Enable Realtime Database

1. In Firebase Console, go to "Realtime Database"
2. Click "Create Database"
3. Choose location (e.g., us-central1)
4. Start in **test mode** (for development)
5. Security Rules for production:

```json
{
  "rules": {
    "gameSession": {
      ".read": true,
      ".write": true,
      "players": {
        "$playerId": {
          ".validate": "newData.hasChildren(['id', 'name', 'connected'])"
        }
      },
      "gameStates": {
        "$playerId": {
          ".validate": "newData.hasChildren(['grid', 'score', 'gameOver'])"
        }
      },
      "attacks": {
        "$attackId": {
          ".validate": "newData.hasChildren(['fromPlayerId', 'garbageLines', 'timestamp'])"
        }
      }
    }
  }
}
```

#### Enable Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in **test mode** (for development)
4. Choose location (same as Realtime Database)
5. Security Rules for production:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{entry} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasAll(['playerName', 'score', 'linesCleared', 'timestamp'])
                    && request.resource.data.score is int
                    && request.resource.data.linesCleared is int;
      allow update, delete: if false;
    }
  }
}
```

### 5. Enable Firebase Analytics (Optional)

1. In Firebase Console, go to "Analytics"
2. Click "Enable Analytics"
3. Follow the setup wizard

## Build & Run

### Prerequisites

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17 or later
- Android SDK 34
- Physical device or emulator running Android 7.0+

### Build Steps

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd tetris/android
   ```

2. **Add google-services.json**:
   - Download from Firebase Console
   - Place in `android/app/` directory

3. **Open in Android Studio**:
   ```bash
   # Open the 'android' folder in Android Studio
   ```

4. **Sync Gradle**:
   - Android Studio will automatically sync
   - Or click "Sync Now" if prompted

5. **Build the project**:
   ```bash
   ./gradlew build
   ```

6. **Run on device/emulator**:
   - Click "Run" in Android Studio
   - Or use command line:
   ```bash
   ./gradlew installDebug
   ```

### Build APK

```bash
# Debug APK
./gradlew assembleDebug

# Release APK (requires signing config)
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/`

## Project Structure

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/tetris/multiplayer/
│   │   │   ├── models/           # Data classes
│   │   │   │   ├── GameState.kt
│   │   │   │   └── TetrominoShape.kt
│   │   │   ├── game/             # Game logic
│   │   │   │   └── TetrisGame.kt
│   │   │   ├── ui/               # Views
│   │   │   │   └── TetrisView.kt
│   │   │   ├── firebase/         # Firebase managers
│   │   │   │   ├── MultiplayerManager.kt
│   │   │   │   └── LeaderboardManager.kt
│   │   │   ├── utils/            # Utilities
│   │   │   │   ├── SoundManager.kt
│   │   │   │   └── ParticleEffect.kt
│   │   │   └── MainActivity.kt
│   │   ├── res/
│   │   │   ├── layout/
│   │   │   │   ├── activity_main.xml
│   │   │   │   └── player_small.xml
│   │   │   └── values/
│   │   │       ├── strings.xml
│   │   │       ├── colors.xml
│   │   │       └── themes.xml
│   │   └── AndroidManifest.xml
│   ├── build.gradle
│   └── google-services.json      # Add this file!
├── build.gradle
├── settings.gradle
└── gradle.properties
```

## Game Controls

| Control | Action |
|---------|--------|
| ← Button | Move left |
| → Button | Move right |
| ↓ Button | Soft drop (faster) |
| ↻ Button | Rotate piece |
| DROP | Hard drop (instant) |
| HOLD | Hold current piece |

## Scoring System

- **1 line**: 10 points
- **2 lines**: 20 points
- **3+ lines**: 50 points + 20% cumulative combo bonus
- **Perfect Clear**: +120 bonus points
- **Combo**: Build combos by clearing 3+ lines consecutively

## Attack System

When clearing lines, garbage lines are sent to opponents:
- **2 lines**: 1 garbage line
- **3 lines**: 2 garbage lines
- **4 lines (Tetris)**: 4 garbage lines
- **Perfect Clear**: +4 extra garbage lines

## Development

### Adding New Features

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test on emulator and physical device
4. Submit pull request

### Testing

```bash
# Run unit tests
./gradlew test

# Run instrumented tests
./gradlew connectedAndroidTest
```

### Debugging

1. Enable USB debugging on Android device
2. Connect device via USB
3. Run app from Android Studio
4. View logs in Logcat

## Troubleshooting

### Build Errors

**Error: google-services.json not found**
- Download from Firebase Console
- Place in `android/app/` directory

**Error: Gradle sync failed**
- Check internet connection
- Update Gradle: `./gradlew wrapper --gradle-version=8.1.4`
- Invalidate caches: File → Invalidate Caches / Restart

**Error: SDK not found**
- Set ANDROID_HOME environment variable
- Install Android SDK via Android Studio

### Runtime Errors

**Firebase connection failed**
- Check internet connection
- Verify `google-services.json` is correct
- Enable Realtime Database and Firestore in Firebase Console

**Game lag or stuttering**
- Close background apps
- Test on physical device (emulator may be slow)
- Reduce particle effects

**Multiplayer not syncing**
- Check Firebase Realtime Database rules
- Verify network connectivity
- Check Logcat for errors

## Release Build

### 1. Generate Signing Key

```bash
keytool -genkey -v -keystore tetris-release.keystore -alias tetris -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configure Signing

Add to `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('tetris-release.keystore')
            storePassword 'your_password'
            keyAlias 'tetris'
            keyPassword 'your_password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Build Release APK

```bash
./gradlew assembleRelease
```

### 4. Publish to Google Play

1. Create Google Play Developer account
2. Create new app in Play Console
3. Upload APK or App Bundle
4. Complete store listing
5. Submit for review

## Firebase Costs

Firebase offers generous free tier:
- **Realtime Database**: 1GB stored, 10GB/month downloaded
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Analytics**: Free unlimited

For production, monitor usage in Firebase Console.

## Security Best Practices

1. **Never commit**:
   - `google-services.json`
   - Keystore files
   - Passwords

2. **Update Firebase rules** for production (see Firebase Setup section)

3. **Enable App Check** to prevent abuse:
   - Go to Firebase Console → App Check
   - Register your app
   - Add SafetyNet provider

4. **Rate limiting**: Implement server-side rate limiting for leaderboard submissions

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Follow Kotlin coding conventions
4. Add tests for new features
5. Submit pull request

## License

MIT License - see ../LICENSE file

## Credits

Built with ❤️ using Kotlin, Firebase, and Android Jetpack

## Support

For issues or questions:
- Open an issue on GitHub
- Check Firebase documentation
- Review Android developer guides

---

**Ready to play?** Follow the Firebase Setup guide and build the app!
