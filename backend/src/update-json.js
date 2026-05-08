const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../parsed_questions.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const paragraph = `Read the following passage and answer the questions based on the passage:
Education and wisdom are frequently treated as interchangeable in everyday discourse, yet a perceptive observer
recognises a clear and essential distinction between them. Education refers to the structured acquisition of
knowledge, typically validated through degrees, academic achievements, and mastery of formal disciplines. It is
imparted via organized curricula, institutional evaluation systems, and theoretical models that emphasize
intellectual competence.
Wisdom, however, extends beyond formal learning. It represents the thoughtful and ethical application of
knowledge in real-world situations, shaped by experience, self-reflection, emotional intelligence, and moral
awareness. A person may be highly educated and still lack wisdom if they are unable to translate learning into
sound judgement or responsible action. In contrast, many individuals—such as farmers, craftsmen, or elders—
may possess limited formal education, yet demonstrate remarkable wisdom through prudent choices informed
by lived experience and practical insight.
While education sharpens the intellect, wisdom deepens understanding. In the modern age of information
overload and algorithm-driven thinking, the gap between education and wisdom has become increasingly
pronounced. Educational systems often prioritise rote learning, examination performance, and standardized
outcomes, sometimes at the expense of critical thinking, ethical reasoning, and emotional maturity. As a result,
society produces individuals adept at solving technical problems but less capable of making balanced decisions
that require empathy, patience, and foresight.
Unlike education, wisdom cannot be downloaded, accelerated, or certified. It develops gradually through trial and
error, failure, reflection, and a nuanced comprehension of human behaviour. Moreover, education is often
temporally limited, concluding with academic milestones or formal qualifications, whereas wisdom is a lifelong
pursuit. It reveals itself not through certificates, but through humility, consistency in ethical conduct, and the
capacity to navigate uncertainty with clarity and grace.
Ultimately, the highest form of intelligence lies not merely in knowing what is right, but in consistently choosing
to act upon it—even when doing so is difficult or inconvenient.

`;

for (let q of data) {
    if (q.id >= 91 && q.id <= 95) {
        // Prepend the paragraph if it's not already there
        if (!q.question.startsWith("Read the following passage")) {
            q.question = paragraph + q.question;
        }
    }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log("Updated questions 91-95 with the passage.");
