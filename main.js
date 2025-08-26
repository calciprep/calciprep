// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// Use global templates loaded from templates-inline.html
const headerHTML = window.headerHTML || '';
const footerHTML = window.footerHTML || '';

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
const db = getFirestore(app);

// --- Global State ---
let isLoginMode = true;

// --- Core App Logic ---

// Function to load HTML templates from the imported strings
function loadTemplates() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = headerHTML;
    }
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = footerHTML;
    }
    
    // Check if we're on a quiz page and show back button if needed
    setupBackButton();
}

// Function to setup back button on quiz pages
function setupBackButton() {
    const currentPage = window.location.pathname;
    const isQuizPage = currentPage.includes('quiz.html');
    const isQuizListPage = currentPage.includes('quiz-list.html');
    const isEnglishPage = currentPage.includes('english.html');
    const isMathsPage = currentPage.includes('maths.html');
    
    if (isQuizPage) {
        const backButtonContainer = document.getElementById('back-button-container');
        const mobileBackLink = document.getElementById('mobile-back-link');
        
        if (backButtonContainer) {
            backButtonContainer.classList.remove('hidden');
        }
        if (mobileBackLink) {
            mobileBackLink.classList.remove('hidden');
        }
        
        // Set up back button functionality
        setupQuizBackButton();
    } else if (isQuizListPage || isEnglishPage || isMathsPage) {
        const backButtonContainer = document.getElementById('back-button-container');
        const mobileBackLink = document.getElementById('mobile-back-link');
        
        if (backButtonContainer) {
            backButtonContainer.classList.remove('hidden');
        }
        if (mobileBackLink) {
            mobileBackLink.classList.remove('hidden');
        }
        
        // Set up back button functionality for other pages
        setupPageBackButton();
    }
}

// Function to setup quiz back button functionality
function setupQuizBackButton() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
        const backUrl = `quiz-list.html?category=${encodeURIComponent(category)}`;
        
        const backLink = document.getElementById('back-link');
        const mobileBackLink = document.getElementById('mobile-back-link');
        
        if (backLink) {
            backLink.href = backUrl;
        }
        if (mobileBackLink) {
            mobileBackLink.href = backUrl;
        }
    }
}

// Function to setup page back button functionality
function setupPageBackButton() {
    const currentPage = window.location.pathname;
    let backUrl = 'index.html';
    
    if (currentPage.includes('quiz-list.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        if (category === 'Synonyms' || category === 'Antonyms' || category === 'One Word Substitution' || category === 'Idioms and Phrases' || category === 'SSC PYQs') {
            backUrl = 'english.html';
        } else {
            backUrl = 'index.html';
        }
    } else if (currentPage.includes('english.html')) {
        backUrl = 'index.html';
    } else if (currentPage.includes('maths.html')) {
        backUrl = 'index.html';
    }
    
    const backLink = document.getElementById('back-link');
    const mobileBackLink = document.getElementById('mobile-back-link');
    
    if (backLink) {
        backLink.href = backUrl;
    }
    if (mobileBackLink) {
        mobileBackLink.href = backUrl;
    }
}

