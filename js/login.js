// Login functionality for Venue Manager

// Demo accounts for testing
const demoAccounts = {
    lecturer: {
        user_id: 1001,
        fname: 'Daud',
        lname: 'Seleman',
        email: 'daud.seleman@gmail.com',
        role: 'lecturer',
        department: 'Computer Science',
        title: 'Dr.'
    },
    admin: {
        user_id: 1002,
        fname: 'Frank',
        lname: 'Tarimo',
        email: 'engineerfm99@gmail.com',
        role: 'admin',
        department: 'Administration',
        title: 'Prof.'
    },
    student: {
        user_id: 1003,
        fname: 'Jackline',
        lname: 'Kisela',
        email: 'jackline.kisela@gmail.com',
        role: 'student',
        department: 'Information Technology',
        studentId: '03.9876.02.01.2024'
    }
};

// Initialize login page
document.addEventListener('DOMContentLoaded', function() {
    setupLoginEventListeners();
    checkExistingUser();
    createDemoAccounts();
});

// Setup login event listeners
function setupLoginEventListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    const quickSignupForm = document.getElementById('quick-signup-form');
    if (quickSignupForm) {
        quickSignupForm.addEventListener('submit', handleQuickSignupSubmit);
    }
}

// Check if user is already logged in
function checkExistingUser() {
    if (currentUser) {
        showMessage('You are already logged in', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

// Create demo accounts in localStorage if they don't exist
function createDemoAccounts() {
    let users = JSON.parse(localStorage.getItem('venueManagerUsers') || '[]');
    
    Object.values(demoAccounts).forEach(demoUser => {
        const existingUser = users.find(user => user.email === demoUser.email);
        if (!existingUser) {
            const userWithPassword = {
                ...demoUser,
                password: 'demo123', // Demo password
                createdAt: new Date().toISOString()
            };
            users.push(userWithPassword);
        }
    });
    
    localStorage.setItem('venueManagerUsers', JSON.stringify(users));
}

// Show login form
function showLoginForm() {
    document.getElementById('login-form-container').style.display = 'block';
    document.getElementById('signup-form-container').style.display = 'none';
    
    // Update tab styles
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    tabs[0].classList.add('active');
}

// Show signup form
function showSignupForm() {
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('signup-form-container').style.display = 'block';
    
    // Update tab styles
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    tabs[1].classList.add('active');
}

// Handle login form submission
function handleLoginSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const remember = formData.get('remember');
    
    // Validate form
    if (!email || !password) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        
        // Check credentials
        const users = JSON.parse(localStorage.getItem('venueManagerUsers') || '[]');
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        
        if (user) {
            // Successful login
            const userForSession = { ...user };
            delete userForSession.password; // Don't store password in session
            
            localStorage.setItem('venueManagerUser', JSON.stringify(userForSession));
            currentUser = userForSession;
            
            showMessage(`Welcome back, ${user.fname}!`, 'success');
            
            // Redirect based on role
            setTimeout(() => {
                if (user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1500);
        } else {
            showMessage('Invalid email or password', 'error');
        }
    }, 1500);
}

// Handle quick signup form submission
function handleQuickSignupSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        fname: formData.get('fname'),
        lname: formData.get('lname'),
        email: formData.get('email'),
        role: formData.get('role'),
        password: formData.get('password'),
        createdAt: new Date().toISOString()
    };
    
    // Validate form
    if (!validateQuickSignupForm(formData)) {
        return;
    }
    
    // Show loading
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        
        // Save user
        let users = JSON.parse(localStorage.getItem('venueManagerUsers') || '[]');
        users.push(userData);
        localStorage.setItem('venueManagerUsers', JSON.stringify(users));
        
        // Auto-login
        const userForSession = { ...userData };
        delete userForSession.password;
        localStorage.setItem('venueManagerUser', JSON.stringify(userForSession));
        currentUser = userForSession;
        
        showMessage('Account created successfully! Welcome to Venue Manager.', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }, 1500);
}

