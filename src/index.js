require('dotenv').config();

// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { GoogleSheetsClient } = require('./google-sheets-client');
const {
  isMessageFromABot,
  messageMentionGuildBot,
  sendChannelMessage,
} = require("./message-utils");

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
  // Initialiezd the OAuth process and stores the OAuth instance
  GoogleSheetsClient.getInstance();

  console.log('Ready!');
});

client.on('messageCreate', (message) => {
  // Retrieves the channel where the user sent message resides
  const channel = client.channels.cache.get(message.channelId);
  const sendMessageFn = sendChannelMessage(channel);

  try {
    // Filters out messages that do not trigger events
    if (isMessageFromABot(message)) return;

    /**
     * For default functionality:
     *  Record user's scores for Guild Weeklies, Culvert, and Flag Race
     */
    if (messageMentionGuildBot(message)) {
      sendMessageFn(message.content)
    } else {
      // Prefixed commands here
    }
  } catch (errMsg) {
    const parsedErrMsg = String(errMsg).slice(7);
    sendMessageFn(parsedErrMsg);
  }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);