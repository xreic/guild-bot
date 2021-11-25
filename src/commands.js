const { executePostRequestActions } = require('./message-utils');
const sheetUtils = require('./sheet-utils');

async function retrieveArgs(discordMessage) {
	const rowIdx = await sheetUtils.findRowUserIsLocated(discordMessage);

	// Assume that the format of the command is: !weeklies 5
	const value = discordMessage.content.split(' ')[1];

	return { rowIdx, value };
}

async function updateWeekliesCommand(discordMessage) {
	try {
		const { rowIdx, value } = await retrieveArgs(discordMessage);

		if (value === null || value === undefined) throw new Error('Please enter a number (1 - 5).');

		await sheetUtils.updateUserGuildWeeklies(rowIdx, value);
		await executePostRequestActions(true, discordMessage);
	} catch (err) {
		await executePostRequestActions(false, discordMessage, String(err));
	}
}

async function updateCulvertCommand(discordMessage) {
	try {
		const { rowIdx, value } = await retrieveArgs(discordMessage);

		if (value === null || value === undefined) throw new Error('Please enter a number.');

		await sheetUtils.updateUserCulvert(rowIdx, value);
		await executePostRequestActions(true, discordMessage);
	} catch (err) {
		await executePostRequestActions(false, discordMessage, String(err));
	}
}

async function updateFlagCommand(discordMessage) {
	try {
		const { rowIdx, value } = await retrieveArgs(discordMessage);

		if (value === null || value === undefined) {
			throw new Error([
				'Please enter a number from the following:',
				'0, 100, 200, 250, 300, 350, 400, 450, 550, 650, 800, 1000',
			].join('\n'));
		}

		await sheetUtils.updateUserFlag(rowIdx, value);
		await executePostRequestActions(true, discordMessage);
	} catch (err) {
		await executePostRequestActions(false, discordMessage, String(err));
	}
}

const commandMap = {
	'!weeklies': updateWeekliesCommand,
	'!culvert': updateCulvertCommand,
	'!flag': updateFlagCommand,
};

module.exports = {
	botCommands: commandMap,
};
