# Debugging the Tetris Android App

## Viewing Crash Logs in Android Studio

The app now includes comprehensive logging to help identify issues. Follow these steps to view the logs:

### 1. Open Logcat in Android Studio

1. Run the app from Android Studio (click the green "Run" button or press Shift+F10)
2. At the bottom of Android Studio, click the **Logcat** tab
3. The Logcat window will show real-time logs from your app

### 2. Filter Logs by Tag

To see only Tetris app logs:

1. In the Logcat search box at the top, type: `tag:TetrisMultiplayer`
2. This will filter to show only logs from our app

### 3. Understanding the Log Output

The app logs every major initialization step. You should see:

```
D/TetrisMultiplayer: onCreate started
D/TetrisMultiplayer: Firebase initialized successfully
D/TetrisMultiplayer: View binding completed
D/TetrisMultiplayer: Player bindings completed
D/TetrisMultiplayer: Firebase managers initialized
D/TetrisMultiplayer: Game initialized
D/TetrisMultiplayer: Controls setup completed
D/TetrisMultiplayer: Firebase setup completed
D/TetrisMultiplayer: Name prompt displayed
```

### 4. Identifying the Crash Point

If the app crashes, look for:
- **The last successful log message** - this tells you what completed before the crash
- **Red error messages (E/)** - these show the exact error and stack trace
- **Exception messages** - look for lines starting with `E/TetrisMultiplayer: Error in onCreate:` or similar

### 5. Common Issues and Solutions

#### Issue: "DatabaseException: Can't determine Firebase Database URL"

**Solution:** Make sure you have enabled Firebase Realtime Database in the Firebase Console:
1. Go to https://console.firebase.google.com/
2. Select your project "tetris-1f53c"
3. In the left menu, click "Build" → "Realtime Database"
4. Click "Create Database"
5. Choose a location (e.g., us-central1)
6. Start in **test mode** for now (we'll secure it later)
7. The database URL will be created (e.g., https://tetris-1f53c-default-rtdb.firebaseio.com)

#### Issue: "Permission denied" on Firebase

**Solution:** Set Firebase Realtime Database rules to allow read/write:
1. Go to Firebase Console → Realtime Database → Rules
2. Set rules to (for testing):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**Important:** These are insecure test rules. For production, use proper authentication.

#### Issue: "No network connection"

**Solution:** Make sure the emulator/device has internet access:
- For emulator: Check that your computer has internet
- For physical device: Check WiFi/mobile data is enabled

#### Issue: ViewBinding errors

If you see errors about views not being found, check that:
1. All layout XML files are properly formatted
2. View IDs match between XML and Kotlin code
3. Clean and rebuild: Build → Clean Project, then Build → Rebuild Project

### 6. Export Logs

To share logs for debugging:

1. In Logcat, right-click anywhere in the log output
2. Select "Copy" or "Save As"
3. Share the log file or paste the relevant section

### 7. Stack Trace Analysis

If you see a crash stack trace like:
```
E/AndroidRuntime: FATAL EXCEPTION: main
    Process: com.tetris.multiplayer, PID: 12345
    java.lang.RuntimeException: Unable to start activity
        at android.app.ActivityThread.performLaunchActivity(...)
        ...
```

Look for:
- The exception type (e.g., `NullPointerException`, `DatabaseException`)
- The line number in our code (e.g., `MainActivity.kt:85`)
- The error message describing what went wrong

## Firebase Console Access

To check Firebase backend:

1. Go to https://console.firebase.google.com/
2. Select project: **tetris-1f53c**
3. Check:
   - **Realtime Database**: See player data, game states
   - **Firestore**: See leaderboard entries
   - **Authentication**: (optional) if you add user auth later

## Testing Checklist

Before running, verify:

- ✅ Firebase project "tetris-1f53c" exists
- ✅ Realtime Database is created and enabled
- ✅ Firestore is created and enabled
- ✅ google-services.json is in android/app/ directory
- ✅ Internet permission is in AndroidManifest.xml
- ✅ Device/emulator has internet connection

## Need More Help?

If the app still crashes after checking logs:

1. Copy the full stack trace from Logcat
2. Note which log message was the last to appear
3. Check Firebase Console for any errors
4. Verify Firebase Realtime Database and Firestore are both enabled
