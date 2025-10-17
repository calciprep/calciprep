import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import AdSenseBlock from '../../components/common/AdSenseBlock';

const MathsGameInterface = ({ settings }) => {
  const { mode, types, difficulty } = settings;

  const [gameState, setGameState] = useState('ready'); // ready, running, ended
  const [problem, setProblem] = useState({ text: 'Get Ready...', answer: null });
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [timer, setTimer] = useState(mode === '1-minute' ? 60 : 0);
  const [inputValue, setInputValue] = useState('');
  const [answerStatus, setAnswerStatus] = useState(null); // 'correct', 'incorrect'

  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const modeTitles = {
    '1-minute': '1-Minute Challenge',
    'bitter-end': 'To the Bitter End',
    'speed-challenge': 'Speed Challenge',
  };
  
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const generateProblem = () => {
    const problemType = types[Math.floor(Math.random() * types.length)];
    let newProblem = {};
    
    const generateAdditionProblem = (diff) => {
        let a, b;
        if (diff === 'easy') { a = rand(1, 10); b = rand(1, 10); }
        else if (diff === 'intermediate') { a = rand(10, 100); b = rand(10, 100); }
        else { a = rand(100, 1000); b = rand(100, 1000); }
        return { text: `${a} + ${b}`, answer: a + b };
    };
    const generateSubtractionProblem = (diff) => {
        let a, b;
        if (diff === 'easy') { a = rand(5, 20); b = rand(1, a - 1); }
        else if (diff === 'intermediate') { a = rand(50, 100); b = rand(10, a - 10); }
        else { a = rand(100, 1000); b = rand(50, a - 50); }
        return { text: `${a} - ${b}`, answer: a - b };
    };
    const generateMultiplicationProblem = (diff) => {
        let a, b;
        if (diff === 'easy') { a = rand(1, 10); b = rand(1, 10); }
        else if (diff === 'intermediate') { a = rand(2, 20); b = rand(2, 20); }
        else { a = rand(10, 50); b = rand(10, 50); }
        return { text: `${a} &times; ${b}`, answer: a * b };
    };
    const generateDivisionProblem = (diff) => {
        let a, b;
        if (diff === 'easy') { b = rand(1, 10); a = b * rand(1, 10); }
        else if (diff === 'intermediate') { b = rand(2, 20); a = b * rand(5, 20); }
        else { b = rand(5, 50); a = b * rand(10, 50); }
        return { text: `${a} &divide; ${b}`, answer: a / b };
    };
     const generateSimplificationProblem = (diff) => {
        let a, b, c;
        if (diff === 'easy') {
            a = rand(1, 10); b = rand(1, 10); c = rand(1, 10);
            return { text: `${a} + ${b} &times; ${c}`, answer: a + b * c };
        } else if (diff === 'intermediate') {
            a = rand(1, 20); b = rand(1, 20); c = rand(1, 10);
            return { text: `(${a} + ${b}) &times; ${c}`, answer: (a + b) * c };
        } else {
            a = rand(10, 50); b = rand(2, 10); c = rand(2, 10);
            let product = a * b;
            return { text: `${product} &divide; ${b} + ${c}`, answer: a + c };
        }
    };
    const generatePercentageProblem = (diff) => {
        let percent, num;
        if (diff === 'easy') {
            percent = [10, 20, 25, 50, 75][rand(0, 4)];
            num = rand(1, 10) * 10;
        } else if (diff === 'intermediate') {
            percent = rand(1, 99);
            num = rand(10, 200);
        } else {
            percent = rand(1, 150);
            num = rand(100, 1000);
        }
        const answer = (percent / 100) * num;
        return { text: `${percent}% of ${num}`, answer: parseFloat(answer.toFixed(2)) };
    };

    switch (problemType) {
        case 'add': newProblem = generateAdditionProblem(difficulty); break;
        case 'subtract': newProblem = generateSubtractionProblem(difficulty); break;
        case 'multiply': newProblem = generateMultiplicationProblem(difficulty); break;
        case 'divide': newProblem = generateDivisionProblem(difficulty); break;
        case 'simplify': newProblem = generateSimplificationProblem(difficulty); break;
        case 'percentage': newProblem = generatePercentageProblem(difficulty); break;
        default: newProblem = generateAdditionProblem(difficulty);
    }
    setProblem(newProblem);
  };

  useEffect(() => {
    if (gameState === 'running') {
      timerRef.current = setInterval(() => {
        if (mode === '1-minute') {
          setTimer(t => {
            if (t <= 1) {
              endGame("Time's up!");
              return 0;
            }
            return t - 1;
          });
        } else {
          setTimer(t => t + 1);
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, mode]);

  const startGame = () => {
    setGameState('running');
    generateProblem();
    setQuestionCount(1);
    if (inputRef.current) {
        inputRef.current.focus();
    }
  };

  const endGame = (message) => {
    clearInterval(timerRef.current);
    setGameState('ended');
    setProblem({ text: message, answer: null });
  };
  
  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '' || gameState !== 'running') return;

    const userAnswer = parseFloat(inputValue);
    const isCorrect = Math.abs(userAnswer - problem.answer) < 0.01;

    setAnswerStatus(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      setIncorrectCount(ic => ic + 1);
      if (mode === 'bitter-end') {
        setTimeout(() => endGame('Game Over!'), 400);
        return;
      }
    }
    
    if (mode === 'speed-challenge' && questionCount + 1 > 20) {
        setTimeout(() => endGame('Challenge Complete!'), 400);
        return;
    }

    setTimeout(() => {
        setInputValue('');
        setAnswerStatus(null);
        setQuestionCount(q => q + 1);
        generateProblem();
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, 400);
  };

  if (gameState === 'ended') {
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">{problem.text}</h2>
        <div className="text-xl mt-4 space-y-2 font-sans">
            <p>Correct Answers: <span className="text-green-500 font-bold">{score}</span></p>
            {mode !== 'bitter-end' && <p>Incorrect Answers: <span className="text-red-500 font-bold">{incorrectCount}</span></p>}
            <p>Total Time: <span className="font-bold">{timer}s</span></p>
        </div>
        <div className="my-8">
            <AdSenseBlock adSlot="8298630487" />
        </div>
        <div className="flex items-center justify-center space-x-4">
            <button onClick={() => window.location.reload()} className="w-auto px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all">
              Play Again
            </button>
            <Link to="/maths.html" className="w-auto px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all">
                Choose Another Challenge
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
        <style>{`
            .correct-answer {
                border-color: #22c55e !important;
                box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3);
            }
            .incorrect-answer {
                border-color: #ef4444 !important;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
            }
        `}</style>
      <h2 className="text-3xl font-bold text-center mb-6">{modeTitles[mode]}</h2>
      <div
        className="text-5xl font-mono text-center my-8 p-6 bg-gray-100 rounded-lg shadow-inner"
        dangerouslySetInnerHTML={{ __html: problem.text.replace(/×/g, '&times;').replace(/÷/g, '&divide;') }}
      />
      {gameState === 'running' && (
        <form onSubmit={handleAnswerSubmit}>
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={`w-full p-4 text-3xl text-center rounded-lg border-2 focus:outline-none focus:border-purple-500 transition-all duration-300 ${answerStatus === 'correct' ? 'correct-answer' : ''} ${answerStatus === 'incorrect' ? 'incorrect-answer' : ''}`}
              placeholder="Your Answer..."
              autoFocus
              autoComplete="off"
            />
            <button type="submit" className="p-4 bg-purple-500 text-white rounded-lg flex-shrink-0">
                <Send size={24} />
            </button>
          </div>
        </form>
      )}

      <div className="flex justify-between items-center mt-8 text-xl font-sans">
        <div>Time: <span className="font-bold text-purple-600">{timer}</span>s</div>
        {mode === 'speed-challenge' && <div>Question: <span className="font-bold">{questionCount}</span>/20</div>}
        <div>Score: <span className="font-bold text-purple-600">{score}</span></div>
      </div>
      
      <div className="mt-8 font-sans">
          {gameState === 'ready' && (
            <button onClick={startGame} className="w-full py-4 bg-purple-600 text-white text-xl rounded-lg">Start Game</button>
          )}
          {gameState === 'running' && (
            <button onClick={() => endGame("Challenge Ended.")} className="w-full py-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all">End Game</button>
          )}
      </div>
    </div>
  );
};

export default MathsGameInterface;

