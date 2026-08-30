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

    // Extract real client IP and User-Agent from proxy request headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1');
    const userAgent = req.headers.get('user-agent') || 'Unknown Device / Web Browser';

    // 1. Check Demo Accounts (Explicit Demo buttons)
    if (cleanEmail === 'owner@puppyid.com' && (cleanPassword === 'password123' || cleanPassword === 'owner123')) {
      const token = signToken({
        userId: 'demo-owner-id',
        email: 'owner@puppyid.com',
        role: 'USER',
        name: 'Demo Owner',
        phone: '+91 98765 43210',
      });

      try {
        await db.loginLog.create({
          data: {
            userId: 'demo-owner-id',
            userEmail: cleanEmail,
            userName: 'Demo Owner',
            ip: clientIp,
            device: userAgent.slice(0, 50),
            city: 'Hyderabad',
            country: 'India',
          },
        });
      } catch (logErr) {}

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

    // 2. Strict Custom User Authentication from Database
    let dbUser = null;
    try {
      dbUser = await db.user.findUnique({
        where: { email: cleanEmail },
      });
    } catch (dbErr) {
      console.error('DB Login lookup error:', dbErr);
    }

    // 🚨 STRICT SECURITY CHECK: Reject unregistered accounts completely
    if (!dbUser) {
      return NextResponse.json(
        { error: 'Account not found. Please register first to access Puppy ID.' },
        { status: 401 }
      );
    }

    // 🚨 Password Verification
    const isPasswordMatch = await bcrypt.compare(cleanPassword, dbUser.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { error: 'Invalid password. Please check your credentials and try again.' },
        { status: 401 }
      );
    }

    // Record Login History & Security Audit Log
    try {
      await db.loginLog.create({
        data: {
          userId: dbUser.id,
          userEmail: dbUser.email,
          userName: dbUser.name,
          ip: clientIp,
          device: userAgent.slice(0, 50),
          city: 'Hyderabad',
          country: 'India',
        },
      });

      await db.auditLog.create({
        data: {
          userId: dbUser.id,
          action: 'LOGIN_SUCCESS',
          entity: 'USER',
          entityId: dbUser.id,
          details: `Successful login from IP ${clientIp}`,
        },
      });
    } catch (logErr) {}

    const token = signToken({
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role || 'USER',
      name: dbUser.name,
      phone: dbUser.phone || '+91 98765 43210',
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role || 'USER',
      },
    });

    response.headers.set(
      'Set-Cookie',
      `puppy_token=${token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`
    );

    return response;
  } catch (err) {
    console.error('Login route error:', err);
    return NextResponse.json({ error: 'Failed to process login request' }, { status: 500 });
  }
}
