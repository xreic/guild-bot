// Get environment variables
require('dotenv').config();

// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { isMessageFromABot, messageMentionGuildBot } = require('./message-utils');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on('messageCreate', (message) => {
  // Retrieves the channel where the user sent message resides
  const channel = client.channels.cache.get(message.channelId);

  try {
    // Filters out messages that do not trigger events
    if (isMessageFromABot(message)) return;

    channel.send('Wow you did something.');

    /**
     * For default functionality:
     *  Record user's scores for Guild Weeklies, Culvert, and Flag Race
     */
    if (messageMentionGuildBot(message)) {
      // Stuff here
    } else {
      // Prefixed commands here
    }
  } catch (errMsg) {
    const parsedErrMsg = String(errMsg).slice(7);

    const channel = client.channels.cache.get(message.channelId);
    channel.send(parsedErrMsg);
  }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);