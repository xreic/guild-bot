require('dotenv').config();

// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Intents } = require('discord.js');
const messageUtils = require('./message-utils');
const sheetUtils = require('./sheet-utils');


// Create a new client instance
const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
	try {
		// Turn the ENV VAR Service Account JSON key into a file for Google Auth to read
		fs.writeFileSync('./src/keys.json', JSON.stringify(JSON.parse(process.env.CREDENTIALS)));
		console.log('Ready!');
	} catch (err) {
		console.log('\nERROR - client.once - ready');
		console.log(err);
		console.log('-------------------------------------------\n');
	}
});

client.on('messageCreate', (message) => {
	// Retrieves the channel where the user sent message resides
	const channel = client.channels.cache.get(message.channelId);
	const sendMessageFn = messageUtils.sendChannelMessage(channel);

	try {
		// Filters out messages that do not trigger events
		if (messageUtils.isMessageFromABot(message)) return;

		/**
		 * For default functionality:
		 *  Record user's scores for Guild Weeklies, Culvert, and Flag Race
		 */
		if (messageUtils.messageMentionGuildBot(message)) {
			sheetUtils.updateUserScores(message);
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
