# Tetris Frontend

Static HTML/CSS/JavaScript frontend for multiplayer Tetris game.

## Features

- 4-player grid display
- Real-time WebSocket connection
- Leaderboard integration
- Responsive design
- No build step required

## Configuration

Before deploying, update the backend URLs in `client.js`:

```javascript
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://YOUR_RENDER_APP_NAME.onrender.com';  // ← Update this

const WS_URL = window.location.hostname === 'localhost'
    ? 'ws://localhost:8080'
    : 'wss://YOUR_RENDER_APP_NAME.onrender.com';    // ← Update this
```

Replace `YOUR_RENDER_APP_NAME` with your actual Render app name.

## Local Development

### Option 1: Open HTML file directly
Simply open `index.html` in your browser.

### Option 2: Use a local server
```bash
npx http-server -p 3000
```
Then open http://localhost:3000

## Files

- **index.html** - Main game interface
- **game.js** - Tetris game logic (shapes, movement, collision detection)
- **client.js** - WebSocket client and API integration
- **style.css** - Styles and responsive design
- **vercel.json** - Vercel deployment configuration

## Deployment to Vercel

### Via Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Other
   - Leave build settings empty
5. Click "Deploy"

### Via CLI

```bash
npm install -g vercel
cd frontend
vercel --prod
```

## Environment Detection

The app automatically detects whether it's running locally or in production:

- **Local**: Connects to `http://localhost:8080`
- **Production**: Connects to your Render backend URL

## Game Controls

| Key | Action |
|-----|--------|
| ← → | Move piece left/right |
| ↑   | Rotate piece |
| ↓   | Soft drop |
| Space | Hard drop |

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile browsers: ✅ Supported (keyboard controls only)

## Features

### Game Canvas
- 10x20 grid per player
- Real-time rendering using HTML5 Canvas
- Visual grid lines

### Leaderboard
- Modal popup interface
- Top 10 scores displayed
- Medals for top 3 (🥇🥈🥉)
- Auto-refresh after score submission

### Multiplayer
- Up to 4 players simultaneously
- Real-time state synchronization
- Player status indicators
- Connection status display

## Customization

### Change Colors
Edit `style.css` to change the gradient background:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Change Tetromino Colors
Edit `game.js`:
```javascript
const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    // ...
};
```

### Change Game Speed
Edit `client.js` line 98:
```javascript
dropInterval = setInterval(() => {
    // ...
}, 1000);  // ← Change interval (milliseconds)
```

## License

MIT
