# AmIABot - Turing Test Game

An interactive web platform that gamifies the Turing Test, where users engage in real-time conversations to determine whether they're chatting with a human or an AI.

## Features

- **Real-time Chat**: 3-minute timed conversations
- **Queue System**: 30-second wait time to find partners
- **AI Opponents**: Smart contextual responses
- **Scoring System**: Track your guessing accuracy
- **Responsive Design**: Works on desktop and mobile

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## How to Play

1. Click "Start Game" to enter the queue
2. Wait 30 seconds for a partner (human or AI)
3. Chat for 3 minutes to determine if your partner is human or AI
4. Make your guess before time runs out
5. See your score and play again!

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Real-time**: Socket.io
- **Deployment**: Vercel (recommended)

## Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── lib/
│   ├── ai-responses.ts
│   └── socket.ts
└── types/
    └── game.ts
```

## Deployment

### Deploy to Render (Recommended)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Use these settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
   - **Plan**: `Free`
6. Add environment variable: `OPENAI_API_KEY` = your API key
7. Deploy!

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically!

### Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required for AI responses)

## Development Notes

- Uses in-memory storage (no database required for MVP)
- AI responses are contextual and randomized
- Queue system handles both human and bot matching
- Real-time messaging with Socket.io

## Future Enhancements

- Database integration for persistent scores
- Leaderboard system
- User authentication
- Enhanced AI prompt engineering
- Early exit option
- Mobile app

## License

MIT License - feel free to use for your school project!

