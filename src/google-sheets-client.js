require('dotenv').config();

const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

const scopes = ['https://www.googleapis.com/auth/spreadsheets'];

class GoogleSheetsClient {
	static instance = null;

	static async getInstance() {
		if (!GoogleSheetsClient.instance) {
			try {
				const auth = new GoogleAuth({ keyFile: './src/keys.json', scopes });
				const client = await auth.getClient();

				GoogleSheetsClient.instance = google.sheets({ version: 'v4', auth: client });
			} catch (err) {
				console.log('\nERROR - getInstance');
				console.log(err);
				console.log('-------------------------------------------\n');
			}
		}

		return GoogleSheetsClient.instance;
	}

	async get(range) {
		if (!range) return;

		const client = await GoogleSheetsClient.getInstance();
		const { data } = await client.spreadsheets.values.get({
			spreadsheetId: process.env.SHEET_ID,
			range
		});

		return data.values;
	}
}

const googleSheetsClient = new GoogleSheetsClient();

module.exports = {
	GoogleSheetsClient,
	googleSheetsClient,
}
