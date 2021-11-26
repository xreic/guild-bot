/**
 * Determines the day of Sunday of the week for the requested date
 * 	in format of YYYY/MM/DD
 *
 * @param {string} date date string in the format of MM/DD/YYYY
 */
function calcSundayOfWeek(date) {
	// Defaults to today, if not date is requested
	const requestedDate = date ? new Date(date) : new Date();

	// Value between 0 to 6 (Sun, Mon, Tue,  Wed, Thu, Fri, Sat)
	const dayOfRequestedDate = requestedDate.getUTCDay();

	const year = requestedDate.getFullYear();
	// getMonth returns the value of the month in a 0-index fashion
	const month = requestedDate.getMonth() + 1;
	// Getting the day for the Sunday for the week of the requested date
	const day = requestedDate.getUTCDate() - dayOfRequestedDate;

	return `${year}/${month}/${day}`;
}

/**
 * Generates the full range for the spreadsheet operation to execute against
 *
 * @param {*} range the range of cell(s) for the operation to execute against
 * 	Usually in the form of:
 * 		1. "A4"
 * 		2. "A4:B18"
 * 		3. ["A4:B18", "C5"]
 * @param {string} date date string in the format of MM/DD/YYYY
 */
function generateSheetRange(range, date) {
	const sheetName = calcSundayOfWeek(date);

	if (Array.isArray(range)) {
		const ranges = range.map((el) => `${sheetName}!${el}`);
		return ranges;
	}

	return `${sheetName}!${range}`;
}

/**
 * Determines if a new spreadsheet needs to be made from the template
 * 	by checking if the day of the Sunday of the current week is the
 * 	title of an existing spreadsheet
 *
 * @param {Spreadsheet} workbook
 * 	Spreadsheet - https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#resource:-spreadsheet
 * 	Returned from spreadsheets.get - https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/get
 */
function shouldMakeNewSpreadsheet(workbook) {
	const expectedSheetName = calcSundayOfWeek();
	const workbookDoesNotHaveSheet = workbook.data.sheets.every(
		(sheet) => sheet.properties.title !== expectedSheetName,
	);

	return workbookDoesNotHaveSheet;
}

module.exports = {
	calcSundayOfWeek,
	generateSheetRange,
	shouldMakeNewSpreadsheet,
};
