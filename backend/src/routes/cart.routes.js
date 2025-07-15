const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middlewares/auth.middleware');

// Add to cart (POST)
router.post('/', auth, async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product)
    return res.status(404).json({ error: 'Product not found' });

  const total = product.price * quantity;

  const cart = await prisma.cart.create({
    data: {
      productId,
      quantity,
      total,
      userId: req.user.userId // ← ambil dari token
    }
  });

  res.json(cart);
});

// Get all cart (for current user)
router.get('/', auth, async (req, res) => {
  const cartItems = await prisma.cart.findMany({
    where: { userId: req.user.userId },
    include: { product: true }
  });

  res.json(cartItems);
});

module.exports = router;
