// Signup functionality for Venue Manager

// Initialize signup page
document.addEventListener('DOMContentLoaded', function() {
    setupSignupEventListeners();
    checkExistingUser();
});

// Setup signup event listeners
function setupSignupEventListeners() {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignupSubmit);
    }
    
    // Show/hide student ID field based on role
    const roleSelect = document.getElementById('role');
    if (roleSelect) {
        roleSelect.addEventListener('change', toggleStudentIdField);
    }
    
    // Real-time password validation
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePassword);
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordConfirmation);
    }
    
    // Email validation
    // const emailInput = document.getElementById('email');
    // if (emailInput) {
    //     emailInput.addEventListener('blur', validateEmailUnique);
    // }
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

// Toggle student ID field based on role
function toggleStudentIdField() {
    const roleSelect = document.getElementById('role');
    const studentIdGroup = document.getElementById('student-id-group');
    const studentIdInput = document.getElementById('student-id');
    
    if (roleSelect.value === 'student') {
        studentIdGroup.style.display = 'block';
        studentIdInput.required = true;
    } else {
        studentIdGroup.style.display = 'none';
        studentIdInput.required = false;
        studentIdInput.value = '';
    }
}
// Clear field error
function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.style.borderColor = '#e1e8ed';
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
    background: white;
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
const styles = document.getElementById('style');
styles.textContent = spinnerCSS;



// Validate password strength
function validatePassword() {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;
    
    clearFieldError(passwordInput);
    
    if (password.length < 8) {
        showFieldError(passwordInput, 'Password must be at least 8 characters long');
        return false;
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
        showFieldError(passwordInput, 'Password must contain at least one lowercase letter');
        return false;
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
        showFieldError(passwordInput, 'Password must contain at least one uppercase letter');
        return false;
    }
    
    if (!/(?=.*\d)/.test(password)) {
        showFieldError(passwordInput, 'Password must contain at least one number');
        return false;
    }
    
    return true;
}

// Validate password confirmation
function validatePasswordConfirmation() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    clearFieldError(confirmPasswordInput);
    
    if (passwordInput.value !== confirmPasswordInput.value) {
        showFieldError(confirmPasswordInput, 'Passwords do not match');
        return false;
    }
    
    return true;
}



// Validate email uniqueness
function validateEmailUnique() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value;
    
    if (!email) return;
    // Check against existing users in localStorage
    //modify
    const existingUsers = JSON.parse(localStorage.getItem('venueManagerUsers') || '[]');
    if(existingUsers.length !== 0){
        existingUsers.forEach(user => {
            alert(user.email);
        });
    }
    // const emailExists = existingUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
    
    let emailExists;
    existingUsers.forEach(user =>{
        if(user.email === email){
            emailExists = true;
        }else{
            emailExists = false;
        }
    });

    clearFieldError(emailInput);
    
    if (emailExists) {
        showFieldError(emailInput, 'An account with this email already exists');
        return false;
    }
    return true;
}

// Handle signup form submission
function handleSignupSubmit(event) {
    event.preventDefault();
    alert('handling signupSubmit.........');
    
    // Validate form
    if (!validateSignupForm()) {
        alert('not valid signup form......');
        return;
    }
    alert('valid signup form.........');
    
    // Get form data
    const formData = new FormData(event.target);
    // const userData = {
    //     firstName: formData.get('fname'),
    //     lastName: formData.get('lname'),
    //     email: formData.get('email'),
    //     phone: formData.get('phone'),
    //     gender: formData.get('gender'),
    //     title: formData.get('title'),
    //     role: formData.get('role'),
    //     department: formData.get('department'),
    //     studentId: formData.get('student-id'),
    //     profilePic: formData.get('profile-pic') ?? null, 
    //     password: formData.get('password'), 
    //     createdAt: new Date().toISOString()
    // };
    
    // Show loading
    
    const userData = Object.fromEntries(formData.entries());

    alert(userData.email);

    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        
        // Save user to localStorage
        saveUser(userData);
        
        // Auto-login the user
        const userForSession = { ...userData };
        delete userForSession.password; // Don't store password in session
        let empty = {};
        localStorage.setItem('venueManagerUser', JSON.stringify(empty))
        localStorage.setItem('venueManagerUser', JSON.stringify(userForSession));
        currentUser = userForSession;
        alert(`${currentUser.fname} is current user`);

        // Show success message
        // showMessage('Account created successfully! Welcome to Venue Manager.', 'success');
        alert('redirect.....');
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    }, 2000);
}

