const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
console.log('PDF object type:', typeof pdf);
console.log('PDF object keys:', Object.keys(pdf));

const PDF_PATH = path.join(__dirname, '../../SSC-CGL-T-I-Similar-Paper-Held-on-12-Sep-2025-S1.pdf');

async function parseSSC(filePath) {
    console.log(`Reading PDF: ${filePath}`);
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const text = data.text;

    // 1. Separate Questions and Solutions
    const solutionMarker = "Solutions";
    const [questionsPart, solutionsPart] = text.split(new RegExp(solutionMarker, 'i'));

    if (!solutionsPart) {
        console.error("Could not find 'Solutions' section.");
        // If not found, maybe the whole thing is questions
    }

    // 2. Parse Questions
    const questions = [];
    // Improved Regex to handle various formats
    const questionRegex = /Q(\d+)\.\s+([\s\S]*?)\((a|1)\)\s+([\s\S]*?)\((b|2)\)\s+([\s\S]*?)\((c|3)\)\s+([\s\S]*?)\((d|4)\)\s+([\s\S]*?)(?=Q\d+\.|$)/g;

    let match;
    while ((match = questionRegex.exec(questionsPart || text)) !== null) {
        const qNum = match[1];
        const questionText = match[2].trim();
        const optA = match[4].trim();
        const optB = match[6].trim();
        const optC = match[8].trim();
        const optD = match[10].trim();

        questions.push({
            id: parseInt(qNum),
            question: questionText,
            options: [
                { key: 'a', text: optA },
                { key: 'b', text: optB },
                { key: 'c', text: optC },
                { key: 'd', text: optD }
            ]
        });
    }

    // 3. Parse Solutions
    const answersMap = {};
    const answerRegex = /S(\d+)\.\s+Ans\.\(([a-d])\)/g;

    if (solutionsPart) {
        while ((match = answerRegex.exec(solutionsPart)) !== null) {
            answersMap[parseInt(match[1])] = match[2];
        }
    }

    // 4. Merge
    const finalData = questions.map(q => ({
        ...q,
        correctAnswer: answersMap[q.id] || "N/A"
    }));

    console.log(`Parsed ${finalData.length} questions.`);
    console.log(JSON.stringify(finalData.slice(0, 3), null, 2));

    // Save to file
    fs.writeFileSync(path.join(__dirname, '../parsed_questions.json'), JSON.stringify(finalData, null, 2));
    console.log("Saved results to backend/parsed_questions.json");
}

parseSSC(PDF_PATH).catch(console.error);
