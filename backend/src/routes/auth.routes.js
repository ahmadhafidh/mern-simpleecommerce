const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { successResponse, errorResponse } = require('../utils/response'); //response standard
const cookieOptions = require('../utils/cookieOptions'); //cookies use for login and logout

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ check existed email
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return errorResponse(res, 'Email is already in use', null, 400);
    }

    // 2️⃣ Hash password & create user
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashed }
    });

    // 3️⃣ send response success
    return successResponse(res, 'Register successful', {
        id: user.id,
        email: user.email
    });

  } catch (err) {
    return errorResponse(res, 'Register failed', { error: err.message }, 500);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !await bcrypt.compare(password, user.password)) {
    return errorResponse(res, 'Invalid credentials', null, 401);
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  res.cookie('token', token, cookieOptions(req)); // save token in cookie
  return successResponse(res, 'Login successful', { userId: user.id, email: email, token: token });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    ...cookieOptions(req),
    maxAge: undefined // override maxAge biar cookie benar-benar terhapus
  });

  return successResponse(res, 'Logout successful');
});

module.exports = router;
