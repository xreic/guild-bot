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
async function updateWeeklyCommand(discordMessage) {
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

async function printRaffleDetails(discordMessage) {
	const raffleDetails = [
		'We hold a monthly raffle with entries based on your participation.',
		'The prizes are **20K, 10K, and 10K NX** for **1st, 2nd, and 3rd place in marbles**.',
		'Culvert: 1 marble (score does not matter)',
		'Flag Race: 1 marble per 100 points',
	].join('\n');

	await discordMessage.reply(raffleDetails);
}

async function generateMarblesCSV(discordMessage) {
	console.log(0);
	const validUser = discordMessage.member.roles.cache.some(
		(role) => {
			console.log('role:', role);
			console.log('role.name:', role.name);
			return role.name === process.env.ADMIN_ROLE;
		},
	);
	console.log('0-1');

	// eslint-disable-next-line no-unused-vars
	const [_, start, end] = discordMessage.content.split(' ');
	console.log('0-2');

	console.log('process.env.ADMIN_ROLE:', process.env.ADMIN_ROLE);
	console.log('validUser:', validUser);

	if (!validUser || !start || !end) {
		console.log('0-3');
		await executeBotResponses(false, discordMessage, []);
	} else {
		console.log('0-4');
		try {
			console.log('0-5');
			await sheetUtils.updateMarbleSheet(start, end);
			await executeBotResponses(true, discordMessage, []);
		} catch (err) {
			await executeBotResponses(false, discordMessage, [err]);
			throw err;
		}
	}
}

const commandMap = {
	'!weekly': updateWeeklyCommand,
	'!culvert': updateCulvertCommand,
	'!flag': updateFlagCommand,
	'!raffle': printRaffleDetails,
	'!marbles': generateMarblesCSV,
};

module.exports = {
	botCommands: commandMap,
};
