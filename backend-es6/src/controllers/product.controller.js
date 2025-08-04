import prisma from "../config/prisma.js";
import fs from "fs";
import path from "path";
import { successResponse, errorResponse } from "../utils/response.js";

// Helper: clean image URL
const cleanImageUrl = (base, imagePath) =>
  base.replace(/\/$/, "") + "/" + imagePath.replace(/^\//, "");

// 👉 Create Product
export const createProduct = async (req, res) => {
  try {
    const { name, price, stock, description, inventoryId } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        description,
        image,
        inventoryId,
      },
    });

    // 🔹 Buat URL dinamis
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return successResponse(res, "Create Product successful", {
      ...product,
      image: product.image ? `${baseUrl}${product.image}` : null,
    });
  } catch (error) {
    return errorResponse(
      res,
      "Create Product failed",
      { error: error.message },
      500
    );
  }
};

// 👉 GET All
export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { inventory: true }, // join ke tabel inventory
    });
    const base = `${req.protocol}://${req.get("host")}`;
    const productsWithImageUrl = products.map((product) => ({
      ...product,
      image: product.image ? cleanImageUrl(base, product.image) : null,
    }));

    return successResponse(
      res,
      "Get all products successful",
      productsWithImageUrl
    );
  } catch (error) {
    return errorResponse(
      res,
      "Get Product failed",
      { error: error.message },
      500
    );
  }
};

//get product by inventortid
export const getProductByInventoryID = async (req, res) => {
  try {
    const { id } = req.params; // ✅ Ambil ID dari parameter URL
    const product = await prisma.product.findMany({
      where: { inventoryId: id },
    });

    if (!product || product.length === 0) {
      return errorResponse(
        res,
        "No products found for this inventory",
        null,
        404
      );
    }

    // ✅ Buat URL gambar lengkap
    const base = `${req.protocol}://${req.get("host")}`;
    const productWithImageUrl = product.map((p) => ({
      ...p,
      image: p.image ? `${base}${p.image}` : null,
    }));

    return successResponse(
      res,
      "Get product by id successful",
      productWithImageUrl
    );
  } catch (error) {
    return errorResponse(
      res,
      "Get product failed",
      { error: error.message },
      500
    );
  }
};

// 👉 GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params; // ✅ Ambil ID dari parameter URL

    // ✅ Cari produk berdasarkan ID
    const product = await prisma.product.findUnique({
      where: { id }, // Kalau id UUID
      include: { inventory: true },
    });

    if (!product) {
      return errorResponse(res, "Product not found", null, 404);
    }

    // ✅ Buat URL gambar lengkap
    const base = `${req.protocol}://${req.get("host")}`;
    const productWithImageUrl = {
      ...product,
      image: product.image ? `${base}${product.image}` : null,
    };

    return successResponse(
      res,
      "Get product by id successful",
      productWithImageUrl
    );
  } catch (error) {
    return errorResponse(
      res,
      "Get product failed",
      { error: error.message },
      500
    );
  }
};

// 👉 PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, description, inventoryId } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    // ✅ Cari produk lama
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return errorResponse(res, "Product not found", null, 404);

    // ✅ Hapus file lama jika ada file baru
    if (image && product.image) {
      const oldImagePath = path.join(
        process.cwd(), // ✅ Ganti __dirname dengan process.cwd()
        "uploads",
        path.basename(product.image)
      );

      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.warn("Gagal hapus file lama:", oldImagePath);
        } else {
          console.log("File lama terhapus:", oldImagePath);
        }
      });
    }

    // ✅ Data yang akan diupdate
    const updateData = {
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      description,
      inventoryId,
    };
    if (image) updateData.image = image;

    // ✅ Update produk
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    // ✅ URL dinamis
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return successResponse(res, "Update Product successful", {
      ...updatedProduct,
      image: updatedProduct.image ? `${baseUrl}${updatedProduct.image}` : null,
    });
  } catch (error) {
    return errorResponse(
      res,
      "Update Product failed",
      { error: error.message },
      500
    );
  }
};

// 👉 DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Kalau id di DB integer → ubah jadi parseInt(id)
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return errorResponse(res, "Product not found", null, 404);
    }

    // ✅ Hapus file gambar kalau ada
    if (product.image) {
      const imagePath = path.join(
        process.cwd(), // ✅ ganti __dirname dengan process.cwd()
        "uploads",
        path.basename(product.image)
      );

      // Cek dulu apakah file ada sebelum dihapus
      fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(imagePath, (unlinkErr) => {
            if (unlinkErr) {
              console.warn("Gagal menghapus file:", imagePath);
            } else {
              console.log("File terhapus:", imagePath);
            }
          });
        }
      });
    }

    // ✅ Hapus data di database
    await prisma.product.delete({ where: { id } });

    return successResponse(res, "Product deleted successfully");
  } catch (error) {
    return errorResponse(
      res,
      "Gagal menghapus produk",
      { error: error.message },
      500
    );
  }
};
