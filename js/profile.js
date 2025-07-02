// Profile page functionality for Venue Manager

let userProfile = {};
let originalProfile = {};

// Initialize profile page
document.addEventListener('DOMContentLoaded', function() {
    checkUserAccess();
    loadUserProfile();
    setupProfileEventListeners();
    updateProfileStats();
});

// Check if user is logged in
function checkUserAccess() {
    if (!currentUser) {
        showMessage('Please sign in to access your profile', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
}

// Load user profile data
function loadUserProfile() {
    userProfile = { ...currentUser };
    originalProfile = { ...currentUser };
    
    // Load additional profile data from localStorage
    const savedProfile = localStorage.getItem(`profile_${currentUser.id}`);
    if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        userProfile = { ...userProfile, ...profileData };
        originalProfile = { ...userProfile };
    }
    
    populateProfileData();
}

// Populate profile data in the UI
function populateProfileData() {
    // Header information
    document.getElementById('profile-name').textContent = `${userProfile.firstName} ${userProfile.lastName}`;
    document.getElementById('profile-role').textContent = userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1);
    document.getElementById('profile-email').textContent = userProfile.email;
    
    // Avatar initials
    const initials = `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase();
    document.getElementById('avatar-initials').textContent = initials;
    
    // Personal information form
    document.getElementById('first-name').value = userProfile.firstName || '';
    document.getElementById('last-name').value = userProfile.lastName || '';
    document.getElementById('title').value = userProfile.title || '';
    document.getElementById('phone').value = userProfile.phone || '';
    document.getElementById('department').value = userProfile.department || '';
    document.getElementById('bio').value = userProfile.bio || '';
    
    // Show student ID field for students
    if (userProfile.role === 'student') {
        document.getElementById('student-id-group').style.display = 'block';
        document.getElementById('student-id').value = userProfile.studentId || '';
    }
    
    // Account settings
    document.getElementById('email').value = userProfile.email || '';
    document.getElementById('role-display').value = userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1);
    document.getElementById('language').value = userProfile.language || 'en';
    document.getElementById('timezone').value = userProfile.timezone || 'UTC';
    
    // Preferences
    loadPreferences();
    
    // Update navigation
    updateUserNavigation();
}

// Load user preferences
function loadPreferences() {
    const preferences = userProfile.preferences || {};
    
    // Email notifications
    document.querySelector('input[name="emailBookingConfirmation"]').checked = preferences.emailBookingConfirmation !== false;
    document.querySelector('input[name="emailBookingReminders"]').checked = preferences.emailBookingReminders !== false;
    document.querySelector('input[name="emailBookingChanges"]').checked = preferences.emailBookingChanges !== false;
    document.querySelector('input[name="emailSystemUpdates"]').checked = preferences.emailSystemUpdates || false;
    
    // Booking preferences
    document.getElementById('default-duration').value = preferences.defaultDuration || '60';
    document.querySelector('input[name="autoFillBookingDetails"]').checked = preferences.autoFillBookingDetails !== false;
    document.querySelector('input[name="showAvailabilityHints"]').checked = preferences.showAvailabilityHints !== false;
    
    // Display preferences
    document.getElementById('theme').value = preferences.theme || 'light';
    document.getElementById('date-format').value = preferences.dateFormat || 'MM/DD/YYYY';
    document.getElementById('time-format').value = preferences.timeFormat || '12';
}

// Setup event listeners
function setupProfileEventListeners() {
    // Personal information form
    const personalForm = document.getElementById('personal-info-form');
    if (personalForm) {
        personalForm.addEventListener('submit', handlePersonalInfoSubmit);
    }
    
    // Account settings form
    const accountForm = document.getElementById('account-settings-form');
    if (accountForm) {
        accountForm.addEventListener('submit', handleAccountSettingsSubmit);
    }
    
    // Preferences form
    const preferencesForm = document.getElementById('preferences-form');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', handlePreferencesSubmit);
    }
    
    // Password form
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordSubmit);
    }
}

// Show profile tab
function showProfileTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.profile-tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.profile-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab content
    const selectedContent = document.getElementById(`${tabName}-tab`);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
    
    // Add active class to selected tab
    const selectedTab = event.target;
    selectedTab.classList.add('active');
}

// Handle personal information form submission
function handlePersonalInfoSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const updatedData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        title: formData.get('title'),
        phone: formData.get('phone'),
        department: formData.get('department'),
        bio: formData.get('bio')
    };
    
    // Update user profile
    Object.assign(userProfile, updatedData);
    
    // Update current user session
    Object.assign(currentUser, {
        firstName: updatedData.firstName,
        lastName: updatedData.lastName
    });
    
    // Save to localStorage
    saveProfileData();
    
    // Update UI
    populateProfileData();
    
    showMessage('Personal information updated successfully', 'success');
}

// Handle account settings form submission
function handleAccountSettingsSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const updatedData = {
        email: formData.get('email'),
        language: formData.get('language'),
        timezone: formData.get('timezone')
    };
    
    // Check if email changed
    if (updatedData.email !== userProfile.email) {
        // In a real app, this would require email verification
        showMessage('Email change requires verification (demo mode)', 'info');
    }
    
    // Update user profile
    Object.assign(userProfile, updatedData);
    Object.assign(currentUser, { email: updatedData.email });
    
    // Save to localStorage
    saveProfileData();
    
    showMessage('Account settings updated successfully', 'success');
}

// Handle preferences form submission
function handlePreferencesSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const preferences = {
        emailBookingConfirmation: formData.get('emailBookingConfirmation') === 'on',
        emailBookingReminders: formData.get('emailBookingReminders') === 'on',
        emailBookingChanges: formData.get('emailBookingChanges') === 'on',
        emailSystemUpdates: formData.get('emailSystemUpdates') === 'on',
        defaultDuration: formData.get('defaultDuration'),
        autoFillBookingDetails: formData.get('autoFillBookingDetails') === 'on',
        showAvailabilityHints: formData.get('showAvailabilityHints') === 'on',
        theme: formData.get('theme'),
        dateFormat: formData.get('dateFormat'),
        timeFormat: formData.get('timeFormat')
    };
    
    userProfile.preferences = preferences;
    
    // Apply theme change
    applyTheme(preferences.theme);
    
    // Save to localStorage
    saveProfileData();
    
    showMessage('Preferences updated successfully', 'success');
}

// Handle password form submission
function handlePasswordSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
        showMessage('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showMessage('Password must be at least 8 characters long', 'error');
        return;
    }
    
    // In demo mode, just show success
    showMessage('Password changed successfully', 'success');
    
    // Clear form
    event.target.reset();
}

// Reset personal information form
function resetPersonalForm() {
    document.getElementById('first-name').value = originalProfile.firstName || '';
    document.getElementById('last-name').value = originalProfile.lastName || '';
    document.getElementById('title').value = originalProfile.title || '';
    document.getElementById('phone').value = originalProfile.phone || '';
    document.getElementById('department').value = originalProfile.department || '';
    document.getElementById('bio').value = originalProfile.bio || '';
    
    showMessage('Form reset to original values', 'info');
}

// Change avatar (placeholder function)
function changeAvatar() {
    showMessage('Avatar upload feature coming soon', 'info');
}

// Apply theme
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (theme === 'light') {
        document.body.classList.remove('dark-theme');
    } else if (theme === 'auto') {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }
}

// Update profile statistics
function updateProfileStats() {
    const bookings = JSON.parse(localStorage.getItem('venueManagerBookings') || '[]');
    const userBookings = bookings.filter(booking => booking.userId === currentUser.id);
    
    const now = new Date();
    const activeBookings = userBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= now;
    });
    
    document.getElementById('total-bookings').textContent = userBookings.length;
    document.getElementById('active-bookings').textContent = activeBookings.length;
    
    // Member since (use creation date or current year)
    const memberSince = currentUser.createdAt ? new Date(currentUser.createdAt).getFullYear() : new Date().getFullYear();
    document.getElementById('member-since').textContent = memberSince;
}

// Save profile data to localStorage
function saveProfileData() {
    localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(userProfile));
    localStorage.setItem('venueManagerUser', JSON.stringify(currentUser));
}

// Logout from all sessions
function logoutAllSessions() {
    if (confirm('Are you sure you want to logout from all other sessions?')) {
        showMessage('Logged out from all other sessions', 'success');
    }
}

// Show delete account modal
function showDeleteAccountModal() {
    const modal = document.createElement('div');
    modal.className = 'delete-account-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Delete Account</h2>
                <button class="modal-close" onclick="closeDeleteAccountModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="warning-message">
                    <strong>⚠️ Warning: This action cannot be undone!</strong>
                    <p>Deleting your account will permanently remove:</p>
                    <ul>
                        <li>Your profile and personal information</li>
                        <li>All your booking history</li>
                        <li>Your preferences and settings</li>
                        <li>Any associated data</li>
                    </ul>
                </div>
                <form id="delete-account-form">
                    <div class="form-group">
                        <label for="delete-confirmation">Type "DELETE" to confirm:</label>
                        <input type="text" id="delete-confirmation" name="confirmation" required>
                    </div>
                    <div class="form-group">
                        <label for="delete-password">Enter your password:</label>
                        <input type="password" id="delete-password" name="password" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="closeDeleteAccountModal()">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-danger">
                            Delete Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listener for form submission
    const deleteForm = document.getElementById('delete-account-form');
    deleteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const confirmation = document.getElementById('delete-confirmation').value;
        if (confirmation === 'DELETE') {
            showMessage('Account deletion is disabled in demo mode', 'info');
            closeDeleteAccountModal();
        } else {
            showMessage('Please type "DELETE" to confirm', 'error');
        }
    });
    
    addDeleteAccountModalStyles();
}

// Close delete account modal
function closeDeleteAccountModal() {
    const modal = document.querySelector('.delete-account-modal');
    if (modal) {
        modal.remove();
    }
}

// Add delete account modal styles
function addDeleteAccountModalStyles() {
    if (document.getElementById('delete-account-modal-styles')) return;
    
    const modalCSS = `
        .delete-account-modal {
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
        
        .delete-account-modal .modal-content {
            max-width: 500px;
            width: 90%;
        }
        
        .warning-message {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .warning-message strong {
            color: #856404;
        }
        
        .warning-message ul {
            margin: 0.5rem 0 0 1rem;
            color: #856404;
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'delete-account-modal-styles';
    style.textContent = modalCSS;
    document.head.appendChild(style);
}

// Add profile page styles
const profileCSS = `
    .profile-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 3rem 2rem;
        border-radius: 15px;
        margin-bottom: 2rem;
        display: flex;
        align-items: center;
        gap: 2rem;
        flex-wrap: wrap;
    }
    
    .profile-avatar {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }
    
    .avatar-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        font-weight: bold;
        border: 4px solid rgba(255,255,255,0.3);
    }
    
    .avatar-upload-btn {
        background: rgba(255,255,255,0.2);
        border: 2px solid rgba(255,255,255,0.3);
        color: white;
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }
    
    .avatar-upload-btn:hover {
        background: rgba(255,255,255,0.3);
    }
    
    .profile-info {
        flex: 1;
        min-width: 300px;
    }
    
    .profile-info h1 {
        margin: 0 0 0.5rem 0;
        font-size: 2.5rem;
    }
    
    .profile-role {
        font-size: 1.2rem;
        margin: 0 0 0.5rem 0;
        opacity: 0.9;
        text-transform: capitalize;
    }
    
    .profile-email {
        font-size: 1rem;
        margin: 0 0 2rem 0;
        opacity: 0.8;
    }
    
    .profile-stats {
        display: flex;
        gap: 2rem;
        flex-wrap: wrap;
    }
    
    .stat-item {
        text-align: center;
    }
    
    .stat-number {
        display: block;
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 0.25rem;
    }
    
    .stat-label {
        font-size: 0.9rem;
        opacity: 0.8;
    }
    
    .profile-content {
        background: white;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        overflow: hidden;
    }
    
    .profile-tabs {
        display: flex;
        background: #f8f9fa;
        border-bottom: 1px solid #e1e8ed;
        overflow-x: auto;
    }
    
    .profile-tab {
        flex: 1;
        padding: 1rem 1.5rem;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
        color: #5a6c7d;
        transition: all 0.3s ease;
        white-space: nowrap;
        min-width: 150px;
    }
    
    .profile-tab.active {
        background: white;
        color: #667eea;
        border-bottom: 3px solid #667eea;
    }
    
    .profile-tab:hover {
        background: rgba(102, 126, 234, 0.1);
    }
    
    .profile-tab-content {
        display: none;
        padding: 2rem;
    }
    
    .profile-tab-content.active {
        display: block;
    }
    
    .profile-section {
        max-width: 800px;
    }
    
    .profile-section h2 {
        color: #2c3e50;
        margin-bottom: 2rem;
        font-size: 1.8rem;
    }
    
    .profile-section h3 {
        color: #2c3e50;
        margin-bottom: 1rem;
        font-size: 1.3rem;
    }
    
    .profile-form {
        margin-bottom: 2rem;
    }
    
    .preference-group {
        margin-bottom: 2rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid #e1e8ed;
    }
    
    .preference-group:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }
    
    .security-section {
        margin-bottom: 3rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid #e1e8ed;
    }
    
    .security-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }
    
    .session-list {
        margin-bottom: 1.5rem;
    }
    
    .session-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid #e1e8ed;
        border-radius: 5px;
        margin-bottom: 1rem;
    }
    
    .session-item.current {
        background: #f8f9fa;
        border-color: #667eea;
    }
    
    .session-info strong {
        color: #2c3e50;
    }
    
    .session-info p {
        margin: 0.25rem 0;
        color: #5a6c7d;
    }
    
    .session-info small {
        color: #95a5a6;
    }
    
    .session-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    .session-badge.current {
        background: #667eea;
        color: white;
    }
    
    .danger-zone {
        border: 2px solid #e74c3c;
        border-radius: 10px;
        padding: 2rem;
        background: #fdf2f2;
    }
    
    .danger-zone h3 {
        color: #e74c3c;
        margin-bottom: 1rem;
    }
    
    .danger-actions {
        margin-top: 1rem;
    }
    
    .danger-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 2rem;
        flex-wrap: wrap;
    }
    
    .danger-info strong {
        color: #e74c3c;
    }
    
    .danger-info p {
        margin: 0.5rem 0 0 0;
        color: #721c24;
    }
    
    .btn-danger {
        background: #e74c3c;
        color: white;
        border: 2px solid #e74c3c;
    }
    
    .btn-danger:hover {
        background: #c0392b;
        border-color: #c0392b;
    }
    
    @media (max-width: 768px) {
        .profile-header {
            flex-direction: column;
            text-align: center;
            padding: 2rem 1rem;
        }
        
        .profile-info h1 {
            font-size: 2rem;
        }
        
        .profile-stats {
            justify-content: center;
        }
        
        .profile-tabs {
            flex-direction: column;
        }
        
        .profile-tab {
            min-width: auto;
        }
        
        .profile-tab-content {
            padding: 1.5rem;
        }
        
        .danger-item {
            flex-direction: column;
            align-items: stretch;
        }
        
        .stat-item {
            min-width: 80px;
        }
    }
    
    @media (max-width: 480px) {
        .avatar-circle {
            width: 100px;
            height: 100px;
            font-size: 2.5rem;
        }
        
        .profile-info h1 {
            font-size: 1.8rem;
        }
        
        .profile-stats {
            gap: 1rem;
        }
        
        .stat-number {
            font-size: 1.5rem;
        }
    }
`;

// Add profile CSS to head
const profileStyle = document.createElement('style');
profileStyle.textContent = profileCSS;
document.head.appendChild(profileStyle);

