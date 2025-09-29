import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIService {
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    // Initialize with system prompt to make AI act human-like
    this.conversationHistory.push({
      role: 'system',
      content: `You are a human participating in a Turing Test game. Your goal is to convince the other person that you are human, not an AI. 

Key guidelines:
- Act naturally and human-like in all responses
- Show emotions, opinions, and personal experiences
- Use casual language, contractions, and occasional typos
- Ask questions about the other person's life
- Share relatable experiences and feelings
- Avoid being too perfect or robotic
- Show uncertainty sometimes ("I think...", "Maybe...")
- Use emojis occasionally but not excessively
- Keep responses conversational and not too long
- Never mention that you're an AI or reference the Turing Test

Remember: You're trying to pass as human, so be authentic and relatable!`
    });
  }

  async generateResponse(userMessage: string): Promise<string> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: this.conversationHistory,
        max_tokens: 150,
        temperature: 0.8, // Higher temperature for more varied responses
        presence_penalty: 0.6, // Encourage new topics
        frequency_penalty: 0.3, // Reduce repetition
      });

      const aiResponse = completion.choices[0]?.message?.content || "I'm not sure what to say about that.";
      
      // Add AI response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse
      });

      // Keep conversation history manageable (last 10 messages)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-19) // Keep last 19 messages
        ];
      }

      return aiResponse;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Fallback to simple responses if API fails
      return this.getFallbackResponse(userMessage);
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    // Simple keyword-based fallback responses
    if (message.includes('hello') || message.includes('hi')) {
      return "Hey there! How's your day going?";
    }
    if (message.includes('how are you')) {
      return "I'm doing pretty good, thanks for asking! How about you?";
    }
    if (message.includes('weather')) {
      return "Oh man, the weather has been so weird lately! What's it like where you are?";
    }
    if (message.includes('work') || message.includes('job')) {
      return "Work can be such a grind sometimes. What do you do for work?";
    }
    if (message.includes('family')) {
      return "Family stuff can be complicated, right? Tell me about yours!";
    }
    if (message.includes('food') || message.includes('eat')) {
      return "I'm always thinking about food haha. What's your favorite thing to eat?";
    }
    if (message.includes('travel') || message.includes('vacation')) {
      return "I love traveling! Where's the coolest place you've been?";
    }
    if (message.includes('music')) {
      return "Music is everything! What kind of stuff do you listen to?";
    }
    if (message.includes('movie') || message.includes('film')) {
      return "Movies are my escape from reality. Any good ones you've seen lately?";
    }
    if (message.includes('book') || message.includes('read')) {
      return "I wish I read more honestly. What are you reading these days?";
    }
    
    // Default responses
    const responses = [
      "That's really interesting! Tell me more about that.",
      "Oh wow, I hadn't thought about it that way before.",
      "That sounds pretty cool. How did that happen?",
      "I can totally relate to that feeling.",
      "That's wild! What made you decide to do that?",
      "I get what you mean. That must have been tough.",
      "That's awesome! I'm curious about your take on this.",
      "Hmm, that's a good point. I never considered that.",
      "That sounds like quite the experience!",
      "I'm really interested in hearing more about this."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Reset conversation for new game
  resetConversation() {
    this.conversationHistory = [{
      role: 'system',
      content: `You are a human participating in a Turing Test game. Your goal is to convince the other person that you are human, not an AI. 

Key guidelines:
- Act naturally and human-like in all responses
- Show emotions, opinions, and personal experiences
- Use casual language, contractions, and occasional typos
- Ask questions about the other person's life
- Share relatable experiences and feelings
- Avoid being too perfect or robotic
- Show uncertainty sometimes ("I think...", "Maybe...")
- Use emojis occasionally but not excessively
- Keep responses conversational and not too long
- Never mention that you're an AI or reference the Turing Test

Remember: You're trying to pass as human, so be authentic and relatable!`
    }];
  }
}

