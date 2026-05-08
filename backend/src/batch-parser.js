const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SOURCE_DIR = path.join(__dirname, '../../questionspdfs');

async function parseAndUpload() {
    console.log("🚀 Starting Multi-Template Batch Parsing...");
    
    const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.pdf'));
    console.log(`Found ${files.length} PDFs to process.`);

    for (const fileName of files) {
        const title = fileName.replace('.pdf', '').replace(/-/g, ' ');
        const existingTest = await prisma.test.findFirst({ 
            where: { title },
            include: { _count: { select: { questions: true } } }
        });
        
        if (existingTest && existingTest._count.questions >= 90) {
            console.log(`  ⏭️ Skipping ${fileName} (Already fully uploaded: ${existingTest._count.questions} questions)`);
            continue;
        }

        // Delete partial test if it exists
        if (existingTest) {
            console.log(`  🗑️ Cleaning up partial test: ${title}`);
            await prisma.testQuestion.deleteMany({ where: { testId: existingTest.id } });
            await prisma.test.delete({ where: { id: existingTest.id } });
        }

        console.log(`\n📄 Processing: ${fileName}`);
        const filePath = path.join(SOURCE_DIR, fileName);
        const dataBuffer = fs.readFileSync(filePath);
        
        try {
            const data = await pdf(dataBuffer);
            const text = data.text;

            let questions = [];

            // Detect Template
            const isTemplateB = text.includes("Answer:") && text.includes("Sol:");

            if (isTemplateB) {
                console.log("  🔍 Detected Template B (Inline Answers)");
                questions = parseTemplateB(text);
            } else {
                console.log("  🔍 Detected Template A (Separate Solutions)");
                questions = parseTemplateA(text);
            }

            if (questions.length === 0) {
                console.warn(`  ⚠️ No questions extracted from ${fileName}. Check regex.`);
                continue;
            }

            // Upload to Database
            console.log(`  💾 Uploading ${questions.length} questions to database...`);
            const test = await prisma.test.create({
                data: {
                    title: fileName.replace('.pdf', '').replace(/-/g, ' '),
                    description: `Automatically parsed from ${fileName}`,
                    duration: 60,
                }
            });

            for (const q of questions) {
                const sanitize = (str) => str ? str.replace(/\u0000/g, '') : '';
                
                const createdQ = await prisma.question.create({
                    data: {
                        text: sanitize(q.text),
                        optionA: sanitize(q.optionA),
                        optionB: sanitize(q.optionB),
                        optionC: sanitize(q.optionC),
                        optionD: sanitize(q.optionD),
                        correctAnswer: q.correctAnswer,
                        topic: getTopicForId(q.id),
                        difficulty: 'Medium'
                    }
                });

                await prisma.testQuestion.create({
                    data: {
                        testId: test.id,
                        questionId: createdQ.id,
                        order: q.id
                    }
                });
            }

            console.log(`  ✅ Successfully uploaded ${fileName}`);

        } catch (err) {
            console.error(`  ❌ Error processing ${fileName}:`, err.message);
        }
    }
    
    console.log("\n✨ Batch process finished!");
}

function parseTemplateA(text) {
    const solutionMarker = "Solutions";
    const [questionsPart, solutionsPart] = text.split(new RegExp(solutionMarker, 'i'));
    if (!solutionsPart) return [];

    const questions = [];
    const questionRegex = /Q(\d+)\.\s+([\s\S]*?)\((a|1)\)\s+([\s\S]*?)\((b|2)\)\s+([\s\S]*?)\((c|3)\)\s+([\s\S]*?)\((d|4)\)\s+([\s\S]*?)(?=Q\d+\.|$)/g;
    
    const answersMap = {};
    const answerRegex = /S(\d+)\.\s+Ans\.\(([a-d])\)/g;
    let m;
    while ((m = answerRegex.exec(solutionsPart)) !== null) {
        answersMap[parseInt(m[1])] = m[2].toUpperCase();
    }

    let match;
    while ((match = questionRegex.exec(questionsPart)) !== null) {
        const qNum = parseInt(match[1]);
        let questionText = match[2].trim();
        
        // Paragraph logic for Template A
        if (qNum >= 91 && qNum <= 95 && questionsPart.includes("Read the following passage")) {
             const passageRegex = /Read the following passage[\s\S]*?(?=Q91\.)/i;
             const passageMatch = questionsPart.match(passageRegex);
             if (passageMatch) questionText = passageMatch[0].trim() + "\n\n" + questionText;
        }

        questions.push({
            id: qNum,
            text: questionText,
            optionA: match[4].trim(),
            optionB: match[6].trim(),
            optionC: match[8].trim(),
            optionD: match[10].trim(),
            correctAnswer: answersMap[qNum] || 'A'
        });
    }
    return questions;
}

function parseTemplateB(text) {
    const questions = [];
    // Pattern: Q.1 [Text] A. [OptA] B. [OptB] C. [OptC] D. [OptD] Answer:X
    const questionRegex = /Q\.(\d+)\s+([\s\S]*?)A\.\s+([\s\S]*?)B\.\s+([\s\S]*?)C\.\s+([\s\S]*?)D\.\s+([\s\S]*?)Answer:([A-D])/g;

    let match;
    while ((match = questionRegex.exec(text)) !== null) {
        const qNum = parseInt(match[1]);
        let questionText = match[2].trim();

        // Paragraph logic for Template B
        if (qNum >= 91 && qNum <= 95 && text.includes("Read the following passage")) {
            const passageRegex = /Read the following passage[\s\S]*?(?=Q\.91)/i;
            const passageMatch = text.match(passageRegex);
            if (passageMatch) questionText = passageMatch[0].trim() + "\n\n" + questionText;
        }

        questions.push({
            id: qNum,
            text: questionText,
            optionA: match[3].trim(),
            optionB: match[4].trim(),
            optionC: match[5].trim(),
            optionD: match[6].trim(),
            correctAnswer: match[7].toUpperCase()
        });
    }
    return questions;
}

function getTopicForId(id) {
    if (id <= 25) return 'General Intelligence and Reasoning';
    if (id <= 50) return 'General Awareness';
    if (id <= 75) return 'Quantitative Aptitude';
    return 'English Language';
}

parseAndUpload()
    .catch(err => console.error("Fatal Error:", err))
    .finally(() => prisma.$disconnect());
