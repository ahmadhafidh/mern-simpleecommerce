import express from "express";
import {
  Checkout,
  getAllinvoice,
  getInvoicebyId,
  getInvoicebyuseremail,
} from "../controllers/invoice.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();
router.use(verifyToken);

router.post("/checkout", Checkout);
router.get("/", getAllinvoice);
router.get("/:id", getInvoicebyId);
router.get("/user/:email", getInvoicebyuseremail);

export default router;
