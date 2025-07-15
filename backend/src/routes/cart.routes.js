const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add to cart (POST)
router.post('/', async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await prisma.product.findUnique({ where: { id: +productId } });
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const total = product.price * quantity;

  const cart = await prisma.cart.create({
    data: { productId: +productId, quantity, total }
  });

  res.json(cart);
});

// Get all cart (for testing)
router.get('/', async (req, res) => {
  const cartItems = await prisma.cart.findMany({
    include: { product: true }
  });
  res.json(cartItems);
});

module.exports = router;
