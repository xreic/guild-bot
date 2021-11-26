const { executeBotResponses } = require('./message-utils');
const sheetUtils = require('./spreadsheet-operations');

/**
 * Function to remove the repetitiveness of having to get the
 * 	row of the user and the possible arguments to other functions
 *
 * @param {Message} message Discord message the user sent
 */
async function retrieveArgs(message) {
	const rowIdx = await sheetUtils.findRowUserIsLocated(message);

	/**
	 * Assume that the format of the command is: !<COMMAND> <VALUE>
	 * See "commandMap" for available commands
	 */
	const value = message.content.split(' ')[1];

	return { rowIdx, value };
}

/**
 * Updates the user's weekly mission points for the week
 *
 * No plans on adding the functionality to change other weeks just
 * 	because guild members are dumb
 *
 * @param {Message} discordMessage Discord message the user sent
 */
async function updateWeekliesCommand(discordMessage) {
	try {
		const { rowIdx, value } = await retrieveArgs(discordMessage);
		if (value === null || value === undefined) throw new Error('Please enter a number (0 - 5).');

		await sheetUtils.updateUserGuildWeeklies(rowIdx, value);
		await executeBotResponses(true, discordMessage);
	} catch (err) {
		await executeBotResponses(false, discordMessage, err);
	}
}

/**
 * Updates the user's culvert score for the week
 *
 * No plans on adding the functionality to change other weeks just
 * 	because guild members are dumb
 *
 * @param {Message} discordMessage Discord message the user sent
 */
async function updateCulvertCommand(discordMessage) {
	try {
		const { rowIdx, value } = await retrieveArgs(discordMessage);
		if (value === null || value === undefined) throw new Error('Please enter a number.');

		await sheetUtils.updateUserCulvert(rowIdx, value);
		await executeBotResponses(true, discordMessage);
	} catch (err) {
		await executeBotResponses(false, discordMessage, err);
	}
}

/**
 * Updates the user's flag race score for the week
 *
 * No plans on adding the functionality to change other weeks just
 * 	because guild members are dumb
 *
 * @param {Message} discordMessage Discord message the user sent
 */
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
		await executeBotResponses(true, discordMessage);
	} catch (err) {
		await executeBotResponses(false, discordMessage, err);
	}
}

/**
 * Updates the user's weekly mission points for the week
 *
 * No plans on adding the functionality to change other weeks just
 * 	because guild members are dumb
 *
 * @param {Message} discordMessage Discord message the user sent
 */
async function retrieveWeeklyScore(discordMessage) {
	try {
		const possibleDateArg = discordMessage.content.split(' ')[1];

		const rowIdx = await sheetUtils.findRowUserIsLocated(discordMessage, possibleDateArg);

		const data = await sheetUtils.retrieveUserData(rowIdx, possibleDateArg);

		const replyMessage = [
			'Your scores for the week are:',
			`Weekly Mission Points: ${data[0]}`,
			`Culvert: ${data[1]}`,
			`Flag: ${data[2]}`,
			`Marbles: ${data[3]} (\`!raffle\`)`,
		];
		await executeBotResponses(true, discordMessage, replyMessage);
	} catch (err) {
		const replyMessage = [
			'There was an issue retrieving your score.',
			'If you entered a date, then make sure that the date is correct and in the right format:',
			'MM/DD/YY or MM/DD/YYYY',
		];
		await executeBotResponses(false, discordMessage, replyMessage);
	}
}

async function printRaffleDetails(discordMessage) {
	const raffleDetails = [
		'We hold a monthly raffle with entries based on your participation.',
		'The prizes are **20K, 10K, and 10K NX** for **1st, 2nd, and 3rd place in marbles**.',
		'',
		'Culvert: 1 marble',
		'Flag Race: 1 marble per 100 points',
		'Weekly Mission Points: 1 marble per 2 WMP, 5 WMP = 4 marbles',
	].join('\n');

	await discordMessage.reply(raffleDetails);
}

const commandMap = {
	'!weeklies': updateWeekliesCommand,
	'!culvert': updateCulvertCommand,
	'!flag': updateFlagCommand,
	'!score': retrieveWeeklyScore,
	'!raffle': printRaffleDetails,
};

module.exports = {
	botCommands: commandMap,
};
