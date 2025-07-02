// Admin page functionality for Venue Manager

let timetableEntries = [];
let issues = [];
let currentTimetableView = 'week';
let currentWeekStart = new Date();

// Initialize admin page
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();
    initializeAdminData();
    setupAdminEventListeners();
    updateAdminStats();
    loadTimetableData();
    loadIssuesData();
    showAdminTab('dashboard');
});

// Check if user has admin access
function checkAdminAccess() {
    if (!currentUser || currentUser.role !== 'admin') {
        showMessage('Access denied. Admin privileges required.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
}

// Initialize admin data
function initializeAdminData() {
    // Set current week start to Monday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() + daysToMonday);
    currentWeekStart.setHours(0, 0, 0, 0);
}

// Setup event listeners
function setupAdminEventListeners() {
    // Update navigation
    updateUserNavigation();
}

// Show admin tab
function showAdminTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.admin-tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab content
    const selectedContent = document.getElementById(`${tabName}-tab`);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
    
    // Add active class to selected tab
    const selectedTab = event.target;
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Load tab-specific data
    switch (tabName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'timetable':
            displayTimetable();
            break;
        case 'issues':
            displayIssues();
            break;
    }
}

// Update admin statistics
function updateAdminStats() {
    // Get data from localStorage
    const allBookings = JSON.parse(localStorage.getItem('venueManagerBookings') || '[]');
    const venues = 8; // Static for demo
    const users = 156; // Static for demo
    
    // Calculate active bookings
    const now = new Date();
    const activeBookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= now && booking.status !== 'cancelled';
    });
    
    // Update stats
    document.getElementById('total-venues').textContent = venues;
    document.getElementById('total-bookings').textContent = activeBookings.length;
    document.getElementById('open-issues').textContent = issues.filter(issue => issue.status === 'open').length;
    document.getElementById('total-users').textContent = users;
}

// Load dashboard data
function loadDashboardData() {
    loadRecentBookings();
    updateChart();
}

// Load recent bookings
function loadRecentBookings() {
    const allBookings = JSON.parse(localStorage.getItem('venueManagerBookings') || '[]');
    const recentBookings = allBookings
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    const recentBookingsList = document.getElementById('recent-bookings-list');
    if (!recentBookingsList) return;
    
    if (recentBookings.length === 0) {
        recentBookingsList.innerHTML = '<p class="no-data">No recent bookings</p>';
        return;
    }
    
    recentBookingsList.innerHTML = recentBookings.map(booking => `
        <div class="recent-item">
            <div class="recent-info">
                <strong>${booking.venueName}</strong>
                <p>${booking.bookedBy} • ${formatDate(booking.date)} ${formatTime(booking.startTime)}</p>
            </div>
            <span class="status-badge ${booking.status}">${booking.status}</span>
        </div>
    `).join('');
}

// Refresh recent bookings
function refreshRecentBookings() {
    loadRecentBookings();
    showMessage('Recent bookings refreshed', 'success');
}

// Update chart
function updateChart() {
    // Simple chart implementation using canvas
    const canvas = document.getElementById('bookingChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Sample data for demonstration
    const data = [12, 19, 15, 25, 22, 18, 28];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxValue = Math.max(...data);
    
    // Draw bars
    const barWidth = width / data.length * 0.8;
    const barSpacing = width / data.length * 0.2;
    
    ctx.fillStyle = '#667eea';
    data.forEach((value, index) => {
        const barHeight = (value / maxValue) * (height - 60);
        const x = index * (barWidth + barSpacing) + barSpacing / 2;
        const y = height - barHeight - 30;
        
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw labels
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], x + barWidth / 2, height - 10);
        ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
        
        ctx.fillStyle = '#667eea';
    });
}

// TIMETABLE MANAGEMENT FUNCTIONS

// Load timetable data
function loadTimetableData() {
    // Load from localStorage or create sample data
    const savedTimetable = localStorage.getItem('venueManagerTimetable');
    if (savedTimetable) {
        timetableEntries = JSON.parse(savedTimetable);
    } else {
        // Create sample timetable data
        createSampleTimetableData();
    }
}

// Create sample timetable data
function createSampleTimetableData() {
    const sampleEntries = [
        {
            id: Date.now() + 1,
            title: 'Computer Science 101',
            lecturer: 'John Smith',
            venue: 'Computer Lab D',
            department: 'Computer Science',
            dayOfWeek: 1, // Monday
            startTime: '09:00',
            endTime: '11:00',
            semester: 'Fall 2025',
            students: 25,
            recurring: true,
            color: '#667eea'
        },
        {
            id: Date.now() + 2,
            title: 'Mathematics 201',
            lecturer: 'Sarah Johnson',
            venue: 'Lecture Hall B',
            department: 'Mathematics',
            dayOfWeek: 2, // Tuesday
            startTime: '14:00',
            endTime: '16:00',
            semester: 'Fall 2025',
            students: 45,
            recurring: true,
            color: '#f39c12'
        },
        {
            id: Date.now() + 3,
            title: 'Physics Lab',
            lecturer: 'Mike Wilson',
            venue: 'Physics Lab A',
            department: 'Physics',
            dayOfWeek: 3, // Wednesday
            startTime: '10:00',
            endTime: '12:00',
            semester: 'Fall 2025',
            students: 20,
            recurring: true,
            color: '#27ae60'
        },
        {
            id: Date.now() + 4,
            title: 'Chemistry Seminar',
            lecturer: 'Dr. Emily Brown',
            venue: 'Seminar Room C',
            department: 'Chemistry',
            dayOfWeek: 4, // Thursday
            startTime: '15:00',
            endTime: '17:00',
            semester: 'Fall 2025',
            students: 30,
            recurring: true,
            color: '#e74c3c'
        },
        {
            id: Date.now() + 5,
            title: 'Advanced Programming',
            lecturer: 'John Smith',
            venue: 'Computer Lab D',
            department: 'Computer Science',
            dayOfWeek: 5, // Friday
            startTime: '11:00',
            endTime: '13:00',
            semester: 'Fall 2025',
            students: 18,
            recurring: true,
            color: '#9b59b6'
        }
    ];
    
    timetableEntries = sampleEntries;
    saveTimetableData();
}

