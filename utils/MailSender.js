const nodemailer = require("nodemailer");

async function sendEmail(body, to, username, otp) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "aahosny1@gmail.com",
        pass: "coseictcaayrjlnx",
      },
      debug: true,
    });

    const mailOptions = {
      from: "aahosny1@gmail.com",
      to: to,
      subject: "One Time Password",
      html: `
        <html>
          <head>
            <title>OTP Email</title>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
              <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">One time password</h1>
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;">
                Dear ${username},
              </p>
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;">
                ${body} <strong>${otp}</strong>
              </p>
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;">Please login to the system with this password.</p>
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;">Don't forget to change your password.</p>
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;">Thank you.</p>
            </div>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = { sendEmail };
