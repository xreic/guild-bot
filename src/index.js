require('dotenv').config();

const fs = require('fs');
// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const messageUtils = require('./message-utils');
const sheetUtils = require('./sheet-utils');
const { botCommands } = require('./commands');

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
		// Filters out messages that do not trigger events
		if (messageUtils.isMessageFromABot(discordMessage)) return;

		/**
		 * For default functionality:
		 *  Record user's scores for Guild Weeklies, Culvert, and Flag Race
		 */
		if (messageUtils.messageMentionGuildBot(discordMessage)) {
			const success = await sheetUtils.updateUserScores(discordMessage);
			await messageUtils.executePostRequestActions(success, discordMessage);
		} else {
			// Only do something, if the message has the command prefix (!)
			if (discordMessage.content[0] !== '!') return;

			// Retrieve the prefixed command
			const command = discordMessage.content.split(' ')[0];
			if (botCommands[command]) await botCommands[command](discordMessage);
		}
	} catch (errMsg) {
		console.log('\n\n------------------');
		console.log(`${discordMessage.author.username} (Discord ID: ${discordMessage.author.id}) triggered an error with:`);
		console.log(discordMessage.content);
		console.log(errMsg);
	}
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);

