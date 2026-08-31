import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, password, phone } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanName = String(name).trim();
    const cleanPhone = phone ? String(phone).trim() : '+91 98765 43210';

    // 1. Check if user already exists in MongoDB Atlas
    const existingUser = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Account with this email already exists' }, { status: 400 });
    }

    // 2. Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Perform REAL database insert into MongoDB Atlas (coco_website -> User collection)
    const user = await db.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        phone: cleanPhone,
        role: 'USER',
      },
    });

    // 4. Sign JWT session token with real MongoDB user.id
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone || cleanPhone,
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
    console.error('MongoDB Atlas Registration Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Database error: Unable to create user account in MongoDB Atlas.' },
      { status: 500 }
    );
  }
}
