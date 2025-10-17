import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getLearnKeysExercises, getPracticeWords, getTypeParagraphs } from '../services/dataService';
import { useTypingSound } from '../hooks/useTypingSound';
import ResultPopup from '../components/common/ResultPopup';

// --- Reusable Logic Hook for Typing Practice ---
const useTypingPractice = (fetchDataFunction, options = {}) => {
    const { isMultiLevel = false } = options;

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [currentText, setCurrentText] = useState('');
    const [typedText, setTypedText] = useState('');
    
    const [activeCategory, setActiveCategory] = useState('');
    const [activeSubIndex, setActiveSubIndex] = useState(0);

    const [fontSize, setFontSize] = useState(24);
    const { soundEnabled, toggleSound, playKeySound } = useTypingSound(false);
    
    const [isStarted, setIsStarted] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [backspaceCount, setBackspaceCount] = useState(0);
    const [keystrokeCount, setKeystrokeCount] = useState(0);

    const [isResultOpen, setIsResultOpen] = useState(false);
    const [results, setResults] = useState(null);

    const inputRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const fetchedData = await fetchDataFunction();
            if (fetchedData) {
                setData(fetchedData);
                const firstCategory = Object.keys(fetchedData)[0];
                setActiveCategory(firstCategory);
                if (isMultiLevel) {
                    setCurrentText(fetchedData[firstCategory]?.[0] || '');
                } else {
                     setCurrentText(fetchedData[firstCategory]?.join(' ') || '');
                }
            }
            setIsLoading(false);
        };
        load();
    }, [fetchDataFunction, isMultiLevel]);

    const resetPractice = useCallback(() => {
        setTypedText('');
        setStartTime(null);
        setBackspaceCount(0);
        setKeystrokeCount(0);
        setIsStarted(false);
        setIsResultOpen(false);
        setResults(null);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const loadExercise = useCallback((category, subIndex = 0) => {
        if (!data) return;
        resetPractice();
        setActiveCategory(category);
        setActiveSubIndex(subIndex);
        if(isMultiLevel) {
            setCurrentText(data[category]?.[subIndex] || '');
        } else {
            setCurrentText(data[category]?.join(' ') || '');
        }
    }, [data, isMultiLevel, resetPractice]);

    const handleKeyDown = (e) => {
        if (!isStarted && (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Shift')) {
            setIsStarted(true);
            setStartTime(Date.now());
        }
        if (e.key === 'Backspace') setBackspaceCount(c => c + 1);
        if ((e.key.length === 1 || e.key === ' ') && !e.metaKey && !e.ctrlKey) {
            setKeystrokeCount(c => c + 1);
            playKeySound();
        }
    };
    
    const finalizeExercise = useCallback(() => {
        if (typedText.length === 0) return;
        const durationMs = startTime ? (Date.now() - startTime) : 1;
        const minutes = durationMs / 60000;
        const typedWords = typedText.trim().split(/\s+/).filter(Boolean);
        const expectedWords = currentText.trim().split(/\s+/);
        let correctChars = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (i < currentText.length && typedText[i] === currentText[i]) correctChars++;
        }
        let correctWordsCount = 0;
        typedWords.forEach((word, i) => { if (expectedWords[i] && word === expectedWords[i]) correctWordsCount++; });
        
        const grossWpm = (typedText.length / 5) / minutes;
        const netWpm = Math.max(0, ((correctChars / 5) / minutes));
        const grossWpm2 = typedWords.length / minutes;
        const netWpm2 = correctWordsCount / minutes;
        const strokesPerMin = keystrokeCount / minutes;
        const accuracy = typedText.length > 0 ? (correctChars / typedText.length) * 100 : 0;
        const formatDuration = ms => { const s=Math.floor(ms/1000); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; };
        
        setResults({
            durationFormatted: formatDuration(durationMs), correctWords: correctWordsCount, totalWords: typedWords.length, incorrectWords: typedWords.length - correctWordsCount,
            netWpm: Math.round(netWpm), grossWpm: Math.round(grossWpm), netWpm2: Math.round(netWpm2), grossWpm2: Math.round(grossWpm2),
            strokesPerMin: Math.round(strokesPerMin), accuracy: Math.round(accuracy), backspaceCount
        });
        setIsResultOpen(true);
    }, [typedText, currentText, startTime, keystrokeCount, backspaceCount]);
    
    useEffect(() => {
        if (isStarted && typedText.length > 0 && typedText.length >= currentText.length) {
            finalizeExercise();
        }
    }, [typedText, currentText, isStarted, finalizeExercise]);

    return {
        data, isLoading, currentText, typedText, setTypedText, activeCategory, activeSubIndex, fontSize, setFontSize,
        soundEnabled, toggleSound, isStarted, inputRef, handleKeyDown, finalizeExercise, isResultOpen, results,
        setIsResultOpen, resetPractice, loadExercise
    };
};


// --- Main Component ---
const LearnTypingPage = () => {
  const [activeTab, setActiveTab] = useState('panel-1');

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <Helmet>
            <title>Learn Typing - Improve Speed & Accuracy | CalciPrep</title>
            <meta name="description" content="Master touch typing with our interactive lessons and practice exercises. Improve your speed and accuracy while typing in English." />
        </Helmet>
        <style>{`
            .tab-link.active { border-bottom-color: #8B5CF6; color: #7C3AED; font-weight:600; }
            @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
            .cursor::before { content: ''; position: absolute; top: 10%; bottom: 10%; left: -2px; width: 2px; background-color: #10b981; animation: blink 1.2s infinite; }
            .correct-char { color: #15803d; }
            .incorrect-char { background-color: #fee2e2; color: #b91c1c; text-decoration: underline; border-radius: 2px;}
        `}</style>
      <div className="mb-4 max-w-7xl mx-auto">
        <Link to="/typing-selection.html" className="text-sm text-purple-600 hover:text-purple-800 font-medium inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Typing Selection
        </Link>
      </div>
      <div className="flex justify-center gap-8">
        <div className="flex-grow max-w-4xl">
          <nav className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-8 font-sans overflow-x-auto">
            <a href="#instructions" onClick={(e) => { e.preventDefault(); setActiveTab('panel-1'); }} className={`tab-link whitespace-nowrap border-b-2 px-4 py-2 transition-colors duration-200 text-slate-600 hover:text-purple-600 ${activeTab === 'panel-1' ? 'active' : 'border-transparent'}`}>1. Instructions</a>
            <span className="text-slate-300 mx-2 hidden sm:inline">&rarr;</span>
            <a href="#learn-keys" onClick={(e) => { e.preventDefault(); setActiveTab('panel-2'); }} className={`tab-link whitespace-nowrap border-b-2 px-4 py-2 transition-colors duration-200 text-slate-600 hover:text-purple-600 ${activeTab === 'panel-2' ? 'active' : 'border-transparent'}`}>2. Learn Keys</a>
            <span className="text-slate-300 mx-2 hidden sm:inline">&rarr;</span>
            <a href="#practice-words" onClick={(e) => { e.preventDefault(); setActiveTab('panel-3'); }} className={`tab-link whitespace-nowrap border-b-2 px-4 py-2 transition-colors duration-200 text-slate-600 hover:text-purple-600 ${activeTab === 'panel-3' ? 'active' : 'border-transparent'}`}>3. Practice Words</a>
            <span className="text-slate-300 mx-2 hidden sm:inline">&rarr;</span>
            <a href="#type-paragraphs" onClick={(e) => { e.preventDefault(); setActiveTab('panel-4'); }} className={`tab-link whitespace-nowrap border-b-2 px-4 py-2 transition-colors duration-200 text-slate-600 hover:text-purple-600 ${activeTab === 'panel-4' ? 'active' : 'border-transparent'}`}>4. Type Paragraphs</a>
          </nav>
            <div style={{ display: activeTab === 'panel-1' ? 'block' : 'none' }}><InstructionsPanel onStartLearning={() => setActiveTab('panel-2')} /></div>
            <div style={{ display: activeTab === 'panel-2' ? 'block' : 'none' }}><LearnKeysPanel /></div>
            <div style={{ display: activeTab === 'panel-3' ? 'block' : 'none' }}><PracticeWordsPanel /></div>
            <div style={{ display: activeTab === 'panel-4' ? 'block' : 'none' }}><TypeParagraphsPanel /></div>
        </div>
      </div>
    </main>
  );
};

