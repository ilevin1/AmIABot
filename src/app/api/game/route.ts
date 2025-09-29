import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/openai-service';

// In-memory storage (will reset on serverless function restart)
let gameSessions: Map<string, any> = new Map();
let playerScores: Map<string, number> = new Map();
let aiServices: Map<string, AIService> = new Map();

export async function POST(req: NextRequest) {
  try {
    const { action, sessionId, playerId, content, guess } = await req.json();

    switch (action) {
      case 'joinQueue':
        return handleJoinQueue(playerId);
      
      case 'sendMessage':
        return handleSendMessage(sessionId, playerId, content);
      
      case 'makeGuess':
        return handleMakeGuess(sessionId, playerId, guess);
      
      case 'getSession':
        return handleGetSession(sessionId);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleJoinQueue(playerId: string) {
  // Create a new session with AI bot
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const botPlayer = {
    id: `bot_${Date.now()}`,
    isHuman: false,
    score: 0
  };

  const session = {
    id: sessionId,
    player1: { id: playerId, isHuman: true, score: 0 },
    player2: botPlayer,
    startTime: Date.now(),
    messages: [],
    status: 'active',
    queueTime: 5, // Always show 5 seconds
    actualStartTime: 5 // Always start at 5 seconds
  };

  gameSessions.set(sessionId, session);
  
  return NextResponse.json({ 
    success: true, 
    sessionId,
    queueTime: session.queueTime,
    actualStartTime: session.actualStartTime
  });
}

async function handleSendMessage(sessionId: string, playerId: string, content: string) {
  const session = gameSessions.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Add player message
  const message = {
    id: Date.now().toString(),
    playerId,
    content,
    timestamp: Date.now()
  };

  session.messages.push(message);

  // Generate AI response with human-like delay
  try {
    let aiService = aiServices.get(sessionId);
    if (!aiService) {
      aiService = new AIService();
      aiServices.set(sessionId, aiService);
    }
    
    const aiResponse = await aiService.generateResponse(content);
    
    // Add human-like delay (1-4 seconds)
    const delay = Math.floor(Math.random() * 3000) + 1000; // 1-4 seconds
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      playerId: session.player2.id,
      content: aiResponse,
      timestamp: Date.now() + delay
    };
    
    session.messages.push(aiMessage);
  } catch (error) {
    console.error('AI Response Error:', error);
    // Fallback response
    const fallbackResponse = getContextualAIResponse(content);
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      playerId: session.player2.id,
      content: fallbackResponse,
      timestamp: Date.now() + 1000
    };
    session.messages.push(aiMessage);
  }

  return NextResponse.json({ 
    success: true, 
    messages: session.messages 
  });
}

async function handleMakeGuess(sessionId: string, playerId: string, guess: 'human' | 'bot') {
  const session = gameSessions.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const player = session.player1.id === playerId ? session.player1 : session.player2;
  player.guess = guess;
  player.correct = guess === 'bot'; // Since we always pair with AI

  // Update score
  if (player.correct) {
    const currentScore = playerScores.get(playerId) || 0;
    playerScores.set(playerId, currentScore + 1);
  }

  session.status = 'finished';
  session.endTime = Date.now();

  return NextResponse.json({ 
    success: true, 
    correct: player.correct,
    score: playerScores.get(playerId) || 0,
    session 
  });
}

async function handleGetSession(sessionId: string) {
  const session = gameSessions.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({ 
    success: true, 
    session 
  });
}

function getContextualAIResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes('hello') || message.includes('hi')) {
    return "hey there! hows your day going?";
  }
  if (message.includes('how are you')) {
    return "im doing pretty good, thanks for asking! how about you?";
  }
  if (message.includes('weather')) {
    return "oh man, the weather has been so weird lately! whats it like where you are?";
  }
  if (message.includes('work') || message.includes('job')) {
    return "work can be such a grind sometimes. what do you do for work?";
  }
  if (message.includes('family')) {
    return "family stuff can be complicated, right? tell me about yours!";
  }
  if (message.includes('food') || message.includes('eat')) {
    return "im always thinking about food haha. whats your favorite thing to eat?";
  }
  if (message.includes('travel') || message.includes('vacation')) {
    return "i love traveling! wheres the coolest place youve been?";
  }
  if (message.includes('music')) {
    return "music is everything! what kind of stuff do you listen to?";
  }
  if (message.includes('movie') || message.includes('film')) {
    return "movies are my escape from reality. any good ones youve seen lately?";
  }
  if (message.includes('book') || message.includes('read')) {
    return "i wish i read more honestly. what are you reading these days?";
  }
  
  const responses = [
    "thats really interesting! tell me more about that.",
    "oh wow, i hadnt thought about it that way before.",
    "that sounds pretty cool. how did that happen?",
    "i can totally relate to that feeling.",
    "thats wild! what made you decide to do that?",
    "i get what you mean. that must have been tough.",
    "thats awesome! im curious about your take on this.",
    "hmm, thats a good point. i never considered that.",
    "that sounds like quite the experience!",
    "im really interested in hearing more about this."
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
