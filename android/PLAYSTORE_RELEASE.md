# Publishing to Google Play Store

## Part 1: Creating and Adding App Icon

### Step 1: Create Your App Icon

You need several icon sizes for Android:
- **512x512 px** - Play Store listing
- **192x192 px** - xxxhdpi (4x)
- **144x144 px** - xxhdpi (3x)
- **96x96 px** - xhdpi (2x)
- **72x72 px** - hdpi (1.5x)
- **48x48 px** - mdpi (1x)

**Design Guidelines:**
- Use a square canvas (512x512)
- Keep important content in the center (avoid edges)
- Use vibrant colors
- Make it recognizable at small sizes
- No text (unless it's part of your logo)

**Tools to Create Icons:**
1. **Android Studio Image Asset Studio** (easiest):
   - Right-click `app/src/main/res` in Android Studio
   - Select `New` → `Image Asset`
   - Choose `Launcher Icons`
   - Upload your 512x512 image or use clipart
   - Adjust padding and shape
   - Click `Next` → `Finish`

2. **Online Tools:**
   - [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)
   - [AppIcon.co](https://www.appicon.co/)

3. **Design Tools:**
   - Figma, Adobe Illustrator, or Canva

### Step 2: Add Icon to Your Project

If using Android Studio Image Asset Studio, icons are automatically added. Otherwise, manually add them:

1. Create these folders in `android/app/src/main/res/`:
   ```
   mipmap-mdpi/
   mipmap-hdpi/
   mipmap-xhdpi/
   mipmap-xxhdpi/
   mipmap-xxxhdpi/
   ```

2. Place your icons:
   - `mipmap-mdpi/ic_launcher.png` (48x48)
   - `mipmap-hdpi/ic_launcher.png` (72x72)
   - `mipmap-xhdpi/ic_launcher.png` (96x96)
   - `mipmap-xxhdpi/ic_launcher.png` (144x144)
   - `mipmap-xxxhdpi/ic_launcher.png` (192x192)

3. Icon is already referenced in `AndroidManifest.xml`:
   ```xml
   <application
       android:icon="@mipmap/ic_launcher"
       android:roundIcon="@mipmap/ic_launcher_round"
       ...>
   ```

### Step 3: Add Adaptive Icon (Android 8.0+)

Create `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
```

Add background color to `android/app/src/main/res/values/colors.xml`:
```xml
<color name="ic_launcher_background">#000000</color>
```

---

## Part 2: Prepare Release Build

### Step 1: Create a Keystore (Signing Key)

**IMPORTANT:** Keep this keystore file safe! You cannot update your app without it.

1. Open terminal in `android/` directory
2. Run:
   ```bash
   keytool -genkey -v -keystore tetris-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias tetris-release
   ```

3. Answer the prompts:
   - Password: Choose a strong password (remember this!)
   - Name, Organization, etc.: Fill in your details

4. This creates `tetris-release-key.jks` - **BACKUP THIS FILE!**

### Step 2: Configure Signing in Gradle

1. Create `android/keystore.properties` (this file is gitignored):
   ```properties
   storePassword=YOUR_KEYSTORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=tetris-release
   storeFile=tetris-release-key.jks
   ```

2. Update `android/app/build.gradle`:

   Add before `android {` block:
   ```gradle
   def keystorePropertiesFile = rootProject.file("keystore.properties")
   def keystoreProperties = new Properties()
   if (keystorePropertiesFile.exists()) {
       keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
   }
   ```

   Add inside `android {` block:
   ```gradle
   signingConfigs {
       release {
           keyAlias keystoreProperties['keyAlias']
           keyPassword keystoreProperties['keyPassword']
           storeFile file(keystoreProperties['storeFile'])
           storePassword keystoreProperties['storePassword']
       }
   }

   buildTypes {
       release {
           minifyEnabled true
           shrinkResources true
           proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
           signingConfig signingConfigs.release
       }
   }
   ```

### Step 3: Update App Version

In `android/app/build.gradle`, inside `defaultConfig`:
```gradle
versionCode 1      // Increment this for each release
versionName "1.0"  // User-visible version (e.g., "1.0", "1.1", "2.0")
```

### Step 4: Build Release AAB (Android App Bundle)

Google Play requires AAB format (not APK) for new apps.

```bash
cd android
./gradlew.bat bundleRelease
```

The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

**File size should be around 5-10 MB.**

---

## Part 3: Google Play Console Setup

### Step 1: Create Google Play Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google account
3. Pay $25 one-time registration fee
4. Complete account details and accept agreements
5. Verify your identity (Google may require this)

### Step 2: Create a New App

1. Click **Create app**
2. Fill in details:
   - **App name:** "Tetris Multiplayer" (or your chosen name)
   - **Default language:** English (US)
   - **App or game:** Game
   - **Free or paid:** Free
   - Accept declarations
3. Click **Create app**

### Step 3: Complete Store Listing

#### 3.1 App Details
- **App name:** Tetris Multiplayer
- **Short description:** (80 chars max)
  ```
  4-player online Tetris! Compete in real-time with attack mechanics & combos.
  ```
- **Full description:** (4000 chars max)
  ```
  Experience the classic Tetris game with modern multiplayer features!

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
  • 7 tetromino pieces (I, O, T, S, Z, J, L)
  • Progressive speed increase
  • Ghost piece preview
  • Next piece preview
  • Hold piece system

  🏆 COMPETITIVE:
  Submit your high scores to the global leaderboard and compete with players worldwide!

  Perfect for both casual players and Tetris veterans!
  ```

#### 3.2 Graphics Assets

You need to create these images:

1. **App icon** (512x512 PNG)
   - Your main app icon

2. **Feature graphic** (1024x500 PNG)
   - Banner image shown at top of Play Store listing
   - Show gameplay or logo

3. **Screenshots** (at least 2, up to 8)
   - **Phone:** 16:9 or 9:16 ratio
   - Minimum: 320px
   - Maximum: 3840px
   - Show actual gameplay
   - Take screenshots from Android Studio emulator or device

4. **Optional but recommended:**
   - Promo video (YouTube link)
   - TV banner (1280x720)
   - Wear OS screenshots (if applicable)

**How to take screenshots:**
- Run app in Android Studio
- Play the game
- Click camera icon in emulator toolbar
- Or use device screenshot (Power + Volume Down)

#### 3.3 Categorization
- **App category:** Games / Puzzle
- **Tags:** tetris, puzzle, multiplayer, arcade
- **Content rating:** Everyone (apply for rating in Play Console)

#### 3.4 Contact Details
- **Email:** your-email@example.com
- **Phone:** (optional)
- **Website:** (optional) Link to GitHub repo or website
- **Privacy Policy:** (optional but recommended)

### Step 4: Content Rating

1. Go to **Policy** → **App content**
2. Click **Content rating** → **Start questionnaire**
3. Select category: **Games**
4. Answer questions honestly (for Tetris, should be rated E for Everyone)
5. Submit and receive rating

### Step 5: Set Up App Pricing & Distribution

1. Go to **Pricing and distribution**
2. Select **Free**
3. Select countries (select all or specific regions)
4. Check **Content guidelines** and **US export laws** boxes

### Step 6: Data Safety

1. Go to **Policy** → **App content** → **Data safety**
2. Answer questions about data collection:
   - For this app:
     - Collects: Player names, scores, game data
     - Uses: Firebase Realtime Database and Firestore
     - Data encrypted in transit: Yes
     - Users can request data deletion: Yes (you should implement this)
3. Submit declaration

---

## Part 4: Release Your App

### Step 1: Create a Release

1. Go to **Release** → **Production**
2. Click **Create new release**
3. Upload your `app-release.aab` file
4. Review release:
   - Release name: "1.0"
   - Release notes: "Initial release"
     ```
     🎮 First release of Tetris Multiplayer!

     Features:
     • 4-player real-time multiplayer
     • Attack mechanics and combos
     • Global leaderboard
     • Classic Tetris gameplay
     ```

### Step 2: Review and Rollout

1. Review all sections - must all show green checkmarks
2. Click **Review release**
3. Check for warnings or errors
4. Click **Start rollout to Production**

### Step 3: Wait for Review

- Google reviews your app (usually 1-3 days)
- You'll receive email when approved or if changes needed
- Once approved, app goes live on Play Store!

---

## Part 5: Post-Release

### Update Your App

When releasing updates:

1. Increment version in `app/build.gradle`:
   ```gradle
   versionCode 2      // Always increment by 1
   versionName "1.1"  // Update version number
   ```

2. Build new AAB:
   ```bash
   ./gradlew.bat bundleRelease
   ```

3. Upload to Play Console:
   - Go to **Production** → **Create new release**
   - Upload new AAB
   - Write release notes describing changes
   - Roll out to production

### Monitor Your App

- **Dashboard:** See installs, crashes, ratings
- **User feedback:** Respond to reviews
- **Pre-launch report:** Google tests your app automatically
- **Android vitals:** Monitor crashes and ANRs
- **Crashes & ANRs:** View crash reports from users

---

## Checklist Before Submitting

- [ ] App icon added (all sizes)
- [ ] Keystore created and backed up
- [ ] Release AAB built successfully
- [ ] Tested release build on device
- [ ] Store listing completed (description, screenshots)
- [ ] Content rating obtained
- [ ] Data safety form completed
- [ ] Privacy policy created (if collecting data)
- [ ] All policies accepted
- [ ] Countries/regions selected
- [ ] Firebase Realtime Database rules secured for production

---

## Important Notes

### Security - Secure Firebase for Production

Before going live, update Firebase rules:

**Realtime Database Rules:**
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
      }
    }
  }
}
```

**Firestore Rules:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{entry} {
      allow read: if true;
      allow create: if request.resource.data.score is int
                    && request.resource.data.playerName is string;
      allow update, delete: if false;
    }
  }
}
```

### Backup Your Keystore

- Store `tetris-release-key.jks` in a safe place (cloud storage, USB drive)
- Save your keystore passwords securely
- Without the keystore, you cannot update your app!

### App Size Optimization

If your AAB is too large:
- Enable minification (already done in release build)
- Remove unused resources
- Use WebP instead of PNG for images
- Use Android App Bundle (not APK)

### Testing Before Release

Test the release build:
```bash
# Install release build on device
adb install android/app/build/outputs/apk/release/app-release.apk
```

Test:
- All gameplay features work
- Multiplayer connects properly
- Leaderboard saves scores
- No crashes
- UI looks correct on different screen sizes

---

## Resources

- [Google Play Console](https://play.google.com/console)
- [Android Developer Documentation](https://developer.android.com/distribute/console)
- [App Icon Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher)
- [Feature Graphic Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)

---

## Need Help?

Common issues:
- **"Keystore not found"** - Check path in keystore.properties
- **"Wrong password"** - Verify keystore password is correct
- **"App not signed"** - Ensure signingConfig is set in build.gradle
- **"Bundle too large"** - Enable minification and shrinkResources
- **"Upload failed"** - Ensure version code is higher than previous release
