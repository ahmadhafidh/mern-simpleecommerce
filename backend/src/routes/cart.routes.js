const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middlewares/auth.middleware');
const { successResponse, errorResponse } = require('../utils/response'); //response standard

// Add to cart (POST)
router.post('/', auth, async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product)
    return errorResponse(res, 'Product not found', { error: 'Product not found' }, 404);

  const total = product.price * quantity;

  const cart = await prisma.cart.create({
    data: {
      productId,
      quantity,
      total,
      userId: req.user.userId // ← ambil dari token
    }
  });

  return successResponse(res, 'Add to cart successful', cart);

});

// Get all cart (for current user)
router.get('/', auth, async (req, res) => {
  const cartItems = await prisma.cart.findMany({
    where: { userId: req.user.userId },
    include: { product: true }
  });
  
  return successResponse(res, 'get all cart successful', cartItems );

});

module.exports = router;
