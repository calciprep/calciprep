export type PlatformType =
  | "Testbook"
  | "Oliveboard"
  | "Parmar SSC"
  | "RBE"
  | "PracticeMock"
  | "SuperMocks"
  | "Other";

export type ExamCategory =
  | "SSC CGL Tier-1"
  | "SSC CGL Tier-2"
  | "SSC CPO"
  | "SSC CHSL"
  | "Delhi Police HCM"
  | "IB ACIO";

export type MockMode = "Full Mock" | "Sectional Mock";

export type SectionKey = "quant" | "reasoning" | "english" | "gk";

export interface SectionalScores {
  quant: number;
  reasoning: number;
  english: number;
  gk: number;
}

export interface MockTestRecord {
  id: string;
  userId?: string;
  title: string;
  date: string;
  createdAt: number;
  platform: PlatformType;
  exam: ExamCategory;
  mockMode: MockMode;
  sectionalSubject?: SectionKey;
  totalScore: number;
  maxScore: number;
  percentile: number;
  accuracy: number;
  timeTakenMinutes?: number;
  sections: SectionalScores;
  weakTopics: string;
}

export interface UserMockGoal {
  targetExam: ExamCategory;
  targetScore: number;
  targetPercentile: number;
}