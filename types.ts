
export interface UserData {
  companyName: string;
  email: string;
  phone: string;
  countryCode: string;
}

export interface QuizData {
  resignationFrequency: string;
  hiringPlan: string;
  headcount: string;
}

export type GameState = 'ENTRY' | 'GAME' | 'DECISION' | 'PRE_CLAIM' | 'REVEAL';

export interface Prize {
  id: number;
  label: string;
  reward: string;
  description: string;
  icon: string;
}
