const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CONFIGURATION
const TEST_TITLE = "SSC CGL T I Similar Paper Held on 12 Sep 2025 S2 English";
const Q_NUMBER = 80;
const NEW_OPTIONS = {
    optionA: "Updated choice A",
    optionB: "Updated choice B",
    // You only need to include the ones you want to change
};

async function updateOptions() {
    const test = await prisma.test.findFirst({
        where: { title: { contains: TEST_TITLE, mode: 'insensitive' } },
        include: { questions: { where: { order: Q_NUMBER }, include: { question: true } } }
    });

    if (!test || test.questions.length === 0) return console.log("Test/Question not found.");

    await prisma.question.update({
        where: { id: test.questions[0].question.id },
        data: NEW_OPTIONS
    });
    console.log(`✅ Updated Options for Q${Q_NUMBER}`);
}
updateOptions().finally(() => prisma.$disconnect());
