const { PrismaClient } = require('@prisma/client');

// Create a single Prisma client instance for the entire application
// This is important - you should NEVER create multiple PrismaClient instances
// because each one opens its own database connection pool
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// Test the database connection when the app starts
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// Gracefully disconnect when the app shuts down
async function disconnectDB() {
  await prisma.$disconnect();
  console.log('📦 Database disconnected');
}

module.exports = { prisma, connectDB, disconnectDB };
