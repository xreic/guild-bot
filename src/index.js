require('dotenv').config();

const fs = require('fs');
// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const messageUtils = require('./message-utils');
const sheetUtils = require('./sheet-utils');

// Create a new client instance
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	],
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
	try {
		client.user.setActivity('Maplestory with Crowned');

		// Turn the ENV VAR Service Account JSON key into a file for Google Auth to read
		fs.writeFileSync('./src/keys.json', JSON.stringify(JSON.parse(process.env.CREDENTIALS)));
		console.log('Ready!');
	} catch (err) {
		console.log('\nERROR - client.once - ready');
		console.log(err);
		console.log('-------------------------------------------\n');
	}
});

client.on('messageCreate', async (message) => {
	try {
		// Filters out messages that do not trigger events
		if (messageUtils.isMessageFromABot(message)) return;

		/**
		 * For default functionality:
		 *  Record user's scores for Guild Weeklies, Culvert, and Flag Race
		 */
		if (messageUtils.messageMentionGuildBot(message)) {
			const success = await sheetUtils.updateUserScores(message);
			await messageUtils.executePostRequestActions(success, message);
		} else {
			// Only do something, if the message has the command prefix (!)
			if (message.content[0] !== '!') return;

			// Prefixed commands here
			console.log('\n-------------- Commands --------------');
			const command = message.content.split(' ')[0];
			console.log('command:', command);
		}
	} catch (errMsg) {
		console.log('\n-------------- messageCreate - ERROR --------------');
		console.log(errMsg);
	}
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);

