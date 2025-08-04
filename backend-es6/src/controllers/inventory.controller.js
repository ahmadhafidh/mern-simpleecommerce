import prisma from "../config/prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

// 👉 Get all inventory
export const getInventories = async (req, res) => {
  const inventories = await prisma.inventory.findMany();
  return successResponse(res, "get inventory successful", inventories);
};

// 👉 Get id inventory
export const getInventory = async (req, res) => {
  const { id } = req.params;
  const inventory = await prisma.inventory.findUnique({ where: { id } });
  if (!inventory) {
    return errorResponse(res, "id tidak di temukan", null, 401);
  } else {
    return successResponse(res, "get inventory successful", inventory);
  }
};

// 👉 Create inventory
export const createInventory = async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description)
    return errorResponse(res, "Data Tidak Boleh kosong", null, 401);

  const inventory = await prisma.inventory.create({
    data: { name, description },
  });

  return successResponse(res, "Inventory Berhasil di buat", inventory);
};

// 👉 Update inventory
export const updateInventory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const existing = await prisma.inventory.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, "Inventory not found", null, 404);
    }

    const inventory = await prisma.inventory.update({
      where: { id },
      data: { name, description },
    });

    return successResponse(res, "Inventory Berhasil di update", inventory);
  } catch (err) {
    return errorResponse(res, "failed", { error: err.message }, 500);
  }
};

// 👉 Delete inventory
export const deleteInventory = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.inventory.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, "Inventory not found", null, 404);
    }

    
    const inventory = await prisma.inventory.delete({ where: { id } });
    return successResponse(res, "Inventory Berhasil di update", inventory);
  } catch (err) {
    return errorResponse(
      res,
      "Failed to delete inventory",
      { error: err.message },
      500
    );
  }
};
