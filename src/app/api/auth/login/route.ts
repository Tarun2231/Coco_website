import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check Demo Accounts for instant zero-fail login
    if (cleanEmail === 'owner@puppyid.com' && (password === 'password123' || password === 'owner123')) {
      const token = signToken({
        userId: 'demo-owner-id',
        email: 'owner@puppyid.com',
        role: 'USER',
      });

      const res = NextResponse.json({
        success: true,
        user: {
          id: 'demo-owner-id',
          email: 'owner@puppyid.com',
          name: 'Demo Owner',
          role: 'USER',
        },
      });

      res.cookies.set({
        name: 'puppy_token',
        value: token,
        httpOnly: true,
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });

      return res;
    }

    if (cleanEmail === 'admin@puppyid.com' && (password === 'adminpassword123' || password === 'admin123')) {
      const token = signToken({
        userId: 'demo-admin-id',
        email: 'admin@puppyid.com',
        role: 'ADMIN',
      });

      const res = NextResponse.json({
        success: true,
        user: {
          id: 'demo-admin-id',
          email: 'admin@puppyid.com',
          name: 'System Administrator',
          role: 'ADMIN',
        },
      });

      res.cookies.set({
        name: 'puppy_token',
        value: token,
        httpOnly: true,
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });

      return res;
    }

    // 2. Database User Lookup
    try {
      const user = await db.user.findUnique({
        where: { email: cleanEmail },
      });

      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          const token = signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
          });

          const res = NextResponse.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
          });

          res.cookies.set({
            name: 'puppy_token',
            value: token,
            httpOnly: true,
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
          });

          return res;
        }
      }
    } catch (dbErr) {
      console.error('DB Login lookup error:', dbErr);
    }

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Failed to process login request' }, { status: 500 });
  }
}
