const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middlewares/auth.middleware');

// Public
router.get('/', async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

router.get('/inventory/:id', async (req, res) => {
  const { id } = req.params;
  const products = await prisma.product.findMany({
    where: { inventoryId: id }
  });
  res.json(products);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({ where: { id: id } });
  res.json(product);
});

// Admin
router.use(auth);

router.post('/', async (req, res) => {
  const { name, image, price, description, stock, inventoryId } = req.body;

  try {
    // ✅ Validasi: pastikan Inventory ID ada
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
    });

    if (!inventory) {
      return res.status(404).json({
        message: `Inventory dengan ID ${inventoryId} tidak ditemukan`,
      });
    }

    // 🚀 Lanjut buat produk
    const product = await prisma.product.create({
      data: {
        name,
        image,
        price,
        description,
        stock,
        inventoryId,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat produk' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, image, price, description, stock, inventoryId } = req.body;

  try {
    // 🔍 Cek apakah Inventory ID valid
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
    });

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory ID tidak ditemukan' });
    }

    // ✅ Update produk hanya jika inventory valid
    const product = await prisma.product.update({
      where: { id: id },
      data: {
        name,
        image,
        price,
        description,
        stock,
        inventoryId,
      },
    });

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal update produk' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id: id } });
  res.json({ message: 'Product deleted' });
});

module.exports = router;
