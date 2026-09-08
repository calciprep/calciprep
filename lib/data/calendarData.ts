// lib/data/calendarData.ts

export type NotificationType = 
  | 'Admit Card' 
  | 'Apply Notification' 
  | 'Corrigendum' 
  | 'Reschedule' 
  | 'Vacancies' 
  | 'City Intimation' 
  | 'Answer Key'
  | 'Result'
  | 'General Update';

export interface ExamNotification {
  id: string;
  board: string;
  examName: string;
  title: string;
  type: NotificationType;
  date: string;
  link: string;
}

// ⬇️ THIS IS THE ONLY ARRAY YOU EVER NEED TO EDIT ⬇️
export const calendarDatabase: ExamNotification[] = [
  {
    id: '1',
    board: 'SSC',
    examName: 'SSC CGL 2026',
    title: 'Tier 1 Admit Card Released for Northern Region',
    type: 'Admit Card',
    date: '08 Sept 2026',
    link: 'https://ssc.gov.in',
  },

];

// Helper function to get unique boards automatically
export const getUniqueBoards = () => {
  return ['All Updates', ...Array.from(new Set(calendarDatabase.map(item => item.board)))];
};