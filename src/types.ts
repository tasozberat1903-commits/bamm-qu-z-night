
export interface Choice {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  choices: Choice[];
  correctChoiceId: string;
  duration: number; // in seconds
}

export interface Participant {
  id: string;
  name: string;
  tableNumber: string;
  score: number;
  lastAnswer?: string;
  isCorrect?: boolean;
}

export interface QuizState {
  currentQuestionIndex: number;
  status: 'waiting' | 'active' | 'results' | 'ended';
  participants: Participant[];
  totalQuestions: number;
}
