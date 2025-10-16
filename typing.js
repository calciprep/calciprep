import { resultPopup } from './result-popup.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const textDisplay = document.getElementById('text-display');
    const typingInput = document.getElementById('typing-input');
    
    // Timer & Controls
    const timerControls = document.getElementById('timer-controls');
    const timerControlsMobile = document.getElementById('timer-controls-mobile');
    const timerEl = document.getElementById('timer');
    const timerMobileEl = document.getElementById('timer-mobile');
    const durationSelect = document.getElementById('duration-select');
    const submitBtn = document.getElementById('submit-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const submitBtnMobile = document.getElementById('submit-btn-mobile');
    const pauseBtnMobile = document.getElementById('pause-btn-mobile');

    // Exercise Navigation
    const exerciseSelect = document.getElementById('exercise-select');
    const prevExerciseBtn = document.getElementById('prev-exercise');
    const nextExerciseBtn = document.getElementById('next-exercise');

    // Settings
    const fontIncreaseBtn = document.getElementById('font-increase');
    const fontDecreaseBtn = document.getElementById('font-decrease');
    const soundCheckbox = document.getElementById('typing-sound-checkbox');

    // --- State Variables ---
    let paragraphs = [];
    let currentParagraphIndex = 0;
    
    let timerInterval = null;
    let timeRemaining = parseInt(durationSelect.value, 10);
    
    let isTestActive = false;
    let isPaused = false;
    
    let backspaceCount = 0;
    let keystrokeCount = 0;
    let testStartTime = null;

    // --- Sound Logic ---
    const TYPING_SOUND_KEY = 'calciprep_typing_sound_enabled';
    let audioCtx = null;
    let typingSoundEnabled = localStorage.getItem(TYPING_SOUND_KEY) === 'true';
    if (soundCheckbox) {
        soundCheckbox.checked = typingSoundEnabled;
        soundCheckbox.addEventListener('change', (e) => {
            typingSoundEnabled = e.target.checked;
            localStorage.setItem(TYPING_SOUND_KEY, typingSoundEnabled);
             if(typingSoundEnabled && audioCtx && audioCtx.state==='suspended') audioCtx.resume();
        });
    }

    let clickBuffer = null;
    let thudBuffer = null; // We'll still define it, but won't use it for the thud sound

    function ensureAudioContext(){ if(!audioCtx){ try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ audioCtx = null; } } }
    
    async function makeClickBuffers(){ if(!audioCtx) return; if(clickBuffer && thudBuffer) return;
        // This function creates sound buffers programmatically, similar to learn-typing.html
        const sampleRate = audioCtx.sampleRate;
        const renderBuffer = async (durationSec, toneFreq, noiseGain=0.35, toneGain=0.6, decay=6) => {
            const len = Math.floor(sampleRate * durationSec);
            // Use OfflineAudioContext to render a high-quality buffer
            const offline = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, len, sampleRate);
            // Tone part
            const osc = offline.createOscillator(); osc.type = 'sine'; osc.frequency.value = toneFreq;
            const toneGainNode = offline.createGain();
            toneGainNode.gain.setValueAtTime(0.0001, 0);
            toneGainNode.gain.linearRampToValueAtTime(toneGain, 0.002);
            toneGainNode.gain.exponentialRampToValueAtTime(0.0001, durationSec);
            osc.connect(toneGainNode); toneGainNode.connect(offline.destination);

            // Noise part for a more realistic click
            const noiseBuf = offline.createBuffer(1, len, sampleRate);
            const nd = noiseBuf.getChannelData(0);
            for(let i=0;i<len;i++){
                const t = i / len;
                nd[i] = (Math.random()*2 - 1) * Math.pow(1 - t, decay) * noiseGain;
            }
            const noiseSrc = offline.createBufferSource(); noiseSrc.buffer = noiseBuf; noiseSrc.connect(offline.destination);

            osc.start(0); noiseSrc.start(0);
            return await offline.startRendering();
        };

        try {
            if(!clickBuffer) clickBuffer = await renderBuffer(0.06, 1600 + Math.random()*400, 0.25, 0.6, 20);
            if(!thudBuffer) thudBuffer = await renderBuffer(0.12, 300 + Math.random()*200, 0.4, 0.9, 12);
        } catch(e) {
            console.error("Could not create typing sounds with OfflineAudioContext, falling back.", e);
            // Fallback for older browsers
            if(!clickBuffer){
                const clickLen = Math.floor(sampleRate * 0.06);
                const click = audioCtx.createBuffer(1, clickLen, sampleRate);
                const cdata = click.getChannelData(0);
                for(let i=0;i<clickLen;i++){ const t=i/clickLen; cdata[i]=(Math.random()*2-1)*(1-t)*0.4; }
                clickBuffer = click;
            }
        }
    }


    function playTypeSound(key) {
        if (!typingSoundEnabled || !clickBuffer) return;
        try {
            ensureAudioContext();
            if (!audioCtx) return;
            if (audioCtx.state === 'suspended') audioCtx.resume();
            
            const src = audioCtx.createBufferSource();
            const gain = audioCtx.createGain();
            
            // Play the same 'click' sound for all keys, removing the spacebar 'thud'
            src.buffer = clickBuffer;
            
            // Add slight random variation to pitch and volume to avoid sounding robotic
            src.playbackRate.value = 1.0 + Math.random() * 0.2;
            gain.gain.value = 0.5 + Math.random() * 0.2;

            src.connect(gain);
            gain.connect(audioCtx.destination);
            src.start();

        } catch (e) { /* ignore audio errors */ }
    }
    
    // --- Core Test Functions ---
    function setTimerControlsVisibility(visible) {
        const action = visible ? 'remove' : 'add';
        timerControls.classList[action]('controls-hidden');
        timerControlsMobile.classList[action]('controls-hidden');
    }

    function resetTestState() {
        isTestActive = false;
        isPaused = false;
        clearInterval(timerInterval);
        timeRemaining = parseInt(durationSelect.value, 10);
        
        backspaceCount = 0;
        keystrokeCount = 0;
        testStartTime = null;
        
        typingInput.value = '';
        typingInput.disabled = false;
        
        pauseBtn.textContent = 'Pause';
        pauseBtnMobile.textContent = 'Pause';
        
        setTimerControlsVisibility(false);
        updateTimerDisplay();
        
        loadParagraph(currentParagraphIndex);
    }

    function loadParagraph(index) {
        if (index < 0 || index >= paragraphs.length) return;
        currentParagraphIndex = index;
        const paragraph = paragraphs[index];
        
        textDisplay.innerHTML = '';
        paragraph.passage.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            textDisplay.appendChild(span);
        });
        
        if (textDisplay.firstChild) {
            textDisplay.firstChild.classList.add('current-char');
        }

        exerciseSelect.value = index;
        prevExerciseBtn.disabled = index === 0;
        nextExerciseBtn.disabled = index === paragraphs.length - 1;
        typingInput.focus();
    }

    function startTest() {
        if (isTestActive) return; // Prevent multiple starts

        isTestActive = true;
        testStartTime = Date.now();
        
        setTimerControlsVisibility(true);
        // Ensure sounds are loaded when the test starts
        ensureAudioContext();
        makeClickBuffers();

        timerInterval = setInterval(() => {
            if (!isPaused && isTestActive) {
                timeRemaining--;
                updateTimerDisplay();
                if (timeRemaining <= 0) {
                    finalizeExercise();
                }
            }
        }, 1000);
    }
    
    function finalizeExercise() {
        if (!isTestActive) return; 
        isTestActive = false;
        isPaused = true; 
        clearInterval(timerInterval);
        typingInput.disabled = true;

        setTimerControlsVisibility(false);

        const typedText = typingInput.value;
        const expectedText = paragraphs[currentParagraphIndex].passage;
        const durationTaken = testStartTime ? (Date.now() - testStartTime) / 1000 : parseInt(durationSelect.value, 10);
        const durationMs = durationTaken * 1000;

        const typedWords = typedText.trim() ? typedText.trim().split(/\s+/).filter(Boolean) : [];
        const expectedWords = expectedText.trim().split(/\s+/);
        
        let correctChars = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (i < expectedText.length && typedText[i] === expectedText[i]) {
                correctChars++;
            }
        }
        
        const totalCharsTyped = typedText.length;
        const totalMistakes = totalCharsTyped - correctChars;
        const minutes = (durationMs / 60000) || 0.00001;

        const grossWpm = Math.round((totalCharsTyped / 5) / minutes);
        const netWpm = Math.max(0, Math.round(grossWpm - (totalMistakes / minutes)));
        
        const grossWpm2 = Math.round(typedWords.length / minutes);
        let correctWordsCount = 0;
        typedWords.forEach((word, i) => {
            if (word === expectedWords[i]) {
                correctWordsCount++;
            }
        });
        const netWpm2 = Math.max(0, Math.round((correctWordsCount / minutes)));

        const strokesPerMin = Math.round(keystrokeCount / minutes);
        const accuracy = totalCharsTyped > 0 ? Math.max(0, Math.round((correctChars / totalCharsTyped) * 100)) : 100;

        resultPopup.show({
            durationFormatted: formatTime(Math.round(durationTaken)),
            correctWords: correctWordsCount,
            totalWords: typedWords.length,
            incorrectWords: typedWords.length - correctWordsCount,
            netWpm,
            grossWpm,
            netWpm2,
            grossWpm2,
            strokesPerMin,
            accuracy,
            backspaceCount,
        }, 
        () => { // onNext
            const nextIndex = currentParagraphIndex + 1;
            if (nextIndex < paragraphs.length) {
                currentParagraphIndex = nextIndex;
                resetTestState();
            } else {
                 resetTestState();
            }
        },
        () => { // onRepeat
            resetTestState();
        });
    }

    function handleTypingInput() {
        if (!isTestActive) {
            startTest();
        }

        if (isPaused) return;

        const typed = typingInput.value;
        const spans = textDisplay.querySelectorAll('span');
        
        spans.forEach((span, i) => {
            span.className = '';
            if (i < typed.length) {
                span.classList.add(typed[i] === span.textContent ? 'correct-char' : 'incorrect-char');
            }
        });
        
        if (typed.length < spans.length) {
            spans[typed.length].classList.add('current-char');
        }

        if (typed.length >= spans.length) {
            finalizeExercise();
        }
    }

    function handleTypingKeydown(e) {
        if (e.key === 'Backspace') backspaceCount++;
        if (e.key.length === 1 || e.key === ' ' || e.key === 'Enter') {
            keystrokeCount++;
            playTypeSound(e.key);
        }
    }
    
    function togglePause() {
        if (!isTestActive) return;
        isPaused = !isPaused;
        const newText = isPaused ? 'Resume' : 'Pause';
        pauseBtn.textContent = newText;
        pauseBtnMobile.textContent = newText;
        typingInput.disabled = isPaused;
        if (!isPaused) {
            typingInput.focus();
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    function updateTimerDisplay() {
        const timeStr = formatTime(timeRemaining);
        timerEl.textContent = timeStr;
        timerMobileEl.textContent = timeStr;
    }
    
    async function initializePage() {
        try {
            const response = await fetch('/data/typing-paragraphs.json');
            const data = await response.json();
            paragraphs = data.typing_tests;

            exerciseSelect.innerHTML = '';
            paragraphs.forEach((p, i) => {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = p.title;
                exerciseSelect.appendChild(option);
            });
            
            resetTestState();
            ensureAudioContext();
            makeClickBuffers();

        } catch (error) {
            console.error('Failed to load paragraphs:', error);
            textDisplay.textContent = 'Error loading exercises. Please refresh.';
        }
    }

    // --- Event Listeners ---
    typingInput.addEventListener('keydown', handleTypingKeydown);
    typingInput.addEventListener('input', handleTypingInput);
    
    durationSelect.addEventListener('change', resetTestState);
    exerciseSelect.addEventListener('change', (e) => {
        currentParagraphIndex = parseInt(e.target.value, 10);
        resetTestState();
    });
    
    prevExerciseBtn.addEventListener('click', () => {
        const newIndex = currentParagraphIndex - 1;
        if (newIndex >= 0) {
            currentParagraphIndex = newIndex;
            resetTestState();
        }
    });

    nextExerciseBtn.addEventListener('click', () => {
        const newIndex = currentParagraphIndex + 1;
        if (newIndex < paragraphs.length) {
            currentParagraphIndex = newIndex;
            resetTestState();
        }
    });

    [submitBtn, submitBtnMobile].forEach(btn => btn.addEventListener('click', finalizeExercise));
    [pauseBtn, pauseBtnMobile].forEach(btn => btn.addEventListener('click', togglePause));

    fontIncreaseBtn.addEventListener('click', () => {
        let currentSize = parseFloat(window.getComputedStyle(textDisplay).fontSize);
        textDisplay.style.fontSize = `${Math.min(currentSize + 2, 40)}px`;
    });
    fontDecreaseBtn.addEventListener('click', () => {
        let currentSize = parseFloat(window.getComputedStyle(textDisplay).fontSize);
        textDisplay.style.fontSize = `${Math.max(currentSize - 2, 12)}px`;
    });

    initializePage();
    lucide.createIcons();
});
