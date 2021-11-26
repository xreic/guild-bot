require('dotenv').config();

const fs = require('fs');
// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { botCommands } = require('./commands');
const {
	executeBotResponses,
	messageMentionsBot,
	reportErrorsInThread,
} = require('./message-utils');
const { updateUserScores } = require('./spreadsheet-operations');

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

client.on('messageCreate', async (discordMessage) => {
	try {
		/**
		 * Ignored messages:
		 * 	1. Bot messages
		 */
		if (discordMessage.author.bot) return;

		/**
		 * For default functionality: @bot <WEEKLY MISSION POINTS> <CULVERT> <FLAG>
		 *  Record user's scores for Guild Weeklies, Culvert, and Flag Race
		 */
		if (messageMentionsBot(discordMessage)) {
			const success = await updateUserScores(discordMessage);
			await executeBotResponses(success, discordMessage);
		} else {
			// Retrieve the prefixed command
			const command = discordMessage.content.split(' ')[0];
			if (botCommands[command]) await botCommands[command](discordMessage);
		}
	} catch (errMsg) {
		console.log(`${discordMessage.author.username} (Discord ID: ${discordMessage.author.id}) triggered an error with:`);
		console.log(discordMessage.content);
		console.log(errMsg);

		await reportErrorsInThread(discordMessage, errMsg);
	}
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);

