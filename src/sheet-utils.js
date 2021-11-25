require('dotenv').config();

const _ = require('lodash');
const { googleSheetsClient } = require('./google-sheets-client');
const { generateRange, removeGuildBotMention } = require('./utils');

const firstRowId = 2;

async function addUserToSheet(rowId, id, username) {
	const range = generateRange(`A${firstRowId + rowId}:B${firstRowId + rowId}`);
	const value = [[id, username]];
	await googleSheetsClient.postBatch(range, value);
}

async function findRowUserIsLocated(message) {
	const { id, username } = message.author;

	const columnA = `A${firstRowId}:A`;
	const range = generateRange(columnA);

	// Get all the Discord IDs and usernames within the target sheet
	const data = _.flatten(await googleSheetsClient.get(range));
	const rowIdx = data.indexOf(id);

	/**
	 * User does not exist in the spreadsheet
	 * indexOf evaluates to -1, if the target is not found
	 */
	if (rowIdx === -1) addUserToSheet(data.length, id, username);
	return rowIdx !== -1 ? rowIdx : data.length;
}

async function updateUserGuildWeeklies(rowIdx, value = '0') {
	// Convert the user input value into a number
	const convertedValue = +value;

	if (Number.isNaN(convertedValue)) {
		throw new Error(`\`${value}\` is not valid for this command. Please enter a number between 1 - 5.`);
	}

	// Users should not be able to enter an amount that is greater than the weekly max (5)
	if (convertedValue > 5) {
		throw new Error(`\`${value}\` is greater than the max (5) amount of weekly mission points you can accrue in one week.`);
	}

	// If the value comes in as a negative number, then reset it to 0
	const insertValue = Math.max(Math.floor(convertedValue), 0);

	const cell = generateRange(`C${firstRowId + rowIdx}`);
	await googleSheetsClient.post(cell, insertValue);
}

async function updateUserCulvert(rowIdx, value = '0') {
	// Convert the user input value into a number
	const convertedValue = +value;

	if (Number.isNaN(convertedValue)) {
		throw new Error(`\`${value}\` is not valid for this command. Please enter a number.`);
	}

	// If the value comes in as a negative number, then reset it to 0
	const insertValue = Math.max(Math.floor(value), 0);

	const cell = generateRange(`D${firstRowId + rowIdx}`);
	await googleSheetsClient.post(cell, insertValue);
}

/**
 * We use a string value for the default value, because
 * 	we're searching for the number string instead
 */
async function updateUserFlag(rowIdx, value = '0') {
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

	const cell = generateRange(`E${firstRowId + rowIdx}`);

	/**
	 * Convert value to a number, because in the "post" method
	 * 	we do an evaluation of whether or not tha value is a
	 * 	safe integer (isSafeInteger from lodash)
	 */
	await googleSheetsClient.post(cell, +value);
}

/**
 * This functions updates all three of the user's score in the current week
 * If any value is missing, then we will default the value to 0
 *
 * @param {string} content - string of three numbers
 */
async function updateUserScores(message) {
	const rawUsersScores = removeGuildBotMention(message.content).split(' ').slice(0, 3);

	const rowIdx = await findRowUserIsLocated(message);

	const promises = [
		updateUserGuildWeeklies(rowIdx, rawUsersScores[0]),
		updateUserCulvert(rowIdx, rawUsersScores[1]),
		updateUserFlag(rowIdx, rawUsersScores[2]),
	];

	const resolvedPromises = await Promise.allSettled(promises);
	return resolvedPromises.every((resolution) => resolution.status === 'fulfilled');
}

module.exports = {
	addUserToSheet,
	findRowUserIsLocated,
	updateUserScores,
	updateUserGuildWeeklies,
	updateUserCulvert,
	updateUserFlag,
};
