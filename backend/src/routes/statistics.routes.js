const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middlewares/auth.middleware');

router.use(auth);

// Statistik berdasarkan rentang tanggal
router.get('/range', async (req, res) => {
  const { start, end } = req.query;

  const data = await prisma.invoice.findMany({
    where: {
      date: {
        gte: new Date(start),
        lte: new Date(end)
      }
    }
  });

  const totalPesanan = data.reduce((sum, inv) => sum + 1, 0);
  const totalTerbayar = data.reduce((sum, inv) => sum + inv.total, 0);

  res.json({ totalPesanan, totalTerbayar });
});

// Statistik satu tanggal
router.get('/single', async (req, res) => {
  const { date } = req.query;

  const target = new Date(date);
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const data = await prisma.invoice.findMany({
    where: {
      date: {
        gte: target,
        lt: nextDay
      }
    }
  });

  const totalPesanan = data.length;
  const totalTerbayar = data.reduce((sum, inv) => sum + inv.total, 0);

  res.json({ totalPesanan, totalTerbayar });
});

module.exports = router;
