require('dotenv').config();

const flatten = require('lodash/flatten');
const { googleSheetsClient } = require('./google-sheets-client');
const { removeGuildBotMention, findMostRecentSundayDate } = require('./utils');

/**
 * For accessing a specific sheet in the workbook:
 * https://stackoverflow.com/questions/53352783/how-to-call-a-specific-sheet-within-a-spreadsheet-via-the-google-sheets-api-v4-i
 */

async function addUserToSheet(rowId, id, username) {
	const firstRowId = 4;
	const range = `A${firstRowId + rowId}:B${firstRowId + rowId}`;
	const value = [[id, username]];
	await googleSheetsClient.postBatch(range, value);
}

async function findUserDiscordID(message) {
	const { id, username } = message.author;

	const dateString = findMostRecentSundayDate();
	const data = flatten(await googleSheetsClient.get(`${dateString}!A4:A`));
	const rowId = data.indexOf(id) + 1;

	/**
	 * User does not exist in the spreadsheet
	 * indexOf evaluates to -1, if the target is not found
	 */
	if (!rowId) addUserToSheet(rowId, id, username);
	return rowId;
}

/**
 * This functions updates all three of the user's score in the current week
 * If any value is missing, then we will default the value to 0
 *
 * @param {string} content - string of three numbers
 */
async function updateUserScores(message) {
	const rawUsersScores = removeGuildBotMention(message.content).split(' ').slice(0, 3);

	const rowId = await findUserDiscordID(message);
}

function updateUserGuildWeeklies(value = 0) {
	return value;
}

function updateUserCulvert() {
	// Something here
}

function updateUserFlag() {
	// Something here
}

module.exports = {
	addUserToSheet,
	findUserDiscordID,
	updateUserScores,
	updateUserGuildWeeklies,
	updateUserCulvert,
	updateUserFlag,
};
