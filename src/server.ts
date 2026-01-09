import { buildApp } from './app';
import config from './config/env';
import { initializePocketBase } from './lib/pocketbase';

async function start() {
  try {
    console.log('✅ Connecting to PocketBase:', config.pocketbaseUrl);

    // Authenticate with PocketBase admin
    await initializePocketBase();

    // Build and start the server
    const fastify = await buildApp();

    await fastify.listen({
      port: config.port,
      host: '0.0.0.0',
    });

    console.log(`🚀 Server is running on http://localhost:${config.port}`);
    console.log(`📚 Environment: ${config.nodeEnv}`);
    console.log(`🔐 JWT authentication enabled`);
    console.log(`🗄️  PocketBase URL: ${config.pocketbaseUrl}`);
    console.log(`\n📖 API Endpoints:`);
    console.log(`   POST   /api/auth/register`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   GET    /api/posts`);
    console.log(`   GET    /api/posts/:id`);
    console.log(`   POST   /api/posts (WRITER, ADMIN)`);
    console.log(`   PUT    /api/posts/:id (ADMIN)`);
    console.log(`   DELETE /api/posts/:id (ADMIN)`);
    console.log(`   GET    /api/users (ADMIN)`);
    console.log(`   PATCH  /api/users/:id/role (ADMIN)`);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

start();

