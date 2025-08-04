import prisma from "../config/prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

// Add to cart (POST)
export const addtoCard = async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product)
    return errorResponse(
      res,
      "Product not found",
      { error: "Product not found" },
      404
    );

  const total = product.price * quantity;

  const cart = await prisma.cart.create({
    data: {
      productId,
      quantity,
      total,
      userId: req.user.id, // ← ambil dari token
    },
  });

  return successResponse(res, "Add to cart successful", cart);
};

// Get all cart
export const getAllcart = async (req, res) => {
  const cartItems = await prisma.cart.findMany({
    where: { userId: req.user.userId },
    include: { product: true },
  });

  return successResponse(res, "get all cart successful", cartItems);
};
