import { PrismaClient } from '@prisma/client';


declare global {
  var __db: PrismaClient | undefined;
}

//prevent multiple instances in development
const prisma = global.__db || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  global.__db = prisma;
}


//graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});


export default prisma;