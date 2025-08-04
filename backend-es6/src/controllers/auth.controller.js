// src/controllers/auth.controller.js
import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { successResponse, errorResponse } from "../utils/response.js";
import cookieOptions from "../utils/cookieOptions.js";

// ENV
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// 👉 Register User
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Cek jika email sudah digunakan
  const existed = await prisma.user.findUnique({ where: { email } });
  if (existed) return errorResponse(res, "Email is already in use", null, 400);

  // Hash password sebelum simpan
  const hashed = await bcrypt.hash(password, 10);

  // Simpan user baru
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
    },
  });

  return successResponse(res, "Register successful", {
    id: user.id,
    name: user.name,
    email: user.email,
  });
};

// 👉 Login User
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Cari user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return errorResponse(res, 'email tidak ditemukan', null, 401);


  // Cocokkan password
  const match = await bcrypt.compare(password, user.password);
  if (!match) return errorResponse(res, 'Password salah', null, 401);


  // Buat JWT Token
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

  res.cookie("token", token, cookieOptions(req)); // save token in cookie
  return successResponse(res, "Login successful", {
    userId: user.id,
    email: email,
    token: token,
  });
};

// 👉 Logout User
export const logout = (req, res) => {
  res.clearCookie("token", {
    ...cookieOptions(req),
    maxAge: undefined, // override maxAge biar cookie benar-benar terhapus
  });
  return successResponse(res, "Logout successful");
};
