export interface Passage {
  id: string;
  title: string;
  text: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard'| 'PYTT';
  pdfUrl?: string;
}

export interface ExamRules {
  id: string;
  name: string;
  logo?: string;
  duration: number;
  allowBackspace: boolean;
  highlightCurrentWord: boolean;
  showLiveErrors: boolean;
  targetWpm: number;
  description: string;
}

export interface ExamData {
  rules: ExamRules;
  passages: Passage[];
}