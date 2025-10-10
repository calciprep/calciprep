// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, sendEmailVerification, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
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
let isLoginMode = true; // Default to Sign In now
let isPasswordResetMode = false; // New state for password reset

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

    // Set <main> padding-top to the actual header height on non-index pages so
    // the fixed header never overlaps or creates inconsistent spacing.
    try {
        if (!isIndexPage) {
            const headerEl = document.getElementById('header');
            const mainEl = document.querySelector('main');
            if (headerEl && mainEl) {
                // Measure header height accurately
                const rect = headerEl.getBoundingClientRect();
                const headerHeight = Math.round(rect.height) || 64;

                // Remove large Tailwind pt-* utility classes that can add extra space
                const kept = (mainEl.className || '').split(/\s+/).filter(c => {
                    return !/^pt-\d+$/i.test(c) && !/^[a-z]+:pt-\d+$/i.test(c);
                }).join(' ');
                mainEl.className = kept;

                // Use the header placeholder as the spacer to push content below the fixed header.
                const headerPlaceholder = document.getElementById('header-placeholder');
                if (headerPlaceholder) {
                    // Use a consistent spacer for non-index pages so the fixed header
                    // does not overlap page content. Per request, set to 80px for
                    // all non-index pages (index page remains unchanged).
                    headerPlaceholder.style.height = '80px';
                } else {
                    // Fallback: set main padding-top to header height
                    mainEl.style.paddingTop = headerHeight + 'px';
                }

                // Ensure main has no leftover top padding/margin so content sits flush under placeholder
                mainEl.style.paddingTop = '0';
                mainEl.style.marginTop = '0';

                // Mark header as a sub-page header so CSS can reserve space for the back button
                headerEl.classList.add('subpage-header');
            }
        }
    } catch (e) {
        console.warn('Could not apply header-height padding:', e);
    }
    
    // Apply a page-specific card glow theme using CSS variables
    try {
        const current = window.location.pathname || '';
        // Helper to convert hex to "r,g,b"
        function hexToRgb(hex) {
            if (!hex) return '79,70,229';
            const h = hex.replace('#','');
            const bigint = parseInt(h.length===3 ? h.split('').map(c=>c+c).join('') : h, 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            return `${r},${g},${b}`;
        }

        // Map pages to accent colors (hex)
        let accentHex = '#4f46e5'; // default (blue)
        if (current.includes('typing-selection.html') || current.includes('typing.html') || current.includes('learn-typing.html')) {
            accentHex = '#10b981'; // Tailwind green-500 used on typing pages
        } else if (current.includes('english.html')) {
            accentHex = '#be94f5';
        } else if (current.includes('maths.html')) {
            accentHex = '#4f46e5';
        } else if (current.includes('account.html')) {
            accentHex = '#4f46e5';
        }

        const accentRgb = hexToRgb(accentHex);
        document.documentElement.style.setProperty('--card-accent', accentHex);
        document.documentElement.style.setProperty('--card-accent-rgb', accentRgb);

        // Inject shared card glow CSS once
        if (!document.getElementById('card-glow-styles')) {
            const s = document.createElement('style');
            s.id = 'card-glow-styles';
            s.textContent = `
            .mode-card, .feature-card, .subject-card, .card-glow, .practice-card {
                transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease;
            }
            .mode-card:hover, .feature-card:hover, .subject-card:hover, .card-glow:hover, .practice-card:hover {
                transform: translateY(-6px);
                box-shadow: 0 12px 30px rgba(var(--card-accent-rgb), 0.18), 0 6px 12px rgba(0,0,0,0.06);
                border-color: var(--card-accent);
            }
            /* subtle animated glow ring */
            .card-glow::after, .mode-card::after, .feature-card::after, .subject-card::after {
                content: '';
                pointer-events: none;
                position: absolute;
                inset: 0;
                border-radius: inherit;
                box-shadow: 0 0 0 rgba(var(--card-accent-rgb), 0);
                transition: box-shadow .28s ease, opacity .28s ease;
                opacity: 0;
            }
            .mode-card:hover::after, .feature-card:hover::after, .subject-card:hover::after, .card-glow:hover::after {
                box-shadow: 0 10px 40px rgba(var(--card-accent-rgb), 0.12);
                opacity: 1;
            }
            `;
            document.head.appendChild(s);
        }
    } catch (err) {
        console.warn('card glow theme setup failed', err);
    }

    setupBackButton();
}

