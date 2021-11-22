require('dotenv').config();

const { ZERO } = require('./constants');
const { GoogleSheetsClient } = require('./google-sheets-client');
const { removeGuildBotMention } = require('./utils');

function addUserToSheet() {
	// Something here
}

function findUserDiscordID() {
	// Something here
}

/**
 * This functions updates all three of the user's score in the current week
 * If any value is missing, then we will default the value to 0
 *
 * @param {string} content - string of three numbers
 */
function updateUserScores({ content }) {
	console.log('\n-------------- updateUserScores --------------');

	const splitChar = ' ';

	const rawUsersScores = removeGuildBotMention(content)
		.split(splitChar)
		.slice(0, 3);

	let parsedUserScores = [...rawUsersScores];

	const maxLength = 3;
	if (parsedUserScores.length < maxLength) {
		const fillerValues = Array(maxLength - parsedUserScores.length).fill(
			String(ZERO),
		);
		parsedUserScores = parsedUserScores.concat(fillerValues);
	}

	console.log('parsedUserScores:', parsedUserScores);
}

function updateUserGuildWeeklies() {
	// Something here
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