// --- Panel Components ---

const InstructionsPanel = ({ onStartLearning }) => (
  <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm">
    <h2 className="text-2xl font-bold mb-2">Where to place your fingers</h2>
    <p className="text-gray-600 font-sans">QWERTY keyboards are standard. Before you start, place your fingers as shown in the image below.</p>
    <div className="my-6 flex justify-center">
      <img src="/media/instructions.png" alt="Keyboard finger placement guide" className="max-w-xl w-full border rounded-lg shadow-sm" />
    </div>
    <ul className="list-disc list-inside space-y-2 text-gray-700 font-sans">
      <li>Place your left index finger on the 'F' key.</li>
      <li>Place your right index finger on the 'J' key.</li>
      <li>Your thumbs should rest lightly on the 'space' bar.</li>
    </ul>
    <div className="mt-6 text-center">
      <button onClick={onStartLearning} className="bg-purple-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-purple-700 transition-colors">Start Learning Keys</button>
    </div>
  </div>
);

const LearnKeysPanel = () => {
    const practice = useTypingPractice(getLearnKeysExercises, { isMultiLevel: true });
    const handleClose = () => {
        practice.setIsResultOpen(false);
        practice.resetPractice();
    };
    return (
      <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border">
        <DisplayArea {...practice} />
        <div className="flex flex-wrap justify-between items-center mt-2 px-2 py-1 gap-4">
            <div className="flex items-center space-x-2">
                <button onClick={() => practice.loadExercise(practice.activeCategory, practice.activeSubIndex - 1)} disabled={practice.activeSubIndex === 0} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50"><ChevronLeft/></button>
                <select onChange={e => practice.loadExercise(e.target.value, 0)} value={practice.activeCategory} className="text-sm px-2 py-1 border rounded bg-white font-sans">
                    {practice.data && Object.keys(practice.data).map(key => <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}</option>)}
                </select>
                <select onChange={e => practice.loadExercise(practice.activeCategory, parseInt(e.target.value, 10))} value={practice.activeSubIndex} className="text-sm px-2 py-1 border rounded bg-white font-sans">
                    {practice.data && practice.data[practice.activeCategory]?.map((_, idx) => <option key={idx} value={idx}>Exercise {idx + 1}</option>)}
                </select>
                <button onClick={() => practice.loadExercise(practice.activeCategory, practice.activeSubIndex + 1)} disabled={!practice.data || practice.activeSubIndex >= (practice.data[practice.activeCategory]?.length - 1)} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50"><ChevronRight/></button>
            </div>
            <Controls {...practice} />
        </div>
        <TypingArea {...practice} />
        <ResultPopup isOpen={practice.isResultOpen} results={practice.results} onClose={handleClose} onRepeat={practice.resetPractice} onNext={() => practice.loadExercise(practice.activeCategory, practice.activeSubIndex + 1)} />
      </div>
    );
};

