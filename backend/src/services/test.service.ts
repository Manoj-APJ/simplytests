import * as testRepository from '../repositories/test.repository';
import { AppError } from '../middleware/error.middleware';

export const getAllTests = async () => {
  return await testRepository.findAll();
};

export const getTestById = async (id: string) => {
  return await testRepository.findById(id);
};

export const evaluateTest = async (testId: string, userAnswers: Record<string, string>) => {
  const test = await testRepository.findByIdWithQuestions(testId);
  
  if (!test) {
    throw new AppError('Test not found', 404);
  }

  let correctCount = 0;
  const totalQuestions = test.questions.length;

  const evaluationDetails = test.questions.map((tq) => {
    const question = tq.question;
    const userAnswer = userAnswers[question.id];
    const isCorrect = userAnswer === question.correctAnswer;
    
    if (isCorrect) {
      correctCount++;
    }

    return {
      questionId: question.id,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
    };
  });

  const incorrectCount = totalQuestions - correctCount;
  const score = correctCount; // Assuming 1 mark per correct answer for MVP
  const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  // Save attempt
  const attempt = await testRepository.createAttempt({
    testId,
    score,
    totalQuestions,
    correctCount,
    incorrectCount,
    accuracy,
    answers: userAnswers,
  });

  return {
    attemptId: attempt.id,
    totalQuestions,
    correctCount,
    incorrectCount,
    score,
    accuracy: accuracy.toFixed(2) + '%',
    evaluationDetails,
  };
};
