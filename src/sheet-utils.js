require('dotenv').config();

const { google } = require('googleapis');
const { GoogleSheetsClient } = require('./google-sheets-client');

function addUserToSheet() {
  // Something here
}

function findUserDiscordID() {
  // Something here
}

function updateUserScores() {
  // Something here
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
