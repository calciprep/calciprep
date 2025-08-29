// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// Use global templates loaded from templates.js
let headerHTML = '';
let footerHTML = '';

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
let isLoginMode = false; // Default to Sign Up

// --- Core App Logic ---

function loadTemplates() {
    headerHTML = window.headerHTML || '';
    footerHTML = window.footerHTML || '';
    
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (headerPlaceholder && headerHTML) {
        headerPlaceholder.innerHTML = headerHTML;
    }
    
    const currentPage = window.location.pathname;
    const isIndexPage = currentPage.includes('index.html') || currentPage === '/' || currentPage === '';
    
    if (footerPlaceholder && footerHTML && isIndexPage) {
        footerPlaceholder.innerHTML = footerHTML;
    } else if (footerPlaceholder && !isIndexPage) {
        footerPlaceholder.style.display = 'none';
    }
    
    setupBackButton();
}

function setupBackButton() {
    const currentPage = window.location.pathname;
    if (currentPage.includes('index.html') || currentPage === '/' || currentPage === '') return;
    
    const backButtonContainer = document.getElementById('back-button-container');
    const mobileBackLink = document.getElementById('mobile-back-link');
    if (backButtonContainer) backButtonContainer.classList.remove('hidden');
    if (mobileBackLink) mobileBackLink.classList.remove('hidden');

    if (currentPage.includes('quiz.html')) {
        setupQuizBackButton();
    } else {
        setupPageBackButton();
    }
}

function setupQuizBackButton() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        const backUrl = `quiz-list.html?category=${encodeURIComponent(category)}`;
        document.getElementById('back-link')?.setAttribute('href', backUrl);
        document.querySelector('#mobile-back-link a')?.setAttribute('href', backUrl);
    }
}

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
    } else if (currentPage.includes('english.html') || currentPage.includes('maths.html') || currentPage.includes('account.html')) {
        backUrl = 'index.html';
    }
    
    document.getElementById('back-link')?.setAttribute('href', backUrl);
    document.querySelector('#mobile-back-link a')?.setAttribute('href', backUrl);
}

