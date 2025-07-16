const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middlewares/auth.middleware');
const { successResponse, errorResponse } = require('../utils/response'); //response standard

router.use(auth);

router.get('/', async (req, res) => {
  const items = await prisma.inventory.findMany();

  return successResponse(res, 'get inventory successful', items);

});

router.post('/', async (req, res) => {
  const { name, description } = req.body;
  const item = await prisma.inventory.create({ data: { name, description } });

  return successResponse(res, 'Inventory Created', item);

});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    // 1️⃣ check existing data inventory with its id
    const existing = await prisma.inventory.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, 'Inventory not found', null, 404);
    }

    // Update existing data
    const item = await prisma.inventory.update({
      where: { id },
      data: { name, description }
    });

    return successResponse(res, 'Inventory Updated', item);

  } catch (err) {
    return errorResponse(res, 'Update failed', { error: err.message }, 500);
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Check existing data
    const existing = await prisma.inventory.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, 'Inventory not found', null, 404);
    }

    // delete data dan save result
    const item = await prisma.inventory.delete({ where: { id } });

    // send success response
    return successResponse(res, 'Inventory deleted', item);

  } catch (err) {
    return errorResponse(res, 'Failed to delete inventory', { error: err.message }, 500);
  }
});

module.exports = router;
