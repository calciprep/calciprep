// Centralized HTML templates for CalciPrep
(function() {
    'use strict';
    
    // Define the refactored header template
    const headerHTML = `
<!-- 
  ================================================================================
  REFACTORED HEADER
  Description: This header has been updated to a modern, three-part layout.
  - Left: Logo
  - Center: Glassmorphism pill navigation
  - Right: User action buttons
  - Layout: Achieved using Flexbox for perfect alignment and centering.
  - Responsive: Includes a functional hamburger menu for mobile devices.
  ================================================================================
-->
<header id="header" class="fixed top-0 left-0 right-0 z-50">
    <div class="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        
        <!-- Left Section (1/3): Logo -->
        <div class="flex-1 flex justify-start">
            <a href="index.html" class="flex-shrink-0">
                <img src="New-logo.svg" alt="CalciPrep Logo" class="h-10">
            </a>
        </div>

        <!-- Center Section (1/3): Glassmorphism Navigation -->
        <nav id="main-nav" class="hidden lg:flex items-center space-x-1 p-1 glassmorphism-nav">
            <a href="index.html#home" class="nav-link active">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span>Home</span>
            </a>
            <a href="index.html#subjects" class="nav-link"><span>Subjects</span></a>
            <a href="index.html#about" class="nav-link"><span>About</span></a>
            <a href="index.html#features" class="nav-link"><span>Features</span></a>
            <a href="index.html#resources" class="nav-link"><span>Resources</span></a>
            <a href="index.html#contact" class="nav-link"><span>Contact</span></a>
        </nav>

        <!-- Right Section (1/3): Action Buttons -->
        <div class="flex-1 hidden lg:flex items-center justify-end space-x-4">
             <!-- Back Button (Desktop) - Hidden by default, shown via JS -->
             <div id="back-button-container" class="hidden">
                <a id="back-link" href="#" class="back-button" title="Go Back">
                    <i data-lucide="arrow-left" class="w-6 h-6"></i>
                </a>
            </div>
             <div id="auth-container">
                <div id="logged-out-view" class="flex items-center space-x-2">
                    <button id="login-btn" class="font-semibold text-white/80 hover:text-white px-4 py-2 rounded-full transition-colors">Login</button>
                    <button id="signup-btn" class="action-btn-primary">Sign up</button>
                </div>
                <div id="logged-in-view" class="hidden items-center space-x-4">
                    <span id="user-email" class="text-sm text-white/70 font-medium"></span>
                    <button id="logout-btn" class="font-semibold text-white/80 hover:text-white px-4 py-2 rounded-full transition-colors">Logout</button>
                </div>
            </div>
        </div>
        
        <!-- Mobile Menu Button (Hamburger) -->
        <div class="lg:hidden flex-1 flex justify-end">
            <button id="menu-btn" class="focus:outline-none p-2 text-white">
                <i data-lucide="menu" class="w-6 h-6"></i>
            </button>
        </div>
    </div>
    
    <!-- Mobile Menu Panel -->
    <div id="mobile-menu" class="hidden lg:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1">
             <!-- Back Button (Mobile) - Hidden by default, shown via JS -->
             <div id="mobile-back-link" class="hidden mb-2">
                 <a href="#" class="flex items-center text-base font-medium px-3 py-2 rounded-md">
                     <i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i>
                     Back
                 </a>
             </div>
             <a href="index.html#home" class="block px-3 py-2 rounded-md text-base font-medium">Home</a>
             <a href="index.html#subjects" class="block px-3 py-2 rounded-md text-base font-medium">Subjects</a>
             <a href="index.html#about" class="block px-3 py-2 rounded-md text-base font-medium">About</a>
             <a href="index.html#features" class="block px-3 py-2 rounded-md text-base font-medium">Features</a>
             <a href="index.html#resources" class="block px-3 py-2 rounded-md text-base font-medium">Resources</a>
             <a href="index.html#contact" class="block px-3 py-2 rounded-md text-base font-medium">Contact</a>
             <div class="px-3 pt-4 pb-2 border-t border-white/10">
                 <div id="mobile-auth-container">
                     <!-- Mobile login/signup buttons are dynamically inserted here by main.js -->
                 </div>
             </div>
        </div>
    </div>
</header>

<style>
    body {
      padding-top: 80px; 
    }
    #header {
        /* Header is a transparent container for layout */
    }
    .glassmorphism-nav {
        background: rgba(18, 18, 18, 0.5);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }
    .nav-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 9999px;
        font-weight: 500;
        color: #A1A1AA; /* Zinc 400 */
        transition: all 0.3s ease;
        position: relative;
        z-index: 1;
    }
    .nav-link:hover {
        background-color: rgba(255, 255, 255, 0.05);
        color: #FAFAFA; /* Zinc 50 */
    }
    .nav-link.active {
        background-color: #09090B; /* Zinc 950 */
        color: #FAFAFA; /* Zinc 50 */
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    .action-btn-primary {
        background-color: #3B82F6; /* Blue 500 */
        color: white;
        font-weight: 600;
        border-radius: 9999px;
        padding: 0.5rem 1.25rem;
        box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);
        transition: all 0.3s ease;
    }
    .action-btn-primary:hover {
        background-color: #2563EB; /* Blue 600 */
        transform: scale(1.05);
    }
    
    /* * NEW: Styling for the back button */
    .back-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem; /* 8px */
        border-radius: 9999px; /* full circle */
        color: #A1A1AA; /* Zinc 400 */
        transition: opacity 0.3s ease;
    }
    .back-button:hover {
        opacity: 0.7;
        /* No background highlight or glow as requested */
    }

    #mobile-menu {
        position: fixed;
        top: 70px;
        left: 1rem;
        right: 1rem;
        background: rgba(20, 20, 20, 0.8);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        overflow: hidden;
    }
    #mobile-menu a, #mobile-menu button, #mobile-menu span {
        color: #D4D4D8; /* Zinc 300 */
    }
    #mobile-menu a:hover {
        background-color: rgba(255, 255, 255, 0.05);
        color: white;
    }
    #mobile-auth-container #mobile-signup-btn {
        background-color: #3B82F6; /* Blue 500 */
        color: white;
    }
</style>

<!-- Auth Modal (Unchanged) -->
<div id="auth-modal" class="modal hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md text-gray-800">
        <div class="p-8">
            <div class="flex justify-between items-center mb-6">
                <h2 id="modal-title" class="text-3xl font-bold">Login</h2>
                <button id="close-modal-btn" class="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
            </div>
            <div id="error-message" class="hidden bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm"></div>
            <form id="auth-form">
                <div class="mb-4">
                    <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" id="email" class="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-800">
                </div>
                <div class="mb-6">
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" id="password" class="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-800">
                </div>
                <button type="submit" id="modal-submit-btn" class="w-full btn-primary" style="background-color: #ff5734;">Login</button>
            </form>
            <p class="text-center text-sm text-gray-600 mt-4">
                <span id="modal-switch-text">Don't have an account?</span>
                <button id="modal-switch-btn" class="font-semibold text-orange-600 hover:underline">Sign Up</button>
            </p>
        </div>
    </div>
</div>
`;    

    // Footer template remains unchanged as requested
    const footerHTML = `
<footer class="bg-gray-800 text-white py-12" style="background-color: #0d0d0dff;">
    <div class="container mx-auto px-6 text-center">
        <a href="index.html#home">
            <img src="New-logo.svg" alt="CalciPrep Logo" class="h-10 mx-auto">
        </a>
        <div class="flex justify-center space-x-6 my-6">
            <a href="index.html#about" class="hover:text-orange-500 text-gray-300">About</a>
            <a href="index.html#subjects" class="hover:text-orange-500 text-gray-300">Subjects</a>
            <a href="index.html#features" class="hover:text-orange-500 text-gray-300">Features</a>
            <a href="index.html#contact" class="hover:text-orange-500 text-gray-300">Contact</a>
        </div>
        <p class="text-gray-400">&copy; 2025 CalciPrep. All Rights Reserved.</p>
    </div>
</footer>
    `;
    
    // Make templates globally accessible for main.js to use
    window.headerHTML = headerHTML;
    window.footerHTML = footerHTML;
    
})();
