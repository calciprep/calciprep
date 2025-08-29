// Centralized HTML templates for CalciPrep
(function() {
    'use strict';
    
    // Define templates
    const headerHTML = `
<header id="header" class="fixed top-0 left-0 right-0 z-50">
    <div class="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <a href="index.html" class="flex-shrink-0">
            <img src="New-logo.svg" alt="CalciPrep Logo" class="h-10">
        </a>

        <nav id="main-nav" class="glassmorphism-nav hidden lg:flex items-center space-x-1 p-1.5 relative">
            <div id="nav-highlight" class="nav-highlight"></div>
            <a href="index.html#home" class="nav-link active">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span>Home</span>
            </a>
            <a href="index.html#subjects" class="nav-link">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                <span>Subjects</span>
            </a>
            <a href="index.html#about" class="nav-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <span>About</span>
            </a>
            <a href="index.html#features" class="nav-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
                <span>Features</span>
            </a>
            <a href="index.html#resources" class="nav-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                <span>Resources</span>
            </a>
            <a href="index.html#contact" class="nav-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span>Contact</span>
            </a>
        </nav>

        <div class="hidden lg:flex items-center space-x-2">
            <div id="back-button-container" class="hidden">
                <a id="back-link" href="#" class="p-2 rounded-full hover:opacity-75 transition-all" title="Go Back">
                    <i data-lucide="arrow-left" class="w-6 h-6 text-gray-700"></i>
                </a>
            </div>
            <div id="auth-container">
                <div id="logged-out-view" class="flex items-center space-x-2">
                    <button id="login-btn" class="font-semibold text-gray-700 hover:bg-gray-200/50 px-4 py-2 rounded-full transition-colors">Login</button>
                    <button id="signup-btn" class="btn-primary" style="padding: 0.5rem 1rem;">Sign up</button>
                </div>
                <div id="logged-in-view" class="hidden items-center space-x-4">
                    <span id="user-email" class="text-sm text-gray-600 font-medium"></span>
                    <button id="logout-btn" class="font-semibold text-gray-700 hover:bg-gray-200/50 px-4 py-2 rounded-full transition-colors">Logout</button>
                </div>
            </div>
        </div>

        <div class="lg:hidden">
            <button id="menu-btn" class="focus:outline-none p-2 text-gray-800">
                <i data-lucide="menu" class="w-6 h-6"></i>
            </button>
        </div>
    </div>
    
    <div id="mobile-menu" class="hidden lg:hidden fixed top-24 left-4 right-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 overflow-hidden">
        <div class="px-2 pt-2 pb-3 space-y-1">
             <a href="index.html#home" class="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-500/10">Home</a>
             <a href="index.html#subjects" class="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-500/10">Subjects</a>
             <a href="index.html#about" class="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-500/10">About</a>
             <a href="index.html#features" class="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-500/10">Features</a>
             <a href="index.html#resources" class="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-500/10">Resources</a>
             <a href="index.html#contact" class="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-500/10">Contact</a>
             <div class="px-3 pt-4 pb-2 border-t border-gray-200/50">
                 <div id="mobile-back-link" class="hidden mb-3">
                     <a href="#" class="flex items-center text-base font-medium text-gray-800 hover:bg-gray-500/10 px-3 py-2 rounded-md">
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
      padding-top: 80px; /* Add padding to body to prevent content from being hidden behind the fixed header */
    }
    .glassmorphism-nav {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 9999px; /* full pill shape */
        border: 1px solid rgba(255, 255, 255, 0.9);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
    }

    .nav-link {
        display: flex;
        align-items: center;
        gap: 0.5rem; /* 8px */
        padding: 0.5rem 1rem; /* 8px 16px */
        border-radius: 9999px;
        font-weight: 500;
        color: #374151; /* text-gray-700 */
        transition: color 0.3s ease;
        position: relative;
        z-index: 1;
    }

    .nav-link.active, .nav-link:hover {
        color: #111827; /* text-gray-900 */
    }

    .nav-highlight {
        position: absolute;
        top: 6px; /* Corresponds to p-1.5 */
        bottom: 6px;
        background-color: #ffffff;
        border-radius: 9999px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        z-index: 0;
    }
    
    .btn-primary {
        background-color: #ff5734;
        color: white;
        font-weight: 600;
        border-radius: 9999px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        transition: all 0.3s ease;
        transform: scale(1);
    }
    .btn-primary:hover {
        background-color: #e64a2e;
        transform: scale(1.05);
    }
    
    /* New Auth Modal Styles */
    .auth-modal-grid {
        display: grid;
        grid-template-columns: 4fr 5fr;
        min-height: 550px;
    }
    .auth-left-panel {
        background: linear-gradient(rgba(255, 87, 52, 0.8), rgba(255, 87, 52, 0.6)), url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
        background-size: cover;
        background-position: center;
        font-family: 'Inter', sans-serif;
    }
    @media (max-width: 768px) {
        .auth-modal-grid {
            grid-template-columns: 1fr;
        }
        .auth-left-panel {
            display: none;
        }
    }
</style>

<div id="auth-modal" class="modal hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden auth-modal-grid">
        <!-- Left Panel -->
        <div class="auth-left-panel p-10 flex flex-col justify-center text-white">
            <h2 class="text-3xl font-bold mb-4">Prepare for your next SSC exam.</h2>
            <p class="text-lg text-white/90 mb-6">Practice all your SSC subjects in one place.</p>
            <ul class="space-y-4 text-lg">
                <li class="flex items-center">
                    <i data-lucide="check-circle" class="w-6 h-6 mr-3 text-white/80"></i>
                    <span>Practice thousands of questions.</span>
                </li>
                <li class="flex items-center">
                    <i data-lucide="check-circle" class="w-6 h-6 mr-3 text-white/80"></i>
                    <span>Level up your skills in Maths & English.</span>
                </li>
                 <li class="flex items-center">
                    <i data-lucide="check-circle" class="w-6 h-6 mr-3 text-white/80"></i>
                    <span>Join a community of aspirants.</span>
                </li>
            </ul>
        </div>
        <!-- Right Panel (Form) -->
        <div class="p-10 relative flex flex-col justify-center">
            <button id="close-modal-btn" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl leading-none">&times;</button>
            <div class="w-full max-w-sm mx-auto">
                 <h2 id="modal-title" class="text-3xl font-bold text-gray-900 mb-2">Welcome</h2>
                 <p class="text-gray-900 mb-6">Create an account to save your progress.</p>
                <div id="error-message" class="hidden bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm"></div>
                <form id="auth-form">
                    <div class="mb-4">
                        <label for="email" class="block text-sm font-medium text-black mb-1">Email Address</label>
                        <input type="email" id="email" class="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-accent-orange focus:border-accent-orange">
                    </div>
                    <div class="mb-6">
                        <label for="password" class="block text-sm font-medium text-black mb-1">Password</label>
                        <input type="password" id="password" class="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-accent-orange focus:border-accent-orange">
                    </div>
                    <button type="submit" id="modal-submit-btn" class="w-full btn-primary rounded-md py-3 text-base">Login</button>
                </form>
                <p class="text-center text-sm text-black mt-6">
                    <span id="modal-switch-text">Don't have an account?</span>
                    <button id="modal-switch-btn" class="font-semibold text-accent-orange hover:underline">Sign Up</button>
                </p>
            </div>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;

        const highlight = document.getElementById('nav-highlight');
        const links = nav.querySelectorAll('.nav-link');
        const activeLink = nav.querySelector('.nav-link.active');

        function positionHighlight(element) {
            if (!element) return;
            highlight.style.width = \`\${element.offsetWidth}px\`;
            highlight.style.left = \`\${element.offsetLeft}px\`;
        }

        // Use a small timeout to ensure all elements are rendered before calculating position
        setTimeout(() => {
            if (activeLink) {
                positionHighlight(activeLink);
            }
        }, 50);


        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                positionHighlight(link);
            });
        });

        nav.addEventListener('mouseleave', () => {
            const currentActive = nav.querySelector('.nav-link.active');
            positionHighlight(currentActive);
        });
    });
</script>
`;

    const footerHTML = `
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

