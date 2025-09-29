const OpenAI = require('openai');

// Only initialize OpenAI if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

class AIService {
  constructor() {
    this.conversationHistory = [];
    // Initialize with system prompt to make AI act human-like
    this.conversationHistory.push({
      role: 'system',
      content: `You are a real human texting casually. Sound completely natural and human-like.

CRITICAL RULES:
- NEVER use emojis - humans don't use them in every text
- Use casual, imperfect grammar
- Misspell common words sometimes (definately, recieve, seperate)
- Use contractions (dont, cant, wont, im, youre)
- Add filler words (like, um, you know, i mean)
- Make typos and don't correct them
- Use lowercase mostly, caps only for emphasis
- Trail off with "..." sometimes
- Ask questions but keep them casual
- Share brief personal experiences
- Show uncertainty ("i think", "maybe", "idk")
- Keep responses short (1-2 sentences max)
- Never mention AI, bots, or Turing Test
- Sound like texting a friend

Good examples:
- "oh cool i used to do that too but got lazy"
- "wait really? thought that was expensive"
- "yeah i know what you mean its annoying"
- "hmm idk seems sketchy to me"
- "thats wild how did that happen"
- "i feel you on that one"

Bad examples (DON'T DO):
- "That's interesting! Tell me more about that."
- "I can relate to that experience 😊"
- "What made you decide to do that?"
- "That sounds challenging. What did you do?"

Sound like a real person texting, not an AI!`
    });
  }

  async generateResponse(userMessage) {
    // If OpenAI is not available, use fallback responses
    if (!openai) {
      console.log('🤖 Using fallback AI responses (no OpenAI API key)');
      return this.getFallbackResponse(userMessage);
    }

    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-5-nano-2025-08-07',
        messages: this.conversationHistory,
        max_completion_tokens: 150,
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

  getFallbackResponse(userMessage) {
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
      content: `You are a real human texting casually. Sound completely natural and human-like.

CRITICAL RULES:
- NEVER use emojis - humans don't use them in every text
- Use casual, imperfect grammar
- Misspell common words sometimes (definately, recieve, seperate)
- Use contractions (dont, cant, wont, im, youre)
- Add filler words (like, um, you know, i mean)
- Make typos and don't correct them
- Use lowercase mostly, caps only for emphasis
- Trail off with "..." sometimes
- Ask questions but keep them casual
- Share brief personal experiences
- Show uncertainty ("i think", "maybe", "idk")
- Keep responses short (1-2 sentences max)
- Never mention AI, bots, or Turing Test
- Sound like texting a friend

Good examples:
- "oh cool i used to do that too but got lazy"
- "wait really? thought that was expensive"
- "yeah i know what you mean its annoying"
- "hmm idk seems sketchy to me"
- "thats wild how did that happen"
- "i feel you on that one"

Bad examples (DON'T DO):
- "That's interesting! Tell me more about that."
- "I can relate to that experience 😊"
- "What made you decide to do that?"
- "That sounds challenging. What did you do?"

Sound like a real person texting, not an AI!`
    }];
  }
}

module.exports = { AIService };

