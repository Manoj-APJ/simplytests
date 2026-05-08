import prisma from '../config/prisma';

export const findAll = async () => {
  return await prisma.test.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      duration: true,
      _count: {
        select: { questions: true }
      }
    }
  });
};

export const findById = async (id: string) => {
  return await prisma.test.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: {
          question: {
            select: {
              id: true,
              text: true,
              optionA: true,
              optionB: true,
              optionC: true,
              optionD: true,
              topic: true,
              difficulty: true,
            }
          }
        }
      }
    }
  });
};

export const findByIdWithQuestions = async (id: string) => {
  return await prisma.test.findUnique({
    where: { id },
    include: {
      questions: {
        include: {
          question: true
        }
      }
    }
  });
};

export const createAttempt = async (data: any) => {
  return await prisma.attempt.create({
    data
  });
};
