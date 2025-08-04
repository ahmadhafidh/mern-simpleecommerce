import express from "express";
import { upload } from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  createProduct,
  getAllProducts,
  getProductByInventoryID,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

// Semua endpoint dilindungi oleh JWT
router.get("/", getAllProducts);
router.get("/inventories/:id", getProductByInventoryID);
router.get("/:id", getProductById);
router.post("/", verifyToken, upload.single("image"), createProduct);
router.put("/:id", verifyToken, upload.single("image"), updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

export default router;
