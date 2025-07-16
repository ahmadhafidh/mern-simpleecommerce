const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middlewares/auth.middleware');
const { successResponse, errorResponse } = require('../utils/response'); //response standard

router.post('/checkout', auth, async (req, res) => {
  const { email, name, phone, date } = req.body;

  // get cart current user logged in
  const carts = await prisma.cart.findMany({
    where: { userId: req.user.userId },
    include: { product: true }
  });

  if (carts.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const items = carts.map(c => `${c.product.name} x ${c.quantity}`).join(', ');
  const total = carts.reduce((sum, item) => sum + item.total, 0);

  const invoice = await prisma.invoice.create({
    data: {
      email,
      name,
      phone,
      date: new Date(date),
      items,
      total,
      userId: req.user.userId
    }
  });

  // Hapus cart hanya milik user ini
  await prisma.cart.deleteMany({
    where: { userId: req.user.userId }
  });

  return successResponse(res, 'Checkout Successful', invoice);

});

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const data = await prisma.invoice.findMany();
    return successResponse(res, 'Get all invoices', data );
  } catch (err) {
    return errorResponse(res, 'Failed get Invoice');
  }
});


// Get invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id }
    });

    if (!invoice) {
      return errorResponse(res, 'Invoice not found');

    }

    return successResponse(res, 'Get invoice by ID successful', invoice );

  } catch (err) {
    return errorResponse(res, 'get invoice by id fail', { error: err.message }, 500);
  }
});

// Get invoice by user email
router.get('/user/:email', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { email: req.params.email }
    });

    return successResponse(res, 'Get invoice by ID successful', invoices);

  } catch (err) {
    return errorResponse(res, 'get invoice by email fail', { error: err.message }, 500);
  }
});

module.exports = router;