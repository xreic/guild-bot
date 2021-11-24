function findMostRecentSundayDate() {
	const todaysDate = new Date();
	const daysSinceSunday = todaysDate.getUTCDay();

	// Months are 0-indexed, so we add 1
	return `${todaysDate.getFullYear()}/${todaysDate.getMonth() + 1}/${todaysDate.getUTCDate() - daysSinceSunday}`;
}

function generateRange(range) {
	const sheetName = findMostRecentSundayDate();

	return `${sheetName ? `${sheetName}!` : ''}${range}`;
}

function removeGuildBotMention(string) {
	return string.replace('<@!912148184099328100> ', '').trim();
}

function shouldMakeNewSpreadsheet(workbook) {
	const expectedSheetName = findMostRecentSundayDate();
	const workbookDoesNotHaveSheet = workbook.data.sheets.every(
		(sheet) => sheet.properties.title !== expectedSheetName,
	);

	return workbookDoesNotHaveSheet;
}

module.exports = {
	findMostRecentSundayDate,
	generateRange,
	removeGuildBotMention,
	shouldMakeNewSpreadsheet,
};
