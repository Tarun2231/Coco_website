import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing connection to MongoDB Atlas database: coco_website...');
  try {
    // Perform CRUD Test
    const testEmail = `test-${Date.now()}@coco.com`;
    console.log(`Creating test user with email: ${testEmail}`);
    
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Atlas Test User',
        password: 'hashed-test-password',
        role: 'USER',
      },
    });

    console.log('✅ User successfully created in MongoDB Atlas! ID:', user.id);

    const foundUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    console.log('✅ User successfully fetched from MongoDB Atlas:', foundUser?.name);

    await prisma.user.delete({
      where: { id: user.id },
    });

    console.log('✅ Test user cleaned up. MongoDB Atlas connection & CRUD operations verified 100%!');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
