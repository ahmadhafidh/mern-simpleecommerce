const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middlewares/auth.middleware');


router.post('/checkout', auth, async (req, res) => {
  const { email, name, phone, date } = req.body;

  // Ambil cart hanya milik user saat ini
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

  res.status(201).json({
    success: true,
    message: 'Checkout berhasil',
    data: invoice
  });
});

// ✅ Get all invoices
router.get('/', async (req, res) => {
  try {
    const data = await prisma.invoice.findMany();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil invoice' });
  }
});


// ✅ Get invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice tidak ditemukan' });
    }

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil invoice berdasarkan ID' });
  }
});

// ✅ Get invoice by user email
router.get('/user/:email', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { email: req.params.email }
    });

    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil invoice berdasarkan email' });
  }
});

module.exports = router;