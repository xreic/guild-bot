async function executePostRequestActions(isRequestSuccessful, discordMessage, message) {
	const replyMessage = isRequestSuccessful ?
		[
			'Your score(s) have been recorded.',
			'You can double check the spreadsheet if you want.',
			'https://docs.google.com/spreadsheets/d/1jvomrR7UV2XzH-xasM-Jduw0CzCIgFUwsxMNeZuXzZM',
		].join('\n') :
		[
			'An issue was encountered while recording your score(s).',
			'Please check the spreadsheet for any issues.',
			'`!weeklies <VALUE>`, `!culvert <VALUE>`, or `!flag <VALUE>` to fix a specific score or retry the message.',
		].join('\n');

	await Promise.allSettled([
		discordMessage.react(isRequestSuccessful ? '✅' : '❌'),
		discordMessage.reply(message || replyMessage),
	]);
}

function isMessageFromABot(message) {
	return message?.author?.bot;
}

function messageMentionGuildBot(message) {
	if (message.mentions.roles.size) {
		throw new Error(`<@${message?.author?.id}> you mentioned the role instead of the bot.`);
	}

	return message?.mentions?.members.has(process.env.DISCORD_CLIENT_ID);
}

module.exports = {
	executePostRequestActions,
	isMessageFromABot,
	messageMentionGuildBot,
};
