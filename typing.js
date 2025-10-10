document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const textDisplayContainer = document.getElementById('text-display-container');
    const textDisplay = document.getElementById('text-display');
    const cursor = document.getElementById('cursor');
    const timerEl = document.getElementById('timer');
    const wpmEl = document.getElementById('wpm');
    const accuracyEl = document.getElementById('accuracy');
    const resetBtn = document.getElementById('reset-btn');
    const resultsModal = document.getElementById('results-modal');
    const tryAgainBtn = document.getElementById('next-btn');
    const closeResultsBtn = document.getElementById('close-results-btn');
    
    // --- State Variables ---
    let paragraphs = [];
    let currentParagraph = '';
    let testDuration = 60; // Default duration in seconds
    let timeLeft = testDuration;
    let timerInterval = null;
    let testActive = false;
    let currentIndex = 0;
    let totalCharsTyped = 0;
    let uncorrectedErrors = 0;

    // --- Initialization ---
    async function initializeTest() {
        await fetchParagraphs();
        setupTest();
    }

    async function fetchParagraphs() {
        try {
            const response = await fetch('data/typing-paragraphs.json');
            if (!response.ok) throw new Error('Network response was not ok');
            paragraphs = await response.json();
        } catch (error) {
            console.error('Error fetching paragraphs:', error);
            textDisplay.innerHTML = '<span class="incorrect">Could not load text. Please refresh.</span>';
        }
    }

    function setupTest() {
        const urlParams = new URLSearchParams(window.location.search);
        testDuration = parseInt(urlParams.get('duration'), 10) || 60;
        
        loadNewParagraph();
        resetState();
    }

    function loadNewParagraph() {
        const randomIndex = Math.floor(Math.random() * paragraphs.length);
        currentParagraph = paragraphs[randomIndex] || "The quick brown fox jumps over the lazy dog.";
        textDisplay.innerHTML = '';
        currentParagraph.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            textDisplay.appendChild(span);
        });
    }

    function resetState() {
        clearInterval(timerInterval);
        testActive = false;
        timeLeft = testDuration;
        currentIndex = 0;
        totalCharsTyped = 0;
        uncorrectedErrors = 0;

        timerEl.textContent = formatTime(timeLeft);
        wpmEl.textContent = '0';
        accuracyEl.textContent = '100%';
        
        textDisplay.querySelectorAll('span').forEach(span => {
            span.className = '';
        });
    textDisplay.className = 'text-gray-400';
    // keep current paragraph rendered; don't overwrite spans
        
        cursor.classList.add('hidden');
        resultsModal.classList.add('hidden');
        textDisplayContainer.focus();
    }

    // --- Test Logic ---
    function startTest() {
        if (testActive || timeLeft === 0) return;
        
        testActive = true;
    textDisplay.className = '';
        updateCursorPosition();
        cursor.classList.remove('hidden');

        timerInterval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = formatTime(timeLeft);
            updateStats();
            if (timeLeft <= 0) {
                endTest();
            }
        }, 1000);
    }
    
    function endTest() {
        clearInterval(timerInterval);
        testActive = false;
        cursor.classList.add('hidden');
        showResults();
        
        // Save result to Firestore if user is logged in
        if (window.saveQuizResult) {
            const user = getAuth().currentUser;
            if (user) {
                const stats = calculateFinalStats();
                window.saveQuizResult({
                    category: "Typing",
                    quizName: `${testDuration / 60} Minute Test`,
                    correctCount: stats.correctChars,
                    incorrectCount: stats.uncorrectedErrors,
                    totalTime: testDuration,
                    wpm: stats.netWPM,
                    accuracy: stats.accuracy
                });
            }
        }
    }

    function handleInput(event) {
        if (!testActive && timeLeft > 0) {
            startTest();
        }
        if (!testActive) return;

        const charTyped = event.key;
        const spans = textDisplay.querySelectorAll('span');
        
        if (charTyped === 'Backspace') {
            if (currentIndex > 0) {
                currentIndex--;
                spans[currentIndex].classList.remove('correct','incorrect','current');
            }
        } else if (charTyped.length === 1 && currentIndex < currentParagraph.length) {
            totalCharsTyped++;
            if (charTyped === spans[currentIndex].textContent) {
                spans[currentIndex].className = 'correct';
            } else {
                spans[currentIndex].className = 'incorrect';
            }
            currentIndex++;
        }
        
        if (currentIndex === currentParagraph.length) {
            endTest();
        } else {
            updateCursorPosition();
        }
        updateStats();
    }

    // --- UI & Calculations ---
    function updateStats() {
        const timeElapsedMin = (testDuration - timeLeft) / 60;
        if (timeElapsedMin === 0) return;

        let correctChars = 0;
        uncorrectedErrors = 0;
        
        const spans = textDisplay.querySelectorAll('span');
        for (let i = 0; i < currentIndex; i++) {
            if (spans[i].classList.contains('correct')) {
                correctChars++;
            } else {
                uncorrectedErrors++;
            }
        }
        
        const grossWPM = Math.floor((currentIndex / 5) / timeElapsedMin);
        const accuracy = totalCharsTyped > 0 ? Math.floor((correctChars / currentIndex) * 100) : 100;

        wpmEl.textContent = grossWPM < 0 ? 0 : grossWPM;
        accuracyEl.textContent = `${accuracy}%`;
    }

    function calculateFinalStats() {
        const timeElapsedMin = testDuration / 60;
        let correctChars = 0;
        let finalUncorrectedErrors = 0;

        const spans = textDisplay.querySelectorAll('span');
        for (let i = 0; i < currentIndex; i++) {
            if (spans[i].classList.contains('correct')) {
                correctChars++;
            } else {
                finalUncorrectedErrors++;
            }
        }

        const grossWPM = Math.floor((currentIndex / 5) / timeElapsedMin);
        const errorPenalty = Math.floor(finalUncorrectedErrors / timeElapsedMin);
        const netWPM = grossWPM - errorPenalty;
        const accuracy = currentIndex > 0 ? Math.floor((correctChars / currentIndex) * 100) : 100;
        
        return {
            grossWPM: grossWPM < 0 ? 0 : grossWPM,
            netWPM: netWPM < 0 ? 0 : netWPM,
            accuracy: accuracy,
            uncorrectedErrors: finalUncorrectedErrors,
            totalChars: currentIndex,
            correctChars: correctChars
        };
    }

    function showResults() {
        const stats = calculateFinalStats();
        // Populate modal fields if they exist
        const grossEl = document.getElementById('gross-wpm-result'); if (grossEl) grossEl.textContent = stats.grossWPM;
        const netEl = document.getElementById('net-wpm-result'); if (netEl) netEl.textContent = stats.netWPM;
        const accEl = document.getElementById('accuracy-result'); if (accEl) accEl.textContent = `${stats.accuracy}%`;
        const errEl = document.getElementById('errors-result'); if (errEl) errEl.textContent = stats.uncorrectedErrors;
        const totalEl = document.getElementById('total-chars-result'); if (totalEl) totalEl.textContent = `${stats.correctChars} / ${stats.totalChars}`;
        
        resultsModal.classList.remove('hidden');
        resultsModal.querySelector('div').classList.add('modal-enter-active');
    }

    function updateCursorPosition() {
        const spans = textDisplay.querySelectorAll('span');
        const currentSpan = spans[currentIndex];
        
        if (currentSpan) {
            const containerRect = textDisplayContainer.getBoundingClientRect();
            const spanRect = currentSpan.getBoundingClientRect();
            
            const top = spanRect.top - containerRect.top;
            const left = spanRect.left - containerRect.left;

            cursor.style.transform = `translate(${left}px, ${top}px)`;
            
            // Scroll logic
            if (spanRect.bottom > containerRect.bottom - 20) {
                 textDisplayContainer.scrollTop += spanRect.height + 10;
            } else if (spanRect.top < containerRect.top + 20) {
                 textDisplayContainer.scrollTop -= spanRect.height + 10;
            }

        }
        
        spans.forEach(s => s.classList.remove('current'));
        if (currentSpan) currentSpan.classList.add('current');
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // --- Event Listeners ---
    textDisplayContainer.addEventListener('keydown', handleInput);
    resetBtn?.addEventListener('click', () => { setupTest(); });
    tryAgainBtn?.addEventListener('click', () => { setupTest(); });
    closeResultsBtn?.addEventListener('click', () => { resultsModal.classList.add('hidden'); });

    // --- Initial Load ---
    initializeTest();
});

