// const { getGoogleSheetsAccessToken } = require("./googleAuth");
// const { Reservation } = require("./models/db");
// const cron = require("node-cron");

// const accessToken = getGoogleSheetsAccessToken();

// async function appendToGoogleSheet() {
//   try {
//     // Authenticate with Google Sheets API
//     const auth = await authenticateWithGoogleSheets();

//     // Create a Google Sheets API instance
//     const sheets = google.sheets({ version: "v4", auth });

//     const spreadsheetId = process.env.GOOGLE_SHEET_SUBSCRIBERS_ID;
//     const sheetName = process.env.GOOGLE_SHEETS_SUBSCRIBERS_PAGE;

//     // Prepare data for the API request
//     const values = [
//       [
//         new Date().toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         }),
//         "test@example.com",
//       ],
//     ];

//     // Append data to the sheet
//     await sheets.spreadsheets.values.append({
//       spreadsheetId,
//       range: sheetName,
//       valueInputOption: "USER_ENTERED",
//       insertDataOption: "INSERT_ROWS",
//       resource: {
//         values,
//       },
//       auth: {
//         // Use the access token obtained earlier
//         accessToken,
//       },
//     });

//     console.log("Data appended to Google Sheet successfully.");
//   } catch (error) {
//     console.error("Error appending data to Google Sheet:", error);
//   }
// }

// appendToGoogleSheet();

// // Function to authenticate with Google Sheets API

// // Call the function to export last 24 bookings to Google Sheets

// cron.schedule("36 10 * * *", async function () {
//   console.log("Fetching and sending report...");
//   await exportLast24BookingsToGoogleSheets();
//   console.log("Report sent!");
// });
