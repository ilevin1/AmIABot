# Deployment Guide

## Quick Deploy to Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial AmIABot MVP"
   git remote add origin https://github.com/yourusername/amiabot.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Deploy!

## Alternative: Deploy to Railway

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**:
   ```bash
   railway login
   railway init
   railway up
   ```

## Environment Variables

No environment variables needed for MVP!

## Production Notes

- Socket.io works seamlessly with Vercel
- In-memory storage means scores reset on server restart
- For persistent data, add a database later

## Testing Your Deployment

1. Open your deployed URL
2. Click "Start Game"
3. Wait in queue (30 seconds)
4. Chat with AI for 3 minutes
5. Make your guess
6. See your score!

## Troubleshooting

**Socket connection issues**: Make sure your deployment platform supports WebSockets (Vercel does)

**Build errors**: Run `npm run build` locally first to check for issues

**Styling issues**: Ensure Tailwind CSS is properly configured