const PracticeWordsPanel = () => {
    const practice = useTypingPractice(getPracticeWords, { isMultiLevel: false });
    const handleClose = () => {
        practice.setIsResultOpen(false);
        practice.resetPractice();
    };
    return (
      <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border">
        <DisplayArea {...practice} />
        <div className="flex flex-wrap justify-between items-center mt-2 px-2 py-1 gap-4">
            <div className="flex items-center space-x-2">
                <button onClick={() => practice.loadExercise(practice.activeCategory)} className="p-2 rounded-md hover:bg-slate-100"><ChevronLeft/></button>
                <select onChange={e => practice.loadExercise(e.target.value)} value={practice.activeCategory} className="text-sm px-2 py-1 border rounded bg-white font-sans">
                    {practice.data && Object.keys(practice.data).map(key => <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>)}
                </select>
                <button onClick={() => practice.loadExercise(practice.activeCategory)} className="p-2 rounded-md hover:bg-slate-100"><ChevronRight/></button>
            </div>
            <Controls {...practice} />
        </div>
        <TypingArea {...practice} />
        <ResultPopup isOpen={practice.isResultOpen} results={practice.results} onClose={handleClose} onRepeat={practice.resetPractice} onNext={() => practice.loadExercise(practice.activeCategory)} />
      </div>
    );
};

