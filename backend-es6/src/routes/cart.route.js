import express from "express";
import {
  addtoCard,
  getAllcart
} from "../controllers/cart.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();
router.use(verifyToken);

router.post("/", addtoCard);
router.get("/", getAllcart);

export default router;
