import { sscCgl } from './exams/ssc-cgl';
import { sscChsl } from './exams/ssc-chsl';
import { delhiPoliceHcm } from './exams/delhi-police';
import { ExamData } from './types';

export const exams: Record<string, ExamData> = {
  'ssc_cgl': sscCgl,
  'ssc_chsl': sscChsl,
  'delhi_police_hcm': delhiPoliceHcm,
  // Add new exams here in the future!
};

export const getExamList = () => {
    return Object.values(exams);
};