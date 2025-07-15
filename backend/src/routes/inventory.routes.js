const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middlewares/auth.middleware');

router.use(auth);

router.get('/', async (req, res) => {
  const items = await prisma.inventory.findMany();
  res.json(items);
});

router.post('/', async (req, res) => {
  const { name, description } = req.body;
  const item = await prisma.inventory.create({ data: { name, description } });
  res.json(item);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const item = await prisma.inventory.update({
    where: { id: id },
    data: { name, description }
  });
  res.json(item);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.inventory.delete({ where: { id: id } });
  res.json({ message: 'Inventory deleted' });
});

module.exports = router;
