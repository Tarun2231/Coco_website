import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'puppy-id-super-secret-jwt-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('puppy_token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      altPhone: true,
      address: true,
      avatar: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}
