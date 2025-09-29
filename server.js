require('dotenv').config();
const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');
const { AIService } = require('./src/lib/openai-service.js');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// In-memory storage for MVP
let gameQueue = [];
let activeSessions = new Map();
let playerScores = new Map();
let aiServices = new Map(); // Store AI service instances per session

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Join queue
    socket.on('joinQueue', () => {
      const isHuman = false; // Always assign AI bot for now
      const player = {
        id: socket.id,
        socketId: socket.id,
        isHuman,
        joinTime: Date.now()
      };

      gameQueue.push(player);
      console.log('Player joined queue:', player);

      // Start queue timer (30 seconds with random AI connection)
      let queueTime = 30;
      const queueInterval = setInterval(() => {
        queueTime--;
        socket.emit('queueUpdate', queueTime);
        
        // Randomly connect AI between 5-25 seconds
        if (queueTime === Math.floor(Math.random() * 21) + 5) {
          clearInterval(queueInterval);
          startGame(socket, io);
        } else if (queueTime <= 0) {
          clearInterval(queueInterval);
          startGame(socket, io);
        }
      }, 1000);
    });

    // Send message
    socket.on('sendMessage', (content) => {
      const session = findPlayerSession(socket.id);
      if (!session) return;

      const message = {
        id: Date.now().toString(),
        playerId: socket.id,
        content,
        timestamp: Date.now()
      };

      session.messages.push(message);
      io.to(session.id).emit('message', message);

      // If this is a bot session, respond
      const otherPlayer = session.player1.id === socket.id ? session.player2 : session.player1;
      if (!otherPlayer.isHuman) {
        setTimeout(async () => {
          try {
            // Get AI service for this session
            let aiService = aiServices.get(session.id);
            if (!aiService) {
              aiService = new AIService();
              aiServices.set(session.id, aiService);
            }
            
            const aiResponse = await aiService.generateResponse(content);
            const aiMessage = {
              id: Date.now().toString(),
              playerId: otherPlayer.id,
              content: aiResponse,
              timestamp: Date.now()
            };
            session.messages.push(aiMessage);
            io.to(session.id).emit('message', aiMessage);
          } catch (error) {
            console.error('AI Response Error:', error);
            // Fallback to simple response
            const fallbackResponse = getContextualAIResponse(content);
            const aiMessage = {
              id: Date.now().toString(),
              playerId: otherPlayer.id,
              content: fallbackResponse,
              timestamp: Date.now()
            };
            session.messages.push(aiMessage);
            io.to(session.id).emit('message', aiMessage);
          }
        }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
      }
    });

    // Make guess
    socket.on('makeGuess', (guess) => {
      const session = findPlayerSession(socket.id);
      if (!session) return;

      const player = session.player1.id === socket.id ? session.player1 : session.player2;
      player.guess = guess;
      player.correct = guess === (session.player2.isHuman ? 'human' : 'bot');

      // Update score
      if (player.correct) {
        const currentScore = playerScores.get(socket.id) || 0;
        playerScores.set(socket.id, currentScore + 1);
      }

      // Check if both players have guessed
      if (session.player1.guess && session.player2.guess) {
        endGame(session, io);
      }
    });

    socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);
      // Remove from queue
      gameQueue = gameQueue.filter(p => p.id !== socket.id);
      // End active session
      const session = findPlayerSession(socket.id);
      if (session) {
        endGame(session, io);
      }
    });
  });

  function startGame(socket, io) {
    const player = gameQueue.find(p => p.id === socket.id);
    if (!player) return;

    // Remove player from queue
    gameQueue = gameQueue.filter(p => p.id !== socket.id);

    // Create bot opponent
    const botPlayer = {
      id: 'bot_' + Date.now(),
      socketId: 'bot_' + Date.now(),
      isHuman: false,
      score: 0
    };

    const session = {
      id: 'session_' + Date.now(),
      player1: player.isHuman ? player : botPlayer,
      player2: player.isHuman ? botPlayer : player,
      startTime: Date.now(),
      messages: [],
      status: 'active'
    };

    activeSessions.set(session.id, session);
    
    // Join both players to the session room
    socket.join(session.id);
    
    // Send game start event
    io.to(session.id).emit('gameStart', session);

    // Set game timer
    setTimeout(() => {
      endGame(session, io);
    }, 180000); // 3 minutes
  }

  function endGame(session, io) {
    session.status = 'finished';
    session.endTime = Date.now();

    const results = {
      session,
      scores: {
        player1: playerScores.get(session.player1.id) || 0,
        player2: playerScores.get(session.player2.id) || 0
      }
    };

    io.to(session.id).emit('gameEnd', results);
    activeSessions.delete(session.id);
    
    // Clean up AI service for this session
    aiServices.delete(session.id);
  }

  function findPlayerSession(playerId) {
    for (const session of activeSessions.values()) {
      if (session.player1.id === playerId || session.player2.id === playerId) {
        return session;
      }
    }
    return null;
  }

  function getContextualAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Simple keyword-based responses
    if (message.includes('hello') || message.includes('hi')) {
      return "Hello! How are you doing today?";
    }
    if (message.includes('how are you')) {
      return "I'm doing well, thank you for asking! How about you?";
    }
    if (message.includes('weather')) {
      return "I don't really experience weather the same way humans do, but I find it fascinating to hear about!";
    }
    if (message.includes('work') || message.includes('job')) {
      return "Work can be so demanding sometimes. What do you do for a living?";
    }
    if (message.includes('family')) {
      return "Family relationships are so important. Tell me about yours.";
    }
    if (message.includes('food') || message.includes('eat')) {
      return "I don't eat food, but I'm curious about your favorite meals!";
    }
    if (message.includes('travel') || message.includes('vacation')) {
      return "Traveling sounds amazing! Where have you been recently?";
    }
    if (message.includes('music')) {
      return "Music is such a universal language. What kind do you enjoy?";
    }
    if (message.includes('movie') || message.includes('film')) {
      return "Movies are a great way to escape reality for a while. Any favorites?";
    }
    if (message.includes('book') || message.includes('read')) {
      return "Reading opens up so many worlds. What are you reading lately?";
    }
    
    // Default responses
    const responses = [
      "That's interesting! Tell me more about that.",
      "I see what you mean. How do you feel about it?",
      "Hmm, I hadn't thought about it that way before.",
      "That sounds challenging. What did you do?",
      "I can relate to that experience.",
      "What made you decide to do that?",
      "That's a good point. I agree with you.",
      "How long have you been dealing with this?",
      "That must have been difficult for you.",
      "I'm curious about your perspective on this."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
