import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Reading questions from parsed_questions.json...');
  const filePath = path.join(__dirname, '../parsed_questions.json');
  const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  console.log('Clearing existing data...');
  await prisma.testQuestion.deleteMany({});
  await prisma.attempt.deleteMany({});
  await prisma.test.deleteMany({});
  await prisma.question.deleteMany({});

  console.log(`Seeding ${rawData.length} questions...`);

  const createdQuestions = [];

  for (const q of rawData) {
    // Map section based on ID range
    let topic = 'General Awareness';
    if (q.id <= 25) topic = 'General Intelligence and Reasoning';
    else if (q.id <= 50) topic = 'General Awareness';
    else if (q.id <= 75) topic = 'Quantitative Aptitude';
    else topic = 'English Language';

    // Map options
    const optionA = q.options.find(o => o.key === 'a')?.text || '';
    const optionB = q.options.find(o => o.key === 'b')?.text || '';
    const optionC = q.options.find(o => o.key === 'c')?.text || '';
    const optionD = q.options.find(o => o.key === 'd')?.text || '';

    const question = await prisma.question.create({
      data: {
        text: q.question,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer: q.correctAnswer.toUpperCase(),
        topic: topic,
        difficulty: 'Medium', // Defaulting to medium
      }
    });
    createdQuestions.push(question);
  }

  // Create a full test with all 100 questions
  console.log('Creating full mock test...');
  await prisma.test.create({
    data: {
      title: 'SSC CGL Tier-I Similar Paper (12 Sep 2025)',
      description: 'Full-length 100 question mock test based on the 12th Sep 2025 Shift 1 paper.',
      duration: 60,
      questions: {
        create: createdQuestions.map((q, index) => ({
          questionId: q.id,
          order: index + 1,
        })),
      },
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
