require('dotenv').config();

const flatten = require('lodash/flatten');
const { googleSheetsClient } = require('./google-sheets-client');
const { removeGuildBotMention } = require('./utils');

/**
 * For accessing a specific sheet in the workbook:
 * https://stackoverflow.com/questions/53352783/how-to-call-a-specific-sheet-within-a-spreadsheet-via-the-google-sheets-api-v4-i
 */

async function addUserToSheet(rowIdx, id, username) {
	const firstRowIdx = 4;
	const range = `A${firstRowIdx + rowIdx}:B${firstRowIdx + rowIdx}`;
	const value = [[id, username]];
	await googleSheetsClient.postBatch(range, value);
}

async function findUserDiscordID(message) {
	const { id, username } = message.author;

	const data = flatten(await googleSheetsClient.get('A4:A'));
	const idxUserDiscordID = data.indexOf(id) + 1;

	/**
	 * User does not exist in the spreadsheet
	 * indexOf evaluates to -1, if the target is not found
	 */
	if (!idxUserDiscordID) addUserToSheet(idxUserDiscordID, id, username);
}

/**
 * This functions updates all three of the user's score in the current week
 * If any value is missing, then we will default the value to 0
 *
 * @param {string} content - string of three numbers
 */
async function updateUserScores(message) {
	const rawUsersScores = removeGuildBotMention(message.content).split(' ').slice(0, 3);

	await findUserDiscordID(message);
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
