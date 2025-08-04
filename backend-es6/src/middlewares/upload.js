import multer from "multer";
import path from "path";

// Konfigurasi folder upload dan nama file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Pastikan folder `uploads/` sudah ada
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `product-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

// 📌 Filter hanya menerima JPG/PNG
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Hanya file JPG/PNG yang diperbolehkan"));
};

export const upload = multer({ storage, fileFilter });
