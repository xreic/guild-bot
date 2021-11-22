require('dotenv').config();

const { google } = require('googleapis');

class GoogleSheetsClient {
  static instance = null;

  static getInstance() {
    if (!GoogleSheetsClient.instance) {
      const auth = new google.auth.OAuth2(
        process.env.GAPI_CLIENT_ID,
        process.env.GAPI_CLIENT_SECRET,
      );

      GoogleSheetsClient.instance = google.sheets({ version: 'v4', auth });
    }

    return GoogleSheetsClient.instance;
  }
}

module.exports = {
  GoogleSheetsClient
}
