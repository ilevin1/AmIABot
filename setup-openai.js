const fs = require('fs');
const path = require('path');

console.log('🤖 AmIABot OpenAI Setup');
console.log('======================\n');

console.log('To use real AI responses, you need an OpenAI API key:');
console.log('1. Go to https://platform.openai.com/api-keys');
console.log('2. Sign up/login to OpenAI');
console.log('3. Create a new API key');
console.log('4. Copy the key and paste it below\n');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your OpenAI API key (or press Enter to skip): ', (apiKey) => {
  if (apiKey.trim()) {
    // Update .env file
    const envPath = path.join(__dirname, '.env');
    const envContent = `# OpenAI API Key - Get yours from https://platform.openai.com/api-keys
OPENAI_API_KEY=${apiKey.trim()}

# Optional: Set to production for deployment
NODE_ENV=development`;

    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ API key saved to .env file!');
    console.log('🚀 You can now run "npm run dev" to start the server with real AI!');
  } else {
    console.log('\n⏭️  Skipped API key setup.');
    console.log('💡 The game will use fallback responses instead of real AI.');
    console.log('🚀 You can still run "npm run dev" to test the game!');
  }
  
  rl.close();
});