// Validate quick signup form
function validateQuickSignupForm(formData) {
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm-password');
    
    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('venueManagerUsers') || '[]');
    const emailExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());
    
    if (emailExists) {
        showMessage('An account with this email already exists', 'error');
        return false;
    }
    
    // Check password match
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return false;
    }
    
    // Check password strength
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return false;
    }
    
    return true;
}

// Login as demo user
function loginAsDemo(role) {
    const demoUser = demoAccounts[role];
    if (!demoUser) return;
    
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        
        localStorage.setItem('venueManagerUser', JSON.stringify(demoUser));
        currentUser = demoUser;
        
        showMessage(`Logged in as demo ${role}`, 'success');
        
        setTimeout(() => {
            if (role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 1500);
    }, 1000);
}

// Show forgot password modal
function showForgotPassword() {
    const modal = document.createElement('div');
    modal.className = 'forgot-password-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Reset Password</h2>
                <button class="modal-close" onclick="closeForgotPasswordModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="forgot-password-form">
                    <div class="form-group">
                        <label for="reset-email">Email Address</label>
                        <input type="email" id="reset-email" name="email" required>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            Send Reset Link
                        </button>
                    </div>
                </form>
                <p class="text-center">
                    <small>For demo purposes, use password "demo123" for all demo accounts.</small>
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listener for form submission
    const forgotForm = document.getElementById('forgot-password-form');
    forgotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        showMessage('Password reset link sent to your email (demo mode)', 'success');
        closeForgotPasswordModal();
    });
    
    addForgotPasswordModalStyles();
}

// Close forgot password modal
function closeForgotPasswordModal() {
    const modal = document.querySelector('.forgot-password-modal');
    if (modal) {
        modal.remove();
    }
}

// Add forgot password modal styles
function addForgotPasswordModalStyles() {
    if (document.getElementById('forgot-password-modal-styles')) return;
    
    const modalCSS = `
        .forgot-password-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .forgot-password-modal .modal-content {
            max-width: 400px;
            width: 90%;
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'forgot-password-modal-styles';
    style.textContent = modalCSS;
    document.head.appendChild(style);
}

// Add auth page styles
const authCSS = `
    .auth-container {
        max-width: 500px;
        margin: 2rem auto;
        background: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        overflow: hidden;
    }
    
    .auth-tabs {
        display: flex;
        background: #f8f9fa;
    }
    
    .auth-tab {
        flex: 1;
        padding: 1rem;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
        color: #5a6c7d;
        transition: all 0.3s ease;
    }
    
    .auth-tab.active {
        background: white;
        color: #667eea;
        border-bottom: 2px solid #667eea;
    }
    
    .auth-tab:hover {
        background: rgba(102, 126, 234, 0.1);
    }
    
    .auth-container .form-container {
        margin: 0;
        box-shadow: none;
        border-radius: 0;
    }
    
    .form-links {
        text-align: center;
        margin-top: 1rem;
    }
    
    .form-links a {
        color: #667eea;
        text-decoration: none;
        font-size: 0.9rem;
    }
    
    .form-links a:hover {
        text-decoration: underline;
    }
    
    .demo-accounts {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #e1e8ed;
    }
    
    .demo-accounts h3 {
        color: #2c3e50;
        margin-bottom: 0.5rem;
        font-size: 1.1rem;
    }
    
    .demo-accounts p {
        color: #5a6c7d;
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }
    
    .demo-account-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .demo-account-buttons .btn {
        padding: 0.75rem;
        font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
        .auth-container {
            margin: 1rem;
        }
        
        .auth-tab {
            padding: 0.75rem;
            font-size: 0.9rem;
        }
    }
`;

// Add auth CSS to head
const authStyle = document.createElement('style');
authStyle.textContent = authCSS;
document.head.appendChild(authStyle);

