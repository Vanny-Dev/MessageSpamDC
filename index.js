
const axios = require('axios');
const dotenv = require('dotenv');


dotenv.config();

// Configuration
const USER_TOKEN = process.env.USER_TOKEN; 
const CHANNEL_ID = process.env.CHANNEL_ID; 
const MESSAGE =  ["Automated message", "Hello, world!", "Good morning!", "Good afternoon!", "Good evening!", "Have a nice day!", "Goodbye!"];
const INTERVAL = 5000; 

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
      //data: response.data
    });
    
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

// Main function
function startMessaging() {
  console.log(`Starting to send messages to channel ID: ${CHANNEL_ID} every 5 seconds`);
  console.log('Press Ctrl+C to stop the program');
  
  // Send initial message
  sendMessage();
  
  // Set up interval to send messages every 5 seconds
  setInterval(sendMessage, INTERVAL);
}

// Start the program
startMessaging();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nStopping message sender...');
  process.exit(0);
});