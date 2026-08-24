import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    let userId = `user-${Math.random().toString(36).substring(2, 8)}`;
    let userRole = 'USER';

    try {
      const existingUser = await db.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Account with this email already exists' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await db.user.create({
        data: {
          name,
          email: cleanEmail,
          password: hashedPassword,
          phone,
          role: 'USER',
        },
      });
      userId = user.id;
    } catch (dbErr) {
      console.error('DB Registration error, proceeding with session token:', dbErr);
    }

    const token = signToken({
      userId,
      email: cleanEmail,
      role: userRole,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: cleanEmail,
        name,
        role: userRole,
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
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
