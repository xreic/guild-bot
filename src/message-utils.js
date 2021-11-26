const defaultReplyMessages = {
	defaultSuccess: [
		'Your score(s) have been recorded.',
		'You can double check the spreadsheet if you want.',
		'https://docs.google.com/spreadsheets/d/1jvomrR7UV2XzH-xasM-Jduw0CzCIgFUwsxMNeZuXzZM',
	],
	defaultFailure: [
		'An issue was encountered while recording your score(s).',
		'Please check the spreadsheet for any issues.',
		'`!weeklies <VALUE>`, `!culvert <VALUE>`, or `!flag <VALUE>` to fix a specific score or retry the message.',
	],
};

function formatReplyMessage(content, isRequestSuccessful) {
	if (!content) {
		const key = isRequestSuccessful ? 'defaultSuccess' : 'defaultFailure';
		return defaultReplyMessages[key].join('\n');
	}

	let formattedContent = content;

	if (Array.isArray(formattedContent)) formattedContent = formattedContent.join('\n');
	formattedContent = String(formattedContent).replace('Error: ', '');

	return formattedContent;
}

/**
 * Actions that should take place after a command has been executed
 * 	successfully or not
 * 	1. React the the message with ✅ on successes or ❌ on failures
 * 	2. Send a reply message
 *
 * @param {Boolean} isRequestSuccessful boolean indicating if
 * 	the execution of command(s) were successful
 * @param {Message} discordMessage Discord message the user sent
 * @param {[String]} [replyMessage] an array of strings to concat
 * 	with \n to be sent as a reply to the user
 */
async function executeBotResponses(isRequestSuccessful, discordMessage, replyMessage) {
	const botReply = formatReplyMessage(replyMessage, isRequestSuccessful);

	await Promise.allSettled([
		discordMessage.react(isRequestSuccessful ? '✅' : '❌'),
		discordMessage.reply(botReply),
	]);
}

function messageMentionsBot(message) {
	return message?.mentions?.members.has(process.env.DISCORD_CLIENT_ID);
}

async function reportErrorsInThread(discordMessage) {
	const thread = await discordMessage.startThread({ name: 'Command Issue', autoArchiveDuration: 60 });
	await thread.send(`<@${process.env.ADMIN_DISCORD_ID}>\nThis message caused an error`);
}

module.exports = {
	executeBotResponses,
	messageMentionsBot,
	reportErrorsInThread,
};
