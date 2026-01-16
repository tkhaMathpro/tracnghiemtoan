
export interface Question {
  id: number;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
}

export enum QuizState {
  START = 'START',
  LOADING = 'LOADING',
  QUIZ = 'QUIZ',
  RESULT = 'RESULT'
}

export interface UserProgress {
  score: number;
  currentQuestionIndex: number;
  answeredCount: number;
  answers: Record<number, string>;
  level: number; // Theo dõi độ khó
}
