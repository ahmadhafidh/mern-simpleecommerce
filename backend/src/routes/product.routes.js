const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middlewares/auth.middleware');
const upload = require('../utils/upload');

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const BASE_URL = process.env.BASE_URL || 'http://localhost:5025';

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

router.post('/', upload.single('image'), async (req, res) => {
  const { name, price, description, stock, inventoryId } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const inventory = await prisma.inventory.findUnique({ where: { id: inventoryId } });
    if (!inventory) {
      return res.status(404).json({ message: `Inventory dengan ID ${inventoryId} tidak ditemukan` });
    }

    const product = await prisma.product.create({
      data: {
        name,
        image,
        price: parseInt(price),
        description,
        stock: parseInt(stock),
        inventoryId,
      },
    });

    res.status(201).json({
      ...product,
      image: product.image ? `${BASE_URL}${product.image}` : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat produk' });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, price, description, stock, inventoryId } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    const inventory = await prisma.inventory.findUnique({ where: { id: inventoryId } });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory ID tidak ditemukan' });
    }

    // 🔍 Ambil produk lama untuk hapus image jika perlu
    const existingProduct = await prisma.product.findUnique({ where: { id } });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    // 🗑️ Hapus gambar lama jika upload gambar baru
    if (image && existingProduct.image) {
      const oldImagePath = path.join(__dirname, '..', '..', 'uploads', path.basename(existingProduct.image));
      fs.unlink(oldImagePath, (err) => {
        if (err) console.warn('Gagal hapus gambar lama:', oldImagePath);
        else console.log('Gambar lama terhapus:', oldImagePath);
      });
    }

    // 🔄 Siapkan data update
    const updateData = {
      name,
      price: parseInt(price),
      description,
      stock: parseInt(stock),
      inventoryId,
    };

    if (image) updateData.image = image;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.json({
      ...updatedProduct,
      image: updatedProduct.image ? `${BASE_URL}${updatedProduct.image}` : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal update produk' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Ambil data produk dulu
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    // 2. Hapus file image jika ada
    if (product.image) {
      const imagePath = path.join(__dirname, '..', '..', 'uploads', path.basename(product.image));

      // Cek dan hapus file
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.warn(`Gagal menghapus file: ${imagePath}`);
        } else {
          console.log(`File terhapus: ${imagePath}`);
        }
      });
    }

    // 3. Hapus produk dari database
    await prisma.product.delete({ where: { id } });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus produk' });
  }
});

module.exports = router;
