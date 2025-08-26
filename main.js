// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCqCKyATw3NkVsbOfeXqU5HCutECF5ILcU",
    authDomain: "calciprep-1dd16.firebaseapp.com",
    projectId: "calciprep-1dd16",
    storageBucket: "calciprep-1dd16.appspot.com",
    messagingSenderId: "292795386240",
    appId: "1:292795386240:web:89e1049ea1cfbddb63d965",
    measurementId: "G-3VK5ZXNCHV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

// --- DOM Element References ---
const dom = {
    header: document.getElementById('header'),
    authContainer: document.getElementById('auth-container'),
    loggedOutView: document.getElementById('logged-out-view'),
    loggedInView: document.getElementById('logged-in-view'),
    userEmailEl: document.getElementById('user-email'),
    logoutBtn: document.getElementById('logout-btn'),
    loginBtn: document.getElementById('login-btn'),
    signupBtn: document.getElementById('signup-btn'),
    mobileMenuBtn: document.getElementById('menu-btn'),
    mobileMenu: document.getElementById('mobile-menu'),
    mobileAuthContainer: document.getElementById('mobile-auth-container'),
    authModal: document.getElementById('auth-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    modalTitle: document.getElementById('modal-title'),
    modalSubmitBtn: document.getElementById('modal-submit-btn'),
    modalSwitchText: document.getElementById('modal-switch-text'),
    modalSwitchBtn: document.getElementById('modal-switch-btn'),
    authForm: document.getElementById('auth-form'),
    emailInput: document.getElementById('email'),
    passwordInput: document.getElementById('password'),
    errorMessage: document.getElementById('error-message'),
    historyContainer: document.getElementById('history-container') // For dashboard page
};

let isLoginMode = true;

// --- Authentication UI ---
function updateAuthUI(user) {
    if (user) {
        // User is signed in
        if (dom.loggedInView) dom.loggedInView.classList.remove('hidden');
        if (dom.loggedOutView) dom.loggedOutView.classList.add('hidden');
        if (dom.userEmailEl) dom.userEmailEl.textContent = user.email;
        
        if (dom.mobileAuthContainer) {
            dom.mobileAuthContainer.innerHTML = `
                <a href="dashboard.html" class="block px-3 py-2 rounded-md text-base font-medium text-accent-orange hover:bg-gray-50">Dashboard</a>
                <p class="px-3 py-2 text-sm text-gray-500">${user.email}</p>
                <button id="mobile-logout-btn" class="w-full text-left font-semibold text-red-600 px-3 py-2">Logout</button>`;
            const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
            if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', () => signOut(auth));
        }
    } else {
        // User is signed out
        if (dom.loggedInView) dom.loggedInView.classList.add('hidden');
        if (dom.loggedOutView) dom.loggedOutView.classList.remove('hidden');
        if (dom.userEmailEl) dom.userEmailEl.textContent = '';

        if (dom.mobileAuthContainer) {
            dom.mobileAuthContainer.innerHTML = `
                <button id="mobile-login-btn" class="w-full text-left font-semibold text-gray-700 py-2 px-3">Login</button>
                <button id="mobile-signup-btn" class="w-full mt-2 btn-primary text-center py-2">Sign Up</button>`;
            const mobileLoginBtn = document.getElementById('mobile-login-btn');
            const mobileSignupBtn = document.getElementById('mobile-signup-btn');
            if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', () => openModal(true));
            if (mobileSignupBtn) mobileSignupBtn.addEventListener('click', () => openModal(false));
        }
    }
}

// --- Firestore Functions ---
async function saveQuizResult(result) {
    const user = auth.currentUser;
    if (!user) {
        console.log("No user logged in. Cannot save result.");
        return;
    }

    try {
        await addDoc(collection(db, "users", user.uid, "quizHistory"), {
            ...result,
            userId: user.uid,
            createdAt: serverTimestamp()
        });
        console.log("Quiz result saved successfully!");
    } catch (error) {
        console.error("Error saving quiz result: ", error);
    }
}

async function loadDashboardData() {
    const user = auth.currentUser;
    if (!user) {
        dom.historyContainer.innerHTML = '<p class="text-center">Please log in to see your progress.</p>';
        return;
    }

    const q = query(collection(db, "users", user.uid, "quizHistory"), orderBy("createdAt", "desc"));
    
    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            dom.historyContainer.innerHTML = '<p class="text-center">You haven\'t completed any quizzes yet. Go practice!</p>';
            return;
        }

        let historyHtml = '<div class="space-y-4">';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.createdAt ? data.createdAt.toDate().toLocaleDateString() : 'N/A';
            const score = `${data.correctCount}/${data.correctCount + data.incorrectCount}`;
            
            historyHtml += `
                <div class="border-b pb-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-xl font-bold">${data.quizName}</h3>
                        <span class="text-sm text-gray-500">${date}</span>
                    </div>
                    <p class="text-gray-600">Category: ${data.category}</p>
                    <p class="font-semibold">Score: <span class="text-accent-orange">${score}</span> | Time: ${data.totalTime}s</p>
                </div>
            `;
        });
        historyHtml += '</div>';
        dom.historyContainer.innerHTML = historyHtml;

    } catch (error) {
        console.error("Error loading dashboard data: ", error);
        dom.historyContainer.innerHTML = '<p class="text-center text-red-500">Could not load your history. Please try again later.</p>';
    }
}


