const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Configuration
const USER_TOKEN = process.env.USER_TOKEN; 
const CHANNEL_ID = process.env.CHANNEL_ID; 
const MESSAGE = ["Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
   "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).", 
   "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
     "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.",
       "On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish."];
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