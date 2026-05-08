const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CONFIGURATION: Update these two before running
const TEST_TITLE = "SSC CGL T I Similar Paper Held on 12 Sep 2025 S2 English";
const PASSAGE_TEXT = `Read the following passage and answer the questions based on the passage: \nThe rapid expansion of social media has reshaped democratic life in profound ways, functioning at once
as a driver of public participation and a channel for strategic deception. Platforms such as Twitter,
Facebook, and Instagram, once viewed mainly as spaces for personal sharing, have evolved into major
arenas of political conversation. They allow citizens to voice opinions, rally around causes, and hold
those in power accountable almost instantly. Since democracy depends on the circulation of ideas and
information, social media appears to broaden access by weakening the control once exercised by
traditional gatekeepers. Political figures can address voters directly without editorial mediation, and
citizen-led movements can use viral momentum to bring neglected concerns into public focus. In
moments of high political intensity—elections, mass protests, policy disputes—these platforms operate
like a modern digital marketplace of ideas, enabling wider involvement than was previously possible
through newspapers or public meetings. Yet this openness carries serious risks. The same networks that
spread accurate information can also accelerate falsehoods, deepen polarization, and strengthen echo
chambers through algorithmic reinforcement. In several democracies, electoral processes have been
challenged by fake profiles, coordinated harassment, and organized disinformation efforts. Further,
content designed to trigger emotion and maximize engagement often overshadows careful reasoning,
turning political discussion into a noisy stream of anger and extremes. Hence, the influence of social
media on democracy depends not only on technology, but also on the ethical rules that shape its use.
Strong oversight, public media awareness, and transparency in how algorithms rank and recommend
content are crucial if societies wish to gain the benefits while limiting the damage. Ultimately, social
media is not automatically beneficial or harmful—it reflects collective choices. Whether it strengthens
democratic stability or fuels distortion depends on how responsibly it is used by citizens, institutions,
and the platforms themselves.\n
`;

async function runFix() {
    console.log(`Starting update for: ${TEST_TITLE}`);

    // Find the specific test and its questions 91-95
    const test = await prisma.test.findFirst({
        where: { title: { contains: TEST_TITLE, mode: 'insensitive' } },
        include: {
            questions: {
                where: { order: { gte: 79, lte: 83 } },
                include: { question: true }
            }
        }
    });

    if (!test) {
        console.log("Error: Test title not found in database.");
        return;
    }

    for (const entry of test.questions) {
        const originalQ = entry.question;

        // Safety: Remove any existing "Read the following passage" block to avoid duplicates
        const sanitizedText = originalQ.text.replace(/Read the following passage[\s\S]*?(?=Q)/i, "").trim();

        const finalContent = `${PASSAGE_TEXT}\n\n${sanitizedText}`;

        await prisma.question.update({
            where: { id: originalQ.id },
            data: { text: finalContent }
        });
        console.log(`Updated Q${entry.order}`);
    }

    console.log("Update complete.");
}

runFix()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
