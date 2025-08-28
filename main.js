// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

/**
 * @function setupBackButton
 * @description Checks the current page and, if it's not the homepage,
 * it makes the back button visible and sets its href to the correct parent page.
 */
function setupBackButton() {
    const backButtonContainer = document.getElementById('back-button-container');
    const backLink = document.getElementById('back-link');
    const mobileBackLinkContainer = document.getElementById('mobile-back-link');
    const mobileBackLink = mobileBackLinkContainer ? mobileBackLinkContainer.querySelector('a') : null;

    const currentPage = window.location.pathname;
    // Check if the current path ends with the root, index.html, or is empty.
    const isIndexPage = currentPage.endsWith('/') || currentPage.endsWith('index.html') || currentPage === '';

    if (isIndexPage || !backButtonContainer || !mobileBackLinkContainer) {
        return; // Don't show on homepage or if elements don't exist
    }

    // Determine the correct "back" URL based on the current page
    let backUrl = 'index.html'; // Default fallback
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    if (currentPage.includes('quiz.html')) {
        // If on a quiz page, link back to the list for that category
        if (category) {
            backUrl = `quiz-list.html?category=${encodeURIComponent(category)}`;
        }
    } else if (currentPage.includes('quiz-list.html')) {
        // If on a quiz list, link back to the parent subject page
        const englishCategories = ['Synonyms', 'Antonyms', 'One Word Substitution', 'Idioms and Phrases', 'SSC PYQs'];
        if (englishCategories.includes(category)) {
            backUrl = 'english.html';
        } else {
            // Add logic for other subjects if necessary, e.g., maths
            backUrl = 'maths.html';
        }
    } else if (currentPage.includes('english.html') || currentPage.includes('maths.html')) {
        // If on a subject page, link back to the main subjects section on the homepage
        backUrl = 'index.html#subjects';
    }

    // Apply the URL and make the buttons visible
    if (backLink) backLink.href = backUrl;
    if (mobileBackLink) mobileBackLink.href = backUrl;

    backButtonContainer.classList.remove('hidden');
    mobileBackLinkContainer.classList.remove('hidden');
}


// Function to load HTML templates from the imported strings in templates.js
function loadTemplates() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (headerPlaceholder && window.headerHTML) {
        headerPlaceholder.innerHTML = window.headerHTML;
    }
    
    const currentPage = window.location.pathname;
    const isIndexPage = currentPage.includes('index.html') || currentPage === '/' || currentPage === '';
    
    if (footerPlaceholder && window.footerHTML && isIndexPage) {
        footerPlaceholder.innerHTML = window.footerHTML;
    } else if (footerPlaceholder) {
        footerPlaceholder.style.display = 'none';
    }
}

// Function to initialize all event listeners and dynamic content
function initializeCalciPrepApp() {
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

    // --- Back Button Logic ---
    // This function will handle showing/hiding the back button.
    setupBackButton();

    // --- Authentication UI ---
    function updateAuthUI(user) {
        if (user) {
            if (dom.loggedInView) dom.loggedInView.classList.remove('hidden');
            if (dom.loggedOutView) dom.loggedOutView.classList.add('hidden');
            if (dom.userEmailEl) dom.userEmailEl.textContent = user.email;
            
            if (dom.mobileAuthContainer) {
                dom.mobileAuthContainer.innerHTML = `
                    <p class="px-3 py-2 text-sm text-gray-400">${user.email}</p>
                    <button id="mobile-logout-btn" class="w-full text-left font-semibold text-red-500 px-3 py-2">Logout</button>`;
                document.getElementById('mobile-logout-btn')?.addEventListener('click', () => signOut(auth));
            }
        } else {
            if (dom.loggedInView) dom.loggedInView.classList.add('hidden');
            if (dom.loggedOutView) dom.loggedOutView.classList.remove('hidden');
            if (dom.userEmailEl) dom.userEmailEl.textContent = '';

            if (dom.mobileAuthContainer) {
                dom.mobileAuthContainer.innerHTML = `
                    <button id="mobile-login-btn" class="w-full text-left font-semibold py-2 px-3">Login</button>
                    <button id="mobile-signup-btn" class="w-full mt-2 action-btn-primary text-center py-2">Sign Up</button>`;
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
function initializeWhenReady() {
    if (window.headerHTML && window.footerHTML) {
        loadTemplates();
        initializeCalciPrepApp();
    } else {
        setTimeout(initializeWhenReady, 50);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeWhenReady();
});
