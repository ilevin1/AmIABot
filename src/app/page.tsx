'use client';

import { useState, useEffect } from 'react';
import { gameAPI } from '@/lib/api';
import { GameSession, Player, Message } from '@/types/game';

export default function Home() {
  const [gameState, setGameState] = useState<'lobby' | 'queue' | 'playing' | 'results'>('lobby');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [queueTime, setQueueTime] = useState(30);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [session, setSession] = useState<GameSession | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [playerId] = useState(() => `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [guess, setGuess] = useState<'human' | 'bot' | null>(null);
  const [score, setScore] = useState(0);
  const [isHuman, setIsHuman] = useState(false);

  // No need for socket effects anymore

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      // Game ended, show results
      setGameState('results');
    }
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'queue' && queueTime > 0) {
      const timer = setTimeout(() => setQueueTime(queueTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, queueTime]);

  const startGame = async () => {
    try {
      console.log('Starting game with playerId:', playerId);
      setGameState('queue');
      
      // Add a fallback for when API fails
      const result = await gameAPI.joinQueue(playerId);
      console.log('API result:', result);
      
      if (result.success) {
        setSessionId(result.sessionId);
        
        // Start queue countdown
        setQueueTime(result.queueTime);
        console.log('Starting countdown with:', result.queueTime, 'seconds');
        
        const queueInterval = setInterval(() => {
          setQueueTime(prev => {
            const newTime = prev - 1;
            console.log('Queue time:', newTime);
            if (newTime <= 0) {
              clearInterval(queueInterval);
              console.log('Starting game!');
              // Start the game
              setGameState('playing');
              setTimeLeft(180);
              setIsHuman(true);
            }
            return newTime;
          });
        }, 1000);
      } else {
        console.error('API returned success: false');
        setGameState('lobby');
      }
    } catch (error) {
      console.error('Failed to join queue:', error);
      console.log('Falling back to demo mode...');
      
      // Fallback: Start game immediately for demo
      setGameState('queue');
      setQueueTime(5);
      
      const queueInterval = setInterval(() => {
        setQueueTime(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(queueInterval);
            setGameState('playing');
            setTimeLeft(180);
            setIsHuman(true);
          }
          return newTime;
        });
      }, 1000);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    // If no sessionId (API failed), create demo messages
    if (!sessionId) {
      const newMessage = {
        id: Date.now().toString(),
        playerId: playerId,
        content: currentMessage,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setCurrentMessage('');
      
      // Add AI response after 1-2 seconds
      setTimeout(() => {
        const aiResponses = [
          "hey there! hows your day going?",
          "oh cool, tell me more about that",
          "thats interesting! what made you think that?",
          "i can relate to that feeling",
          "wait really? thats wild",
          "hmm idk about that, seems sketchy",
          "thats awesome! im curious about your take",
          "yeah i know what you mean its annoying",
          "thats pretty cool how did that happen?",
          "i feel you on that one"
        ];
        
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          playerId: 'bot_demo',
          content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
          timestamp: Date.now() + 1000
        };
        
        setMessages(prev => [...prev, aiResponse]);
      }, 1000 + Math.random() * 1000);
      
      return;
    }
    
    try {
      const result = await gameAPI.sendMessage(sessionId, playerId, currentMessage);
      if (result.success) {
        setMessages(result.messages);
        setCurrentMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const makeGuess = async (choice: 'human' | 'bot') => {
    setGuess(choice);
    
    // If no sessionId (API failed), show demo results
    if (!sessionId) {
      setScore(1); // Demo score
      setGameState('results');
      return;
    }
    
    try {
      const result = await gameAPI.makeGuess(sessionId, playerId, choice);
      if (result.success) {
        setScore(result.score);
        setGameState('results');
      }
    } catch (error) {
      console.error('Failed to make guess:', error);
      // Fallback to demo results
      setScore(1);
      setGameState('results');
    }
  };

  const playAgain = () => {
    setGameState('lobby');
    setMessages([]);
    setGuess(null);
    setSession(null);
    setSessionId(null);
    setTimeLeft(180);
    setQueueTime(30);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">AmIABot</h1>
          <p className="text-lg text-gray-600">Can you tell the difference between a human and AI?</p>
        </header>

        {gameState === 'lobby' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Welcome to the Turing Test!</h2>
            <p className="text-gray-600 mb-6">
              You'll have 3 minutes to chat and determine if your partner is human or AI.
            </p>
            <button
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'queue' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Finding a Partner...</h2>
            <div className="text-6xl font-bold text-blue-600 mb-4">
              {queueTime}
            </div>
            <p className="text-gray-600">
              {queueTime > 0 ? 'Searching for another player...' : 'Game starting soon!'}
            </p>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Chat Session</h2>
                <div className="text-lg font-bold text-red-600">
                  {formatTime(timeLeft)}
                </div>
              </div>
              
              <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50">
                {messages.map((msg) => {
                  const isMyMessage = msg.playerId === playerId;
                  return (
                    <div
                      key={msg.id}
                      className={`mb-3 flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${
                          isMyMessage
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-gray-300 text-gray-800 rounded-bl-md'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>

              {timeLeft <= 30 && !guess && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold mb-2">Time's almost up! Make your guess:</h3>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => makeGuess('human')}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Human
                    </button>
                    <button
                      onClick={() => makeGuess('bot')}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      AI Bot
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === 'results' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Game Over!</h2>
            <div className="text-4xl font-bold text-blue-600 mb-4">
              Score: {score}
            </div>
            <p className="text-gray-600 mb-6">
              {guess === 'human' ? 'You guessed: Human' : 'You guessed: AI Bot'}
            </p>
            <button
              onClick={playAgain}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

