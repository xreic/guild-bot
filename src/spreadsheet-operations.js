const _ = require('lodash');
const { googleSheetsClient } = require('./google-sheets-client');
const { generateSheetRange, getAllUTCMondaysBetweenWeeks } = require('./utils');

/**
 * Adds the author of the message to the spreadsheet
 * 	Inserts their Discord ID and username
 *
 * @param {*} row the row to insert the values into
 * @param {Message.author} authorData message.author object from the Discord Message object
 */
async function addUserToSheet(row, authorData) {
	const range = generateSheetRange(`A${row}`);
	await googleSheetsClient.post(range, authorData.id);
}

/**
 * Finds the row in spreadsheet where the user who sent the message
 * 	is located in
 *
 * @param {Message} message Discord message the user sent
 * @param {string} possibleDate name of the spreadsheet to search (MM/DD/YYYY)
 */
async function findRowUserIsLocated(message, possibleDate) {
	// The first possible row for a user is 2, since we have titles for columns in row 1
	const firstRowIndex = 2;

	// All the cells in the A column of the target spreadsheet starting from row 2
	const columnA = `A${firstRowIndex}:A`;
	const range = generateSheetRange(columnA, possibleDate);

	// Get all the Discord IDs within the target sheet to search for the user
	const data = _.flatten(await googleSheetsClient.get(range));
	const usersRow = data.indexOf(message.author.id);

	/**
	 * If the user's ID is not found within the list, then add them to the spreadsheet
	 * Then return the row where they can be found
	 */
	if (usersRow === -1) await addUserToSheet(data.length + firstRowIndex, message.author);
	return (usersRow !== -1 ? usersRow : data.length) + firstRowIndex;
}
/**
 * Updates the user's Culvert score for the current week
 *
 * No plans on adding the functionality to change other weeks just
 * 	because guild members are dumb
 *
 * @param {*} row the row for the user being updated
 * @param {*} value the new value
 */
async function updateUserCulvert(row, value = '0') {
	// Convert the user input value into a number
	const convertedValue = +value;

	if (Number.isNaN(convertedValue)) {
		// Users should not be able to enter non-number inputs
		throw new Error(`\`${value}\` is not valid for this command. Please enter a number.`);
	}

	// If the value comes in as a negative number, then reset it to 0
	const insertValue = convertedValue < 0 ? 0 : Math.floor(value);

	const cell = generateSheetRange(`C${row}`);
	await googleSheetsClient.post(cell, insertValue);
}

/**
 * Updates the user's Flag Race score for the current week
 *
 * No plans on adding the functionality to change other weeks just
 * 	because guild members are dumb
 *
 * @param {*} row the row for the user being updated
 * @param {String} value the new value
 * 	!Important that this is a string, because we are searching against an array of strings
 */
async function updateUserFlag(row, value = '0') {
	/**
	 * Throw an error, if the value is not contained within:
	 * 	['0', '100', '200', '250', '300', '350', '400', '450', '550', '650', '800', '1000']
	 */
	const possibleFlagScores = ['0', '100', '200', '250', '300', '350', '400', '450', '550', '650', '800', '1000'];
	const isScorePossible = possibleFlagScores.indexOf(value) !== -1;

	if (!isScorePossible) {
		throw new Error([
			`\`${value}\` is not a possible flag score.`,
			'Please enter a value from the following:',
			'0, 100, 200, 250, 300, 350, 400, 450, 550, 650, 800, 1000',
		].join('\n'));
	}

	const cell = generateSheetRange(`D${row}`);

	/**
	 * Convert value to a number, because in the "post" method
	 * 	we do an evaluation of whether or not tha value is a
	 * 	safe integer (isSafeInteger from lodash)
	 */
	await googleSheetsClient.post(cell, +value);
}

/**
 * Updates all three of the user's scores for the week
 * The expected message is: @bot <1> <2>
 * 		1. Culvert score (defaults to 0)
 * 		2. Flag race score (defaults to 0)
 *
 * No plans on adding the functionality to change other weeks just
 * 	because guild members are dumb
 *
 * @param {Message} message Discord message the user sent
 */
async function updateUserScores(message) {
	/**
	 * 1. Removes the bot mention
	 * 2. Trims whitespace
	 * 3. Convert the string into an array of arguments
	 * 3. Get the relevant arguments (Culvert and Flag)
	 */
	const rawUsersScores = message.content
		.replace(`<@!${process.env.DISCORD_CLIENT_ID}> `, '')
		.trim()
		.split(' ')
		.slice(0, 2);

	const rowIdx = await findRowUserIsLocated(message);

	const promises = [
		updateUserCulvert(rowIdx, rawUsersScores[0]),
		updateUserFlag(rowIdx, rawUsersScores[1]),
	];

	const resolvedPromises = await Promise.allSettled(promises);
	return resolvedPromises.every((resolution) => resolution.status === 'fulfilled');
}

async function updateMarbleSheet(startDate = new Date(), endDate = new Date()) {
	const sheets = getAllUTCMondaysBetweenWeeks(startDate, endDate);
	const ranges = sheets.map((sheet) => generateSheetRange(['B2:B', 'G2:G'], sheet));
	const { valueRanges } = await googleSheetsClient.batchGet(ranges);

	const chunkedRanges = _.chunk(valueRanges.map((range) => range.values), 2);

	const marbleEntriesSheetData = [];

	for (let i = 0; i < chunkedRanges.length; i += 1) {
		const [users, marblesPerUser] = chunkedRanges[i];

		for (let j = 0; j < users.length; j += 1) {
			const user = users?.[j]?.[0];

			const marblesForUser = Number(marblesPerUser?.[j]?.[0]) || 0;

			const list = Array(marblesForUser).fill([user]);
			marbleEntriesSheetData.push(...list);
		}
	}

	const marblesSheetRange = 'Marbles!A:A';
	await googleSheetsClient.clearSheet(marblesSheetRange);

	const sorted = marbleEntriesSheetData.sort();
	await googleSheetsClient.postBatch(marblesSheetRange, sorted);
}

module.exports = {
	findRowUserIsLocated,
	updateUserScores,
	updateUserCulvert,
	updateUserFlag,
	updateMarbleSheet,
};
