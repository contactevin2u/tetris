# Android Studio Setup Guide - Quick Start

Complete guide to install Android Studio and build the Tetris Multiplayer app.

---

## Step 1: Install Android Studio

### Download Android Studio

1. Go to: **https://developer.android.com/studio**
2. Click **"Download Android Studio"**
3. Accept the terms and conditions
4. Download will start automatically (~1 GB)

### System Requirements

- **Windows**: Windows 10/11 (64-bit)
- **RAM**: 8 GB minimum (16 GB recommended)
- **Disk Space**: 8 GB minimum free space
- **Screen Resolution**: 1280 x 800 minimum

### Install Android Studio

**Windows:**
1. Run the downloaded `.exe` file
2. Follow the installation wizard
3. Select **"Standard"** installation type (recommended)
4. This will install:
   - Android Studio IDE
   - Android SDK (Software Development Kit)
   - Android SDK Platform
   - Android Virtual Device (Emulator)
   - **JDK 17** (Java Development Kit - bundled!)

5. Click **"Next"** → **"Next"** → **"Finish"**
6. Wait for initial setup and component downloads (~2-3 GB)
7. Click **"Finish"** when complete

✅ **Android Studio is now installed!**

---

## Step 2: Open the Tetris Project

### Launch Android Studio

1. **Start Android Studio** (from Start Menu or Desktop)
2. If you see "Welcome to Android Studio" screen, click **"Open"**
3. If you have a project open, go to **File → Close Project** first

### Open the Project

1. Click **"Open"** on the Welcome screen
2. Navigate to your project folder:
   ```
   C:\Users\User\Documents\funappbuilding\tetris\android
   ```
3. Select the **`android`** folder
4. Click **"OK"**

### Trust the Project

- If prompted "Trust and Open Project?", click **"Trust Project"**

### Initial Sync

Android Studio will automatically:
- ✅ Detect the Gradle build system
- ✅ Download Gradle 8.1.1 (if needed)
- ✅ Download all dependencies (Firebase, AndroidX, etc.)
- ✅ Configure the project

**Progress indicators:**
- Watch the bottom status bar for sync progress
- First sync takes 3-10 minutes depending on internet speed
- You'll see: "Gradle sync in progress..."

✅ **Wait for "Gradle sync finished" message**

---

## Step 3: Add Firebase Configuration

### Download google-services.json

**You already have this!** ✅
- Location: `android/app/google-services.json`
- Project: `tetris-1f53c`

If you need to download it again:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **tetris-1f53c**
3. Click gear icon → **Project settings**
4. Scroll to **Your apps** section
5. Under your Android app, click **"Download google-services.json"**
6. Place file in: `android/app/google-services.json`

### Verify Configuration

In Android Studio:
1. **Project view** (left sidebar)
2. Navigate to: **app → google-services.json**
3. File should be visible ✅

---

## Step 4: Sync Gradle (If Needed)

If sync didn't happen automatically:

1. **File → Sync Project with Gradle Files**
2. Or click the **🐘 Sync** button in toolbar
3. Or banner at top: **"Gradle files have changed"** → **"Sync Now"**

**During sync, Android Studio downloads:**
- Firebase BoM 34.5.0
- Firebase Realtime Database
- Firebase Firestore
- Firebase Authentication
- Firebase Analytics
- Kotlin libraries
- AndroidX libraries
- All other dependencies

**Check sync status:**
- Bottom bar shows: "Gradle sync in progress..."
- When done: "Gradle build finished" ✅

---

## Step 5: Build the Project

### Build Options

**Option A: Build from Menu**
1. **Build → Make Project**
2. Or press: **Ctrl + F9** (Windows)
3. Watch the **Build** tab at bottom for progress

**Option B: Build from Toolbar**
1. Click the **🔨 Build** icon (hammer) in toolbar

### Build Output

```
BUILD SUCCESSFUL in 1m 23s
54 actionable tasks: 54 executed
```

✅ **Build successful!**

### If Build Fails

**Common errors:**

**Error: "SDK location not found"**
- Solution: **File → Project Structure → SDK Location**
- Set Android SDK location (usually auto-detected)

**Error: "Failed to download..."**
- Solution: Check internet connection
- Retry: **Build → Clean Project**, then **Build → Rebuild Project**

**Error: "Unsupported Java version"**
- Solution: **File → Settings → Build, Execution, Deployment → Build Tools → Gradle**
- Set **Gradle JDK** to: **"Embedded JDK version 17"**

---

## Step 6: Run the App

### Option A: Run on Emulator (Virtual Device)

#### Create an Emulator

1. **Tools → Device Manager** (or click 📱 icon in toolbar)
2. Click **"Create Device"**
3. Select a phone:
   - Recommended: **Pixel 5** or **Pixel 6**
4. Click **"Next"**
5. Select a system image:
   - Recommended: **Android 14 (API 34)** or **Android 13 (API 33)**
   - Click **"Download"** next to the version (if needed)
   - Wait for download (~1 GB)
6. Click **"Next"**
7. Give it a name (e.g., "Pixel 5 API 34")
8. Click **"Finish"**

#### Run on Emulator

1. Select your emulator from the device dropdown (top toolbar)
2. Click the **▶ Run** button (green play icon)
3. Or press: **Shift + F10**

**Emulator will:**
- Launch (takes 30-60 seconds first time)
- Install the app
- Start the app automatically

✅ **App running on emulator!**

### Option B: Run on Physical Device

#### Enable USB Debugging on Your Phone

