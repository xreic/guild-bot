// Env vars
require('dotenv').config();

function isMessageFromABot(message) {
  return message?.author?.bot;
}

function messageMentionGuildBot(message) {
  if (message.mentions.roles.size) {
    throw new Error(`<@${message?.author?.id}> you mentioned the role instead of the bot.`);
  }

  return message?.mentions?.members.has(process.env.CLIENT_ID);
}

module.exports = {
  isMessageFromABot,
  messageMentionGuildBot,
}