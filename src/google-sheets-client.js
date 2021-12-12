const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
const _ = require('lodash');
const {
	getUTCMondayOfWeekFromDate,
	shouldMakeNewSpreadsheet,
} = require('./utils');

const spreadsheetId = process.env.SHEET_ID;
const scopes = ['https://www.googleapis.com/auth/spreadsheets'];

class GoogleSheetsClient {
	static instance = null;
	static sheetURL = null;

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

	async retrieveSheetURL() {
		const client = await GoogleSheetsClient.getInstance();
		const workbookData = await client.spreadsheets.get({ spreadsheetId });

		console.log('retrieveSheetURL');
		console.log('workbookData?.data?.sheets:', workbookData?.data?.sheets);

		const firstSheet = workbookData?.data?.sheets?.[0]?.properties?.sheetId;
		GoogleSheetsClient.sheetURL = `${process.env.SHEET_URL}/edit#gid=${firstSheet}`;
	}

	async duplicateTemplateSheet() {
		try {
			const client = await GoogleSheetsClient.getInstance();

			const resource = {
				requests: [
					{
						duplicateSheet: {
							sourceSheetId: 0,
							newSheetName: getUTCMondayOfWeekFromDate()
						},
					},
				],
			};

			await client.spreadsheets.batchUpdate({ spreadsheetId, resource });
			await this.retrieveSheetURL();
		} catch (err) {
			console.log('\nERROR - createNewSheet');
			console.log(err);
			console.log('-------------------------------------------\n');
		}
	}

	async get(range) {
		if (!range) return;

		const client = await GoogleSheetsClient.getInstance();

		/**
		 * I believe this should be the only instance of having to use "duplicateTemplateSheet",
		 * 	because the first action for any new sheet in the workbook is always searching
		 * 	if the user exists in the current week's sheet (done via this method).
		 *
		 * 	So if the sheet doesn't exist, then this method will create the new sheet for us
		 * 		so all further operations do not necessitate the usage of "duplicateTemplateSheet"
		 */
		const workbookData = await client.spreadsheets.get({ spreadsheetId });
		await this.retrieveSheetURL();
		if (shouldMakeNewSpreadsheet(workbookData)) await this.duplicateTemplateSheet();

		const { data } = await client.spreadsheets.values.get({ spreadsheetId, range });
		return data.values;
	}

	async batchGet(ranges) {
		if (!ranges) return;

		const client = await GoogleSheetsClient.getInstance();
		const { data } = await client.spreadsheets.values.batchGet({ spreadsheetId, ranges });

		return data;
	}

	// Assume that a value is always passed, because I don't want to deal with logic for parsing the number 0
	async post(range, value) {
		if (!range) return;

		const client = await GoogleSheetsClient.getInstance();

		const resource = { values: [[value]] };
		await client.spreadsheets.values.update({
			spreadsheetId,
			range,
			valueInputOption: "RAW",
			resource,
		});
	}

	// We just have to trust that the values is done properly
	async postBatch(range, values) {
		if (!range || !values) return;

		const client = await GoogleSheetsClient.getInstance();

		const resource = { data: [{ range, values }], valueInputOption: 'RAW' };
		await client.spreadsheets.values.batchUpdate({ spreadsheetId, resource });
	}

	// Clears the range specified
	async clearSheet(range) {
		if (!range) return;

		const client = await GoogleSheetsClient.getInstance();
		await client.spreadsheets.values.clear({ spreadsheetId, range, resource: {} });
	}
}

const googleSheetsClient = new GoogleSheetsClient();

module.exports = {
	GoogleSheetsClient,
	googleSheetsClient,
}
