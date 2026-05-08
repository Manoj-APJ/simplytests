export interface Test {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  _count: {
    questions: number;
  };
}

export interface Question {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  topic: string;
  difficulty: string;
}

export interface TestDetail {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  questions: {
    order: number;
    question: Question;
  }[];
}

export interface SubmissionResult {
  attemptId: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  score: number;
  accuracy: string;
  evaluationDetails: {
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
}
