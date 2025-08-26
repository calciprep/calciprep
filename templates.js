// Centralized HTML templates for CalciPrep
(function() {
    'use strict';
    
    // Define templates
    const headerHTML = `
<!-- Header & Navigation -->
<header id="header" class="bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
    <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="index.html">
            <img src="New-logo.svg" alt="CalciPrep Logo" class="h-10">
        </a>
        <div class="hidden lg:flex items-center space-x-8">
            <a href="index.html#home" class="nav-link">Home</a>
            <a href="index.html#subjects" class="nav-link">Subjects</a>
            <a href="index.html#about" class="nav-link">About</a>
            <a href="index.html#features" class="nav-link">Features</a>
            <a href="index.html#resources" class="nav-link">Resources</a>
            <a href="index.html#contact" class="nav-link">Contact</a>
        </div>
                 <!-- Right side: Back button and Auth buttons grouped together -->
         <div class="flex items-center space-x-2">
             <!-- Back Button (hidden by default, shown on quiz pages, hidden on mobile) -->
             <div id="back-button-container" class="hidden max-lg:hidden">
                 <a id="back-link" href="#" class="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Go Back">
                     <i data-lucide="arrow-left" class="w-6 h-6 text-gray-700"></i>
                 </a>
             </div>
            <!-- Auth Buttons (Desktop) -->
            <div id="auth-container" class="max-lg:hidden lg:flex items-center space-x-2">
            <div id="logged-out-view" class="flex items-center space-x-2">
                <button id="login-btn" class="font-semibold text-gray-700 hover:text-accent-orange transition-colors">Login</button>
                <button id="signup-btn" class="ml-2 btn-primary" style="padding: 0.5rem 1rem;">Sign Up</button>
            </div>
            <div id="logged-in-view" class="hidden items-center space-x-4">
                <span id="user-email" class="text-sm text-gray-600"></span>
                <button id="logout-btn" class="font-semibold text-gray-700 hover:text-accent-orange transition-colors">Logout</button>
            </div>
        </div>
        </div>
        <!-- Mobile Menu Button -->
        <div class="lg:hidden">
            <button id="menu-btn" class="focus:outline-none p-2">
                <i data-lucide="menu" class="w-6 h-6"></i>
            </button>
        </div>
    </nav>
    <!-- Mobile Menu -->
    <div id="mobile-menu" class="hidden lg:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1">
             <a href="index.html#home" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Home</a>
             <a href="index.html#subjects" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Subjects</a>
             <a href="index.html#about" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">About</a>
             <a href="index.html#features" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Features</a>
             <a href="index.html#resources" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Resources</a>
             <a href="index.html#contact" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Contact</a>
             <!-- Mobile Back Button and Auth Buttons grouped together -->
             <div class="px-3 pt-4 pb-2 border-t border-gray-200">
                 <!-- Mobile Back Button (hidden by default, shown on quiz pages) -->
                 <div id="mobile-back-link" class="hidden mb-3">
                     <a href="#" class="flex items-center text-base font-medium text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md">
                         <i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i>
                         Back
                     </a>
                 </div>
                 <!-- Mobile Auth Buttons -->
                 <div id="mobile-auth-container">
                     <!-- JS will populate this -->
                 </div>
             </div>
        </div>
    </div>
</header>

<!-- Login/Signup Modal -->
<div id="auth-modal" class="modal hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div class="p-8">
            <div class="flex justify-between items-center mb-6">
                <h2 id="modal-title" class="text-3xl font-bold">Login</h2>
                <button id="close-modal-btn" class="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
            </div>
            <div id="error-message" class="hidden bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm"></div>
            <form id="auth-form">
                <div class="mb-4">
                    <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" id="email" class="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-accent-orange focus:border-accent-orange">
                </div>
                <div class="mb-6">
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" id="password" class="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-accent-orange focus:border-accent-orange">
                </div>
                <button type="submit" id="modal-submit-btn" class="w-full btn-primary">Login</button>
            </form>
            <p class="text-center text-sm text-gray-600 mt-4">
                <span id="modal-switch-text">Don't have an account?</span>
                <button id="modal-switch-btn" class="font-semibold text-accent-orange hover:underline">Sign Up</button>
            </p>
        </div>
    </div>
</div>
`;

    const footerHTML = `
<!-- Footer -->
<footer class="bg-gray-800 text-white py-12" style="background-color: #151313;">
    <div class="container mx-auto px-6 text-center">
        <a href="index.html#home">
            <img src="New-logo.svg" alt="CalciPrep Logo" class="h-10 mx-auto">
        </a>
        <div class="flex justify-center space-x-6 my-6">
            <a href="index.html#about" class="hover:text-accent-orange text-gray-300">About</a>
            <a href="index.html#subjects" class="hover:text-accent-orange text-gray-300">Subjects</a>
            <a href="index.html#features" class="hover:text-accent-orange text-gray-300">Features</a>
            <a href="index.html#contact" class="hover:text-accent-orange text-gray-300">Contact</a>
        </div>
        <p class="text-gray-400">&copy; 2024 CalciPrep. All Rights Reserved.</p>
    </div>
</footer>
    `;
    
    // Make templates globally accessible
    window.headerHTML = headerHTML;
    window.footerHTML = footerHTML;
    
    console.log('Templates loaded:', { 
        headerHTML: !!headerHTML, 
        footerHTML: !!footerHTML,
        headerLength: headerHTML.length,
        footerLength: footerHTML.length
    });
})();
