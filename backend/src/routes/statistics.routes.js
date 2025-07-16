const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middlewares/auth.middleware');

const { successResponse, errorResponse } = require('../utils/response'); //response standard

router.use(auth);

// Statistik with rangedate
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

  return successResponse(res, 'Statistik with rangedate successful', { totalPesanan, totalTerbayar });

});

// Statistik single
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

  return successResponse(res, 'Statistik with singedate successful', { totalPesanan, totalTerbayar });

});

module.exports = router;
