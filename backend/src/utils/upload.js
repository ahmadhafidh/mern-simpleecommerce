const multer = require('multer');
const path = require('path');

// Konfigurasi folder upload dan nama file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pastikan folder `uploads/` sudah ada
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `product-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });
module.exports = upload;
