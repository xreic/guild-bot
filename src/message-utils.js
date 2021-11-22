require('dotenv').config();

function isMessageFromABot(message) {
	return message?.author?.bot;
}

function messageMentionGuildBot(message) {
	if (message.mentions.roles.size) {
		throw new Error(`<@${message?.author?.id}> you mentioned the role instead of the bot.`);
	}

	return message?.mentions?.members.has(process.env.DISCORD_CLIENT_ID);
}

function sendChannelMessage(channel) {
	return function _sendChannelMessage(message) {
		channel.send(message);
	};
}

module.exports = {
	isMessageFromABot,
	messageMentionGuildBot,
	sendChannelMessage,
};
