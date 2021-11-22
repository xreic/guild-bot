function removeGuildBotMention(string) {
	return string.replace('<@!912148184099328100> ', '').trim();
}

module.exports = {
	removeGuildBotMention,
};
