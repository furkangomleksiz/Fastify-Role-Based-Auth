import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  const writer = await prisma.user.upsert({
    where: { email: 'writer@example.com' },
    update: {},
    create: {
      email: 'writer@example.com',
      password: hashedPassword,
      name: 'Writer User',
      role: Role.WRITER,
    },
  });

  const reader = await prisma.user.upsert({
    where: { email: 'reader@example.com' },
    update: {},
    create: {
      email: 'reader@example.com',
      password: hashedPassword,
      name: 'Reader User',
      role: Role.READER,
    },
  });

  console.log('✅ Users created:');
  console.log(`   - Admin: ${admin.email} (role: ${admin.role})`);
  console.log(`   - Writer: ${writer.email} (role: ${writer.role})`);
  console.log(`   - Reader: ${reader.email} (role: ${reader.role})`);

  // Create posts
  const posts = [
    {
      title: 'Getting Started with TypeScript',
      content: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It provides static typing, classes, and interfaces, making it easier to build and maintain large-scale applications.',
      published: true,
      authorId: writer.id,
    },
    {
      title: 'Understanding Fastify',
      content: 'Fastify is a web framework highly focused on providing the best developer experience with the least overhead and a powerful plugin architecture. It is one of the fastest web frameworks for Node.js.',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Introduction to Prisma ORM',
      content: 'Prisma is a next-generation ORM that consists of a Prisma Client, Prisma Migrate, and Prisma Studio. It helps developers build faster and make fewer errors with an auto-generated query builder.',
      published: true,
      authorId: writer.id,
    },
    {
      title: 'Building RESTful APIs',
      content: 'REST (Representational State Transfer) is an architectural style for designing networked applications. RESTful APIs use HTTP requests to perform CRUD operations on resources.',
      published: false,
      authorId: writer.id,
    },
    {
      title: 'Role-Based Access Control',
      content: 'RBAC is a method of regulating access to computer or network resources based on the roles of individual users within an organization. It is a powerful way to manage permissions in applications.',
      published: true,
      authorId: admin.id,
    },
  ];

  // Delete existing posts to ensure clean seeding
  await prisma.post.deleteMany({});

  for (const post of posts) {
    await prisma.post.create({
      data: post,
    });
  }

  console.log(`✅ Created ${posts.length} blog posts`);
  console.log('\n📝 Test Credentials (password for all: password123):');
  console.log('   Admin:  admin@example.com');
  console.log('   Writer: writer@example.com');
  console.log('   Reader: reader@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

