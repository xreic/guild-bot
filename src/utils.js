/**
 * Based on zero-indexed days (Date.getDay())
 *
 * Sun - 6 days since Monday
 * Mon - 0 days since Monday
 * Tue - 1 day since Monday
 * Wed - 2 days since Monday
 * Thu - 3 days since Monday
 * Fri - 4 days since Monday
 * Sat - 5 days since Monday
 */
const diffFromMonday = [6, 0, 1, 2, 3, 4, 5];

/**
 * Determines the day of Monday (UTC) of the week for the requested date
 * 	in format of YYYY/MM/DD
 *
 * We use UTC Monday, since that's when stuff resets
 *
 * @param {string} date date string in the format of MM/DD/YYYY
 */
function getUTCMondayOfWeekFromDate(date) {
	// Defaults to today, if not date is requested
	const requestedDate = date ? new Date(date) : new Date();

	// Value between 1 to 6 (Sun, Mon, Tue,  Wed, Thu, Fri, Sat)
	/**
	 * Results in a value between 1 to 6
	 *
	 * Sunday is defaulted to 6
	 * 	Sunday's day value is 0, which is falsy
	 */
	const dayOfRequestedDate = diffFromMonday[requestedDate.getUTCDay()];

	const year = requestedDate.getFullYear();
	// getMonth returns the value of the month in a 0-index fashion
	const month = requestedDate.getMonth() + 1;
	// Getting the day for the Monday for the week of the requested date
	const day = requestedDate.getUTCDate() - dayOfRequestedDate || 1;

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
	const sheetName = getUTCMondayOfWeekFromDate(date);

	if (Array.isArray(range)) {
		const ranges = range.map((el) => `${sheetName}!${el}`);
		return ranges;
	}

	return `${sheetName}!${range}`;
}

// We use UTC Monday, since that's when stuff resets
function getAllUTCMondaysBetweenWeeks(start, end) {
	const sheets = [];
	const startDate = new Date(getUTCMondayOfWeekFromDate(start));
	const endDate = new Date(getUTCMondayOfWeekFromDate(end));

	let currentDate = startDate;

	while (currentDate <= endDate) {
		sheets.push(getUTCMondayOfWeekFromDate(currentDate));

		const nextCurrentDate = currentDate;
		nextCurrentDate.setDate(nextCurrentDate.getUTCDate() + 7);
		currentDate = nextCurrentDate;
	}

	return sheets;
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
	const expectedSheetName = getUTCMondayOfWeekFromDate();
	const workbookDoesNotHaveSheet = workbook.data.sheets.every(
		(sheet) => sheet.properties.title !== expectedSheetName,
	);

	return workbookDoesNotHaveSheet;
}

module.exports = {
	getUTCMondayOfWeekFromDate,
	generateSheetRange,
	getAllUTCMondaysBetweenWeeks,
	shouldMakeNewSpreadsheet,
};
