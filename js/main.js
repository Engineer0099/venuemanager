// Main JavaScript functionality for Venue Manager

// Global variables
let currentUser = null;
let venues = [];
let bookings = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadUserSession();
    loadVenues();
});

// Initialize application
function initializeApp() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.min = today;
    });
    
    // Initialize mobile navigation
    setupMobileNavigation();
}

// Setup event listeners
function setupEventListeners() {
    // Mobile navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu) {
                navMenu.classList.remove('active');
            }
            if (navToggle) {
                navToggle.classList.remove('active');
            }
        });
    });
    
    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
}

// Setup mobile navigation
function setupMobileNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
}

// Load user session
function loadUserSession() {
    const userData = localStorage.getItem('venueManagerUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        updateUIForLoggedInUser();
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    if (!currentUser) return;
    
    updateUserNavigation();
}

// Update user navigation based on login status
function updateUserNavigation() {
    const userMenu = document.getElementById('user-menu');
    const adminLink = document.getElementById('admin-link');
    const signInLink = document.querySelector('a[href="login.html"]');
    const userOnlyLinks = document.querySelectorAll('.user-only');
    
    if (currentUser) {
        // User is logged in
        if (userMenu) {
            userMenu.textContent = `Welcome, ${currentUser.fname}`;
            userMenu.style.display = 'block';
            document.getElementById('sign-in').style.display = 'none';
            userMenu.onclick = toggleUserDropdown;
        }
        
        if (signInLink) {
            signInLink.style.display = 'none';
        }
        
        // Show user-only links
        userOnlyLinks.forEach(link => {
            link.style.display = 'block';
        });
        
        // Show admin link for admins
        if (adminLink && currentUser.role === 'admin') {
            adminLink.style.display = 'block';
        }
    } else {
        // User is not logged in
        if (userMenu) {
            userMenu.style.display = 'none';
        }
        
        if (signInLink) {
            signInLink.style.display = 'block';
        }
        
        // Hide user-only links
        userOnlyLinks.forEach(link => {
            link.style.display = 'none';
        });
        
        if (adminLink) {
            adminLink.style.display = 'none';
        }
    }
}

// Show user dropdown menu
function showUserDropdown() {
    // Remove existing dropdown
    const existingDropdown = document.querySelector('.user-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
        return;
    }
    
    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';
    dropdown.innerHTML = `
        <div class="dropdown-content">
            <div class="dropdown-header">
                <div class="user-avatar">
                    <span>${currentUser.fname.charAt(0)}${currentUser.lname.charAt(0)}</span>
                </div>
                <div class="user-info">
                    <strong>${currentUser.fname} ${currentUser.lname}</strong>
                    <span>${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}</span>
                </div>
            </div>
            <div class="dropdown-divider"></div>
            <a href="profile.html" class="dropdown-item">
                👤 My Profile
            </a>
            <a href="my-bookings.html" class="dropdown-item">
                📅 My Bookings
            </a>
            ${currentUser.role === 'admin' ? '<a href="admin.html" class="dropdown-item">⚙️ Admin Panel</a>' : ''}
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item" onclick="logout()">
                🚪 Sign Out
            </a>
        </div>
    `;
    
    // Position dropdown
    const userMenu = document.getElementById('user-menu');
    const rect = userMenu.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top = (rect.bottom + 10) + 'px';
    dropdown.style.right = '20px';
    dropdown.style.zIndex = '1000';
    
    document.body.appendChild(dropdown);
    
    // Close dropdown when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
            if (!dropdown.contains(e.target) && e.target !== userMenu) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 100);
    
    addUserDropdownStyles();
}

// Show user menu
function showUserMenu(element) {
    const menu = document.createElement('div');
    menu.className = 'user-menu';
    menu.innerHTML = `
        <div class="user-menu-content">
            <a href="profile.html">My Profile</a>
            <a href="my-bookings.html">My Bookings</a>
            <a href="#" onclick="logout()">Logout</a>
        </div>
    `;
    
    // Position menu
    const rect = element.getBoundingClientRect();
    menu.style.position = 'absolute';
    menu.style.top = rect.bottom + 'px';
    menu.style.left = rect.left + 'px';
    menu.style.zIndex = '1001';
    
    document.body.appendChild(menu);
    
    // Remove menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function removeMenu(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', removeMenu);
            }
        });
    }, 100);
}

// Logout function
function logout() {
    localStorage.removeItem('venueManagerUser');
    currentUser = null;
    window.location.href = 'index.html';
}

