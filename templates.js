// Centralized HTML templates for CalciPrep
(function() {
    'use strict';
    
    // Define templates
    const headerHTML = `
<header id="header" class="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm transition-transform duration-300">
    <div class="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <a href="index.html" class="flex-shrink-0">
            <img src="images/New-logo.svg" alt="CalciPrep Logo" class="h-10">
        </a>

        <nav id="main-nav" class="hidden lg:flex items-center space-x-8">
            <a href="index.html#home" class="nav-link">Home</a>
            <a href="index.html#subjects" class="nav-link">Subjects</a>
            <a href="index.html#about" class="nav-link">About</a>
            <a href="index.html#features" class="nav-link">Features</a>
            <a href="index.html#resources" class="nav-link">Resources</a>
            <a href="index.html#contact" class="nav-link">Contact</a>
        </nav>

        <div class="hidden lg:flex items-center space-x-2">
            <div id="back-button-container" class="hidden">
                <a id="back-link" href="#" class="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Go Back">
                    <i data-lucide="arrow-left" class="w-5 h-5 text-gray-700"></i>
                </a>
            </div>
            <div id="auth-container">
                <div id="logged-out-view" class="flex items-center space-x-2">
                    <button id="login-btn" class="font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-5 py-2 rounded-md transition-colors text-sm">Login</button>
                    <button id="signup-btn" class="font-semibold text-white bg-gray-900 hover:bg-gray-800 px-5 py-2 rounded-md transition-colors text-sm">Sign up</button>
                </div>
                <div id="logged-in-view" class="hidden items-center space-x-4 relative">
                     <button id="account-menu-btn" class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <i data-lucide="user" class="w-6 h-6 text-gray-600"></i>
                    </button>
                    <div id="account-menu" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 top-full">
                        <a href="account.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Account</a>
                        <button id="logout-btn" class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="lg:hidden">
            <button id="menu-btn" class="focus:outline-none p-2 text-gray-800">
                <i data-lucide="menu" class="w-6 h-6"></i>
            </button>
        </div>
    </div>
    
    <div id="mobile-menu" class="hidden lg:hidden bg-white/95 backdrop-blur-md">
        <div class="px-2 pt-2 pb-3 space-y-1">
             <a href="index.html#home" class="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100">Home</a>
             <a href="index.html#subjects" class="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100">Subjects</a>
             <a href="index.html#about" class="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100">About</a>
             <a href="index.html#features" class="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100">Features</a>
             <a href="index.html#resources" class="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100">Resources</a>
             <a href="index.html#contact" class="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100">Contact</a>
             <div class="px-3 pt-4 pb-2 border-t border-gray-200">
                 <div id="mobile-back-link" class="hidden mb-3">
                     <a href="#" class="flex items-center text-base font-medium text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-md">
                         <i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i>
                         Back
                     </a>
                 </div>
                 <div id="mobile-auth-container">
                     </div>
             </div>
        </div>
    </div>
</header>

<style>
    body {
      padding-top: 80px;
    }
    .nav-link {
        color: #4B5563; /* text-gray-600 */
        transition: color 0.3s ease;
        font-weight: 500;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
    }
    .nav-link:hover, .nav-link.active {
        color: #111827; /* text-gray-900 */
    }
    .auth-modal-grid {
        display: grid;
        grid-template-columns: 480px 1fr;
    }
    .auth-left-panel {
       /* No background needed as it's an img now */
    }
    @media (max-width: 768px) {
        .auth-modal-grid {
            grid-template-columns: 1fr;
            font-family: 'Inter', sans-serif;
        }
        .auth-left-panel {
            display: none;
        }
    }
</style>

<div id="auth-modal" class="modal hidden fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden auth-modal-grid relative" style="height: 650px;">
        <button id="close-modal-btn" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 z-20 text-3xl leading-none">&times;</button>
        
        <!-- Left Panel -->
        <div class="auth-left-panel">
            <img src="images/Registration-left-panel.svg" alt="CalciPrep Welcome" class="w-full h-full object-cover">
        </div>

        <!-- Right Panel (Form) -->
        <div class="p-12 flex flex-col justify-center" style="font-family: 'Inter', sans-serif;">
            <div class="w-full max-w-md mx-auto">
                <img src="images/New-logo.svg" alt="CalciPrep Logo" class="h-8 mb-6">
                
                <h2 id="modal-heading" class="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
                <p id="modal-subheading" class="text-sm text-gray-600 mb-6">Let's get started with your 30 day free trial.</p>
                
                <div id="auth-tabs" class="flex border-b mb-6">
                    <button id="signup-tab" class="flex-1 pb-2 font-semibold text-sm border-b-2 border-indigo-600 text-indigo-600">Sign Up</button>
                    <button id="signin-tab" class="flex-1 pb-2 font-semibold text-sm text-gray-500 border-b-2 border-transparent">Sign In</button>
                </div>

                <div id="error-message" class="hidden bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm"></div>

                <form id="auth-form">
                    <div class="mb-4">
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Id</label>
                        <input type="email" id="email" name="email" autocomplete="email" class="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div class="mb-4" id="password-field-container">
                        <div class="flex justify-between items-center mb-1">
                            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                            <a href="#" id="forgot-password-link" class="text-sm text-indigo-600 hover:underline hidden">Forgot Password?</a>
                        </div>
                        <input type="password" id="password" name="password" autocomplete="new-password" placeholder="Enter Password" class="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    
                    <div id="password-strength-container" class="text-sm text-gray-600 space-y-2 mb-6">
                        <div class="flex items-center justify-between">
                            <p>Password Strength: <span id="password-strength-text" class="font-semibold text-gray-800">Weak</span></p>
                        </div>
                        <ul id="password-criteria" class="text-xs text-gray-500 space-y-1.5">
                            <li id="crit-case" class="flex items-center transition-colors"><i data-lucide="x-circle" class="w-4 h-4 mr-2"></i>Should contain mix of Capital and small letters</li>
                            <li id="crit-length" class="flex items-center transition-colors"><i data-lucide="x-circle" class="w-4 h-4 mr-2"></i>At least 8 characters</li>
                            <li id="crit-char" class="flex items-center transition-colors"><i data-lucide="x-circle" class="w-4 h-4 mr-2"></i>Contains a number or symbol</li>
                        </ul>
                    </div>

                    <button type="submit" id="modal-submit-btn" class="w-full bg-indigo-600 text-white rounded-md py-3 text-base font-semibold hover:bg-indigo-700 transition-colors shadow-sm">Create Account</button>
                    
                    <div class="text-center mt-4">
                        <a href="#" id="back-to-signin-link" class="text-sm text-indigo-600 hover:underline hidden">Back to Sign In</a>
                    </div>
                </form>
                <p id="terms-text" class="text-center text-xs text-gray-500 mt-6">
                    By signing up to create an account I accept Company's <a href="#" class="underline">Terms of use & Privacy Policy</a>.
                </p>
            </div>
        </div>
    </div>
</div>
`;

    const footerHTML = `
<footer class="bg-gray-800 text-white py-12" style="background-color: #151313;">
    <div class="container mx-auto px-6 text-center">
        <a href="index.html#home">
            <img src="images/New-logo.svg" alt="CalciPrep Logo" class="h-10 mx-auto">
        </a>
        <div class="flex justify-center space-x-6 my-6">
            <a href="index.html#about" class="hover:text-accent-blue text-gray-300">About</a>
            <a href="index.html#subjects" class="hover:text-accent-blue text-gray-300">Subjects</a>
            <a href="index.html#features" class="hover:text-accent-blue text-gray-300">Features</a>
            <a href="index.html#contact" class="hover:text-accent-blue text-gray-300">Contact</a>
        </div>
        <p class="text-gray-400">&copy; 2024 CalciPrep. All Rights Reserved.</p>
    </div>
</footer>
    `;
    
    // Make templates globally accessible
    window.headerHTML = headerHTML;
    window.footerHTML = footerHTML;
    
})();

