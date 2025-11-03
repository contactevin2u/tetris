# Deployment Guide - 4-Player Tetris

This guide will help you deploy the Tetris game with the backend on Render (Singapore region) and frontend on Vercel.

## Architecture

- **Backend**: Node.js + WebSocket + Express API on Render (Singapore)
- **Database**: PostgreSQL on Render (Singapore)
- **Frontend**: Static HTML/CSS/JS on Vercel

## Step 1: Deploy Backend to Render

### Option A: Using render.yaml (Recommended)

1. **Create a GitHub repository** and push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and create:
     - A PostgreSQL database in Singapore
     - A Web Service in Singapore
   - Click "Apply" to deploy

3. **Note your backend URL**:
   - After deployment, you'll get a URL like: `https://tetris-backend-xxxx.onrender.com`
   - Copy this URL - you'll need it for the frontend

### Option B: Manual Setup

1. **Create PostgreSQL Database**:
   - Go to Render Dashboard
   - Click "New +" → "PostgreSQL"
   - Name: `tetris-db`
   - Region: **Singapore**
   - Plan: Free
   - Click "Create Database"
   - Copy the "Internal Database URL"

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - **Name**: tetris-backend
     - **Region**: Singapore
     - **Branch**: main
     - **Root Directory**: backend
     - **Runtime**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   - Environment Variables:
     - `DATABASE_URL`: [Paste Internal Database URL]
     - `NODE_ENV`: production
   - Click "Create Web Service"

3. **Note your backend URL**: Copy the deployed URL

## Step 2: Update Frontend Configuration

1. **Edit `frontend/client.js`**:
   - Find lines 9-15
   - Replace `YOUR_RENDER_APP_NAME` with your actual Render app name:

   ```javascript
   const API_URL = window.location.hostname === 'localhost'
       ? 'http://localhost:8080'
       : 'https://tetris-backend-xxxx.onrender.com';  // ← Update this

   const WS_URL = window.location.hostname === 'localhost'
       ? 'ws://localhost:8080'
       : 'wss://tetris-backend-xxxx.onrender.com';    // ← Update this
   ```

2. **Commit the changes**:
   ```bash
   git add frontend/client.js
   git commit -m "Update backend URL"
   git push
   ```

## Step 3: Deploy Frontend to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard** (Recommended):
   - Go to [Vercel Dashboard](https://vercel.com/)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Settings:
     - **Framework Preset**: Other
     - **Root Directory**: frontend
     - **Build Command**: (leave empty)
     - **Output Directory**: (leave empty)
   - Click "Deploy"

3. **OR Deploy via CLI**:
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Your frontend is now live!**
   - You'll get a URL like: `https://tetris-multiplayer.vercel.app`

## Step 4: Test the Deployment

1. Open your Vercel frontend URL
2. You should see "Status: Connected" (green)
3. Open the same URL in multiple tabs to test multiplayer
4. Click "Start Game" and play!
5. After game over, submit your score to test the leaderboard

## Troubleshooting

### Backend Issues

**"Status: Disconnected" on frontend**:
- Check if backend is running on Render
- Verify the WebSocket URL in `client.js` is correct
- Check Render logs for errors

**Database connection errors**:
- Verify `DATABASE_URL` environment variable is set correctly
- Check PostgreSQL database is running in Render

### Frontend Issues

**Leaderboard not loading**:
- Check browser console for CORS errors
- Verify API_URL in `client.js` is correct
- Backend CORS is already configured to allow all origins

### WebSocket Issues

**Connection closes immediately**:
- Make sure you're using `wss://` (not `ws://`) for production
- Check Render service is not sleeping (free tier sleeps after inactivity)

## Local Development

To test locally before deploying:

1. **Start backend**:
   ```bash
   cd backend
   npm install
   # Set DATABASE_URL to local PostgreSQL or skip DB features
   npm start
   ```

2. **Open frontend**:
   ```bash
   cd frontend
   # Open index.html in browser or use a local server
   npx http-server -p 3000
   ```

3. **Access**: http://localhost:3000

## Environment Variables Summary

### Backend (Render)
- `DATABASE_URL`: PostgreSQL connection string (auto-set by Render)
- `NODE_ENV`: production
- `PORT`: Auto-set by Render

### Frontend (Vercel)
- No environment variables needed (URLs hardcoded in client.js)

## Cost

- **Render**: Free tier (750 hours/month, sleeps after inactivity)
- **PostgreSQL**: Free tier (1GB storage, 97 hours/month)
- **Vercel**: Free tier (unlimited for personal projects)

**Note**: Free tier services may take 30-60 seconds to wake up from sleep.

## Upgrading for Production

For production use:
1. Upgrade Render to a paid plan for 24/7 uptime
2. Set up custom domain on Vercel
3. Enable SSL/TLS (automatic on both platforms)
4. Add rate limiting and authentication
5. Set up monitoring and logging

## Support

If you encounter issues:
- Check [Render Documentation](https://render.com/docs)
- Check [Vercel Documentation](https://vercel.com/docs)
- Review application logs in respective dashboards
