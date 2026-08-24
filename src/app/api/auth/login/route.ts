import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanPassword = String(password).trim();

    // 1. Instant Demo Accounts (Zero-fail login on Vercel)
    if (cleanEmail === 'owner@puppyid.com' && (cleanPassword === 'password123' || cleanPassword === 'owner123')) {
      const token = signToken({
        userId: 'demo-owner-id',
        email: 'owner@puppyid.com',
        role: 'USER',
      });

      const response = NextResponse.json({
        success: true,
        token,
        user: {
          id: 'demo-owner-id',
          email: 'owner@puppyid.com',
          name: 'Demo Owner',
          role: 'USER',
        },
      });

      response.headers.set(
        'Set-Cookie',
        `puppy_token=${token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`
      );

      return response;
    }

    if (cleanEmail === 'admin@puppyid.com' && (cleanPassword === 'adminpassword123' || cleanPassword === 'admin123')) {
      const token = signToken({
        userId: 'demo-admin-id',
        email: 'admin@puppyid.com',
        role: 'ADMIN',
      });

      const response = NextResponse.json({
        success: true,
        token,
        user: {
          id: 'demo-admin-id',
          email: 'admin@puppyid.com',
          name: 'System Administrator',
          role: 'ADMIN',
        },
      });

      response.headers.set(
        'Set-Cookie',
        `puppy_token=${token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`
      );

      return response;
    }

    // 2. Database User Lookup (Try DB if configured)
    try {
      const user = await db.user.findUnique({
        where: { email: cleanEmail },
      });

      if (user) {
        const isMatch = await bcrypt.compare(cleanPassword, user.password);
        if (isMatch) {
          const token = signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
          });

          const response = NextResponse.json({
            success: true,
            token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
          });

          response.headers.set(
            'Set-Cookie',
            `puppy_token=${token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`
          );

          return response;
        }
      }
    } catch (dbErr) {
      console.error('DB Login lookup error:', dbErr);
    }

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  } catch (err) {
    console.error('Login route error:', err);
    return NextResponse.json({ error: 'Failed to process login request' }, { status: 500 });
  }
}
