const multer = require("multer");
const path = require("path");

// Setup Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in the "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`);
  },
});

// Configure multer
const upload = multer({ storage: storage });

module.exports = upload;
