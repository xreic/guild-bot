require('dotenv').config();

const flatten = require('lodash/flatten');
const { googleSheetsClient } = require('./google-sheets-client');
const {
	generateRange,
	removeGuildBotMention,
} = require('./utils');

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
	const data = flatten(await googleSheetsClient.get(range));
	const rowIdx = data.indexOf(id);

	/**
	 * User does not exist in the spreadsheet
	 * indexOf evaluates to -1, if the target is not found
	 */
	if (rowIdx === -1) addUserToSheet(data.length, id, username);
	return rowIdx !== -1 ? rowIdx : data.length;
}

async function updateUserGuildWeeklies({ rowIdx, value }) {
	// Throw an error if the value is greater than 5
	// If the value comes in as a negative number, then reset it to 0

	const cell = generateRange(`C${firstRowId + rowIdx}`);
	await googleSheetsClient.post(cell, value);

	return cell;
}

// eslint-disable-next-line no-unused-vars
async function updateUserCulvert({ rowIdx, message, value }) {
	return 'updateUserCulvert';
}

// eslint-disable-next-line no-unused-vars
async function updateUserFlag({ rowIdx, message, value }) {
	return 'updateUserFlag';
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
		updateUserGuildWeeklies({ rowIdx, value: rawUsersScores[0] }),
		// updateUserCulvert({ rowIdx, value: rawUsersScores[1] }),
		// updateUserFlag({ rowIdx, value: rawUsersScores[2] }),
	];

	const resolved = await Promise.allSettled(promises);
	console.log('resolved:', resolved);
}

module.exports = {
	addUserToSheet,
	findRowUserIsLocated,
	updateUserScores,
	updateUserGuildWeeklies,
	updateUserCulvert,
	updateUserFlag,
};
