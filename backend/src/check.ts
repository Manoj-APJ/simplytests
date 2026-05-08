import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const tests = await prisma.test.findMany();
  const questions = await prisma.question.count();
  console.log(`Found ${tests.length} tests and ${questions} questions.`);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