const TypeParagraphsPanel = () => {
    const fetchParagraphs = useCallback(() => getTypeParagraphs().then(data => (data ? { paragraphs: data } : null)), []);
    const practice = useTypingPractice(fetchParagraphs, { isMultiLevel: true });
    const handleClose = () => {
        practice.setIsResultOpen(false);
        practice.resetPractice();
    };
    return (
      <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border">
        <DisplayArea {...practice} />
        <div className="flex flex-wrap justify-between items-center mt-2 px-2 py-1 gap-4">
            <div className="flex items-center space-x-2">
                <button onClick={() => practice.loadExercise('paragraphs', practice.activeSubIndex - 1)} disabled={practice.activeSubIndex === 0} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50"><ChevronLeft/></button>
                <select onChange={e => practice.loadExercise('paragraphs', parseInt(e.target.value, 10))} value={practice.activeSubIndex} className="text-sm px-2 py-1 border rounded bg-white font-sans">
                     {practice.data?.paragraphs?.map((_, idx) => <option key={idx} value={idx}>Paragraph {idx + 1}</option>)}
                </select>
                <button onClick={() => practice.loadExercise('paragraphs', practice.activeSubIndex + 1)} disabled={!practice.data || !practice.data.paragraphs || practice.activeSubIndex >= (practice.data.paragraphs.length - 1)} className="p-2 rounded-md hover:bg-slate-100"><ChevronRight/></button>
            </div>
            <Controls {...practice} />
        </div>
        <TypingArea {...practice} />
        <ResultPopup isOpen={practice.isResultOpen} results={practice.results} onClose={handleClose} onRepeat={practice.resetPractice} onNext={() => practice.loadExercise('paragraphs', practice.activeSubIndex + 1)} />
      </div>
    );
};


// --- Helper Components for Typing Interface ---

const DisplayArea = ({ isLoading, currentText, typedText, fontSize }) => (
    <div style={{ fontSize: `${fontSize}px` }} className="w-full h-64 p-4 font-mono text-gray-700 bg-gray-50 rounded-lg border border-slate-200 overflow-y-auto whitespace-pre-wrap select-none">
        {isLoading ? "Loading..." : (currentText || "").split('').map((char, index) => {
            let className = '';
            if (index < typedText.length) className = char === typedText[index] ? 'correct-char' : 'incorrect-char';
            if (index === typedText.length) className += ' relative cursor';
            return <span key={index} className={className}>{char}</span>
        })}
    </div>
);

const Controls = ({ fontSize, setFontSize, soundEnabled, toggleSound, isStarted, finalizeExercise }) => (
    <div className="flex items-center space-x-4 font-sans">
        <div className="flex items-center space-x-2">
            <button onClick={() => setFontSize(s => Math.max(s - 2, 12))} className="p-2 rounded-md hover:bg-slate-100 text-sm">A-</button>
            <button onClick={() => setFontSize(s => Math.min(s + 2, 40))} className="p-2 rounded-md hover:bg-slate-100 text-sm">A+</button>
            <label className="inline-flex items-center text-sm ml-2">
                <input type="checkbox" checked={soundEnabled} onChange={toggleSound} className="mr-1.5 rounded text-purple-600 focus:ring-purple-500"/>
                <span>Sound</span>
            </label>
        </div>
        <div className="h-10">
           {isStarted && (
                <button onClick={finalizeExercise} className="bg-green-600 text-white px-4 py-2 h-full rounded-lg hover:bg-green-700 font-sans">
                    Submit
                </button>
            )}
        </div>
    </div>
);

const TypingArea = ({ inputRef, typedText, setTypedText, handleKeyDown }) => (
    <textarea 
        ref={inputRef} 
        value={typedText} 
        onChange={e => setTypedText(e.target.value)} 
        onKeyDown={handleKeyDown} 
        className="w-full h-48 mt-2 p-4 font-mono text-lg bg-white rounded-lg border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500" 
        placeholder="Start typing here..." 
    />
);

export default LearnTypingPage;