// Function to initialize all event listeners and dynamic content
function initializeApp() {
    // --- DOM Element References ---
    const dom = {
        header: document.getElementById('header'),
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
        modalSwitchBtn: document.getElementById('modal-switch-btn'),
        authForm: document.getElementById('auth-form'),
        emailInput: document.getElementById('email'),
        passwordInput: document.getElementById('password'),
        errorMessage: document.getElementById('error-message')
    };

    // --- Authentication UI ---
    function updateAuthUI(user) {
        if (user) {
            if (dom.loggedInView) dom.loggedInView.classList.remove('hidden');
            if (dom.loggedOutView) dom.loggedOutView.classList.add('hidden');
            if (dom.userEmailEl) dom.userEmailEl.textContent = user.email;
            
            if (dom.mobileAuthContainer) {
                dom.mobileAuthContainer.innerHTML = `
                    <p class="px-3 py-2 text-sm text-gray-500">${user.email}</p>
                    <button id="mobile-logout-btn" class="w-full text-left font-semibold text-red-600 px-3 py-2">Logout</button>`;
                document.getElementById('mobile-logout-btn')?.addEventListener('click', () => signOut(auth));
            }
        } else {
            if (dom.loggedInView) dom.loggedInView.classList.add('hidden');
            if (dom.loggedOutView) dom.loggedOutView.classList.remove('hidden');
            if (dom.userEmailEl) dom.userEmailEl.textContent = '';

            if (dom.mobileAuthContainer) {
                dom.mobileAuthContainer.innerHTML = `
                    <button id="mobile-login-btn" class="w-full text-left font-semibold text-gray-700 py-2 px-3">Login</button>
                    <button id="mobile-signup-btn" class="w-full mt-2 btn-primary text-center py-2">Sign Up</button>`;
                document.getElementById('mobile-login-btn')?.addEventListener('click', () => openModal(true));
                document.getElementById('mobile-signup-btn')?.addEventListener('click', () => openModal(false));
            }
        }
    }

    // --- Modal Logic ---
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
        if (!dom.modalTitle || !dom.modalSubmitBtn || !dom.modalSwitchBtn) return;
        dom.modalTitle.textContent = isLoginMode ? 'Login' : 'Sign Up';
        dom.modalSubmitBtn.textContent = isLoginMode ? 'Login' : 'Sign Up';
        document.getElementById('modal-switch-text').textContent = isLoginMode ? "Don't have an account?" : 'Already have an account?';
        dom.modalSwitchBtn.textContent = isLoginMode ? 'Sign Up' : 'Login';
    }

    function switchModalMode() {
        isLoginMode = !isLoginMode;
        updateModalUI();
    }

    // --- Auth Error Mapping ---
    function mapAuthError(err) {
        switch (err.code) {
            case 'auth/invalid-email': return 'Invalid email address.';
            case 'auth/weak-password': return 'Password should be at least 6 characters.';
            case 'auth/email-already-in-use': return 'This email is already in use. Try logging in.';
            case 'auth/user-not-found': return 'No account found for this email. Please sign up.';
            case 'auth/wrong-password': return 'Incorrect password. Please try again.';
            case 'auth/network-request-failed': return 'Network error. Check your connection.';
            default: return 'An authentication error occurred.';
        }
    }

    // --- Header Scroll Behavior ---
    let lastScrollTop = 0;
    window.addEventListener("scroll", function() {
        // Use a try-catch block in case the header isn't on the page
        try {
            const header = document.getElementById('header');
            if (!header) return;
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        } catch (e) {}
    }, false);

    // --- Event Listeners ---
    onAuthStateChanged(auth, updateAuthUI);

    dom.loginBtn?.addEventListener('click', () => openModal(true));
    dom.signupBtn?.addEventListener('click', () => openModal(false));
    dom.closeModalBtn?.addEventListener('click', closeModal);
    dom.modalSwitchBtn?.addEventListener('click', switchModalMode);
    dom.logoutBtn?.addEventListener('click', () => signOut(auth));
    dom.mobileMenuBtn?.addEventListener('click', () => dom.mobileMenu.classList.toggle('hidden'));

    dom.authForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = dom.emailInput.value;
        const password = dom.passwordInput.value;
        if (dom.errorMessage) dom.errorMessage.classList.add('hidden');

        const authFunction = isLoginMode ? signInWithEmailAndPassword : createUserWithEmailAndPassword;
        authFunction(auth, email, password)
            .then(() => closeModal())
            .catch(error => {
                if (dom.errorMessage) {
                    dom.errorMessage.textContent = mapAuthError(error);
                    dom.errorMessage.classList.remove('hidden');
                }
            });
    });
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// --- Firestore Functions (Globally Accessible) ---
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
window.saveQuizResult = saveQuizResult;

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadTemplates();      // First, inject the HTML from our templates.js file
    initializeApp();      // Then, initialize all the logic and event listeners
});