// Load venues data
function loadVenues() {
    // Sample venue data
    venues = [
        {
            id: 1,
            name: 'Conference Room A',
            location: 'Building 1, Floor 2',
            capacity: 50,
            examCapacity1: 25,
            examCapacity2: 20,
            facilities: ['projector', 'computer', 'whiteboard'],
            image: 'images/classroom-modern.jpg',
            status: 'free'
        },
        {
            id: 2,
            name: 'Lecture Hall B',
            location: 'Building 2, Floor 1',
            capacity: 100,
            examCapacity1: 50,
            examCapacity2: 40,
            facilities: ['projector', 'whiteboard'],
            image: 'images/hero-meeting-room.webp',
            status: 'free'
        },
        {
            id: 3,
            name: 'Seminar Room C',
            location: 'Building 1, Floor 3',
            capacity: 30,
            examCapacity1: 15,
            examCapacity2: 12,
            facilities: ['computer', 'whiteboard'],
            image: 'images/classroom-modern.jpg',
            status: 'booked'
        },
        {
            id: 4,
            name: ''
        }
    ];
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Basic form validation
    if (!validateForm(form)) {
        return false;
    }
    
    // Show loading state
    showMessage('Processing...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        showMessage('Form submitted successfully!', 'success');
        form.reset();
    }, 1000);
}

// Validate form
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
    
    // Email validation
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        if (field.value && !isValidEmail(field.value)) {
            showFieldError(field, 'Please enter a valid email address');
            isValid = false;
        }
    });
    
    // Password confirmation
    const password = form.querySelector('input[name="password"]');
    const confirmPassword = form.querySelector('input[name="confirm-password"]');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
        showFieldError(confirmPassword, 'Passwords do not match');
        isValid = false;
    }
    
    return isValid;
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#e74c3c';
    errorDiv.style.fontSize = '0.9rem';
    errorDiv.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#e74c3c';
}

// Clear field error
function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.style.borderColor = '#e1e8ed';
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show message
function showMessage(text, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // Insert at top of main content
    const main = document.querySelector('main') || document.body;
    main.insertBefore(message, main.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(time) {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if user is lecturer (for booking restrictions)
function isLecturer() {
    return currentUser && currentUser.role === 'lecturer';
}

// Check if user is admin
function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation
function showLoading() {
    const loader = document.createElement('div');
    loader.id = 'loading';
    loader.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    `;
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('loading');
    if (loader) {
        loader.remove();
    }
}

// Add CSS for spinner
const spinnerCSS = `
.spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-spinner {
    text-align: center;
}

.user-menu {
    background: transparent;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    min-width: 150px;
}

.user-menu-content {
    padding: 0.5rem 0;
}

.user-menu-content a {
    display: block;
    padding: 0.5rem 1rem;
    color: #333;
    text-decoration: none;
    transition: background-color 0.3s ease;
}

.user-menu-content a:hover {
    background-color: #f8f9fa;
}
`;

// Add spinner CSS to head
const style = document.createElement('style');
style.textContent = spinnerCSS;
document.head.appendChild(style);



// Add user dropdown styles
function addUserDropdownStyles() {
    if (document.getElementById('user-dropdown-styles')) return;
    
    const dropdownCSS = `
        .user-dropdown {
            position: fixed;
            z-index: 1000;
        }
        
        .dropdown-content {
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            border: 1px solid #e1e8ed;
            min-width: 250px;
            overflow: hidden;
        }
        
        .dropdown-header {
            padding: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.9rem;
        }
        
        .user-info {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        
        .user-info strong {
            font-size: 1rem;
        }
        
        .user-info span {
            font-size: 0.8rem;
            opacity: 0.9;
        }
        
        .dropdown-divider {
            height: 1px;
            background: #e1e8ed;
            margin: 0.5rem 0;
        }
        
        .dropdown-item {
            display: block;
            padding: 0.75rem 1rem;
            color: #2c3e50;
            text-decoration: none;
            transition: background 0.3s ease;
            font-size: 0.9rem;
        }
        
        .dropdown-item:hover {
            background: #f8f9fa;
            color: #667eea;
        }
        
        .dropdown-item:last-child {
            color: #e74c3c;
        }
        
        .dropdown-item:last-child:hover {
            background: #fdf2f2;
            color: #c0392b;
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'user-dropdown-styles';
    style.textContent = dropdownCSS;
    document.head.appendChild(style);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('venueManagerUser');
        currentUser = null;
        
        // Remove any existing dropdown
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
            dropdown.remove();
        }
        
        showMessage('You have been signed out successfully', 'success');
        
        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}
// Add event listener for user menu click
document.getElementById('user-menu').addEventListener('click', function(event) {
    event.preventDefault();
    if (currentUser) {
        showUserDropdown();
    } else {
        window.location.href = 'login.html';
    }
});

// Add event listener for profile link click
document.getElementById('profile').addEventListener('click', function(event) {
    event.preventDefault();
    if (currentUser) {
        window.location.href = 'profile.html';
    } else {
        showMessage('Please sign in to access your profile', 'warning');
        window.location.href = 'login.html';
    }
});

// Add event listener for 

