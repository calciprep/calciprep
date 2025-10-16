// --- Reusable Result Popup Module ---

// This function creates and manages the result popup.
// It injects the necessary HTML and CSS into the page,
// and provides a function to show the modal with dynamic data.

function createResultPopup() {
    // 1. Create Modal HTML String
    const modalHTML = `
    <!-- Result Modal (hidden until an exercise completes) -->
    <div id="result-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 hidden">
        <div class="bg-white w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-[80vh] overflow-y-auto border rounded-lg shadow-lg p-6" style="position:relative;">
            <div class="flex items-start justify-between mb-4">
                <h3 id="result-title" class="text-center text-lg font-semibold underline">Detailed Result as below</h3>
                <div class="flex items-center space-x-2">
                    <button id="res-close" title="Close" class="w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white hover:opacity-90" aria-label="Close">
                        <span style="font-weight:700;line-height:0">✕</span>
                    </button>
                    <button id="res-minimize" title="Minimize" class="w-8 h-8 rounded-full flex items-center justify-center bg-green-500 text-white hover:opacity-90" aria-label="Minimize">
                        <span style="font-weight:700;line-height:0">–</span>
                    </button>
                </div>
            </div>

            <div id="result-content" class="text-sm text-slate-800">
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 border-b pb-4">
                    <div>
                        <div class="flex justify-between"><span class="font-medium">Test Duration</span><span id="res-duration">: 00 minutes 00 seconds</span></div>
                        <div class="flex justify-between mt-2"><span class="font-medium">Correct Words Typed</span><span id="res-correct-words">: 0</span></div>
                    </div>
                    <div>
                        <div class="flex justify-between"><span class="font-medium">Total Words Typed</span><span id="res-total-words">: 0</span></div>
                        <div class="flex justify-between mt-2"><span class="font-medium">Incorrect Words Typed</span><span id="res-incorrect-words">: 0</span></div>
                    </div>
                </div>
                <div class="mb-4">
                    <div class="text-slate-500 italic mb-2">Method 1 <span class="text-xs">(one word = 5 character or key strokes)</span></div>
                    <div class="grid grid-cols-2 gap-2 pl-4">
                        <div class="text-slate-700">Net Speed</div><div id="m1-net" class="text-slate-900">: 0 words per minute</div>
                        <div class="text-slate-700">: </div><div id="m1-net-strokes" class="text-slate-900">: 0 key strokes per minute</div>
                        <div class="text-slate-700">Gross Speed</div><div id="m1-gross" class="text-slate-900">: 0 words per minute</div>
                        <div class="text-slate-700">: </div><div id="m1-gross-strokes" class="text-slate-900">: 0 key strokes per minute</div>
                        <div class="text-slate-700">Accuracy</div><div id="m1-accuracy" class="text-slate-900">: 0%</div>
                        <div class="text-slate-700">Backspace</div><div id="m1-backspace" class="text-slate-900">: 0 times</div>
                    </div>
                </div>
                <div class="mb-4">
                    <div class="text-slate-500 italic mb-2">Method 2 <span class="text-xs">(one word = group of letters separated by space)</span></div>
                    <div class="grid grid-cols-2 gap-2 pl-4">
                        <div class="text-slate-700">Net Speed</div><div id="m2-net" class="text-slate-900">: 0 words per minute</div>
                        <div class="text-slate-700">: </div><div id="m2-net-strokes" class="text-slate-900">: 0 key strokes per minute</div>
                        <div class="text-slate-700">Gross Speed</div><div id="m2-gross" class="text-slate-900">: 0 words per minute</div>
                        <div class="text-slate-700">: </div><div id="m2-gross-strokes" class="text-slate-900">: 0 key strokes per minute</div>
                        <div class="text-slate-700">Accuracy</div><div id="m2-accuracy" class="text-slate-900">: 0%</div>
                        <div class="text-slate-700">Backspace</div><div id="m2-backspace" class="text-slate-900">: 0 times</div>
                    </div>
                </div>
                <div class="text-xs text-slate-500">Note : Key depressions, characters and key strokes are same thing.</div>
            </div>
            <div class="flex justify-between items-center mt-6">
                <button id="res-repeat" class="bg-white border px-4 py-2 rounded hover:bg-slate-50">Repeat</button>
                <button id="res-next" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Next&gt;&gt;</button>
            </div>
        </div>
    </div>
    <!-- Minimized result bar -->
    <div id="result-minimized" class="fixed right-4 bottom-4 z-60 bg-white border rounded shadow px-4 py-2 hidden">
        <div class="flex items-center space-x-3">
            <div id="min-summary" class="text-sm text-slate-700">Result summary</div>
            <button id="min-restore" class="bg-green-600 text-white px-3 py-1 rounded text-sm">Show</button>
        </div>
    </div>
    `;

    // 2. Inject HTML into the body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 3. Get DOM Elements
    const modalEl = document.getElementById('result-modal');
    const minBarEl = document.getElementById('result-minimized');
    const closeBtn = document.getElementById('res-close');
    const minimizeBtn = document.getElementById('res-minimize');
    const restoreBtn = document.getElementById('min-restore');
    const nextBtn = document.getElementById('res-next');
    const repeatBtn = document.getElementById('res-repeat');
    
    // 4. State for callbacks
    let onNextCallback = () => {};
    let onRepeatCallback = () => {};
    let lastResultSummary = {};

    // 5. Functions to control the modal
    const show = (results, onNext, onRepeat) => {
        // Store callbacks
        onNextCallback = onNext;
        onRepeatCallback = onRepeat;
        lastResultSummary = { netWpm: results.netWpm, accuracy: results.accuracy };

        // Populate fields
        document.getElementById('res-duration').textContent = `: ${results.durationFormatted}`;
        document.getElementById('res-correct-words').textContent = `: ${results.correctWords}`;
        document.getElementById('res-total-words').textContent = `: ${results.totalWords}`;
        document.getElementById('res-incorrect-words').textContent = `: ${results.incorrectWords}`;
        
        document.getElementById('m1-net').textContent = `: ${results.netWpm} wpm`;
        document.getElementById('m1-net-strokes').textContent = `: ${results.strokesPerMin} kspm`;
        document.getElementById('m1-gross').textContent = `: ${results.grossWpm} wpm`;
        document.getElementById('m1-gross-strokes').textContent = `: ${results.strokesPerMin} kspm`;
        document.getElementById('m1-accuracy').textContent = `: ${results.accuracy}%`;
        document.getElementById('m1-backspace').textContent = `: ${results.backspaceCount} times`;

        document.getElementById('m2-net').textContent = `: ${results.netWpm2} wpm`;
        document.getElementById('m2-net-strokes').textContent = `: ${results.strokesPerMin} kspm`;
        document.getElementById('m2-gross').textContent = `: ${results.grossWpm2} wpm`;
        document.getElementById('m2-gross-strokes').textContent = `: ${results.strokesPerMin} kspm`;
        document.getElementById('m2-accuracy').textContent = `: ${results.accuracy}%`;
        document.getElementById('m2-backspace').textContent = `: ${results.backspaceCount} times`;

        // Show modal
        modalEl.classList.remove('hidden');
        minBarEl.classList.add('hidden');
    };

    const hide = () => {
        modalEl.classList.add('hidden');
    };

    // 6. Event Listeners
    closeBtn.addEventListener('click', () => {
        hide();
        minBarEl.classList.add('hidden');
    });

    minimizeBtn.addEventListener('click', () => {
        hide();
        document.getElementById('min-summary').textContent = `Net: ${lastResultSummary.netWpm || 0} WPM · Acc: ${lastResultSummary.accuracy || 0}%`;
        minBarEl.classList.remove('hidden');
    });

    restoreBtn.addEventListener('click', () => {
        minBarEl.classList.add('hidden');
        modalEl.classList.remove('hidden');
    });

    nextBtn.addEventListener('click', () => {
        hide();
        if (typeof onNextCallback === 'function') {
            onNextCallback();
        }
    });

    repeatBtn.addEventListener('click', () => {
        hide();
        if (typeof onRepeatCallback === 'function') {
            onRepeatCallback();
        }
    });

    // 7. Expose the `show` function globally or as an export
    return { show };
}

// Initialize and export the popup manager
export const resultPopup = createResultPopup();