// Visitor counter: try Firestore transaction first, fall back to CountAPI if that fails.
async function recordAndShowVisitorCount() {
    const countEl = () => document.getElementById('visitor-count');
    // Try Firestore transaction
    try {
        const docRef = doc(db, 'siteMetrics', 'visitors');
        await setDoc(docRef, { updatedAt: serverTimestamp() }, { merge: true });
        // Use transaction-like increment via get + update to keep code simple
        // (This is safe for most low-traffic use; for high concurrency use server-side admin).
        const snap = await getDoc(docRef);
        let current = 0;
        if (snap.exists()) {
            current = snap.data().count || 0;
        }
        const newVal = current + 1;
        await setDoc(docRef, { count: newVal, updatedAt: serverTimestamp() }, { merge: true });
        const el = countEl();
        if (el) el.textContent = newVal.toLocaleString();
        return;
    } catch (e) {
        console.warn('Firestore visitor increment failed, falling back to CountAPI', e);
    }

    // Fallback: CountAPI
    try {
        const namespace = 'calciprep-website';
        const key = 'global-visit-count';
        const url = `https://api.countapi.xyz/hit/${namespace}/${key}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('countapi error');
        const data = await res.json();
        const el = countEl();
        if (el) el.textContent = data.value.toLocaleString();
    } catch (e) {
        const el = countEl();
        if (el) el.textContent = 'n/a';
        console.warn('CountAPI fallback failed', e);
    }
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

// --- New Subtle Success Message Function ---
function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-5 right-5 bg-green-500 text-white py-3 px-5 rounded-lg shadow-lg transform transition-all duration-300 translate-y-16 opacity-0';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('translate-y-16', 'opacity-0');
        notification.classList.add('translate-y-0', 'opacity-100');
    }, 100);

    setTimeout(() => {
        notification.classList.add('translate-y-16', 'opacity-0');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
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
        // New elements for modal state changes
        modalHeading: document.getElementById('modal-heading'),
        modalSubheading: document.getElementById('modal-subheading'),
        authTabs: document.getElementById('auth-tabs'),
        passwordFieldContainer: document.getElementById('password-field-container'),
        termsText: document.getElementById('terms-text'),
        backToSigninLink: document.getElementById('back-to-signin-link')
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

    function openModal(login = true) {
        isLoginMode = login;
        isPasswordResetMode = false;
        updateModalUI();
        dom.authModal?.classList.remove('hidden');
    }

    function closeModal() {
        dom.authModal?.classList.add('hidden');
        dom.errorMessage?.classList.add('hidden');
        dom.authForm?.reset();
    }
    
    function updateModalUI() {
        dom.errorMessage.classList.add('hidden');
        if (isPasswordResetMode) {
            dom.modalHeading.textContent = 'Reset your password';
            dom.modalSubheading.textContent = 'We\'ll send a recovery link to your email.';
            dom.authTabs.classList.add('hidden');
            dom.passwordFieldContainer.classList.add('hidden');
            dom.passwordStrengthContainer.classList.add('hidden');
            dom.termsText.classList.add('hidden');
            dom.modalSubmitBtn.textContent = 'Send Recovery Link';
            dom.backToSigninLink.classList.remove('hidden');
        } else if (isLoginMode) {
            dom.modalHeading.textContent = 'Welcome back!';
            dom.modalSubheading.textContent = 'Sign in to continue your progress.';
            dom.authTabs.classList.remove('hidden');
            dom.passwordFieldContainer.classList.remove('hidden');
            dom.passwordStrengthContainer.classList.add('hidden');
            dom.termsText.classList.add('hidden');
            dom.backToSigninLink.classList.add('hidden');

            dom.signinTab.classList.add('border-indigo-600', 'text-indigo-600');
            dom.signinTab.classList.remove('text-gray-500', 'border-transparent');
            dom.signupTab.classList.remove('border-indigo-600', 'text-indigo-600');
            dom.signupTab.classList.add('text-gray-500', 'border-transparent');
            dom.modalSubmitBtn.textContent = 'Sign In';
            dom.forgotPasswordLink.classList.remove('hidden');
            dom.passwordInput.setAttribute('autocomplete', 'current-password');
        } else { // Sign Up Mode
            dom.modalHeading.textContent = 'Create your account';
            dom.modalSubheading.textContent = 'Let\'s get started with your journey.';
            dom.authTabs.classList.remove('hidden');
            dom.passwordFieldContainer.classList.remove('hidden');
            dom.passwordStrengthContainer.classList.remove('hidden');
            dom.termsText.classList.remove('hidden');
            dom.backToSigninLink.classList.add('hidden');
            
            dom.signupTab.classList.add('border-indigo-600', 'text-indigo-600');
            dom.signupTab.classList.remove('text-gray-500', 'border-transparent');
            dom.signinTab.classList.remove('border-indigo-600', 'text-indigo-600');
            dom.signinTab.classList.add('text-gray-500', 'border-transparent');
            dom.modalSubmitBtn.textContent = 'Create Account';
            dom.forgotPasswordLink.classList.add('hidden');
            dom.passwordInput.setAttribute('autocomplete', 'new-password');
        }
        checkPasswordStrength();
    }

    function checkPasswordStrength() {
        if (isLoginMode || isPasswordResetMode || !dom.passwordInput) {
             if(dom.passwordStrengthContainer) dom.passwordStrengthContainer.classList.add('hidden');
             return;
        } else {
             if(dom.passwordStrengthContainer) dom.passwordStrengthContainer.classList.remove('hidden');
        }

        const password = dom.passwordInput.value;
        
        const criteriaMet = {
            length: password.length >= 8,
            char: /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password),
            case: /(?=.*[a-z])(?=.*[A-Z])/.test(password)
        };

        const strength = Object.values(criteriaMet).filter(Boolean).length;
        
        const updateCriterion = (el, isMet) => {
            if (!el) return;
            const iconEl = el.querySelector('i');
            if(!iconEl) return;
            
            const newIconName = isMet ? 'check-circle' : 'x-circle';
            const addClass = isMet ? 'text-green-600' : 'text-gray-500';
            const removeClass = isMet ? 'text-gray-500' : 'text-green-600';
            
            el.classList.remove(removeClass);
            el.classList.add(addClass);
            iconEl.setAttribute('data-lucide', newIconName);
        };

        updateCriterion(dom.passwordCriteria.case, criteriaMet.case);
        updateCriterion(dom.passwordCriteria.length, criteriaMet.length);
        updateCriterion(dom.passwordCriteria.char, criteriaMet.char);

        const strengthTextMap = { 0: 'Weak', 1: 'Weak', 2: 'Medium', 3: 'Strong' };
        const strengthColorMap = { 0: 'text-red-600', 1: 'text-red-600', 2: 'text-yellow-600', 3: 'text-green-600' };
        dom.passwordStrengthText.textContent = strengthTextMap[strength];
        dom.passwordStrengthText.className = `font-semibold ${strengthColorMap[strength]}`;
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }


    function mapAuthError(err) {
        switch (err.code) {
            case 'auth/invalid-email': return 'Invalid email address format.';
            case 'auth-weak-password':
            case 'auth/weak-password': return 'Password does not meet the strength requirements.';
            case 'auth/email-already-in-use': return 'This email is already registered. Please Sign In.';
            case 'auth/user-not-found': return 'No account found for this email. Please Sign Up or check for typos.';
            case 'auth/wrong-password': return 'Incorrect password. Please try again.';
            default: return 'An authentication error occurred. Please try again.';
        }
    }
    
    function showError(error) {
        let message;
        if (typeof error === 'string') {
            message = error;
        } else {
            message = error.message || mapAuthError(error);
        }
        dom.errorMessage.textContent = message;
        dom.errorMessage.classList.remove('hidden');
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
    
    dom.signinTab?.addEventListener('click', () => { isLoginMode = true; isPasswordResetMode = false; updateModalUI(); });
    dom.signupTab?.addEventListener('click', () => { isLoginMode = false; isPasswordResetMode = false; updateModalUI(); });
    
    dom.forgotPasswordLink?.addEventListener('click', (e) => { 
        e.preventDefault();
        isPasswordResetMode = true; 
        updateModalUI(); 
    });
    
    dom.backToSigninLink?.addEventListener('click', (e) => {
        e.preventDefault();
        isPasswordResetMode = false;
        isLoginMode = true;
        updateModalUI();
    });

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
        dom.errorMessage.classList.add('hidden');
        
        if (isPasswordResetMode) {
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    isPasswordResetMode = false;
                    isLoginMode = true;
                    updateModalUI();
                    showSuccessMessage("Password reset link sent! Check your inbox.");
                })
                .catch((error) => {
                    showError(error);
                });

        } else if (!isLoginMode) { // Sign Up Logic
            const password = dom.passwordInput.value;
            const isLengthValid = password.length >= 8;
            const hasChar = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
            const hasMixedCase = /(?=.*[a-z])(?=.*[A-Z])/.test(password);

            if (!isLengthValid || !hasChar || !hasMixedCase) {
                showError({code: 'auth-weak-password'});
                return;
            }

            createUserWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => {
                    const user = userCredential.user;
                    await sendEmailVerification(user);
                    closeModal();
                    showSuccessMessage("Verification email sent! Please check your inbox.");
                    await signOut(auth);
                    
                    try {
                        await setDoc(doc(db, "users", user.uid), {
                            email: user.email,
                            createdAt: new Date(),
                            emailVerified: false
                        });
                    } catch (err) {
                        console.error("❌ Firestore write failed, but user account was created.", err);
                    }
                })
                .catch((error) => showError(error));

        } else { // Sign In Logic
            const password = dom.passwordInput.value;
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    if (user.emailVerified) {
                        closeModal();
                        showSuccessMessage("Signed in successfully!");
                    } else {
                        signOut(auth);
                        showError({ message: "Please verify your email before signing in." });
                    }
                })
                .catch(error => showError(error));
        }
    });
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
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
        // Record visitor count (async, non-blocking)
        recordAndShowVisitorCount().catch(err => console.warn('Visitor count error', err));
    } else {
        setTimeout(initializeWhenReady, 50);
    }
}

document.addEventListener('DOMContentLoaded', initializeWhenReady);