function initializeCalciPrepApp() {
    const dom = {
        loggedOutView: document.getElementById('logged-out-view'),
        loggedInView: document.getElementById('logged-in-view'),
        accountMenuBtn: document.getElementById('account-menu-btn'),
        accountMenu: document.getElementById('account-menu'),
        logoutBtn: document.getElementById('logout-btn'),
        loginBtn: document.getElementById('login-btn'),
        signupBtn: document.getElementById('signup-btn'),
        mobileMenuBtn: document.getElementById('menu-btn'),
        mobileMenu: document.getElementById('mobile-menu'),
        mobileAuthContainer: document.getElementById('mobile-auth-container'),
        authModal: document.getElementById('auth-modal'),
        closeModalBtn: document.getElementById('close-modal-btn'),
        signupTab: document.getElementById('signup-tab'),
        signinTab: document.getElementById('signin-tab'),
        modalSubmitBtn: document.getElementById('modal-submit-btn'),
        authForm: document.getElementById('auth-form'),
        emailInput: document.getElementById('email'),
        passwordInput: document.getElementById('password'),
        errorMessage: document.getElementById('error-message'),
        passwordStrengthContainer: document.getElementById('password-strength-container'),
        passwordStrengthText: document.getElementById('password-strength-text'),
        passwordCriteria: {
            case: document.getElementById('crit-case'),
            length: document.getElementById('crit-length'),
            char: document.getElementById('crit-char'),
        },
        forgotPasswordLink: document.getElementById('forgot-password-link'),
        // New success modal elements
        successModal: document.getElementById('success-modal'),
        closeSuccessModalBtn: document.getElementById('close-success-modal-btn'),
    };

    function updateAuthUI(user) {
        if (user) {
            dom.loggedInView?.classList.remove('hidden');
            dom.loggedOutView?.classList.add('hidden');
            if (dom.mobileAuthContainer) {
                dom.mobileAuthContainer.innerHTML = `
                    <p class="px-3 py-2 text-sm text-gray-500">${user.email}</p>
                    <a href="account.html" class="w-full text-left font-semibold text-gray-700 py-2 px-3">My Account</a>
                    <button id="mobile-logout-btn" class="w-full text-left font-semibold text-red-600 px-3 py-2">Logout</button>`;
                document.getElementById('mobile-logout-btn')?.addEventListener('click', () => signOut(auth));
            }
        } else {
            dom.loggedInView?.classList.add('hidden');
            dom.loggedOutView?.classList.remove('hidden');
            if (dom.mobileAuthContainer) {
                dom.mobileAuthContainer.innerHTML = `
                    <button id="mobile-login-btn" class="w-full text-left font-semibold text-gray-700 py-2 px-3">Login</button>
                    <button id="mobile-signup-btn" class="w-full mt-2 btn-primary text-center py-2">Sign Up</button>`;
                document.getElementById('mobile-login-btn')?.addEventListener('click', () => openModal(true));
                document.getElementById('mobile-signup-btn')?.addEventListener('click', () => openModal(false));
            }
        }
    }

    function openModal(login = false) {
        isLoginMode = login;
        updateModalUI();
        dom.authModal?.classList.remove('hidden');
    }

    function closeModal() {
        dom.authModal?.classList.add('hidden');
        dom.errorMessage?.classList.add('hidden');
        dom.authForm?.reset();
    }
    
    // --- NEW Success Modal Functions ---
    function openSuccessModal() {
        const modal = dom.successModal;
        const modalContent = modal.querySelector('.transform');
        if (!modal || !modalContent) return;
        
        modal.classList.remove('hidden');
        // Trigger the transition
        setTimeout(() => {
            modalContent.classList.remove('scale-95', 'opacity-0');
        }, 50);

        lucide.createIcons();
    }

    function closeSuccessModal() {
        const modal = dom.successModal;
        const modalContent = modal.querySelector('.transform');

        if (!modal || !modalContent) return;

        modalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300); // match transition duration
    }

    function updateModalUI() {
        if (isLoginMode) {
            dom.signinTab.classList.add('border-indigo-600', 'text-indigo-600');
            dom.signinTab.classList.remove('text-gray-500', 'border-transparent');
            dom.signupTab.classList.remove('border-indigo-600', 'text-indigo-600');
            dom.signupTab.classList.add('text-gray-500', 'border-transparent');
            dom.modalSubmitBtn.textContent = 'Sign In';
            dom.passwordStrengthContainer.classList.add('hidden');
            dom.forgotPasswordLink.classList.remove('hidden');
        } else {
            dom.signupTab.classList.add('border-indigo-600', 'text-indigo-600');
            dom.signupTab.classList.remove('text-gray-500', 'border-transparent');
            dom.signinTab.classList.remove('border-indigo-600', 'text-indigo-600');
            dom.signinTab.classList.add('text-gray-500', 'border-transparent');
            dom.modalSubmitBtn.textContent = 'Create Account';
            dom.passwordStrengthContainer.classList.remove('hidden');
            dom.forgotPasswordLink.classList.add('hidden');
        }
        checkPasswordStrength(); // Re-check on tab switch
    }

    function checkPasswordStrength() {
        if (isLoginMode || !dom.passwordInput) return;

        const password = dom.passwordInput.value;
        
        const criteriaMet = {
            length: password.length >= 8,
            char: /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password),
            case: /(?=.*[a-z])(?=.*[A-Z])/.test(password)
        };

        const strength = Object.values(criteriaMet).filter(Boolean).length;
        
        const updateCriterion = (el, isMet) => {
            if (!el) return;

            const newIconName = isMet ? 'check-circle' : 'x-circle';
            const addClass = isMet ? 'text-green-600' : 'text-red-600';
            const removeClass = isMet ? 'text-red-600' : 'text-green-600';
            const initialClass = 'text-gray-500';

            // 1. Update the color of the entire list item `<li>`
            el.classList.remove(removeClass, initialClass);
            el.classList.add(addClass);

            // 2. Find the current icon, which could be an `<i>` or an `<svg>`
            const currentIcon = el.querySelector('i, svg');

            // 3. If an icon exists, replace it with a new `<i>` tag for Lucide to process.
            if (currentIcon) {
                const newIconEl = document.createElement('i');
                newIconEl.setAttribute('data-lucide', newIconName);
                newIconEl.className = 'w-4 h-4 mr-2'; 
                currentIcon.parentNode.replaceChild(newIconEl, currentIcon);
            }
        };

        updateCriterion(dom.passwordCriteria.case, criteriaMet.case);
        updateCriterion(dom.passwordCriteria.length, criteriaMet.length);
        updateCriterion(dom.passwordCriteria.char, criteriaMet.char);

        const strengthTextMap = { 0: 'Weak', 1: 'Weak', 2: 'Medium', 3: 'Strong' };
        const strengthColorMap = { 0: 'text-red-600', 1: 'text-red-600', 2: 'text-yellow-600', 3: 'text-green-600' };
        dom.passwordStrengthText.textContent = strengthTextMap[strength];
        dom.passwordStrengthText.className = `font-semibold ${strengthColorMap[strength]}`;
        
        lucide.createIcons();
    }


    function mapAuthError(err) {
        switch (err.code) {
            case 'auth/invalid-email': return 'Invalid email address format.';
            case 'auth-weak-password': return 'Password does not meet the strength requirements.';
            case 'auth/email-already-in-use': return 'This email is already registered. Please Sign In.';
            case 'auth/user-not-found': return 'No account found for this email. Please Sign Up.';
            case 'auth/wrong-password': return 'Incorrect password. Please try again.';
            default: return 'An authentication error occurred. Please try again.';
        }
    }

    let lastScrollTop = 0;
    window.addEventListener("scroll", () => {
        const header = document.getElementById('header');
        if (!header) return;
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        header.style.transform = (scrollTop > lastScrollTop && scrollTop > 100) ? 'translateY(-100%)' : 'translateY(0)';
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, false);

    onAuthStateChanged(auth, updateAuthUI);

    dom.loginBtn?.addEventListener('click', () => openModal(true));
    dom.signupBtn?.addEventListener('click', () => openModal(false));
    dom.closeModalBtn?.addEventListener('click', closeModal);
    dom.closeSuccessModalBtn?.addEventListener('click', closeSuccessModal); // New listener
    dom.signinTab?.addEventListener('click', () => { isLoginMode = true; updateModalUI(); });
    dom.signupTab?.addEventListener('click', () => { isLoginMode = false; updateModalUI(); });
    dom.logoutBtn?.addEventListener('click', () => {
        signOut(auth);
        dom.accountMenu.classList.add('hidden');
    });
    dom.mobileMenuBtn?.addEventListener('click', () => dom.mobileMenu.classList.toggle('hidden'));
    dom.passwordInput?.addEventListener('input', checkPasswordStrength);
    
    dom.accountMenuBtn?.addEventListener('click', () => dom.accountMenu.classList.toggle('hidden'));
    window.addEventListener('click', (e) => {
        if (dom.accountMenu && dom.accountMenuBtn && !dom.accountMenu.contains(e.target) && !dom.accountMenuBtn.contains(e.target)) {
            dom.accountMenu.classList.add('hidden');
        }
    });

    dom.authForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = dom.emailInput.value;
        const password = dom.passwordInput.value;
        dom.errorMessage.classList.add('hidden');

        if (!isLoginMode) {
            const isLengthValid = password.length >= 8;
            const hasChar = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
            const hasMixedCase = /(?=.*[a-z])(?=.*[A-Z])/.test(password);

            if (!isLengthValid || !hasChar || !hasMixedCase) {
                dom.errorMessage.textContent = mapAuthError({code: 'auth-weak-password'});
                dom.errorMessage.classList.remove('hidden');
                return;
            }

            createUserWithEmailAndPassword(auth, email, password)
                .then(async ({ user }) => {
                    await setDoc(doc(db, "users", user.uid), { email: user.email, createdAt: serverTimestamp() });
                    closeModal();
                    openSuccessModal(); // <-- SHOW SUCCESS MODAL HERE
                })
                .catch(error => {
                    dom.errorMessage.textContent = mapAuthError(error);
                    dom.errorMessage.classList.remove('hidden');
                });
        } else {
            signInWithEmailAndPassword(auth, email, password)
                .then(closeModal)
                .catch(error => {
                    dom.errorMessage.textContent = mapAuthError(error);
                    dom.errorMessage.classList.remove('hidden');
                });
        }
    });
    
    lucide?.createIcons();
}

async function saveQuizResult(result) {
    const user = auth.currentUser;
    if (!user) { console.log("No user logged in. Cannot save result."); return; }
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

function initializeWhenReady() {
    if (window.headerHTML && window.footerHTML) {
        loadTemplates();
        initializeCalciPrepApp();
    } else {
        setTimeout(initializeWhenReady, 50);
    }
}

document.addEventListener('DOMContentLoaded', initializeWhenReady);

