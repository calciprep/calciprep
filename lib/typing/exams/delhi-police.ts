import { ExamData } from '../types';

export const delhiPoliceHcm: ExamData = {
  rules: {
    id: 'delhi_police_hcm',
    name: 'Delhi Police HCM Typing',
    // Pointing to your local DP logo
    logo: '/media/delhi-police-logo.png',
    duration: 10 * 60, // 10 minutes
    allowBackspace: true, 
    highlightCurrentWord: false, // Strict exam environment
    showLiveErrors: false,
    targetWpm: 30, // 30 WPM English requirement
    description: "Delhi Police HCM Typing Test 2025 on Computer (Maximum 25 marks): Candidates who qualify in the Physical Endurance & Measurement Tests (PE&MT) as well as Persons with Benchmark Disabilities (PwBD) who qualify in the Computer Based Examination will be called for Delhi Police Typing Test on Computer. The marks will be taken into account while preparing the final result. The candidates will be allotted marks according to the speed achieved in the Typing Test. The Typing Test shall be of 10 minutes duration. Minimum qualifying speed shall be 30 w.p.m. in English and 25 w.p.m. in Hindi. Candidates will be provided with a printed passage containing a minimum of 400 words or 2000 strokes in English or 350 words or 1750 strokes in Hindi. No candidate shall be allowed/continue to type the passage after the duration of 10 minutes gets over."
  },
  passages: [

  ]
};