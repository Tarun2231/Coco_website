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

    // 1. Instant Demo Accounts (Explicit Demo Buttons)
    if (cleanEmail === 'owner@puppyid.com' && (cleanPassword === 'password123' || cleanPassword === 'owner123')) {
      const token = signToken({
        userId: 'demo-owner-id',
        email: 'owner@puppyid.com',
        role: 'USER',
        name: 'Demo Owner',
        phone: '+91 98765 43210',
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
        name: 'System Administrator',
        phone: '+91 98765 43210',
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

    // 2. REAL MongoDB User Login
    const user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email address. Please register first.' }, { status: 400 });
    }

    // Verify password hash
    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Log security entry
    try {
      await db.loginLog.create({
        data: {
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          ip: '182.73.12.105',
          device: 'Chrome / Mobile',
          city: 'Hyderabad',
          country: 'India',
        },
      });
    } catch (logErr) {
      console.error('LoginLog error:', logErr);
    }

    // Sign JWT session token with real MongoDB user.id
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone || '+91 98765 43210',
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });

    response.headers.set(
      'Set-Cookie',
      `puppy_token=${token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`
    );

    return response;
  } catch (err: any) {
    console.error('MongoDB Atlas Login route error:', err);
    return NextResponse.json({ error: err?.message || 'Database error processing login' }, { status: 500 });
  }
}
