(function() {
    'use strict';

    // This script will inject the header, handle all authentication logic,
    // and provide common functionality across the entire site.

    const navAndAuthHTML = `
    <!-- Header -->
    <header id="app-header" class="fixed top-4 inset-x-0 z-50 px-4 transition-transform duration-300">
        <div id="glass-nav-container" class="glass-nav max-w-7xl mx-auto bg-white/60 backdrop-blur-lg border border-gray-200/80 shadow-md rounded-full overflow-hidden">
            <div class="flex justify-between items-center h-14 px-4 sm:px-6 py-2">
                
                <!-- LEFT PART: Logo & Back Button -->
                <div class="flex-1 flex justify-start items-center space-x-2">
                    <a id="back-link" href="index.html" class="hidden md:block p-2 rounded-full hover:bg-gray-200/50 transition-colors" title="Go Back">
                        <i data-lucide="arrow-left" class="w-6 h-6 text-gray-700"></i>
                    </a>
                    <a href="index.html" class="flex items-center flex-shrink-0">
                        <img src="media/New-logo.svg" alt="CalciPrep Logo" class="h-10 w-auto">
                    </a>
                </div>

                <!-- CENTER PART: Desktop Navigation -->
                <nav class="hidden md:flex items-center space-x-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <a href="index.html#subjects" class="text-gray-700 hover:text-gray-900 transition-colors text-base font-medium">Subjects</a>
                    <a href="index.html#features" class="text-gray-700 hover:text-gray-900 transition-colors text-base font-medium">Features</a>
                    <a href="index.html#contact" class="text-gray-700 hover:text-gray-900 transition-colors text-base font-medium">Contact</a>
                </nav>

                <!-- RIGHT PART: Auth and Mobile Menu -->
                <div class="flex-1 flex justify-end items-center">
                    <div class="hidden md:flex items-center space-x-2">
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
                    <button id="mobile-menu-button" class="md:hidden text-gray-700 p-2">
                        <i data-lucide="menu" class="w-6 h-6 transition-transform duration-300"></i>
                    </button>
                </div>
            </div>

            <!-- Mobile Menu Dropdown -->
            <div id="mobile-menu" class="md:hidden overflow-hidden">
                <div class="pt-2 pb-4 px-4 font-sans">
                     <div id="mobile-back-link-container" class="hidden pb-2 mb-2 border-b border-gray-200/80">
                         <a id="mobile-back-link" href="index.html" class="flex items-center text-lg font-semibold text-gray-800 hover:bg-gray-100/50 px-3 py-3 rounded-xl">
                             <i data-lucide="arrow-left" class="w-5 h-5 mr-3"></i>
                             Back
                         </a>
                     </div>
                    <a href="index.html#home" class="block py-3 px-3 text-lg text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-100/50">Home</a>
                    <a href="index.html#subjects" class="block py-3 px-3 text-lg text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-100/50">Subjects</a>
                    <a href="index.html#features" class="block py-3 px-3 text-lg text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-100/50">Features</a>
                    <a href="index.html#contact" class="block py-3 px-3 text-lg text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-100/50">Contact Us</a>
                    <div id="mobile-auth-container" class="border-t border-gray-200/80 mt-2 pt-4">
                        <!-- Auth buttons will be injected here -->
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Auth Modal -->
    <div id="auth-modal" class="modal hidden fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 font-sans">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden auth-modal-grid relative" style="max-height: 90vh;">
            <button id="close-modal-btn" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 z-20 text-3xl leading-none">&times;</button>
            
            <div class="auth-image-panel hidden lg:block">
                <img src="media/Registration-left-panel.svg" alt="CalciPrep Welcome" class="w-full h-full object-cover rounded-l-2xl">
            </div>
    
            <div class="auth-form-panel p-8 sm:p-12 flex flex-col justify-center overflow-y-auto">
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
    
                        <button type="submit" id="modal-submit-btn" class="w-full btn-primary text-white rounded-md py-3 text-base font-semibold shadow-sm hover:bg-purple-700 transition-colors">Create Account</button>
                        
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
    <style>
        .auth-modal-grid { display: grid; grid-template-columns: 1fr; height: auto; max-height: 650px; }
        @media (min-width: 1024px) { .auth-modal-grid { grid-template-columns: 400px 1fr; } }
        .btn-primary { background-color: #8B5CF6; }

        /* CSS Animation for Mobile Menu */
        #glass-nav-container { transition: border-radius 0.5s cubic-bezier(0.23, 1, 0.32, 1); }
        #glass-nav-container.menu-open { border-radius: 2rem; }
        #mobile-menu {
            max-height: 0;
            opacity: 0;
            transition: max-height 0.5s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        #mobile-menu.menu-open {
            max-height: 500px; /* A large enough value to not clip content */
            opacity: 1;
        }
        #mobile-menu-button i { transform-origin: center; }
        #mobile-menu-button.menu-open i { transform: rotate(90deg); }
    </style>
    `;

    // Inject the HTML into the placeholder
    const placeholder = document.getElementById('nav-placeholder');
    if (placeholder) {
        placeholder.innerHTML = navAndAuthHTML;
    } else {
        console.error('The "#nav-placeholder" div was not found. The navigation bar could not be loaded.');
        return;
    }

    // --- Start Firebase Integration ---
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js").then(firebaseApp => {
        Promise.all([
            import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"),
            import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"),
            import("https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js")
        ]).then(([firebaseAuth, firebaseFirestore, firebaseStorage]) => {
            
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
            const storage = firebaseStorage.getStorage(app);

            window.firebaseInstances = { 
                auth, db, storage, 
                ...firebaseAuth, 
                ...firebaseFirestore,
                ...firebaseStorage
            };
            
            let isLoginMode = false;
            let isPasswordResetMode = false;

            const dom = {
                header: document.getElementById('app-header'),
                glassNav: document.getElementById('glass-nav-container'),
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
            
            function toggleMobileMenu() {
                const isOpen = dom.glassNav.classList.toggle('menu-open');
                dom.mobileMenu.classList.toggle('menu-open');
                dom.mobileMenuButton.classList.toggle('menu-open');
                const icon = dom.mobileMenuButton.querySelector('i');
                icon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
                lucide.createIcons();
            }


            function showSuccessMessage(message) {
                const notification = document.createElement('div');
                notification.className = `fixed bottom-5 right-5 bg-green-600 text-white py-3 px-5 rounded-lg shadow-lg transform transition-all duration-300 translate-y-16 opacity-0 z-[101]`;
                notification.textContent = message;
                document.body.appendChild(notification);
                setTimeout(() => {
                    notification.classList.remove('translate-y-16', 'opacity-0');
                }, 100);
                setTimeout(() => {
                    notification.classList.add('translate-y-16', 'opacity-0');
                    setTimeout(() => notification.remove(), 300);
                }, 5000);
            }

            function mapAuthError(error) {
                switch (error.code) {
                    case 'auth/invalid-email':
                        return 'Please enter a valid email address.';
                    case 'auth/user-not-found':
                    case 'auth/invalid-credential':
                        return 'No account found with this email/password. Please check your credentials or sign up.';
                    case 'auth/wrong-password':
                        return 'Incorrect password. Please try again.';
                    case 'auth/email-already-in-use':
                        return 'An account with this email already exists. Please sign in.';
                    case 'auth/weak-password':
                        return 'Password should be at least 8 characters long.';
                    default:
                        return 'An authentication error occurred. Please try again.';
                }
            }


            function updateAuthUI(user) {
               if (user) {
                    dom.loggedInView?.classList.remove('hidden');
                    dom.loggedOutView?.classList.add('hidden');
                    if (dom.mobileAuthContainer) {
                        dom.mobileAuthContainer.innerHTML = `
                            <p class="px-3 py-2 text-sm text-gray-500">${user.email}</p>
                            <a href="account.html" class="block w-full text-left font-semibold text-gray-700 py-2 px-3 hover:bg-gray-100/50 rounded-md">My Account</a>
                            <button id="mobile-logout-btn" class="block w-full text-left font-semibold text-red-600 px-3 py-2 hover:bg-red-50/50 rounded-md">Logout</button>`;
                        document.getElementById('mobile-logout-btn')?.addEventListener('click', () => firebaseAuth.signOut(auth));
                    }
                } else {
                    dom.loggedInView?.classList.add('hidden');
                    dom.loggedOutView?.classList.remove('hidden');
                    if (dom.mobileAuthContainer) {
                        dom.mobileAuthContainer.innerHTML = `
                            <div class="flex gap-3 mt-2">
                                <button id="mobile-login-btn" class="flex-1 text-center text-gray-700 bg-gray-100 hover:bg-gray-200/80 font-medium py-3 rounded-xl border border-gray-200 text-base">Sign In</button>
                                <button id="mobile-signup-btn" class="flex-1 text-center btn-primary text-white px-5 py-3 rounded-xl transition-opacity hover:opacity-90 text-base">Sign Up</button>
                            </div>`;
                        document.getElementById('mobile-login-btn')?.addEventListener('click', () => openModal(true));
                        document.getElementById('mobile-signup-btn')?.addEventListener('click', () => openModal(false));
                    }
                }
            }

            function openModal(login = false) {
                isLoginMode = login;
                isPasswordResetMode = false;
                updateModalUI();
                dom.authModal?.classList.remove('hidden');
            }

            function closeModal() {
                dom.authModal?.classList.add('hidden');
            }
            
            function updateModalUI() {
                dom.errorMessage.classList.add('hidden');
                dom.authForm.reset();
                
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

                    dom.signinTab.classList.add('border-purple-600', 'text-purple-600');
                    dom.signinTab.classList.remove('text-gray-500', 'border-transparent');
                    dom.signupTab.classList.remove('border-purple-600', 'text-purple-600');
                    dom.signupTab.classList.add('text-gray-500', 'border-transparent');
                    dom.modalSubmitBtn.textContent = 'Sign In';
                    dom.forgotPasswordLink.classList.remove('hidden');
                } else { // Signup
                    dom.modalHeading.textContent = 'Create your account';
                    dom.modalSubheading.textContent = 'Let\'s get started with your journey.';
                    dom.authTabs.classList.remove('hidden');
                    dom.passwordFieldContainer.classList.remove('hidden');
                    dom.passwordStrengthContainer.classList.remove('hidden');
                    dom.termsText.classList.remove('hidden');
                    dom.backToSigninLink.classList.add('hidden');

                    dom.signupTab.classList.add('border-purple-600', 'text-purple-600');
                    dom.signupTab.classList.remove('text-gray-500', 'border-transparent');
                    dom.signinTab.classList.remove('border-purple-600', 'text-purple-600');
                    dom.signinTab.classList.add('text-gray-500', 'border-transparent');
                    dom.modalSubmitBtn.textContent = 'Create Account';
                    dom.forgotPasswordLink.classList.add('hidden');
                }
            }
            
            function showError(error) {
                dom.errorMessage.textContent = error.message;
                dom.errorMessage.classList.remove('hidden');
            }

             function checkPasswordStrength() {
                if (isLoginMode || isPasswordResetMode) return;
                const password = dom.passwordInput.value;
                const criteriaMet = {
                    length: password.length >= 8,
                    char: /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password),
                    case: /(?=.*[a-z])(?=.*[A-Z])/.test(password)
                };
                const updateCriterion = (el, isMet) => {
                    if (!el) return;
                    const iconEl = el.querySelector('i');
                    if (!iconEl) return;
                    const newIconName = isMet ? 'check-circle' : 'x-circle';
                    el.classList.toggle('text-green-600', isMet);
                    el.classList.toggle('text-gray-500', !isMet);
                    iconEl.setAttribute('data-lucide', newIconName);
                };
                updateCriterion(dom.passwordCriteria.case, criteriaMet.case);
                updateCriterion(dom.passwordCriteria.length, criteriaMet.length);
                updateCriterion(dom.passwordCriteria.char, criteriaMet.char);
                const strength = Object.values(criteriaMet).filter(Boolean).length;
                const strengthTextMap = { 0: 'Weak', 1: 'Weak', 2: 'Medium', 3: 'Strong' };
                const strengthColorMap = { 0: 'text-red-600', 1: 'text-red-600', 2: 'text-yellow-600', 3: 'text-green-600' };
                dom.passwordStrengthText.textContent = strengthTextMap[strength];
                dom.passwordStrengthText.className = `font-semibold ${strengthColorMap[strength]}`;
                lucide.createIcons();
            };

            function setupBackButton() {
                const currentPage = window.location.pathname.split('/').pop();
                const isIndex = currentPage === 'index.html' || currentPage === '';
                
                const backLink = document.getElementById('back-link');
                const mobileBackContainer = document.getElementById('mobile-back-link-container');
                const mobileBackLink = document.getElementById('mobile-back-link');

                if (isIndex) {
                    if (backLink) backLink.classList.add('hidden');
                    if (mobileBackContainer) mobileBackContainer.classList.add('hidden');
                    return;
                };

                // The md:block class on backLink will handle desktop visibility.
                if(backLink) backLink.classList.remove('hidden');
                if(mobileBackContainer) mobileBackContainer.classList.remove('hidden');
                
                let backUrl = 'index.html';
                const urlParams = new URLSearchParams(window.location.search);

                if (currentPage === 'quiz-list.html') {
                    backUrl = 'english.html';
                } else if (currentPage === 'quiz.html') {
                    const category = urlParams.get('category');
                    if (category) backUrl = `quiz-list.html?category=${encodeURIComponent(category)}`;
                } else if (['english.html', 'maths.html', 'typing-selection.html', 'account.html'].includes(currentPage)) {
                    backUrl = 'index.html';
                } else if (['learn-typing.html', 'typing.html'].includes(currentPage)) {
                    backUrl = 'typing-selection.html';
                }
                
                if(backLink) backLink.setAttribute('href', backUrl);
                if(mobileBackLink) mobileBackLink.setAttribute('href', backUrl);
            }

            // --- Event Listeners ---
            firebaseAuth.onAuthStateChanged(auth, updateAuthUI);

            if(dom.loginBtn) dom.loginBtn.addEventListener('click', () => openModal(true));
            if(dom.signupBtn) dom.signupBtn.addEventListener('click', () => openModal(false));
            if(dom.closeModalBtn) dom.closeModalBtn.addEventListener('click', closeModal);

            if(dom.signinTab) dom.signinTab.addEventListener('click', () => { isLoginMode = true; isPasswordResetMode = false; updateModalUI(); });
            if(dom.signupTab) dom.signupTab.addEventListener('click', () => { isLoginMode = false; isPasswordResetMode = false; updateModalUI(); });
            
            if(dom.forgotPasswordLink) dom.forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); isPasswordResetMode = true; updateModalUI(); });
            if(dom.backToSigninLink) dom.backToSigninLink.addEventListener('click', (e) => { e.preventDefault(); isPasswordResetMode = false; isLoginMode = true; updateModalUI(); });

            if(dom.logoutBtn) dom.logoutBtn.addEventListener('click', () => firebaseAuth.signOut(auth));
            if(dom.passwordInput) dom.passwordInput.addEventListener('input', checkPasswordStrength);
            
            if(dom.accountMenuBtn) dom.accountMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dom.accountMenu.classList.toggle('hidden');
            });
            window.addEventListener('click', (e) => {
                if (dom.accountMenu && !dom.accountMenu.classList.contains('hidden') && !dom.accountMenuBtn.contains(e.target) && !dom.accountMenu.contains(e.target)) {
                    dom.accountMenu.classList.add('hidden');
                }
            });

            if(dom.mobileMenuButton) {
                dom.mobileMenuButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleMobileMenu();
                });
            }
            
            document.addEventListener('click', (e) => {
                 if (dom.mobileMenu && dom.glassNav.classList.contains('menu-open') && !dom.glassNav.contains(e.target)) {
                    toggleMobileMenu();
                }
            });

            // Close mobile menu on link click
            document.querySelectorAll('#mobile-menu a').forEach(link => {
                link.addEventListener('click', toggleMobileMenu);
            });


            dom.authForm?.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = dom.emailInput.value;
                const password = dom.passwordInput.value;
                dom.errorMessage.classList.add('hidden');

                if (isPasswordResetMode) {
                    firebaseAuth.sendPasswordResetEmail(auth, email)
                        .then(() => {
                            showSuccessMessage("Password reset link sent! Check your inbox.");
                            isPasswordResetMode = false;
                            isLoginMode = true;
                            updateModalUI();
                        })
                        .catch(error => showError({ message: mapAuthError(error) }));
                } else if (isLoginMode) { // SIGN IN
                    firebaseAuth.signInWithEmailAndPassword(auth, email, password)
                        .then((userCredential) => {
                            showSuccessMessage("Signed in successfully!");
                            closeModal();
                        })
                        .catch(error => showError({ message: mapAuthError(error) }));
                } else { // SIGN UP
                    firebaseAuth.createUserWithEmailAndPassword(auth, email, password)
                        .then(async (userCredential) => {
                             const user = userCredential.user;
                             await firebaseFirestore.setDoc(firebaseFirestore.doc(db, "users", user.uid), {
                                email: user.email,
                                createdAt: new Date(),
                             });
                            showSuccessMessage("Account created successfully!");
                            closeModal();
                        })
                        .catch(error => showError({ message: mapAuthError(error) }));
                }
            });
            
            function handleScroll() {
                if (window.innerWidth >= 768) { // md breakpoint
                    if(dom.header) dom.header.style.transform = 'translateY(0)';
                    return;
                }

                let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    if(dom.header) dom.header.style.transform = 'translateY(calc(-100% - 1rem))';
                } else {
                    if(dom.header) dom.header.style.transform = 'translateY(0)';
                }
                lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            }

            // --- Initial Calls ---
            lucide.createIcons();
            setupBackButton();
            
            let lastScrollTop = 0;
            window.addEventListener("scroll", () => {
                // Only close the menu on scroll if it's already open
                if (window.innerWidth < 768 && dom.glassNav.classList.contains('menu-open')) {
                    toggleMobileMenu();
                }
                handleScroll();
            }, false);

            window.addEventListener('resize', () => {
                if (window.innerWidth >= 768) {
                    if(dom.header) dom.header.style.transform = 'translateY(0)';
                }
            });

        });
    });
})();