// Save timetable data
function saveTimetableData() {
    localStorage.setItem('venueManagerTimetable', JSON.stringify(timetableEntries));
}

// Display timetable
function displayTimetable() {
    if (currentTimetableView === 'week') {
        displayWeeklyTimetable();
    } else if (currentTimetableView === 'month') {
        displayMonthlyTimetable();
    }
    displayTimetableList();
}

// Display weekly timetable
function displayWeeklyTimetable() {
    const timetableGrid = document.getElementById('timetable-grid');
    if (!timetableGrid) return;
    
    // Create time slots (8 AM to 6 PM)
    const timeSlots = [];
    for (let hour = 8; hour <= 18; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    
    // Days of the week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    // Create grid HTML
    let gridHTML = '<div class="timetable-week-view">';
    
    // Header row
    gridHTML += '<div class="timetable-header-row">';
    gridHTML += '<div class="time-header">Time</div>';
    days.forEach(day => {
        gridHTML += `<div class="day-header">${day}</div>`;
    });
    gridHTML += '</div>';
    
    // Time slot rows
    timeSlots.forEach(time => {
        gridHTML += '<div class="timetable-row">';
        gridHTML += `<div class="time-slot">${formatTime(time)}</div>`;
        
        days.forEach((day, dayIndex) => {
            const dayOfWeek = dayIndex + 1; // Monday = 1
            const entry = findTimetableEntry(dayOfWeek, time);
            
            if (entry) {
                const duration = calculateDuration(entry.startTime, entry.endTime);
                gridHTML += `
                    <div class="timetable-cell has-entry" style="background-color: ${entry.color}20; border-left: 4px solid ${entry.color};">
                        <div class="entry-content" onclick="editTimetableEntry(${entry.id})">
                            <strong>${entry.title}</strong>
                            <p>${entry.lecturer}</p>
                            <p>${entry.venue}</p>
                            <small>${entry.startTime} - ${entry.endTime}</small>
                        </div>
                    </div>
                `;
            } else {
                gridHTML += `
                    <div class="timetable-cell empty" onclick="addTimetableEntry(${dayOfWeek}, '${time}')">
                        <span class="add-entry">+</span>
                    </div>
                `;
            }
        });
        
        gridHTML += '</div>';
    });
    
    gridHTML += '</div>';
    timetableGrid.innerHTML = gridHTML;
}

// Find timetable entry for specific day and time
function findTimetableEntry(dayOfWeek, time) {
    return timetableEntries.find(entry => {
        if (entry.dayOfWeek !== dayOfWeek) return false;
        
        const entryStart = timeToMinutes(entry.startTime);
        const entryEnd = timeToMinutes(entry.endTime);
        const checkTime = timeToMinutes(time);
        
        return checkTime >= entryStart && checkTime < entryEnd;
    });
}

// Convert time string to minutes
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Calculate duration between two times
function calculateDuration(startTime, endTime) {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    return end - start;
}

// Display timetable list
function displayTimetableList() {
    const timetableEntries_elem = document.getElementById('timetable-entries');
    if (!timetableEntries_elem) return;
    
    const filteredEntries = getFilteredTimetableEntries();
    
    if (filteredEntries.length === 0) {
        timetableEntries_elem.innerHTML = '<p class="no-data">No timetable entries found</p>';
        return;
    }
    
    timetableEntries_elem.innerHTML = filteredEntries.map(entry => `
        <div class="timetable-entry-card">
            <div class="entry-header">
                <div class="entry-title">
                    <h4>${entry.title}</h4>
                    <span class="entry-code">${entry.department}</span>
                </div>
                <div class="entry-actions">
                    <button class="btn btn-outline btn-sm" onclick="editTimetableEntry(${entry.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTimetableEntry(${entry.id})">Delete</button>
                </div>
            </div>
            <div class="entry-details">
                <div class="detail-row">
                    <span class="detail-label">Lecturer:</span>
                    <span class="detail-value">${entry.lecturer}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Venue:</span>
                    <span class="detail-value">${entry.venue}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Schedule:</span>
                    <span class="detail-value">${getDayName(entry.dayOfWeek)} ${formatTime(entry.startTime)} - ${formatTime(entry.endTime)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Students:</span>
                    <span class="detail-value">${entry.students}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Semester:</span>
                    <span class="detail-value">${entry.semester}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Get day name from day number
function getDayName(dayOfWeek) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
}

// Get filtered timetable entries
function getFilteredTimetableEntries() {
    let filtered = [...timetableEntries];
    
    // Apply filters
    const venueFilter = document.getElementById('venue-filter')?.value;
    const departmentFilter = document.getElementById('department-filter')?.value;
    const lecturerFilter = document.getElementById('lecturer-filter')?.value;
    const searchTerm = document.getElementById('timetable-search')?.value.toLowerCase();
    
    if (venueFilter) {
        filtered = filtered.filter(entry => entry.venue.toLowerCase().includes(venueFilter.toLowerCase()));
    }
    
    if (departmentFilter) {
        filtered = filtered.filter(entry => entry.department.toLowerCase().includes(departmentFilter.toLowerCase()));
    }
    
    if (lecturerFilter) {
        filtered = filtered.filter(entry => entry.lecturer.toLowerCase().includes(lecturerFilter.toLowerCase()));
    }
    
    if (searchTerm) {
        filtered = filtered.filter(entry => 
            entry.title.toLowerCase().includes(searchTerm) ||
            entry.lecturer.toLowerCase().includes(searchTerm) ||
            entry.venue.toLowerCase().includes(searchTerm) ||
            entry.department.toLowerCase().includes(searchTerm)
        );
    }
    
    return filtered;
}

// Change timetable view
function changeTimetableView() {
    const viewSelect = document.getElementById('timetable-view');
    if (viewSelect) {
        currentTimetableView = viewSelect.value;
        displayTimetable();
    }
}

// Filter timetable
function filterTimetable() {
    displayTimetableList();
}

// Search timetable
function searchTimetable() {
    displayTimetableList();
}

// Refresh timetable
function refreshTimetable() {
    loadTimetableData();
    displayTimetable();
    showMessage('Timetable refreshed', 'success');
}

// Show add timetable modal
function showAddTimetableModal() {
    const modal = document.createElement('div');
    modal.className = 'timetable-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add Timetable Entry</h2>
                <button class="modal-close" onclick="closeTimetableModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="timetable-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="entry-title">Course Title *</label>
                            <input type="text" id="entry-title" name="title" required>
                        </div>
                        <div class="form-group">
                            <label for="entry-lecturer">Lecturer *</label>
                            <input type="text" id="entry-lecturer" name="lecturer" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="entry-venue">Venue *</label>
                            <select id="entry-venue" name="venue" required>
                                <option value="">Select venue</option>
                                <option value="Conference Room A">Conference Room A</option>
                                <option value="Lecture Hall B">Lecture Hall B</option>
                                <option value="Seminar Room C">Seminar Room C</option>
                                <option value="Computer Lab D">Computer Lab D</option>
                                <option value="Physics Lab A">Physics Lab A</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="entry-department">Department *</label>
                            <select id="entry-department" name="department" required>
                                <option value="">Select department</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Biology">Biology</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="entry-day">Day of Week *</label>
                            <select id="entry-day" name="dayOfWeek" required>
                                <option value="">Select day</option>
                                <option value="1">Monday</option>
                                <option value="2">Tuesday</option>
                                <option value="3">Wednesday</option>
                                <option value="4">Thursday</option>
                                <option value="5">Friday</option>
                                <option value="6">Saturday</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="entry-students">Number of Students</label>
                            <input type="number" id="entry-students" name="students" min="1" max="100">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="entry-start-time">Start Time *</label>
                            <input type="time" id="entry-start-time" name="startTime" required>
                        </div>
                        <div class="form-group">
                            <label for="entry-end-time">End Time *</label>
                            <input type="time" id="entry-end-time" name="endTime" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="entry-semester">Semester</label>
                            <input type="text" id="entry-semester" name="semester" placeholder="e.g., Fall 2025">
                        </div>
                        <div class="form-group">
                            <label for="entry-color">Color</label>
                            <input type="color" id="entry-color" name="color" value="#667eea">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="entry-recurring" name="recurring" checked>
                            <span class="checkmark"></span>
                            Recurring weekly
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="closeTimetableModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Add Entry</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listener for form submission
    const form = document.getElementById('timetable-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        addTimetableEntryFromForm();
    });
    
    addTimetableModalStyles();
}

// Add timetable entry from form
function addTimetableEntryFromForm() {
    const form = document.getElementById('timetable-form');
    const formData = new FormData(form);
    
    const newEntry = {
        id: Date.now(),
        title: formData.get('title'),
        lecturer: formData.get('lecturer'),
        venue: formData.get('venue'),
        department: formData.get('department'),
        dayOfWeek: parseInt(formData.get('dayOfWeek')),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        semester: formData.get('semester') || 'Fall 2025',
        students: parseInt(formData.get('students')) || 0,
        recurring: formData.get('recurring') === 'on',
        color: formData.get('color') || '#667eea'
    };
    
    // Validate time conflict
    if (checkTimeConflict(newEntry)) {
        showMessage('Time conflict detected with existing entry', 'error');
        return;
    }
    
    timetableEntries.push(newEntry);
    saveTimetableData();
    displayTimetable();
    closeTimetableModal();
    showMessage('Timetable entry added successfully', 'success');
}

// Check for time conflicts
function checkTimeConflict(newEntry) {
    return timetableEntries.some(entry => {
        if (entry.venue !== newEntry.venue || entry.dayOfWeek !== newEntry.dayOfWeek) {
            return false;
        }
        
        const newStart = timeToMinutes(newEntry.startTime);
        const newEnd = timeToMinutes(newEntry.endTime);
        const existingStart = timeToMinutes(entry.startTime);
        const existingEnd = timeToMinutes(entry.endTime);
        
        return (newStart < existingEnd && newEnd > existingStart);
    });
}

// Close timetable modal
function closeTimetableModal() {
    const modal = document.querySelector('.timetable-modal');
    if (modal) {
        modal.remove();
    }
}

// Edit timetable entry
function editTimetableEntry(entryId) {
    const entry = timetableEntries.find(e => e.id === entryId);
    if (!entry) return;
    
    // Show edit modal (similar to add modal but pre-filled)
    showEditTimetableModal(entry);
}

// Show edit timetable modal
function showEditTimetableModal(entry) {
    const modal = document.createElement('div');
    modal.className = 'timetable-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Timetable Entry</h2>
                <button class="modal-close" onclick="closeTimetableModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="edit-timetable-form">
                    <input type="hidden" name="entryId" value="${entry.id}">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-entry-title">Course Title *</label>
                            <input type="text" id="edit-entry-title" name="title" value="${entry.title}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-entry-lecturer">Lecturer *</label>
                            <input type="text" id="edit-entry-lecturer" name="lecturer" value="${entry.lecturer}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-entry-venue">Venue *</label>
                            <select id="edit-entry-venue" name="venue" required>
                                <option value="Conference Room A" ${entry.venue === 'Conference Room A' ? 'selected' : ''}>Conference Room A</option>
                                <option value="Lecture Hall B" ${entry.venue === 'Lecture Hall B' ? 'selected' : ''}>Lecture Hall B</option>
                                <option value="Seminar Room C" ${entry.venue === 'Seminar Room C' ? 'selected' : ''}>Seminar Room C</option>
                                <option value="Computer Lab D" ${entry.venue === 'Computer Lab D' ? 'selected' : ''}>Computer Lab D</option>
                                <option value="Physics Lab A" ${entry.venue === 'Physics Lab A' ? 'selected' : ''}>Physics Lab A</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-entry-department">Department *</label>
                            <select id="edit-entry-department" name="department" required>
                                <option value="Computer Science" ${entry.department === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                                <option value="Mathematics" ${entry.department === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
                                <option value="Physics" ${entry.department === 'Physics' ? 'selected' : ''}>Physics</option>
                                <option value="Chemistry" ${entry.department === 'Chemistry' ? 'selected' : ''}>Chemistry</option>
                                <option value="Biology" ${entry.department === 'Biology' ? 'selected' : ''}>Biology</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-entry-day">Day of Week *</label>
                            <select id="edit-entry-day" name="dayOfWeek" required>
                                <option value="1" ${entry.dayOfWeek === 1 ? 'selected' : ''}>Monday</option>
                                <option value="2" ${entry.dayOfWeek === 2 ? 'selected' : ''}>Tuesday</option>
                                <option value="3" ${entry.dayOfWeek === 3 ? 'selected' : ''}>Wednesday</option>
                                <option value="4" ${entry.dayOfWeek === 4 ? 'selected' : ''}>Thursday</option>
                                <option value="5" ${entry.dayOfWeek === 5 ? 'selected' : ''}>Friday</option>
                                <option value="6" ${entry.dayOfWeek === 6 ? 'selected' : ''}>Saturday</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-entry-students">Number of Students</label>
                            <input type="number" id="edit-entry-students" name="students" value="${entry.students}" min="1" max="100">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-entry-start-time">Start Time *</label>
                            <input type="time" id="edit-entry-start-time" name="startTime" value="${entry.startTime}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-entry-end-time">End Time *</label>
                            <input type="time" id="edit-entry-end-time" name="endTime" value="${entry.endTime}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-entry-semester">Semester</label>
                            <input type="text" id="edit-entry-semester" name="semester" value="${entry.semester}">
                        </div>
                        <div class="form-group">
                            <label for="edit-entry-color">Color</label>
                            <input type="color" id="edit-entry-color" name="color" value="${entry.color}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="edit-entry-recurring" name="recurring" ${entry.recurring ? 'checked' : ''}>
                            <span class="checkmark"></span>
                            Recurring weekly
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="closeTimetableModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update Entry</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listener for form submission
    const form = document.getElementById('edit-timetable-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        updateTimetableEntryFromForm();
    });
    
    addTimetableModalStyles();
}

// Update timetable entry from form
function updateTimetableEntryFromForm() {
    const form = document.getElementById('edit-timetable-form');
    const formData = new FormData(form);
    const entryId = parseInt(formData.get('entryId'));
    
    const entryIndex = timetableEntries.findIndex(e => e.id === entryId);
    if (entryIndex === -1) return;
    
    const updatedEntry = {
        id: entryId,
        title: formData.get('title'),
        lecturer: formData.get('lecturer'),
        venue: formData.get('venue'),
        department: formData.get('department'),
        dayOfWeek: parseInt(formData.get('dayOfWeek')),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        semester: formData.get('semester') || 'Fall 2025',
        students: parseInt(formData.get('students')) || 0,
        recurring: formData.get('recurring') === 'on',
        color: formData.get('color') || '#667eea'
    };
    
    // Check for conflicts (excluding current entry)
    const tempEntries = timetableEntries.filter(e => e.id !== entryId);
    if (tempEntries.some(entry => {
        if (entry.venue !== updatedEntry.venue || entry.dayOfWeek !== updatedEntry.dayOfWeek) {
            return false;
        }
        
        const newStart = timeToMinutes(updatedEntry.startTime);
        const newEnd = timeToMinutes(updatedEntry.endTime);
        const existingStart = timeToMinutes(entry.startTime);
        const existingEnd = timeToMinutes(entry.endTime);
        
        return (newStart < existingEnd && newEnd > existingStart);
    })) {
        showMessage('Time conflict detected with existing entry', 'error');
        return;
    }
    
    timetableEntries[entryIndex] = updatedEntry;
    saveTimetableData();
    displayTimetable();
    closeTimetableModal();
    showMessage('Timetable entry updated successfully', 'success');
}

// Delete timetable entry
function deleteTimetableEntry(entryId) {
    const entry = timetableEntries.find(e => e.id === entryId);
    if (!entry) return;
    
    if (confirm(`Are you sure you want to delete "${entry.title}"?`)) {
        timetableEntries = timetableEntries.filter(e => e.id !== entryId);
        saveTimetableData();
        displayTimetable();
        showMessage('Timetable entry deleted successfully', 'success');
    }
}

// Add timetable entry (from grid click)
function addTimetableEntry(dayOfWeek, time) {
    showAddTimetableModal();
    
    // Pre-fill day and time
    setTimeout(() => {
        const daySelect = document.getElementById('entry-day');
        const startTimeInput = document.getElementById('entry-start-time');
        
        if (daySelect) daySelect.value = dayOfWeek.toString();
        if (startTimeInput) startTimeInput.value = time;
    }, 100);
}

// Export timetable
function exportTimetable() {
    const csvContent = generateTimetableCSV();
    downloadCSV(csvContent, 'timetable.csv');
    showMessage('Timetable exported successfully', 'success');
}

// Generate timetable CSV
function generateTimetableCSV() {
    const headers = ['Course Title', 'Lecturer', 'Venue', 'Department', 'Day', 'Start Time', 'End Time', 'Students', 'Semester'];
    const rows = timetableEntries.map(entry => [
        entry.title,
        entry.lecturer,
        entry.venue,
        entry.department,
        getDayName(entry.dayOfWeek),
        entry.startTime,
        entry.endTime,
        entry.students,
        entry.semester
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    return csvContent;
}

// Add timetable modal styles
function addTimetableModalStyles() {
    if (document.getElementById('timetable-modal-styles')) return;
    
    const modalCSS = `
        .timetable-modal {
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
            overflow-y: auto;
        }
        
        .timetable-modal .modal-content {
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'timetable-modal-styles';
    style.textContent = modalCSS;
    document.head.appendChild(style);
}



// ISSUE MANAGEMENT FUNCTIONS

// Load issues data
function loadIssuesData() {
    // Load from localStorage or create sample data
    const savedIssues = localStorage.getItem('venueManagerIssues');
    if (savedIssues) {
        issues = JSON.parse(savedIssues);
    } else {
        // Create sample issues data
        createSampleIssuesData();
    }
}

// Create sample issues data
function createSampleIssuesData() {
    const sampleIssues = [
        {
            id: Date.now() + 1,
            title: 'Projector not working in Conference Room A',
            description: 'The projector in Conference Room A is not displaying properly. The screen appears dim and there are color distortions.',
            category: 'technical',
            priority: 'high',
            status: 'open',
            reportedBy: 'John Smith',
            reportedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: 'IT Support',
            venue: 'Conference Room A',
            estimatedResolution: '2025-07-02',
            comments: [
                {
                    id: 1,
                    author: 'IT Support',
                    message: 'Issue confirmed. Ordering replacement bulb.',
                    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
        },
        {
            id: Date.now() + 2,
            title: 'Air conditioning too cold in Lecture Hall B',
            description: 'Students and faculty have complained that the air conditioning in Lecture Hall B is set too cold, making it uncomfortable during lectures.',
            category: 'maintenance',
            priority: 'medium',
            status: 'in-progress',
            reportedBy: 'Sarah Johnson',
            reportedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: 'Facilities Management',
            venue: 'Lecture Hall B',
            estimatedResolution: '2025-07-01',
            comments: [
                {
                    id: 1,
                    author: 'Facilities Management',
                    message: 'Technician scheduled to adjust thermostat settings.',
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
        },
        {
            id: Date.now() + 3,
            title: 'Booking system showing incorrect availability',
            description: 'The booking system is showing Seminar Room C as available when it should be blocked for maintenance.',
            category: 'booking',
            priority: 'high',
            status: 'open',
            reportedBy: 'Mike Wilson',
            reportedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: 'System Administrator',
            venue: 'Seminar Room C',
            estimatedResolution: '2025-06-30',
            comments: []
        },
        {
            id: Date.now() + 4,
            title: 'Whiteboard markers missing in Computer Lab D',
            description: 'All whiteboard markers in Computer Lab D are either missing or dried out. Need replacement.',
            category: 'maintenance',
            priority: 'low',
            status: 'resolved',
            reportedBy: 'Emily Brown',
            reportedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: 'Facilities Management',
            venue: 'Computer Lab D',
            estimatedResolution: '2025-06-28',
            resolvedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            comments: [
                {
                    id: 1,
                    author: 'Facilities Management',
                    message: 'New markers have been placed in the room.',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
        },
        {
            id: Date.now() + 5,
            title: 'Student unable to access booking system',
            description: 'Student Mike Davis reports that he cannot log into the booking system. Getting authentication error.',
            category: 'user-access',
            priority: 'medium',
            status: 'closed',
            reportedBy: 'Help Desk',
            reportedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: 'System Administrator',
            venue: 'N/A',
            estimatedResolution: '2025-06-25',
            resolvedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            comments: [
                {
                    id: 1,
                    author: 'System Administrator',
                    message: 'Password reset resolved the issue.',
                    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]
        }
    ];
    
    issues = sampleIssues;
    saveIssuesData();
}

// Save issues data
function saveIssuesData() {
    localStorage.setItem('venueManagerIssues', JSON.stringify(issues));
}

// Display issues
function displayIssues() {
    updateIssueStats();
    displayIssuesList();
}

// Update issue statistics
function updateIssueStats() {
    const openCount = issues.filter(issue => issue.status === 'open').length;
    const inProgressCount = issues.filter(issue => issue.status === 'in-progress').length;
    const resolvedCount = issues.filter(issue => issue.status === 'resolved').length;
    const totalCount = issues.length;
    
    document.getElementById('open-issues-count').textContent = openCount;
    document.getElementById('in-progress-issues-count').textContent = inProgressCount;
    document.getElementById('resolved-issues-count').textContent = resolvedCount;
    document.getElementById('total-issues-count').textContent = totalCount;
}

// Display issues list
function displayIssuesList() {
    const issuesList = document.getElementById('issues-list');
    if (!issuesList) return;
    
    const filteredIssues = getFilteredIssues();
    
    if (filteredIssues.length === 0) {
        issuesList.innerHTML = '<p class="no-data">No issues found</p>';
        return;
    }
    
    issuesList.innerHTML = filteredIssues.map(issue => `
        <div class="issue-card ${issue.priority}">
            <div class="issue-header">
                <div class="issue-title-section">
                    <h4 class="issue-title">${issue.title}</h4>
                    <div class="issue-meta">
                        <span class="issue-id">#${issue.id}</span>
                        <span class="issue-category">${formatCategory(issue.category)}</span>
                        <span class="issue-venue">${issue.venue}</span>
                    </div>
                </div>
                <div class="issue-badges">
                    <span class="priority-badge ${issue.priority}">${formatPriority(issue.priority)}</span>
                    <span class="status-badge ${issue.status}">${formatStatus(issue.status)}</span>
                </div>
            </div>
            <div class="issue-content">
                <p class="issue-description">${issue.description}</p>
                <div class="issue-details">
                    <div class="detail-item">
                        <span class="detail-label">Reported by:</span>
                        <span class="detail-value">${issue.reportedBy}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Reported on:</span>
                        <span class="detail-value">${formatDate(issue.reportedDate)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Assigned to:</span>
                        <span class="detail-value">${issue.assignedTo}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Est. Resolution:</span>
                        <span class="detail-value">${formatDate(issue.estimatedResolution)}</span>
                    </div>
                    ${issue.resolvedDate ? `
                        <div class="detail-item">
                            <span class="detail-label">Resolved on:</span>
                            <span class="detail-value">${formatDate(issue.resolvedDate)}</span>
                        </div>
                    ` : ''}
                </div>
                ${issue.comments.length > 0 ? `
                    <div class="issue-comments">
                        <h5>Comments (${issue.comments.length})</h5>
                        <div class="comments-list">
                            ${issue.comments.map(comment => `
                                <div class="comment">
                                    <div class="comment-header">
                                        <strong>${comment.author}</strong>
                                        <span class="comment-time">${formatDateTime(comment.timestamp)}</span>
                                    </div>
                                    <p class="comment-message">${comment.message}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="issue-actions">
                <button class="btn btn-outline btn-sm" onclick="viewIssueDetails(${issue.id})">View Details</button>
                <button class="btn btn-outline btn-sm" onclick="editIssue(${issue.id})">Edit</button>
                <button class="btn btn-outline btn-sm" onclick="addIssueComment(${issue.id})">Add Comment</button>
                ${issue.status !== 'closed' ? `
                    <button class="btn btn-primary btn-sm" onclick="updateIssueStatus(${issue.id})">Update Status</button>
                ` : ''}
                <button class="btn btn-danger btn-sm" onclick="deleteIssue(${issue.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Get filtered issues
function getFilteredIssues() {
    let filtered = [...issues];
    
    // Apply filters
    const statusFilter = document.getElementById('issue-status-filter')?.value;
    const priorityFilter = document.getElementById('issue-priority-filter')?.value;
    const categoryFilter = document.getElementById('issue-category-filter')?.value;
    const searchTerm = document.getElementById('issue-search')?.value.toLowerCase();
    
    if (statusFilter) {
        filtered = filtered.filter(issue => issue.status === statusFilter);
    }
    
    if (priorityFilter) {
        filtered = filtered.filter(issue => issue.priority === priorityFilter);
    }
    
    if (categoryFilter) {
        filtered = filtered.filter(issue => issue.category === categoryFilter);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(issue => 
            issue.title.toLowerCase().includes(searchTerm) ||
            issue.description.toLowerCase().includes(searchTerm) ||
            issue.reportedBy.toLowerCase().includes(searchTerm) ||
            issue.assignedTo.toLowerCase().includes(searchTerm) ||
            issue.venue.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort by priority and date
    filtered.sort((a, b) => {
        const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        return new Date(b.reportedDate) - new Date(a.reportedDate);
    });
    
    return filtered;
}

// Format category
function formatCategory(category) {
    const categories = {
        'technical': 'Technical',
        'maintenance': 'Maintenance',
        'booking': 'Booking',
        'user-access': 'User Access',
        'other': 'Other'
    };
    return categories[category] || category;
}

// Format priority
function formatPriority(priority) {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
}

// Format status
function formatStatus(status) {
    const statuses = {
        'open': 'Open',
        'in-progress': 'In Progress',
        'resolved': 'Resolved',
        'closed': 'Closed'
    };
    return statuses[status] || status;
}

// Filter issues
function filterIssues() {
    displayIssuesList();
}

// Search issues
function searchIssues() {
    displayIssuesList();
}

// Show add issue modal
function showAddIssueModal() {
    const modal = document.createElement('div');
    modal.className = 'issue-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Report New Issue</h2>
                <button class="modal-close" onclick="closeIssueModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="issue-form">
                    <div class="form-group">
                        <label for="issue-title">Issue Title *</label>
                        <input type="text" id="issue-title" name="title" required>
                    </div>
                    <div class="form-group">
                        <label for="issue-description">Description *</label>
                        <textarea id="issue-description" name="description" rows="4" required></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="issue-category">Category *</label>
                            <select id="issue-category" name="category" required>
                                <option value="">Select category</option>
                                <option value="technical">Technical</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="booking">Booking</option>
                                <option value="user-access">User Access</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="issue-priority">Priority *</label>
                            <select id="issue-priority" name="priority" required>
                                <option value="">Select priority</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="issue-venue">Venue</label>
                            <select id="issue-venue" name="venue">
                                <option value="">Select venue (if applicable)</option>
                                <option value="Conference Room A">Conference Room A</option>
                                <option value="Lecture Hall B">Lecture Hall B</option>
                                <option value="Seminar Room C">Seminar Room C</option>
                                <option value="Computer Lab D">Computer Lab D</option>
                                <option value="Physics Lab A">Physics Lab A</option>
                                <option value="N/A">Not applicable</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="issue-assigned-to">Assign to</label>
                            <select id="issue-assigned-to" name="assignedTo">
                                <option value="">Select assignee</option>
                                <option value="IT Support">IT Support</option>
                                <option value="Facilities Management">Facilities Management</option>
                                <option value="System Administrator">System Administrator</option>
                                <option value="Help Desk">Help Desk</option>
                                <option value="Maintenance Team">Maintenance Team</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="issue-estimated-resolution">Estimated Resolution Date</label>
                        <input type="date" id="issue-estimated-resolution" name="estimatedResolution">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="closeIssueModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Report Issue</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listener for form submission
    const form = document.getElementById('issue-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        addIssueFromForm();
    });
    
    addIssueModalStyles();
}

// Add issue from form
function addIssueFromForm() {
    const form = document.getElementById('issue-form');
    const formData = new FormData(form);
    
    const newIssue = {
        id: Date.now(),
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        priority: formData.get('priority'),
        status: 'open',
        reportedBy: currentUser ? currentUser.name : 'Admin',
        reportedDate: new Date().toISOString(),
        assignedTo: formData.get('assignedTo') || 'Unassigned',
        venue: formData.get('venue') || 'N/A',
        estimatedResolution: formData.get('estimatedResolution') || '',
        comments: []
    };
    
    issues.push(newIssue);
    saveIssuesData();
    displayIssues();
    closeIssueModal();
    showMessage('Issue reported successfully', 'success');
}

// Close issue modal
function closeIssueModal() {
    const modal = document.querySelector('.issue-modal');
    if (modal) {
        modal.remove();
    }
}

// Edit issue
function editIssue(issueId) {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    
    showEditIssueModal(issue);
}

// Show edit issue modal
function showEditIssueModal(issue) {
    const modal = document.createElement('div');
    modal.className = 'issue-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Issue</h2>
                <button class="modal-close" onclick="closeIssueModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="edit-issue-form">
                    <input type="hidden" name="issueId" value="${issue.id}">
                    <div class="form-group">
                        <label for="edit-issue-title">Issue Title *</label>
                        <input type="text" id="edit-issue-title" name="title" value="${issue.title}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-issue-description">Description *</label>
                        <textarea id="edit-issue-description" name="description" rows="4" required>${issue.description}</textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-issue-category">Category *</label>
                            <select id="edit-issue-category" name="category" required>
                                <option value="technical" ${issue.category === 'technical' ? 'selected' : ''}>Technical</option>
                                <option value="maintenance" ${issue.category === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                                <option value="booking" ${issue.category === 'booking' ? 'selected' : ''}>Booking</option>
                                <option value="user-access" ${issue.category === 'user-access' ? 'selected' : ''}>User Access</option>
                                <option value="other" ${issue.category === 'other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-issue-priority">Priority *</label>
                            <select id="edit-issue-priority" name="priority" required>
                                <option value="low" ${issue.priority === 'low' ? 'selected' : ''}>Low</option>
                                <option value="medium" ${issue.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="high" ${issue.priority === 'high' ? 'selected' : ''}>High</option>
                                <option value="critical" ${issue.priority === 'critical' ? 'selected' : ''}>Critical</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-issue-status">Status</label>
                            <select id="edit-issue-status" name="status">
                                <option value="open" ${issue.status === 'open' ? 'selected' : ''}>Open</option>
                                <option value="in-progress" ${issue.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                                <option value="resolved" ${issue.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                                <option value="closed" ${issue.status === 'closed' ? 'selected' : ''}>Closed</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-issue-assigned-to">Assign to</label>
                            <select id="edit-issue-assigned-to" name="assignedTo">
                                <option value="IT Support" ${issue.assignedTo === 'IT Support' ? 'selected' : ''}>IT Support</option>
                                <option value="Facilities Management" ${issue.assignedTo === 'Facilities Management' ? 'selected' : ''}>Facilities Management</option>
                                <option value="System Administrator" ${issue.assignedTo === 'System Administrator' ? 'selected' : ''}>System Administrator</option>
                                <option value="Help Desk" ${issue.assignedTo === 'Help Desk' ? 'selected' : ''}>Help Desk</option>
                                <option value="Maintenance Team" ${issue.assignedTo === 'Maintenance Team' ? 'selected' : ''}>Maintenance Team</option>
                                <option value="Unassigned" ${issue.assignedTo === 'Unassigned' ? 'selected' : ''}>Unassigned</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-issue-venue">Venue</label>
                            <select id="edit-issue-venue" name="venue">
                                <option value="Conference Room A" ${issue.venue === 'Conference Room A' ? 'selected' : ''}>Conference Room A</option>
                                <option value="Lecture Hall B" ${issue.venue === 'Lecture Hall B' ? 'selected' : ''}>Lecture Hall B</option>
                                <option value="Seminar Room C" ${issue.venue === 'Seminar Room C' ? 'selected' : ''}>Seminar Room C</option>
                                <option value="Computer Lab D" ${issue.venue === 'Computer Lab D' ? 'selected' : ''}>Computer Lab D</option>
                                <option value="Physics Lab A" ${issue.venue === 'Physics Lab A' ? 'selected' : ''}>Physics Lab A</option>
                                <option value="N/A" ${issue.venue === 'N/A' ? 'selected' : ''}>Not applicable</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-issue-estimated-resolution">Estimated Resolution Date</label>
                            <input type="date" id="edit-issue-estimated-resolution" name="estimatedResolution" value="${issue.estimatedResolution}">
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="closeIssueModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update Issue</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listener for form submission
    const form = document.getElementById('edit-issue-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        updateIssueFromForm();
    });
    
    addIssueModalStyles();
}

// Update issue from form
function updateIssueFromForm() {
    const form = document.getElementById('edit-issue-form');
    const formData = new FormData(form);
    const issueId = parseInt(formData.get('issueId'));
    
    const issueIndex = issues.findIndex(i => i.id === issueId);
    if (issueIndex === -1) return;
    
    const updatedIssue = {
        ...issues[issueIndex],
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        priority: formData.get('priority'),
        status: formData.get('status'),
        assignedTo: formData.get('assignedTo'),
        venue: formData.get('venue'),
        estimatedResolution: formData.get('estimatedResolution')
    };
    
    // Add resolved date if status changed to resolved
    if (formData.get('status') === 'resolved' && issues[issueIndex].status !== 'resolved') {
        updatedIssue.resolvedDate = new Date().toISOString();
    }
    
    issues[issueIndex] = updatedIssue;
    saveIssuesData();
    displayIssues();
    closeIssueModal();
    showMessage('Issue updated successfully', 'success');
}

// Update issue status
function updateIssueStatus(issueId) {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    
    const statusOptions = [
        { value: 'open', label: 'Open' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'closed', label: 'Closed' }
    ];
    
    const currentIndex = statusOptions.findIndex(opt => opt.value === issue.status);
    const nextStatus = statusOptions[currentIndex + 1];
    
    if (nextStatus) {
        issue.status = nextStatus.value;
        if (nextStatus.value === 'resolved') {
            issue.resolvedDate = new Date().toISOString();
        }
        saveIssuesData();
        displayIssues();
        showMessage(`Issue status updated to ${nextStatus.label}`, 'success');
    }
}

// Add issue comment
function addIssueComment(issueId) {
    const comment = prompt('Add a comment:');
    if (!comment) return;
    
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    
    const newComment = {
        id: Date.now(),
        author: currentUser ? currentUser.name : 'Admin',
        message: comment,
        timestamp: new Date().toISOString()
    };
    
    issue.comments.push(newComment);
    saveIssuesData();
    displayIssues();
    showMessage('Comment added successfully', 'success');
}

// Delete issue
function deleteIssue(issueId) {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    
    if (confirm(`Are you sure you want to delete issue "${issue.title}"?`)) {
        issues = issues.filter(i => i.id !== issueId);
        saveIssuesData();
        displayIssues();
        showMessage('Issue deleted successfully', 'success');
    }
}

// View issue details
function viewIssueDetails(issueId) {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    
    // For now, just show edit modal - could be expanded to a detailed view
    showEditIssueModal(issue);
}

// Export issues
function exportIssues() {
    const csvContent = generateIssuesCSV();
    downloadCSV(csvContent, 'issues.csv');
    showMessage('Issues exported successfully', 'success');
}

// Generate issues CSV
function generateIssuesCSV() {
    const headers = ['ID', 'Title', 'Description', 'Category', 'Priority', 'Status', 'Reported By', 'Reported Date', 'Assigned To', 'Venue', 'Estimated Resolution', 'Resolved Date'];
    const rows = issues.map(issue => [
        issue.id,
        issue.title,
        issue.description,
        formatCategory(issue.category),
        formatPriority(issue.priority),
        formatStatus(issue.status),
        issue.reportedBy,
        formatDate(issue.reportedDate),
        issue.assignedTo,
        issue.venue,
        issue.estimatedResolution ? formatDate(issue.estimatedResolution) : '',
        issue.resolvedDate ? formatDate(issue.resolvedDate) : ''
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    return csvContent;
}

// Add issue modal styles
function addIssueModalStyles() {
    if (document.getElementById('issue-modal-styles')) return;
    
    const modalCSS = `
        .issue-modal {
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
            overflow-y: auto;
        }
        
        .issue-modal .modal-content {
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'issue-modal-styles';
    style.textContent = modalCSS;
    document.head.appendChild(style);
}

// UTILITY FUNCTIONS

// Download CSV
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Format date time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Generate report
function generateReport() {
    showMessage('Report generation feature coming soon', 'info');
}

// Show add venue modal
function showAddVenueModal() {
    showMessage('Add venue feature coming soon', 'info');
}

