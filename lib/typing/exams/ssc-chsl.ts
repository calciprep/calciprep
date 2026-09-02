import { ExamData } from '../types';

export const sscChsl: ExamData = {
  rules: {
    id: 'ssc_chsl',
    name: 'SSC CHSL',
    // Using the exact same SSC logo here
    logo: '/media/ssc-logo.png',
    duration: 10 * 60, // 10 minutes
    allowBackspace: true,
    highlightCurrentWord: false,
    showLiveErrors: false,
    targetWpm: 35, // LDC/JSA requirement
    description: "LDC/JSA format: 10 mins, 35 WPM English requirement. Backspace is allowed. Accuracy is crucial; focus on minimizing errors rather than raw speed."
  },
  passages: [
    {
      id: 'chsl_1',
      title: 'Climate Change and Environment',
      text: "Climate change refers to significant and long term changes in the global climate. The global climate is the connected system of sun, earth and oceans, wind, rain and snow, forests, deserts and savannas, and everything people do, too. The climate of a place, say New York, can be described as its rainfall, changing temperatures during the year and so on. But the global climate is more than the average of the climates of specific places. A description of the global climate includes how, for example, the rising temperature of the Pacific feeds typhoons which blow harder, drop more rain and cause more damage, but also shifts global ocean currents that melt Antarctica ice which slowly makes sea level rise until New York will be under water. It is this systemic connectedness that makes global climate change so important and so complicated. Human activities, primarily the burning of fossil fuels, have significantly increased the concentration of greenhouse gases in the atmosphere. This enhanced greenhouse effect traps more heat, leading to global warming. The consequences are far reaching, affecting ecosystems, agriculture, and human settlements. Mitigating climate change requires urgent and coordinated international action to transition to sustainable energy sources."
    },
    {
      id: 'chsl_2',
      title: 'Importance of Positive Thinking',
      text: "Is positive thinking an inherent characteristic of a person or can it be developed in one's psyche? The opinions differ in answering this vital question. Some people believe that it can be inherited from parents, and cannot be developed. Others believe that like other quality of a child. A child, who watches his parents working hard, having faith in success through their words, behaviour and body language, is likely to develop a similar attitude. The children of short-tempered, over-cautious and nervous parents may assume similar characteristics when they grow up. They must be taught the importance of being positive before, during and after the performance of a task. There is no better education for a child than watching his parents come out of a tough situation by means of earnest endeavours. Such success not only gives more joy but also increases self-confidence. Positive thinking acts as a shield against stress and anxiety, promoting overall mental well being. It encourages a proactive approach to problem solving, enabling individuals to focus on solutions rather than dwelling on obstacles. Ultimately, a positive mindset is a powerful tool for personal and professional growth."
    }
  ]
};