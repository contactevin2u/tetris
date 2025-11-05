# Quick Start: Publish to Play Store

This is a condensed version of PLAYSTORE_RELEASE.md. Follow these steps in order.

## 1. Create App Icon (5 minutes)

**Easiest method - Use Android Studio:**
1. In Android Studio, right-click `app/src/main/res`
2. Select `New` → `Image Asset`
3. Choose `Launcher Icons (Adaptive and Legacy)`
4. Either:
   - **Upload your 512x512 image** (PNG with transparent background), OR
   - **Use Clipart** → Choose a shape/icon → Pick a color
5. Adjust padding if needed
6. Click `Next` → `Finish`
7. Done! Icons automatically added to your project.

**Alternative - Online tool:**
- Visit: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
- Upload image or use text
- Download and extract to `app/src/main/res/`

## 2. Create Signing Key (2 minutes)

**Open terminal in `android/` folder and run:**

```bash
keytool -genkey -v -keystore tetris-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias tetris-release
```

**When prompted, enter:**
- Password: (choose a strong password - REMEMBER THIS!)
- Name: Your Name
- Organization: Your Company (or leave blank)
- City, State, Country: (fill in or leave blank)

**⚠️ CRITICAL:** Backup `tetris-release-key.jks` file! Store it safely. Without it, you can't update your app.

## 3. Configure Keystore (1 minute)

1. Copy `keystore.properties.template` to `keystore.properties`
2. Edit `keystore.properties` with your values:
   ```properties
   storePassword=your_password_from_step_2
   keyPassword=your_password_from_step_2
   keyAlias=tetris-release
   storeFile=tetris-release-key.jks
   ```

## 4. Build Release AAB (2 minutes)

```bash
cd android
./gradlew.bat bundleRelease
```

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

✅ If successful, you'll see "BUILD SUCCESSFUL"

## 5. Create Google Play Account (10 minutes)

1. Go to https://play.google.com/console
2. Sign in with Google account
3. Pay $25 one-time fee
4. Complete registration

## 6. Create App Listing (20 minutes)

### Basic Info
- **App name:** Tetris Multiplayer
- **Short description:**
  ```
  4-player online Tetris! Compete in real-time with attack mechanics & combos.
  ```

### Screenshots (Need at least 2)
**How to take screenshots:**
1. Run app in Android Studio emulator
2. Play the game
3. Click camera icon in emulator toolbar
4. Screenshots saved automatically

**Upload to Play Console:**
- Minimum 2 screenshots
- Show gameplay, multiplayer, leaderboard

### Graphics
- **App icon:** 512x512 (upload the one you created)
- **Feature graphic:** 1024x500 (optional but recommended)
  - Can create in Canva or Figma
  - Show game logo or gameplay scene

### Full Description
```
Experience classic Tetris with modern multiplayer features!

🎮 FEATURES:
• Real-time 4-player multiplayer
• Attack opponents with line clears
• Combo system for massive scores
• Perfect clear bonuses
• Hold piece mechanic
• Global leaderboard
• Smooth touch controls

🔥 GAMEPLAY:
Compete against up to 3 other players simultaneously! Clear lines to send garbage blocks to your opponents. Build combos for extra attacks and aim for the perfect clear bonus.

⚡ CLASSIC MECHANICS:
• 7 tetromino pieces
• Progressive speed increase
• Ghost piece preview
• Next piece preview
• Hold piece system

🏆 COMPETITIVE:
Submit your high scores to the global leaderboard!

Perfect for both casual players and Tetris veterans!
```

### Category
- **Category:** Games → Puzzle
- **Tags:** tetris, puzzle, multiplayer, arcade

## 7. Complete Requirements

### Content Rating
1. Go to **Policy** → **App content** → **Content rating**
2. Select category: **Games**
3. Answer questions (all "No" for violence, mature content, etc.)
4. Result: Rated **Everyone**

### Data Safety
1. Go to **Policy** → **App content** → **Data safety**
2. Fill in:
   - Collects: Player names, scores, game data
   - Encryption: Yes (in transit)
   - Can users request deletion: Yes
3. Submit

### Pricing & Distribution
1. **Pricing:** Free
2. **Countries:** Select All
3. Check required boxes

## 8. Upload and Release (5 minutes)

1. Go to **Release** → **Production**
2. Click **Create new release**
3. Upload `app-release.aab`
4. Release notes:
   ```
   🎮 Initial release!

   Features:
   • 4-player real-time multiplayer
   • Attack mechanics and combos
   • Global leaderboard
   • Classic Tetris gameplay
   ```
5. Click **Review release**
6. Click **Start rollout to Production**

## 9. Wait for Approval

- Google reviews in 1-3 days
- You'll receive email when approved
- App goes live automatically when approved!

---

## Before You Submit - Checklist

- [ ] App icon looks good (test on emulator)
- [ ] Keystore file backed up safely
- [ ] `keystore.properties` has correct passwords
- [ ] Release AAB built successfully
- [ ] Tested release build on device/emulator
- [ ] At least 2 screenshots taken
- [ ] Store listing filled out completely
- [ ] Content rating obtained
- [ ] Data safety completed
- [ ] Privacy policy (optional but recommended)

---

## Test Release Build Before Submitting

Extract APK from AAB for testing:
```bash
# Use bundletool (download from: https://github.com/google/bundletool/releases)
java -jar bundletool.jar build-apks --bundle=app-release.aab --output=app.apks --mode=universal

# Extract APK
unzip app.apks

# Install
adb install universal.apk
```

Or use Play Console's internal testing track to test AAB directly.

---

## Common Issues

**"Keystore not found"**
- Make sure `tetris-release-key.jks` is in `android/` folder
- Check path in `keystore.properties`

**"Wrong password"**
- Verify password in `keystore.properties` matches the one you entered when creating keystore

**"Upload failed - duplicate version"**
- Increment `versionCode` in `app/build.gradle`

**"App not signed"**
- Make sure `keystore.properties` file exists
- Check that you built with `bundleRelease` (not `bundleDebug`)

---

## After Your App is Live

### To update your app:

1. Make code changes
2. Increment version in `app/build.gradle`:
   ```gradle
   versionCode 2      // Increment by 1
   versionName "1.1"  // Update as needed
   ```
3. Build: `./gradlew.bat bundleRelease`
4. Upload to Play Console → Production
5. Write release notes describing changes
6. Roll out to production

---

## Resources

- Full guide: See `PLAYSTORE_RELEASE.md`
- Icon generator: https://romannurik.github.io/AndroidAssetStudio/
- Play Console: https://play.google.com/console
- Bundletool: https://github.com/google/bundletool/releases

Good luck with your release! 🚀
