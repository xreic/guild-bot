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
  const channel = client.channels.cache.get(message.channelId);

  try {
    if (isMessageFromABot(message)) return;
    if (messageMentionGuildBot(message)) console.log('This message mentions the guild bot.');


  } catch (errMsg) {
    const parsedErrMsg = String(errMsg).slice(7);

    const channel = client.channels.cache.get(message.channelId);
    channel.send(parsedErrMsg);
  }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);