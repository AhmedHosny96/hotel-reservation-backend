const multer = require("multer");
const path = require("path");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/uploads/"); // Directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = req.body.phone;
    cb(null, `${uniqueSuffix}-ID-PHOTO`); // Define the filename
  },
});

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // Limit file size if needed
  fileFilter: function (req, file, cb) {
    // File filter logic if needed (e.g., allow only certain file types)
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only images of type JPEG/JPG/PNG are allowed!"));
  },
});

module.exports = { upload };
