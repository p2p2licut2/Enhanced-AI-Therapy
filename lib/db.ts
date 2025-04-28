import { PrismaClient } from '@prisma/client';

// Declarăm tipul global pentru PrismaClient
declare global {
  var prisma: PrismaClient | undefined;
}

// Creăm o instanță PrismaClient, optimizată pentru environment serverless
// În mediul de dezvoltare folosim o instanță globală pentru a evita problemele HMR
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Asigurăm refolosirea conexiunii în dezvoltare
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}