// --- Global Event Listeners & Initializations ---
onAuthStateChanged(auth, (user) => {
    updateAuthUI(user);
    // If we are on the dashboard page, load the data
    if (dom.historyContainer) {
        loadDashboardData();
    }
});

if (dom.loginBtn) dom.loginBtn.addEventListener('click', () => openModal(true));
if (dom.signupBtn) dom.signupBtn.addEventListener('click', () => openModal(false));
if (dom.closeModalBtn) dom.closeModalBtn.addEventListener('click', closeModal);
if (dom.modalSwitchBtn) dom.modalSwitchBtn.addEventListener('click', switchModalMode);
if (dom.logoutBtn) dom.logoutBtn.addEventListener('click', () => signOut(auth));

if (dom.authForm) {
    dom.authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = dom.emailInput ? dom.emailInput.value : '';
        const password = dom.passwordInput ? dom.passwordInput.value : '';
        if (dom.errorMessage) dom.errorMessage.classList.add('hidden');

        const authFunction = isLoginMode ? signInWithEmailAndPassword : createUserWithEmailAndPassword;

        authFunction(auth, email, password)
            .then(() => closeModal())
            .catch(error => {
                console.error('Auth error:', error);
                const friendly = mapAuthError(error); // You need to define this function
                if (dom.errorMessage) {
                    dom.errorMessage.textContent = friendly;
                    dom.errorMessage.classList.remove('hidden');
                }
            });
    });
}

if (dom.mobileMenuBtn) dom.mobileMenuBtn.addEventListener('click', () => dom.mobileMenu.classList.toggle('hidden'));

// Make saveQuizResult globally accessible for other scripts
window.saveQuizResult = saveQuizResult;

// --- Helper functions (like mapAuthError, openModal, etc.) remain the same ---
function openModal(loginMode = true) {
    isLoginMode = loginMode;
    updateModalUI();
    if (dom.authModal) dom.authModal.classList.remove('hidden');
}

function closeModal() {
    if (dom.authModal) dom.authModal.classList.add('hidden');
    if (dom.errorMessage) dom.errorMessage.classList.add('hidden');
    if (dom.authForm) dom.authForm.reset();
}

function updateModalUI() {
    if (!dom.modalTitle || !dom.modalSubmitBtn || !dom.modalSwitchText || !dom.modalSwitchBtn) return;
    if (isLoginMode) {
        dom.modalTitle.textContent = 'Login';
        dom.modalSubmitBtn.textContent = 'Login';
        dom.modalSwitchText.textContent = "Don't have an account?";
        dom.modalSwitchBtn.textContent = 'Sign Up';
    } else {
        dom.modalTitle.textContent = 'Sign Up';
        dom.modalSubmitBtn.textContent = 'Sign Up';
        dom.modalSwitchText.textContent = 'Already have an account?';
        dom.modalSwitchBtn.textContent = 'Login';
    }
}

function switchModalMode() {
    isLoginMode = !isLoginMode;
    updateModalUI();
}

function mapAuthError(err) {
    if (!err || !err.code) return 'An unknown error occurred.';
    switch (err.code) {
        case 'auth/invalid-email':
            return 'Invalid email address. Please enter a valid email.';
        case 'auth/weak-password':
            return 'Weak password. Password should be at least 6 characters.';
        case 'auth/email-already-in-use':
            return 'This email is already in use. Try logging in instead.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/user-not-found':
            return 'No account found for this email. Please sign up first.';
        case 'auth/network-request-failed':
            return 'Network error. Check your internet connection and try again.';
        default:
            return err.message || 'An authentication error occurred.';
    }
}