// Validate signup form
function validateSignupForm() {
    const form = document.getElementById('signup-form');
    let isValid = true;
    
    // Clear previous errors
    const errorElements = form.querySelectorAll('.field-error');
    errorElements.forEach(error => error.remove());
    
    // Required fields validation
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
            alert(`${field} is missing`);
        }
    });
    alert('all requred field are there...');

    // Validate email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    
    // Email validation
    const emailInput = document.getElementById('email');
    if (emailInput.value && !isValidEmail(emailInput.value)) {
        showFieldError(emailInput, 'Please enter a valid email address');
        isValid = false;
        alert('invalid email....');
    }
    alert('valid email....');
    
    // Email uniqueness validation
    if (!validateEmailUnique()) {
        isValid = false;
        alert('not unique email.....');
    }
    alert('unique email....');
    
    
    // Password validation
    if (!validatePassword()) {
        isValid = false;
        alert('invalid password......');
    }
    alert('valid password.......');
    
    // Password confirmation validation
    if (!validatePasswordConfirmation()) {
        isValid = false;
        alert('invalid comfirm password......');
    }
    alert('valid comfirm password......');
    
    // Phone number validation (if provided)
    const phoneInput = document.getElementById('phone');
    if (phoneInput.value && !isValidPhone(phoneInput.value)) {
        showFieldError(phoneInput, 'Please enter a valid phone number');
        isValid = false;
        alert('invalid phone number......');
    }
    alert('valid phone.......');
    
    // Student ID validation (if student role)
    const roleSelect = document.getElementById('role');
    const studentIdInput = document.getElementById('student-id');
    if (roleSelect.value === 'student' && !studentIdInput.value.trim()) {
        showFieldError(studentIdInput, 'Student ID is required for students');
        isValid = false;
        alert('invalid student id......');
    }
    alert('all are valid......');
    if (isValid == true){
        alert('is valid');
    }else{
        alert('not valid.');
    }
    return isValid;
}

// Validate phone number
function isValidPhone(phone) {
    // Simple phone validation - accepts various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
}

// Save user to localStorage
function saveUser(userData) {
    alert('register.......');
    let users = JSON.parse(localStorage.getItem('venueManagerUsers') || '[]');
    users.push(userData);
    alert(typeof userData);
    localStorage.setItem('venueManagerUsers', JSON.stringify(users));

    alert(typeof userData);
    const response = registerUser(userData);
    async function registerUser(userData) {
        try {
            const res = await fetch('http://localhost/venue-manager/api/users/create.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: userData
            });
            if (res.ok){
                return true
            }else{
                return false
            }
        } catch (error) {
            console.error('Error Registering User:', error);
            throw error;
        }
    }

    if(response){
        alert('registerd......');
    }else{
        alert('error.....');
    }

    alert('New User is registerd....');
    alert(userData.fname);
}

// Handle profile picture upload
function handleProfilePicUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showMessage('Please select a valid image file', 'error');
        event.target.value = '';
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showMessage('Image file size must be less than 5MB', 'error');
        event.target.value = '';
        return;
    }
    
    // In a real application, you would upload the file to a server
    // For demo purposes, we'll just show a preview
    const reader = new FileReader();
    reader.onload = function(e) {
        showImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Show image preview
function showImagePreview(imageSrc) {
    // Remove existing preview
    const existingPreview = document.getElementById('image-preview');
    if (existingPreview) {
        existingPreview.remove();
    }
    
    // Create preview element
    const preview = document.createElement('div');
    preview.id = 'image-preview';
    preview.innerHTML = `
        <div class="image-preview">
            <img src="${imageSrc}" alt="Profile Preview" class="preview-image">
            <button type="button" class="btn btn-outline btn-small" onclick="removeImagePreview()">
                Remove
            </button>
        </div>
    `;
    
    // Insert after file input
    const fileInput = document.getElementById('profile-pic');
    fileInput.parentNode.insertBefore(preview, fileInput.nextSibling);
}

// Remove image preview
function removeImagePreview() {
    const preview = document.getElementById('image-preview');
    const fileInput = document.getElementById('profile-pic');
    
    if (preview) {
        preview.remove();
    }
    
    if (fileInput) {
        fileInput.value = '';
    }
}

// Add event listener for profile picture upload
document.addEventListener('DOMContentLoaded', function() {
    const profilePicInput = document.getElementById('profile-pic');
    if (profilePicInput) {
        profilePicInput.addEventListener('change', handleProfilePicUpload);
    }
});

// Add styles for image preview
const previewCSS = `
    .image-preview {
        margin-top: 1rem;
        text-align: center;
    }
    
    .preview-image {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 50%;
        border: 3px solid #667eea;
        margin-bottom: 0.5rem;
        display: block;
        margin-left: auto;
        margin-right: auto;
    }
    
    .btn-small {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }
    
    .form-group input[type="file"] {
        padding: 8px;
        border: 2px dashed #e1e8ed;
        border-radius: 5px;
        background-color: #f8f9fa;
        cursor: pointer;
        transition: border-color 0.3s ease;
    }
    
    .form-group input[type="file"]:hover {
        border-color: #667eea;
    }
    
    .form-group input[type="file"]:focus {
        outline: none;
        border-color: #667eea;
        background-color: white;
    }
`;

// Add preview CSS to head
const style = document.createElement('style');
style.textContent = previewCSS;
document.head.appendChild(style);