**Android Device:**
1. Go to **Settings → About phone**
2. Tap **"Build number"** 7 times (enables Developer mode)
3. Go back to **Settings → System → Developer options**
4. Enable **"USB debugging"**
5. Connect phone to PC via USB cable

**Trust the Computer:**
- Popup on phone: "Allow USB debugging?" → **"Allow"**

#### Run on Device

1. Select your device from dropdown (top toolbar)
2. Click the **▶ Run** button
3. App installs and launches on your phone

✅ **App running on physical device!**

---

## Step 7: Test the App

### First Launch

1. **App prompts for name**: Enter your player name (e.g., "Player1")
2. Click **"Join Game"**
3. You'll see: "Joined as Player 1" (or 2/3/4 if others are connected)

### Test Multiplayer (Needs Firebase)

**Make sure Firebase is set up:**
- Realtime Database: Enabled ✅
- Firestore: Enabled ✅
- Security rules: Test mode (for development) ✅

### Test Game Controls

- **← → buttons**: Move piece left/right
- **↻ button**: Rotate piece
- **↓ button**: Soft drop (faster)
- **DROP button**: Hard drop (instant)
- **HOLD button**: Hold current piece

### Test Leaderboard

1. Play a game
2. Get a score (clear some lines)
3. Click **"Stop Game"** or let game end
4. Submit score when prompted
5. Click **"Leaderboard"** to view top scores

---

## Step 8: Debug (Optional)

### Enable Debugging

1. Set breakpoints: Click left margin next to code line
2. Click **🐞 Debug** button (instead of Run)
3. Or press: **Shift + F9**

### View Logs

1. **View → Tool Windows → Logcat**
2. Filter by tag: "TetrisGame", "MainActivity", etc.
3. Watch Firebase connection logs

### Firebase Console

Monitor real-time data:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **tetris-1f53c** project
3. **Realtime Database → Data**: See live player data
4. **Firestore Database → Data**: See leaderboard entries
5. **Analytics → Events**: See app usage (if analytics enabled)

---

## Troubleshooting

### Gradle Sync Failed

**Solution 1: Check Internet**
- Gradle downloads ~500 MB of dependencies
- Ensure stable connection

**Solution 2: Invalidate Caches**
1. **File → Invalidate Caches / Restart**
2. Select **"Invalidate and Restart"**
3. Wait for restart and re-sync

**Solution 3: Clean Build**
1. **Build → Clean Project**
2. **Build → Rebuild Project**

### Emulator Won't Start

**Solution 1: Enable Virtualization**
- Windows: Enable **Hyper-V** or **HAXM** in BIOS
- Check: **Tools → SDK Manager → SDK Tools → Intel x86 Emulator Accelerator**

**Solution 2: Use ARM Emulator**
- Create new emulator with **ARM-based system image** instead of x86

**Solution 3: Increase RAM**
- Edit emulator: **Tools → Device Manager → Edit** (pencil icon)
- Increase RAM to 2048 MB or more

### App Crashes on Launch

**Check Logcat:**
1. **View → Tool Windows → Logcat**
2. Filter: Show only "Error"
3. Look for stack traces

**Common causes:**
- Missing Firebase config: Check `google-services.json` exists
- Firebase not enabled: Enable Realtime Database + Firestore
- No internet: Emulator/device needs internet for Firebase

### Build Takes Too Long

**Speed up builds:**
1. **File → Settings → Build, Execution, Deployment → Compiler**
2. Enable: **"Compile independent modules in parallel"**
3. Set **"Command-line Options"**: `--parallel --max-workers=4`

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Build project | Ctrl + F9 |
| Run app | Shift + F10 |
| Debug app | Shift + F9 |
| Stop app | Ctrl + F2 |
| Sync Gradle | Ctrl + Shift + O |
| Find file | Ctrl + Shift + N |
| Search everywhere | Double Shift |
| Auto-format code | Ctrl + Alt + L |

---

## Next Steps

### Development Workflow

1. **Edit code** in Android Studio
2. **Hot reload** (if using Jetpack Compose - not applicable here)
3. **Build → Make Project** to compile changes
4. **Run** to install on device/emulator
5. **Test** multiplayer with multiple devices

### Test Multiplayer

**Multiple Emulators:**
1. Create 2-4 emulators in Device Manager
2. Run app on each emulator (Run → Select Device → Run)
3. Each will join as different player
4. Test real-time sync and attacks

**Emulator + Physical Device:**
1. Run on emulator
2. Run on phone simultaneously
3. Both connect to same Firebase project
4. Test gameplay and leaderboard

### Release Build

When ready to publish:
1. Generate signing key
2. Configure signing in `build.gradle`
3. **Build → Generate Signed Bundle / APK**
4. Upload to Google Play Console

---

## Resources

- **Android Studio Docs**: https://developer.android.com/studio/intro
- **Firebase Android Setup**: https://firebase.google.com/docs/android/setup
- **Kotlin Docs**: https://kotlinlang.org/docs/home.html
- **Android Developer Guide**: https://developer.android.com/guide

---

## Summary Checklist

- [x] Install Android Studio (with bundled JDK 17)
- [x] Open `android/` project folder
- [x] Wait for Gradle sync to complete
- [x] Verify `google-services.json` is in `app/` folder
- [x] Build the project (Build → Make Project)
- [x] Create emulator or connect device
- [x] Run the app (▶ Run button)
- [x] Test game controls and features
- [x] Test multiplayer and leaderboard
- [x] Monitor Firebase Console for live data

---

**Congratulations! Your Android Tetris app is running! 🎮🔥**

Need help? Check the main `README.md` or `FIREBASE_SETUP.md` for more details!
