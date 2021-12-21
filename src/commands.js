const { executeBotResponses } = require('./message-utils');
const sheetUtils = require('./spreadsheet-operations');
const sunnySundayJSON = require('./sunny-sunday.json');

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
	const validUser = discordMessage.member.roles.cache.some(
		(role) => role.id === process.env.ADMIN_ROLE_ID,
	) || discordMessage.author.id === process.env.ADMIN_ID;

	// eslint-disable-next-line no-unused-vars
	const [_, start, end] = discordMessage.content.split(' ');

	if (!validUser || !start || !end) {
		const reply = !validUser ?
			[`Only users with the <@&${process.env.ADMIN_ROLE_ID}> role can use this command.`] :
			['Please enter start and end date ranges to utilize this command (MM/DD/YYYY).'];

		await executeBotResponses(false, discordMessage, reply);
	} else {
		try {
			await sheetUtils.updateMarbleSheet(start, end);
			await executeBotResponses(true, discordMessage, []);
		} catch (err) {
			await executeBotResponses(false, discordMessage, [err]);
		}
	}
}

async function replyWithSunnySunday(discordMessage) {
	const thread = await discordMessage.startThread({ name: 'Sunny Sunday', autoArchiveDuration: 60 });

	for (let i = 0; i < sunnySundayJSON.length; i += 1) {
		const sunnySundayWeek = sunnySundayJSON[i].join('\n');
		// eslint-disable-next-line no-await-in-loop
		await thread.send(sunnySundayWeek);
	}
}

const commandMap = {
	'!gpq': updateCulvertCommand,
	'!culvert': updateCulvertCommand,
	'!flag': updateFlagCommand,
	'!raffle': printRaffleDetails,
	'!marbles': generateMarblesCSV,
	'!sunnysunday': replyWithSunnySunday,
};

module.exports = {
	botCommands: commandMap,
};
