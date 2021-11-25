async function executePostRequestActions(isRequestSuccessful, message) {
	const replyMessage = isRequestSuccessful ?
		'Your scores have been recorded.\nYou can double check the spreadsheet if you want.\nSee the channel topic for the URL.' :
		'An issue was encountered while recording your scores.\nPlease check the spreadsheet for any issues.\n`!weeklies`, `!culvert`, or `!flag` to fix a specific score or retry the message.';

	await Promise.allSettled([
		message.react(isRequestSuccessful ? '✅' : '❌'),
		message.reply(replyMessage),
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
