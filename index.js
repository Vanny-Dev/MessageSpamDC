const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Configuration
const USER_TOKEN = process.env.USER_TOKEN; 
const CHANNEL_ID = process.env.CHANNEL_ID; 
const MESSAGE = ["Automated message", "Hello, world!", "Good morning!", "Good afternoon!", "Good evening!", "Have a nice day!", "Goodbye!"];
const INTERVAL = 6000; // 6 seconds

// Common emojis for reactions
const EMOJIS = [
  "👍", "❤️", "🔥", "🎉", "😂", "🚀", "✅", "👏",
  "🙌", "⭐", "💯", "🤔", "👀", "🌟", "💪", "🎊"
];

// Function to send a message to the specified channel
async function sendMessage() {
  try {
    const response = await axios.post(
      `https://discord.com/api/v9/channels/${CHANNEL_ID}/messages`,
      {
        content: MESSAGE[Math.floor(Math.random() * MESSAGE.length)],
        tts: false,
      },
      {
        headers: {
          'Authorization': USER_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log({
      timestamp: new Date().toLocaleTimeString(),
      message: response.data.content,
      channel: response.data.channel_id,
    });
    
    // Add multiple random reactions to the message
    await addMultipleReactions(response.data.id);
    
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.response ? error.response.data : error.message);
    
    // If rate limited, log the retry time
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.data.retry_after || 5;
      console.log(`Rate limited. Retry after ${retryAfter} seconds.`);
    }
  }
}

// Function to add a reaction to a message
async function addReaction(messageId, emoji) {
  try {
    // Encode the emoji for URL
    const encodedEmoji = encodeURIComponent(emoji);
    
    await axios.put(
      `https://discord.com/api/v9/channels/${CHANNEL_ID}/messages/${messageId}/reactions/${encodedEmoji}/@me`,
      {},
      {
        headers: {
          'Authorization': USER_TOKEN,
        },
      }
    );
    
    console.log(`Added reaction ${emoji} to message ${messageId}`);
  } catch (error) {
    console.error(`Error adding reaction ${emoji}:`, error.response ? error.response.data : error.message);
    
    // If rate limited, log the retry time
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.data.retry_after || 1;
      console.log(`Rate limited for reactions. Retry after ${retryAfter} seconds.`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    }
  }
}

// Function to add multiple random reactions to a message
async function addMultipleReactions(messageId) {
  // Randomly decide how many reactions to add (2-5)
  const reactionCount = Math.floor(Math.random() * 4) + 2;
  
  // Shuffle and select random emojis without duplicates
  const shuffledEmojis = [...EMOJIS].sort(() => 0.5 - Math.random());
  const selectedEmojis = shuffledEmojis.slice(0, reactionCount);
  
  console.log(`Adding ${reactionCount} reactions to message ${messageId}`);
  
  // Add reactions with delay between each to avoid rate limits
  for (const emoji of selectedEmojis) {
    await addReaction(messageId, emoji);
    // Small delay between adding reactions to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Main function
function startMessaging() {
  console.log(`Starting to send messages to channel ID: ${CHANNEL_ID} every ${INTERVAL/1000} seconds`);
  console.log('Each message will receive 2-5 random reactions');
  console.log('Press Ctrl+C to stop the program');
  
  // Send initial message
  sendMessage();
  
  // Set up interval to send messages
  setInterval(sendMessage, INTERVAL);
}

// Start the program
startMessaging();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nStopping message sender...');
  process.exit(0);
});