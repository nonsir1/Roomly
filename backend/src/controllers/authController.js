import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth.js';

const prisma = new PrismaClient();

export const register = async (req, res) => {
  try {
    const { email, password, role = 'user' } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role
      }
    });

    const { passwordHash: _, ...userResponse } = user;
    res.status(201).json(userResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userEmail = email || username;

    if (!userEmail || !password) {
      return res.status(400).json({ detail: 'Email and password are required' });
    }

    // console.log('login attempt:', userEmail);
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ detail: 'Incorrect username or password' });
    }

    const token = generateToken({ sub: user.email, role: user.role });
    res.json({ access_token: token, token_type: 'bearer' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

export const getCurrentUser = async (req, res) => {
  const { passwordHash, ...userResponse } = req.user;
  res.json(userResponse);
};

