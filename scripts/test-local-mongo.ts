import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing connection to local MongoDB database: mongodb://127.0.0.1:27017/coco...');
  try {
    const testEmail = `local-test-${Date.now()}@coco.local`;
    console.log(`Attempting to create test user: ${testEmail}...`);

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Local MongoDB Test User',
        password: 'local-hashed-password-123',
        role: 'USER',
      },
    });

    console.log('✅ User successfully created in local MongoDB database "coco"! ID:', user.id);

    const foundUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    console.log('✅ User successfully retrieved from local MongoDB:', foundUser?.name);

    await prisma.user.delete({
      where: { id: user.id },
    });

    console.log('✅ Test user cleaned up. Local MongoDB connection & CRUD operations verified 100%!');
  } catch (error: any) {
    console.error('❌ Local MongoDB Connection Error:', error?.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
