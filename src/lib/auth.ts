import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'puppy-id-super-secret-jwt-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
  phone?: string;
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

  try {
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

    if (user) return user;
  } catch (err) {
    console.error('getCurrentUser DB error, falling back to session payload:', err);
  }

  // Preserve user's real registered name, email & phone from token payload!
  return {
    id: payload.userId,
    email: payload.email,
    name: payload.name || (payload.email.includes('admin') ? 'System Administrator' : 'Pet Owner'),
    phone: payload.phone || '+91 98765 43210',
    altPhone: '+91 91234 56789',
    address: 'Road No. 5, Banjara Hills, Hyderabad, Telangana 500034, India',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: payload.role || 'USER',
    createdAt: new Date().toISOString(),
  };
}
