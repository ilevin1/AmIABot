// Simple AI responses for the MVP
export const aiResponses = [
  "That's interesting! Tell me more about that.",
  "I see what you mean. How do you feel about it?",
  "Hmm, I hadn't thought about it that way before.",
  "That sounds challenging. What did you do?",
  "I can relate to that experience.",
  "What made you decide to do that?",
  "That's a good point. I agree with you.",
  "How long have you been dealing with this?",
  "That must have been difficult for you.",
  "I'm curious about your perspective on this.",
  "That's fascinating! I'd love to hear more.",
  "I understand what you're going through.",
  "What was the most surprising part?",
  "That's a great question. Let me think...",
  "I've had similar experiences myself.",
  "How did you handle that situation?",
  "That sounds like it took a lot of courage.",
  "What do you think will happen next?",
  "I'm impressed by your approach to this.",
  "That's a unique way to look at it."
];

export const getRandomAIResponse = (): string => {
  return aiResponses[Math.floor(Math.random() * aiResponses.length)];
};

export const getContextualAIResponse = (userMessage: string): string => {
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
  
  // Default response
  return getRandomAIResponse();
};

