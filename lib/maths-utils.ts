// lib/maths-utils.ts

export interface MathsQuestion {
  question: string;
  answer: number;
  userAnswer?: number | null;
  isCorrect?: boolean;
}

// A simple function to get a random integer within a range
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generates an addition question based on difficulty
const generateAddition = (difficulty: string): MathsQuestion => {
  const levels: { [key: string]: { min: number; max: number } } = {
    easy: { min: 1, max: 20 },
    intermediate: { min: 10, max: 100 },
    advanced: { min: 100, max: 999 },
  };
  const { min, max } = levels[difficulty];
  const num1 = getRandomInt(min, max);
  const num2 = getRandomInt(min, max);
  return {
    question: `${num1} + ${num2}`,
    answer: num1 + num2,
  };
};

// Generates a subtraction question
const generateSubtraction = (difficulty: string): MathsQuestion => {
    const levels: { [key: string]: { min: number; max: number } } = {
        easy: { min: 1, max: 20 },
        intermediate: { min: 10, max: 100 },
        advanced: { min: 100, max: 999 },
    };
    const { min, max } = levels[difficulty];
    let num1 = getRandomInt(min, max);
    let num2 = getRandomInt(min, max);
    // Ensure the result is not negative for easier levels
    if (num1 < num2) {
        [num1, num2] = [num2, num1];
    }
    return {
        question: `${num1} - ${num2}`,
        answer: num1 - num2,
    };
};

// Generates a multiplication question
const generateMultiplication = (difficulty: string): MathsQuestion => {
    const levels: { [key: string]: { min: number; max: number } } = {
        easy: { min: 2, max: 10 },
        intermediate: { min: 5, max: 25 },
        advanced: { min: 10, max: 50 },
    };
    const { min, max } = levels[difficulty];
    const num1 = getRandomInt(min, max);
    const num2 = getRandomInt(min, max);
    return {
        question: `${num1} × ${num2}`,
        answer: num1 * num2,
    };
};

// Generates a division question
const generateDivision = (difficulty: string): MathsQuestion => {
    const levels: { [key: string]: { min: number; max: number } } = {
        easy: { min: 2, max: 10 },
        intermediate: { min: 3, max: 15 },
        advanced: { min: 5, max: 25 },
    };
    const { min, max } = levels[difficulty];
    const divisor = getRandomInt(min, max);
    const quotient = getRandomInt(min, max);
    const dividend = divisor * quotient;
    return {
        question: `${dividend} ÷ ${divisor}`,
        answer: quotient,
    };
};

// Generates a simplification (order of operations) question
const generateSimplification = (difficulty: string): MathsQuestion => {
    let question = '';
    let answer = 0;
    const num1 = getRandomInt(2, 10);
    const num2 = getRandomInt(2, 10);
    const num3 = getRandomInt(2, 10);
    
    if (difficulty === 'easy') {
        question = `${num1} + ${num2} × ${num3}`;
        answer = num1 + num2 * num3;
    } else if (difficulty === 'intermediate') {
        question = `(${num1} + ${num2}) × ${num3}`;
        answer = (num1 + num2) * num3;
    } else { // advanced
        const num4 = getRandomInt(2, 10);
        question = `${num1} × ${num2} + ${num3} × ${num4}`;
        answer = (num1 * num2) + (num3 * num4);
    }

    return { question, answer };
};

// Generates a percentage question
const generatePercentage = (difficulty: string): MathsQuestion => {
    let question = '';
    let answer = 0;
    const percent = getRandomInt(1, 9) * 10;
    
    if (difficulty === 'easy') {
        const num = getRandomInt(1, 5) * 20;
        question = `${percent}% of ${num}`;
        answer = (percent / 100) * num;
    } else if (difficulty === 'intermediate') {
        const num = getRandomInt(10, 200);
        question = `${percent}% of ${num}`;
        answer = Math.round(((percent / 100) * num) * 100) / 100;
    } else { // advanced
        const num = getRandomInt(100, 1000);
        const percentComplex = getRandomInt(5, 75);
        question = `${percentComplex}% of ${num}`;
        answer = Math.round(((percentComplex / 100) * num) * 100) / 100;
    }

    return { question, answer };
};


// Main function to generate a question of a random selected type
export const generateMathsQuestion = (types: string[], difficulty: string): MathsQuestion => {
  const randomType = types[Math.floor(Math.random() * types.length)];

  switch (randomType) {
    case 'add':
      return generateAddition(difficulty);
    case 'subtract':
        return generateSubtraction(difficulty);
    case 'multiply':
        return generateMultiplication(difficulty);
    case 'divide':
        return generateDivision(difficulty);
    case 'simplify':
        return generateSimplification(difficulty);
    case 'percentage':
        return generatePercentage(difficulty);
    default:
      return generateAddition('easy'); // Fallback
  }
};

