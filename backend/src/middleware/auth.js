import { verifyToken } from '../utils/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }

  const user = await prisma.user.findUnique({
    where: { email: payload.sub }
  });

  if (!user) {
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }

  req.user = user;
  next();
};

export const checkAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ detail: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ detail: 'Admin access required' });
  }

  next();
};

