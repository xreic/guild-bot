require('dotenv').config();

const { googleSheetsClient } = require('./google-sheets-client');
const { removeGuildBotMention } = require('./utils');

function addUserToSheet() {
	// Something here
}

async function findUserDiscordID(message) {
	console.log('\n-------------- findUserDiscordID --------------');
	const { id, username } = message.author;

	console.log('id:', id);
	console.log('username:', username);

	const data = await googleSheetsClient.get('A4:A');
	console.log('data:', data);
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
