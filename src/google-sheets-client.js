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

	async post(range, value) {
		if (!range || !value) return;
	}

	async postBatch(range, values) {
		if (!range || !values) return;

		const data = [{ range, values }];
		const resource = { data, valueInputOption: 'RAW' };

		try {
			const client = await GoogleSheetsClient.getInstance();
			await client.spreadsheets.values.batchUpdate({
				spreadsheetId: process.env.SHEET_ID,
				resource
			});

			return true;
		} catch (err) {
			return false;
		}
	}
}

const googleSheetsClient = new GoogleSheetsClient();

module.exports = {
	GoogleSheetsClient,
	googleSheetsClient,
}
