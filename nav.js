(function() {
    'use strict';

    const navHTML = `
    <header id="app-header" class="fixed top-4 inset-x-0 z-50 px-4 transition-transform duration-300">
        <div class="glass-nav max-w-7xl mx-auto bg-white/60 backdrop-blur-lg border border-gray-200/80 rounded-full px-6 py-2 shadow-md">
            <div class="flex justify-between items-center relative">
                <div id="back-button-container" class="absolute left-2 top-1/2 -translate-y-1/2 hidden">
                    <a id="back-link" href="index.html" class="p-2 rounded-full hover:bg-gray-200/50 transition-colors" title="Go Back">
                        <i data-lucide="arrow-left" class="w-5 h-5 text-gray-700"></i>
                    </a>
                </div>
                <div class="flex-1 flex justify-start md:justify-center">
                     <a href="index.html" class="flex items-center flex-shrink-0">
                        <img src="media/New-logo.svg" alt="CalciPrep Logo" class="h-8 w-auto">
                    </a>
                </div>
                <nav class="hidden md:flex items-center space-x-6 absolute left-1/2 -translate-x-1/2">
                    <a href="index.html#subjects" class="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Subjects</a>
                    <a href="index.html#features" class="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Features</a>
                    <a href="index.html#contact" class="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">Contact</a>
                </nav>
                <div class="hidden md:flex items-center space-x-2 flex-1 justify-end">
                    <div id="logged-out-view">
                        <button id="login-btn" class="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-full text-sm">Sign In</button>
                        <button id="signup-btn" class="btn-primary text-white px-4 py-2 rounded-full transition-colors text-sm font-medium">Sign Up</button>
                    </div>
                    <div id="logged-in-view" class="hidden relative">
                        <button id="account-menu-btn" class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <i data-lucide="user" class="w-6 h-6"></i>
                        </button>
                        <div id="account-menu" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 top-full">
                            <a href="account.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Account</a>
                            <button id="logout-btn" class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                        </div>
                    </div>
                </div>
                <button id="mobile-menu-button" class="md:hidden text-gray-700">
                    <i data-lucide="menu" class="w-6 h-6"></i>
                </button>
            </div>
        </div>
    </header>
     <!-- Mobile Menu -->
    <div id="mobile-menu" class="hidden md:hidden fixed inset-x-0 top-20 z-40 p-4">
        <div class="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-lg">
             <div id="mobile-back-link-container" class="hidden pb-4 mb-4 border-b border-gray-200">
                 <a id="mobile-back-link" href="index.html" class="flex items-center text-base font-semibold text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-md">
                     <i data-lucide="arrow-left" class="w-5 h-5 mr-3"></i>
                     Back
                 </a>
             </div>
            <a href="index.html#home" class="block py-2 text-gray-700 hover:text-gray-900">Home</a>
            <a href="index.html#subjects" class="block py-2 text-gray-700 hover:text-gray-900">Subjects</a>
            <a href="index.html#features" class="block py-2 text-gray-700 hover:text-gray-900">Features</a>
            <a href="index.html#contact" class="block py-2 text-gray-700 hover:text-gray-900">Contact Us</a>
            <div id="mobile-auth-container" class="border-t border-gray-200 mt-4 pt-4">
                <!-- Auth buttons will be injected here -->
            </div>
        </div>
    </div>

    <!-- Auth Modal -->
    <div id="auth-modal" class="modal hidden fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" style="font-family: 'Work Sans', sans-serif;">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-y-auto auth-modal-grid relative">
            <button id="close-modal-btn" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 z-20 text-3xl leading-none">&times;</button>
            
            <div class="auth-image-panel">
                <img src="media/Registration-left-panel.svg" alt="CalciPrep Welcome" class="w-full h-full object-cover">
            </div>
    
            <div class="auth-form-panel p-12 flex flex-col justify-center">
                <div class="w-full max-w-md mx-auto">
                    <img src="media/New-logo.svg" alt="CalciPrep Logo" class="h-8 mb-6">
                    
                    <h2 id="modal-heading" class="text-2xl font-bold text-gray-900 mb-2" style="font-family: 'Abril Fatface', cursive;">Create your account</h2>
                    <p id="modal-subheading" class="text-sm text-gray-600 mb-6">Let's get started on your journey.</p>
                    
                    <div id="auth-tabs" class="flex border-b mb-6">
                        <button id="signup-tab" class="flex-1 pb-2 font-semibold text-sm border-b-2 border-purple-600 text-purple-600">Sign Up</button>
                        <button id="signin-tab" class="flex-1 pb-2 font-semibold text-sm text-gray-500 border-b-2 border-transparent">Sign In</button>
                    </div>
    
                    <div id="error-message" class="hidden bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm"></div>
    
                    <form id="auth-form">
                        <div class="mb-4">
                            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Id</label>
                            <input type="email" id="email" name="email" autocomplete="email" class="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500">
                        </div>
                        <div class="mb-4" id="password-field-container">
                            <div class="flex justify-between items-center mb-1">
                                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                                <a href="#" id="forgot-password-link" class="text-sm text-purple-600 hover:underline hidden">Forgot Password?</a>
                            </div>
                            <input type="password" id="password" name="password" autocomplete="new-password" placeholder="Enter Password" class="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500">
                        </div>
                        
                        <div id="password-strength-container" class="text-sm text-gray-600 space-y-2 mb-6">
                            <div class="flex items-center justify-between">
                                <p>Password Strength: <span id="password-strength-text" class="font-semibold text-gray-800">Weak</span></p>
                            </div>
                            <ul id="password-criteria" class="text-xs text-gray-500 space-y-1.5">
                                <li id="crit-case" class="flex items-center transition-colors"><i data-lucide="x-circle" class="w-4 h-4 mr-2"></i>Mix of Capital and small letters</li>
                                <li id="crit-length" class="flex items-center transition-colors"><i data-lucide="x-circle" class="w-4 h-4 mr-2"></i>At least 8 characters</li>
                                <li id="crit-char" class="flex items-center transition-colors"><i data-lucide="x-circle" class="w-4 h-4 mr-2"></i>Contains a number or symbol</li>
                            </ul>
                        </div>
    
                        <button type="submit" id="modal-submit-btn" class="w-full btn-primary text-white rounded-md py-3 text-base font-semibold shadow-sm">Create Account</button>
                        
                        <div class="text-center mt-4">
                            <a href="#" id="back-to-signin-link" class="text-sm text-purple-600 hover:underline hidden">Back to Sign In</a>
                        </div>
                    </form>
                    <p id="terms-text" class="text-center text-xs text-gray-500 mt-6">
                        By signing up, you agree to our <a href="#" class="underline">Terms of Use & Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    </div>
    `;

    document.getElementById('nav-placeholder').innerHTML = navHTML;

    // --- Start Firebase Integration ---
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js").then(firebaseApp => {
        Promise.all([
            import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"),
            import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")
        ]).then(([firebaseAuth, firebaseFirestore]) => {
            
            const firebaseConfig = {
                apiKey: "AIzaSyCqCKyATw3NkVsbOfeXqU5HCutECF5ILcU",
                authDomain: "calciprep-1dd16.firebaseapp.com",
                projectId: "calciprep-1dd16",
                storageBucket: "calciprep-1dd16.appspot.com",
                messagingSenderId: "292795386240",
                appId: "1:292795386240:web:89e1049ea1cfbddb63d965",
                measurementId: "G-3VK5ZXNCHV"
            };

            const app = firebaseApp.initializeApp(firebaseConfig);
            const auth = firebaseAuth.getAuth(app);
            const db = firebaseFirestore.getFirestore(app);

            window.firebaseInstances = { auth, db, firebaseAuth, firebaseFirestore };

            // --- Global Functions and Logic ---
            
            // 1. Save Quiz Result (now part of nav.js)
            window.saveQuizResult = async function(result) {
                const user = auth.currentUser;
                if (!user) { console.log("No user logged in. Cannot save result."); return; }
                try {
                    await firebaseFirestore.addDoc(firebaseFirestore.collection(db, "users", user.uid, "quizHistory"), {
                        ...result,
                        userId: user.uid,
                        createdAt: firebaseFirestore.serverTimestamp()
                    });
                    console.log("Quiz result saved successfully!");
                } catch (error) {
                    console.error("Error saving quiz result: ", error);
                }
            }
            
            // 2. Visitor Counter (now part of nav.js)
            async function recordAndShowVisitorCount() {
                const footer = document.querySelector('footer');
                if (!footer) return; // Only run if there's a footer

                // Create counter element if it doesn't exist
                if (!document.getElementById('visitor-counter')) {
                    const counterDiv = document.createElement('div');
                    counterDiv.className = 'mt-4';
                    counterDiv.innerHTML = `<span id="visitor-counter" class="text-gray-400">Visitors: <strong id="visitor-count">--</strong></span>`;
                    footer.querySelector('.container').appendChild(counterDiv);
                }

                const countEl = document.getElementById('visitor-count');
                
                try {
                    const docRef = firebaseFirestore.doc(db, 'siteMetrics', 'visitors');
                    const transaction = firebaseFirestore.runTransaction(db, async (transaction) => {
                        const docSnap = await transaction.get(docRef);
                        const newCount = (docSnap.data()?.count || 0) + 1;
                        transaction.set(docRef, { count: newCount, updatedAt: firebaseFirestore.serverTimestamp() }, { merge: true });
                        return newCount;
                    });
                    const finalCount = await transaction;
                    if(countEl) countEl.textContent = finalCount.toLocaleString();
                } catch (e) {
                    console.warn('Firestore visitor count failed, falling back to CountAPI', e);
                    // Fallback to CountAPI
                     try {
                        const res = await fetch('https://api.countapi.xyz/hit/calciprep.online/visits');
                        const data = await res.json();
                        if (countEl) countEl.textContent = data.value.toLocaleString();
                    } catch (apiError) {
                        if (countEl) countEl.textContent = 'n/a';
                    }
                }
            }


            // --- App Initialization on DOMContentLoaded ---
            document.addEventListener('DOMContentLoaded', () => {
                
                let isLoginMode = true;
                let isPasswordResetMode = false;

                const dom = {
                    loggedOutView: document.getElementById('logged-out-view'),
                    loggedInView: document.getElementById('logged-in-view'),
                    accountMenuBtn: document.getElementById('account-menu-btn'),
                    accountMenu: document.getElementById('account-menu'),
                    logoutBtn: document.getElementById('logout-btn'),
                    loginBtn: document.getElementById('login-btn'),
                    signupBtn: document.getElementById('signup-btn'),
                    mobileMenuButton: document.getElementById('mobile-menu-button'),
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
                    modalHeading: document.getElementById('modal-heading'),
                    modalSubheading: document.getElementById('modal-subheading'),
                    authTabs: document.getElementById('auth-tabs'),
                    passwordFieldContainer: document.getElementById('password-field-container'),
                    termsText: document.getElementById('terms-text'),
                    backToSigninLink: document.getElementById('back-to-signin-link')
                };

                 // --- Mobile Menu ---
                dom.mobileMenuButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dom.mobileMenu.classList.toggle('hidden');
                });
                document.querySelectorAll('#mobile-menu a').forEach(link => {
                    link.addEventListener('click', () => dom.mobileMenu.classList.add('hidden'));
                });
                document.addEventListener('click', (e) => {
                    if (dom.mobileMenu && !dom.mobileMenu.classList.contains('hidden') && !dom.mobileMenu.contains(e.target) && !dom.mobileMenuButton.contains(e.target)) {
                        dom.mobileMenu.classList.add('hidden');
                    }
                });
                
                // 3. Header Scroll Animation
                let lastScrollTop = 0;
                window.addEventListener("scroll", () => {
                    const header = document.getElementById('app-header');
                    if (!header) return;
                    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    if (scrollTop > lastScrollTop && scrollTop > 100) {
                        header.style.transform = 'translateY(-100%)';
                    } else {
                        header.style.transform = 'translateY(0)';
                    }
                    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
                }, false);


                // --- UI Update Functions ---
                function updateAuthUI(user) {
                   if (user) {
                        dom.loggedInView?.classList.remove('hidden');
                        dom.loggedOutView?.classList.add('hidden');
                        if (dom.mobileAuthContainer) {
                            dom.mobileAuthContainer.innerHTML = `
                                <p class="px-3 py-2 text-sm text-gray-500">${user.email}</p>
                                <a href="account.html" class="block w-full text-left font-semibold text-gray-700 py-2 px-3 hover:bg-gray-100 rounded-md">My Account</a>
                                <button id="mobile-logout-btn" class="block w-full text-left font-semibold text-red-600 px-3 py-2 hover:bg-red-50 rounded-md">Logout</button>`;
                            document.getElementById('mobile-logout-btn')?.addEventListener('click', () => firebaseAuth.signOut(auth));
                        }
                    } else {
                        dom.loggedInView?.classList.add('hidden');
                        dom.loggedOutView?.classList.remove('hidden');
                        if (dom.mobileAuthContainer) {
                            dom.mobileAuthContainer.innerHTML = `
                                <div class="flex gap-3">
                                    <button id="mobile-login-btn" class="flex-1 text-center text-gray-700 bg-white hover:bg-gray-100 font-medium py-2.5 rounded-lg border border-gray-300">Sign In</button>
                                    <button id="mobile-signup-btn" class="flex-1 text-center btn-primary text-white px-5 py-2.5 rounded-lg transition-opacity hover:opacity-90">Sign Up</button>
                                </div>`;
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
                }
                
                function updateModalUI() {
                    // ... (rest of the modal UI update logic)
                }
                
                // 4. Back Button Logic
                function setupBackButton() {
                    const currentPage = window.location.pathname.split('/').pop();
                    if (currentPage === 'index.html' || currentPage === '') return;

                    const backContainer = document.getElementById('back-button-container');
                    const mobileBackContainer = document.getElementById('mobile-back-link-container');

                    if(backContainer) backContainer.classList.remove('hidden');
                    if(mobileBackContainer) mobileBackContainer.classList.remove('hidden');
                    
                    let backUrl = 'index.html'; // Default
                    const urlParams = new URLSearchParams(window.location.search);

                    if (currentPage.includes('quiz-list.html')) {
                        backUrl = 'english.html';
                    } else if (currentPage.includes('quiz.html')) {
                        const category = urlParams.get('category');
                        backUrl = `quiz-list.html?category=${encodeURIComponent(category)}`;
                    } else if (['english.html', 'maths.html', 'typing-selection.html', 'account.html'].includes(currentPage)) {
                        backUrl = 'index.html';
                    } else if (['learn-typing.html', 'typing.html'].includes(currentPage)) {
                        backUrl = 'typing-selection.html';
                    }
                    
                    document.getElementById('back-link')?.setAttribute('href', backUrl);
                    document.getElementById('mobile-back-link')?.setAttribute('href', backUrl);
                }

                // --- Event Listeners & Initial Calls ---
                firebaseAuth.onAuthStateChanged(auth, updateAuthUI);

                dom.loginBtn?.addEventListener('click', () => openModal(true));
                dom.signupBtn?.addEventListener('click', () => openModal(false));
                dom.closeModalBtn?.addEventListener('click', closeModal);
                dom.logoutBtn?.addEventListener('click', () => firebaseAuth.signOut(auth));
                
                dom.accountMenuBtn?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dom.accountMenu.classList.toggle('hidden');
                });
                window.addEventListener('click', (e) => {
                    if (dom.accountMenu && !dom.accountMenu.classList.contains('hidden') && !dom.accountMenu.contains(e.target) && !dom.accountMenuBtn.contains(e.target)) {
                        dom.accountMenu.classList.add('hidden');
                    }
                });

                // ... (rest of the auth form event listeners)

                lucide.createIcons();
                setupBackButton();
                recordAndShowVisitorCount();
            });
        });
    });
})();

