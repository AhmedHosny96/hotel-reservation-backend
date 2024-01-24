const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
async function getGoogleSheetsAccessToken() {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const jwtToken = jwt.sign(
    {
      iss: process.env.GOOGLE_SHEET_SERVICE_ACCOUNT,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://accounts.google.com/o/oauth2/token",
      exp,
      iat,
    },
    process.env.jwtSecret,
    { algorithm: "HS256" }
  );

  const { access_token } = await fetch(
    "https://accounts.google.com/o/oauth2/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwtToken,
      }),
    }
  ).then((response) => response.json());
  return access_token;
}

module.exports = { getGoogleSheetsAccessToken };
