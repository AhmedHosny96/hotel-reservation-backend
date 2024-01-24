const cron = require("node-cron");
const { Reservation, sequelize, Expense } = require("./models/db");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const fetchDataAndSendReport = async () => {
  try {
    // 1. Total Number of Reservations Made in the Last 24 Hours
    const totalReservations = await Reservation.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date() - 24 * 60 * 60 * 1000),
        },
      },
    });

    // 2. Total Paid Amount of Reservations in the Last 24 Hours
    const totalPaidAmount = await Reservation.sum("totalPrice", {
      where: {
        paymentStatus: "Paid",
        createdAt: {
          [Op.gte]: new Date(new Date() - 24 * 60 * 60 * 1000),
        },
      },
    });

    // 3. Cancelled Reservations and Refunded Reservations
    const cancelledRefundedReservations = await Reservation.findAll({
      where: {
        [Op.or]: [{ status: "Cancelled" }, { paymentStatus: "Refunded" }],
        createdAt: {
          [Op.gte]: new Date(new Date() - 24 * 60 * 60 * 1000),
        },
      },
    });

    const startDate = new Date(new Date() - 24 * 60 * 60 * 1000);

    const totalExpense = await Expense.sum("amount", {
      where: {
        date: {
          [Op.gte]: startDate,
        },
      },
    });

    // Create a table
    const pdfPath = "./report.pdf";
    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(fs.createWriteStream(pdfPath));

    // Add content to the PDF
    pdfDoc.fontSize(16).text("Daily Report", { align: "center" }).moveDown(1);

    // Define the table columns
    const columns = ["Metric", "Value"];

    // Define the table rows
    const rows = [
      ["Total Bookings", totalReservations ?? 0],
      ["Total Paid Amount", totalPaidAmount ?? 0],
      ["Cancelled Bookings", cancelledRefundedReservations.length],
      ["Total Expenses", totalExpense],
    ];

    // Calculate column widths
    const columnWidths = [120, 120]; // Adjust the widths based on your requirements

    // Calculate total table width
    const totalTableWidth = columnWidths.reduce((acc, width) => acc + width, 0);

    // Set starting position
    const startX = (pdfDoc.page.width - totalTableWidth) / 2;
    let currentY = pdfDoc.y + 20; // Adjust the starting Y position based on your requirements

    pdfDoc.fontSize(12).font("Helvetica-Bold");
    pdfDoc
      .moveTo(startX, currentY)
      .lineTo(startX + totalTableWidth, currentY)
      .stroke();
    pdfDoc.text(columns[0], startX + 5, currentY + 5);
    pdfDoc.text(columns[1], startX + columnWidths[0] + 25, currentY + 5);

    currentY += 20;

    // Draw the table rows with lines
    pdfDoc.font("Helvetica").fontSize(10);
    for (const row of rows) {
      pdfDoc
        .moveTo(startX, currentY)
        .lineTo(startX + totalTableWidth, currentY)
        .stroke();
      pdfDoc.text(row[0], startX + 5, currentY + 5);
      pdfDoc.text(
        (row[1] ?? "").toString(),
        startX + columnWidths[0] + 25,
        currentY + 5
      );

      currentY += 15;
    }

    pdfDoc.end();
    // pdfDoc.text((row[1] ?? '').toString(), tableX + columnWidths[0] + 25, yPosition + 5);

    // Log or send the results in your report
    console.log("PDF created:", pdfPath);

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
      to: "ahmed@raysmfi.com",
      subject: "Daily Report",
      text: "Find the below attachment ",
      attachments: [
        {
          filename: "report.pdf",
          path: pdfPath,
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  } catch (error) {
    console.error("Error fetching and sending report:", error);
  }
};

// Schedule the job at 7:30 PM every day

cron.schedule("50 17 * * *", async function () {
  console.log("Fetching and sending report...");
  await fetchDataAndSendReport();
  console.log("Report sent!");
});

module.exports = { fetchDataAndSendReport };
