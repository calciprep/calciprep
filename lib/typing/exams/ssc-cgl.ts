import { ExamData } from '../types';

export const sscCgl: ExamData = {
  rules: {
    id: 'ssc_cgl',
    name: 'SSC CGL TYPING',
    // Pointing to your local image in the public/media folder
    logo: '/media/ssc-logo.png',
    duration: 15 * 60, // 15 minutes
    allowBackspace: true,
    highlightCurrentWord: false, 
    showLiveErrors: false,
    targetWpm: 27, 
    description: "Key Depression: The skill test will involve passages with approximately 2000 key depressions in the text. Time Required: Candidates will have 15 minutes to complete the typing test. DEST will be mandatory for all the posts; however, it will be qualifying in nature. For English Typing: 35 Words Per Minute (WPM) and for Hindi Typing: 30 Words Per Minute (WPM)."
  },
  passages: [
    {
      id: 'cgl_1',
      title: 'SSC CGL (Easy) Passage 1',
      difficulty: 'Easy',
      text: "The Staff Selection Commission Combined Graduate Level examination is one of the most coveted competitive exams in India. It offers a pathway to a prestigious career in various government departments and ministries. Understanding digital governance is crucial for these roles."
    },
    {
      id: 'cgl_2',
      title: 'SSC CGL (Medium) Passage 2',
      difficulty: 'Medium',
      text: "Studying is the main source of knowledge. Books are indeed never failing friends of man. For a mature mind, reading is the greatest source of pleasure and solace to distressed minds. The study of good books ennobles us and broadens our outlook."
    },
    {
      id: 'cgl_3',
      title: 'SSC CGL (Hard) New Custom Passage',
      difficulty: 'Hard',
      text: "This is my brand new custom passage. I can make it as long as I want. The architecture will automatically read this file, generate a new row in the passages table, and feed this exact text into the typing interface when the user clicks start. It is fully dynamic and scalable.",
      pdfUrl: "/data/my-custom-passage.pdf" // Optional: if you have a PDF they can download
    }
  ]
};