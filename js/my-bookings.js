// My Bookings page functionality for Venue Manager

let userBookings = [];
let filteredBookings = [];
let currentView = 'list';
let currentCalendarDate = new Date();

// Initialize my bookings page
document.addEventListener('DOMContentLoaded', function() {
    checkUserAccess();
    loadUserBookings();
    setupBookingsEventListeners();
    updateBookingsSummary();
    displayBookings();
});

// Check if user is logged in
function checkUserAccess() {
    if (!currentUser) {
        showMessage('Please sign in to view your bookings', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
}

// Load user bookings from localStorage
function loadUserBookings() {
    const allBookings = JSON.parse(localStorage.getItem('venueManagerBookings') || '[]');
    userBookings = allBookings.filter(booking => booking.userId === currentUser.id);
    
    // If no bookings exist, create some sample bookings for demo
    if (userBookings.length === 0 && currentUser.role === 'lecturer') {
        createSampleBookings();
    }
    
    filteredBookings = [...userBookings];
}

// Create sample bookings for demo purposes
function createSampleBookings() {
    const sampleBookings = [
        {
            id: Date.now() + 1,
            userId: currentUser.id,
            venueId: 1,
            venueName: 'Conference Room A',
            venueLocation: 'Building 1, Floor 2',
            date: '2025-07-02',
            startTime: '10:00',
            endTime: '12:00',
            purpose: 'Lecture',
            attendees: 25,
            facilities: ['projector', 'whiteboard'],
            status: 'confirmed',
            notes: 'Computer Science 101 - Introduction to Programming',
            createdAt: new Date().toISOString(),
            bookedBy: `${currentUser.firstName} ${currentUser.lastName}`
        },
        {
            id: Date.now() + 2,
            userId: currentUser.id,
            venueId: 2,
            venueName: 'Lecture Hall B',
            venueLocation: 'Building 2, Floor 1',
            date: '2025-07-05',
            startTime: '14:00',
            endTime: '16:00',
            purpose: 'Seminar',
            attendees: 50,
            facilities: ['projector'],
            status: 'confirmed',
            notes: 'Guest speaker presentation on AI and Machine Learning',
            createdAt: new Date().toISOString(),
            bookedBy: `${currentUser.firstName} ${currentUser.lastName}`
        },
        {
            id: Date.now() + 3,
            userId: currentUser.id,
            venueId: 4,
            venueName: 'Computer Lab D',
            venueLocation: 'Building 3, Floor 1',
            date: '2025-06-25',
            startTime: '09:00',
            endTime: '11:00',
            purpose: 'Practical Session',
            attendees: 20,
            facilities: ['computer', 'projector'],
            status: 'confirmed',
            notes: 'Database Management practical session',
            createdAt: new Date().toISOString(),
            bookedBy: `${currentUser.firstName} ${currentUser.lastName}`
        }
    ];
    
    // Add to localStorage
    const allBookings = JSON.parse(localStorage.getItem('venueManagerBookings') || '[]');
    allBookings.push(...sampleBookings);
    localStorage.setItem('venueManagerBookings', JSON.stringify(allBookings));
    
    userBookings = sampleBookings;
}

// Setup event listeners
function setupBookingsEventListeners() {
    const searchInput = document.getElementById('bookings-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchBookings, 300));
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBookings();
            }
        });
    }
}

// Update bookings summary
function updateBookingsSummary() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const upcoming = userBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= today && booking.status !== 'cancelled';
    });
    
    const past = userBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate < today && booking.status !== 'cancelled';
    });
    
    const cancelled = userBookings.filter(booking => booking.status === 'cancelled');
    
    document.getElementById('total-bookings-count').textContent = userBookings.length;
    document.getElementById('upcoming-bookings-count').textContent = upcoming.length;
    document.getElementById('past-bookings-count').textContent = past.length;
    document.getElementById('cancelled-bookings-count').textContent = cancelled.length;
}

// Display bookings based on current view
function displayBookings() {
    if (currentView === 'list') {
        displayBookingsList();
    } else {
        displayBookingsCalendar();
    }
}

// Display bookings in list view
function displayBookingsList() {
    const bookingsList = document.getElementById('bookings-list');
    const noBookingsMessage = document.getElementById('no-bookings');
    
    if (!bookingsList) return;
    
    if (filteredBookings.length === 0) {
        bookingsList.style.display = 'none';
        noBookingsMessage.style.display = 'block';
        return;
    }
    
    bookingsList.style.display = 'block';
    noBookingsMessage.style.display = 'none';
    
    bookingsList.innerHTML = filteredBookings.map(booking => createBookingCard(booking)).join('');
}

// Create booking card HTML
function createBookingCard(booking) {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    const isUpcoming = bookingDate >= now;
    const isPast = bookingDate < now;
    
    const statusClass = `status-${booking.status}`;
    const statusText = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
    
    const facilitiesHTML = booking.facilities.map(facility => 
        `<span class="facility-tag">${facility}</span>`
    ).join('');
    
    const actionButtons = getBookingActionButtons(booking, isUpcoming, isPast);
    
    return `
        <div class="booking-card ${statusClass}" data-booking-id="${booking.id}">
            <div class="booking-header">
                <div class="booking-title">
                    <h3>${booking.venueName}</h3>
                    <span class="booking-status ${statusClass}">${statusText}</span>
                </div>
                <div class="booking-date">
                    <span class="date">${formatDate(booking.date)}</span>
                    <span class="time">${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}</span>
                </div>
            </div>
            
            <div class="booking-details">
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${booking.venueLocation}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Purpose:</span>
                    <span class="detail-value">${booking.purpose}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Attendees:</span>
                    <span class="detail-value">${booking.attendees} people</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Facilities:</span>
                    <span class="detail-value">
                        <div class="facilities-tags">
                            ${facilitiesHTML}
                        </div>
                    </span>
                </div>
                ${booking.notes ? `
                    <div class="detail-row">
                        <span class="detail-label">Notes:</span>
                        <span class="detail-value">${booking.notes}</span>
                    </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Booked:</span>
                    <span class="detail-value">${formatDateTime(booking.createdAt)}</span>
                </div>
            </div>
            
            <div class="booking-actions">
                ${actionButtons}
            </div>
        </div>
    `;
}

// Get action buttons based on booking status and timing
function getBookingActionButtons(booking, isUpcoming, isPast) {
    let buttons = [];
    
    // View details button (always available)
    buttons.push(`
        <button class="btn btn-outline" onclick="viewBookingDetails(${booking.id})">
            View Details
        </button>
    `);
    
    // Modify button (only for upcoming confirmed bookings)
    if (isUpcoming && booking.status === 'confirmed') {
        buttons.push(`
            <button class="btn btn-outline" onclick="modifyBooking(${booking.id})">
                Modify
            </button>
        `);
    }
    
    // Cancel button (only for upcoming non-cancelled bookings)
    if (isUpcoming && booking.status !== 'cancelled') {
        buttons.push(`
            <button class="btn btn-danger" onclick="cancelBooking(${booking.id})">
                Cancel
            </button>
        `);
    }
    
    // Rebook button (for past or cancelled bookings)
    if (isPast || booking.status === 'cancelled') {
        buttons.push(`
            <button class="btn btn-primary" onclick="rebookVenue(${booking.id})">
                Book Again
            </button>
        `);
    }
    
    return buttons.join('');
}

// Search bookings
function searchBookings() {
    const searchInput = document.getElementById('bookings-search');
    const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';
    
    applyFilters();
}

// Filter bookings
function filterBookings() {
    applyFilters();
}

// Sort bookings
function sortBookings() {
    const sortBy = document.getElementById('sort-bookings')?.value;
    if (!sortBy) return;
    
    const sorted = sortBookingsList(filteredBookings, sortBy);
    filteredBookings = sorted;
    displayBookings();
}

// Apply all filters
function applyFilters() {
    let filtered = [...userBookings];
    
    // Text search
    const searchText = document.getElementById('bookings-search')?.value.trim().toLowerCase();
    if (searchText) {
        filtered = filtered.filter(booking => 
            booking.venueName.toLowerCase().includes(searchText) ||
            booking.venueLocation.toLowerCase().includes(searchText) ||
            booking.purpose.toLowerCase().includes(searchText) ||
            booking.notes.toLowerCase().includes(searchText)
        );
    }
    
    // Status filter
    const statusFilter = document.getElementById('status-filter')?.value;
    if (statusFilter) {
        filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    // Date filter
    const dateFilter = document.getElementById('date-filter')?.value;
    if (dateFilter) {
        filtered = filterBookingsByDate(filtered, dateFilter);
    }
    
    filteredBookings = filtered;
    
    // Apply current sort
    const sortBy = document.getElementById('sort-bookings')?.value;
    if (sortBy) {
        filteredBookings = sortBookingsList(filteredBookings, sortBy);
    }
    
    displayBookings();
}

// Filter bookings by date range
function filterBookingsByDate(bookings, dateFilter) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
        case 'upcoming':
            return bookings.filter(booking => new Date(booking.date) >= today);
        case 'past':
            return bookings.filter(booking => new Date(booking.date) < today);
        case 'today':
            return bookings.filter(booking => {
                const bookingDate = new Date(booking.date);
                return bookingDate.toDateString() === today.toDateString();
            });
        case 'this-week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return bookings.filter(booking => {
                const bookingDate = new Date(booking.date);
                return bookingDate >= weekStart && bookingDate <= weekEnd;
            });
        case 'this-month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            return bookings.filter(booking => {
                const bookingDate = new Date(booking.date);
                return bookingDate >= monthStart && bookingDate <= monthEnd;
            });
        default:
            return bookings;
    }
}

// Sort bookings list
function sortBookingsList(bookings, sortBy) {
    const sorted = [...bookings];
    
    switch (sortBy) {
        case 'date-desc':
            return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'date-asc':
            return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
        case 'venue':
            return sorted.sort((a, b) => a.venueName.localeCompare(b.venueName));
        case 'status':
            const statusOrder = { 'confirmed': 1, 'pending': 2, 'cancelled': 3 };
            return sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        default:
            return sorted;
    }
}

// Set bookings view (list or calendar)
function setBookingsView(view) {
    currentView = view;
    
    // Update view buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });
    
    // Show/hide views
    const listView = document.getElementById('bookings-list-view');
    const calendarView = document.getElementById('bookings-calendar-view');
    
    if (view === 'list') {
        listView.classList.add('active');
        calendarView.classList.remove('active');
        displayBookingsList();
    } else {
        listView.classList.remove('active');
        calendarView.classList.add('active');
        displayBookingsCalendar();
    }
}

// Display bookings in calendar view
function displayBookingsCalendar() {
    updateCalendarHeader();
    generateCalendarGrid();
}

// Update calendar header
function updateCalendarHeader() {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthYear = `${monthNames[currentCalendarDate.getMonth()]} ${currentCalendarDate.getFullYear()}`;
    document.getElementById('calendar-month-year').textContent = monthYear;
}

// Generate calendar grid
function generateCalendarGrid() {
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Create calendar HTML
    let calendarHTML = `
        <div class="calendar-weekdays">
            <div class="weekday">Sun</div>
            <div class="weekday">Mon</div>
            <div class="weekday">Tue</div>
            <div class="weekday">Wed</div>
            <div class="weekday">Thu</div>
            <div class="weekday">Fri</div>
            <div class="weekday">Sat</div>
        </div>
        <div class="calendar-days">
    `;
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toISOString().split('T')[0];
        const dayBookings = filteredBookings.filter(booking => booking.date === dateString);
        
        const isToday = date.toDateString() === new Date().toDateString();
        const dayClass = isToday ? 'calendar-day today' : 'calendar-day';
        
        let bookingsHTML = '';
        if (dayBookings.length > 0) {
            bookingsHTML = dayBookings.slice(0, 3).map(booking => 
                `<div class="calendar-booking ${booking.status}" onclick="viewBookingDetails(${booking.id})">
                    ${booking.venueName} ${formatTime(booking.startTime)}
                </div>`
            ).join('');
            
            if (dayBookings.length > 3) {
                bookingsHTML += `<div class="calendar-booking-more">+${dayBookings.length - 3} more</div>`;
            }
        }
        
        calendarHTML += `
            <div class="${dayClass}" data-date="${dateString}">
                <div class="calendar-day-number">${day}</div>
                <div class="calendar-day-bookings">
                    ${bookingsHTML}
                </div>
            </div>
        `;
    }
    
    calendarHTML += '</div>';
    calendarGrid.innerHTML = calendarHTML;
}

// Navigate to previous month
function previousMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    displayBookingsCalendar();
}

// Navigate to next month
function nextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    displayBookingsCalendar();
}

// View booking details
function viewBookingDetails(bookingId) {
    const booking = userBookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    const modal = document.createElement('div');
    modal.className = 'booking-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Booking Details</h2>
                <button class="modal-close" onclick="closeBookingDetailsModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="booking-details-content">
                    <div class="detail-section">
                        <h3>Venue Information</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <strong>Venue:</strong>
                                <span>${booking.venueName}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Location:</strong>
                                <span>${booking.venueLocation}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>Booking Information</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <strong>Date:</strong>
                                <span>${formatDate(booking.date)}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Time:</strong>
                                <span>${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Purpose:</strong>
                                <span>${booking.purpose}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Attendees:</strong>
                                <span>${booking.attendees} people</span>
                            </div>
                            <div class="detail-item">
                                <strong>Status:</strong>
                                <span class="status-badge ${booking.status}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>Facilities</h3>
                        <div class="facilities-list">
                            ${booking.facilities.map(facility => `<span class="facility-tag">${facility}</span>`).join('')}
                        </div>
                    </div>
                    
                    ${booking.notes ? `
                        <div class="detail-section">
                            <h3>Additional Notes</h3>
                            <p>${booking.notes}</p>
                        </div>
                    ` : ''}
                    
                    <div class="detail-section">
                        <h3>Booking History</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <strong>Booked by:</strong>
                                <span>${booking.bookedBy}</span>
                            </div>
                            <div class="detail-item">
                                <strong>Booked on:</strong>
                                <span>${formatDateTime(booking.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-actions">
                    ${getBookingModalActions(booking)}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    addBookingDetailsModalStyles();
}

// Get booking modal actions
function getBookingModalActions(booking) {
    const now = new Date();
    const bookingDate = new Date(booking.date);
    const isUpcoming = bookingDate >= now;
    
    let actions = [];
    
    if (isUpcoming && booking.status === 'confirmed') {
        actions.push(`
            <button class="btn btn-outline" onclick="modifyBooking(${booking.id}); closeBookingDetailsModal();">
                Modify Booking
            </button>
        `);
    }
    
    if (isUpcoming && booking.status !== 'cancelled') {
        actions.push(`
            <button class="btn btn-danger" onclick="cancelBooking(${booking.id}); closeBookingDetailsModal();">
                Cancel Booking
            </button>
        `);
    }
    
    if (!isUpcoming || booking.status === 'cancelled') {
        actions.push(`
            <button class="btn btn-primary" onclick="rebookVenue(${booking.id}); closeBookingDetailsModal();">
                Book Again
            </button>
        `);
    }
    
    actions.push(`
        <button class="btn btn-outline" onclick="closeBookingDetailsModal()">
            Close
        </button>
    `);
    
    return actions.join('');
}

// Close booking details modal
function closeBookingDetailsModal() {
    const modal = document.querySelector('.booking-details-modal');
    if (modal) {
        modal.remove();
    }
}

// Modify booking
function modifyBooking(bookingId) {
    const booking = userBookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    // Store booking data for modification
    sessionStorage.setItem('modifyBooking', JSON.stringify(booking));
    window.location.href = 'booking.html';
}

// Cancel booking
function cancelBooking(bookingId) {
    const booking = userBookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    if (confirm(`Are you sure you want to cancel the booking for ${booking.venueName} on ${formatDate(booking.date)}?`)) {
        // Update booking status
        booking.status = 'cancelled';
        
        // Update in localStorage
        const allBookings = JSON.parse(localStorage.getItem('venueManagerBookings') || '[]');
        const bookingIndex = allBookings.findIndex(b => b.id === bookingId);
        if (bookingIndex !== -1) {
            allBookings[bookingIndex].status = 'cancelled';
            localStorage.setItem('venueManagerBookings', JSON.stringify(allBookings));
        }
        
        // Refresh display
        loadUserBookings();
        updateBookingsSummary();
        displayBookings();
        
        showMessage('Booking cancelled successfully', 'success');
    }
}

// Rebook venue
function rebookVenue(bookingId) {
    const booking = userBookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    // Store booking data for rebooking
    const rebookData = {
        venueId: booking.venueId,
        purpose: booking.purpose,
        attendees: booking.attendees,
        facilities: booking.facilities,
        notes: booking.notes
    };
    
    sessionStorage.setItem('rebookData', JSON.stringify(rebookData));
    window.location.href = 'booking.html';
}

// Export bookings
function exportBookings() {
    const csvContent = generateBookingsCSV();
    downloadCSV(csvContent, 'my-bookings.csv');
    showMessage('Bookings exported successfully', 'success');
}

// Generate CSV content
function generateBookingsCSV() {
    const headers = ['Date', 'Time', 'Venue', 'Location', 'Purpose', 'Attendees', 'Status', 'Notes'];
    const rows = filteredBookings.map(booking => [
        booking.date,
        `${booking.startTime} - ${booking.endTime}`,
        booking.venueName,
        booking.venueLocation,
        booking.purpose,
        booking.attendees,
        booking.status,
        booking.notes || ''
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    return csvContent;
}

// Download CSV file
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
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

// Add booking details modal styles
function addBookingDetailsModalStyles() {
    if (document.getElementById('booking-details-modal-styles')) return;
    
    const modalCSS = `
        .booking-details-modal {
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
        
        .booking-details-modal .modal-content {
            max-width: 700px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .booking-details-content {
            margin-bottom: 2rem;
        }
        
        .detail-section {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid #e1e8ed;
        }
        
        .detail-section:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .detail-section h3 {
            color: #2c3e50;
            margin-bottom: 1rem;
            font-size: 1.2rem;
        }
        
        .detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }
        
        .detail-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        
        .detail-item strong {
            color: #5a6c7d;
            font-size: 0.9rem;
        }
        
        .detail-item span {
            color: #2c3e50;
        }
        
        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: bold;
            text-transform: uppercase;
            display: inline-block;
            width: fit-content;
        }
        
        .status-badge.confirmed {
            background: #27ae60;
            color: white;
        }
        
        .status-badge.pending {
            background: #f39c12;
            color: white;
        }
        
        .status-badge.cancelled {
            background: #e74c3c;
            color: white;
        }
        
        .facilities-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .modal-actions {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            justify-content: flex-end;
        }
        
        @media (max-width: 768px) {
            .detail-grid {
                grid-template-columns: 1fr;
            }
            
            .modal-actions {
                flex-direction: column;
            }
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'booking-details-modal-styles';
    style.textContent = modalCSS;
    document.head.appendChild(style);
}

// Add my bookings page styles
const myBookingsCSS = `
    .bookings-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .page-title {
        color: #2c3e50;
        font-size: 2.5rem;
        margin-bottom: 2rem;
    }
    
    .bookings-summary {
        display: flex;
        justify-content: center;
        gap: 2rem;
        flex-wrap: wrap;
        margin-bottom: 2rem;
    }
    
    .summary-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 10px;
        text-align: center;
        min-width: 120px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .summary-number {
        display: block;
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
    
    .summary-label {
        font-size: 0.9rem;
        opacity: 0.9;
    }
    
    .bookings-controls {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        margin-bottom: 2rem;
    }
    
    .controls-row {
        display: flex;
        gap: 2rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        align-items: end;
    }
    
    .controls-row:last-child {
        margin-bottom: 0;
    }
    
    .search-group {
        display: flex;
        gap: 0.5rem;
        flex: 1;
        min-width: 250px;
    }
    
    .filter-group,
    .sort-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-width: 150px;
    }
    
    .filter-group label,
    .sort-group label {
        font-weight: 600;
        color: #2c3e50;
        font-size: 0.9rem;
    }
    
    .filter-group select,
    .sort-group select {
        padding: 8px;
        border: 2px solid #e1e8ed;
        border-radius: 5px;
        font-size: 0.9rem;
    }
    
    .view-toggle {
        display: flex;
        gap: 0.5rem;
    }
    
    .view-btn {
        padding: 0.75rem 1rem;
        border: 2px solid #e1e8ed;
        background: white;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }
    
    .view-btn.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
    }
    
    .view-btn:hover {
        border-color: #667eea;
    }
    
    .action-buttons {
        display: flex;
        gap: 1rem;
    }
    
    .bookings-view {
        display: none;
    }
    
    .bookings-view.active {
        display: block;
    }
    
    .bookings-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .booking-card {
        background: white;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        padding: 2rem;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border-left: 5px solid #667eea;
    }
    
    .booking-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }
    
    .booking-card.status-cancelled {
        border-left-color: #e74c3c;
        opacity: 0.8;
    }
    
    .booking-card.status-pending {
        border-left-color: #f39c12;
    }
    
    .booking-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
    }
    
    .booking-title {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    .booking-title h3 {
        color: #2c3e50;
        margin: 0;
        font-size: 1.3rem;
    }
    
    .booking-status {
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
    }
    
    .booking-status.status-confirmed {
        background: #27ae60;
        color: white;
    }
    
    .booking-status.status-pending {
        background: #f39c12;
        color: white;
    }
    
    .booking-status.status-cancelled {
        background: #e74c3c;
        color: white;
    }
    
    .booking-date {
        text-align: right;
        color: #5a6c7d;
    }
    
    .booking-date .date {
        display: block;
        font-weight: bold;
        font-size: 1.1rem;
        color: #2c3e50;
    }
    
    .booking-date .time {
        font-size: 0.9rem;
    }
    
    .booking-details {
        margin-bottom: 1.5rem;
    }
    
    .detail-row {
        display: flex;
        margin-bottom: 0.75rem;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .detail-label {
        font-weight: 600;
        color: #5a6c7d;
        min-width: 100px;
        font-size: 0.9rem;
    }
    
    .detail-value {
        color: #2c3e50;
        flex: 1;
    }
    
    .booking-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    .booking-actions .btn {
        padding: 0.75rem 1rem;
        font-size: 0.9rem;
    }
    
    .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding: 1rem;
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .calendar-header h2 {
        margin: 0;
        color: #2c3e50;
        font-size: 1.5rem;
    }
    
    .calendar-grid {
        background: white;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        overflow: hidden;
        margin-bottom: 2rem;
    }
    
    .calendar-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        background: #f8f9fa;
        border-bottom: 1px solid #e1e8ed;
    }
    
    .weekday {
        padding: 1rem;
        text-align: center;
        font-weight: bold;
        color: #5a6c7d;
        font-size: 0.9rem;
    }
    
    .calendar-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
    }
    
    .calendar-day {
        min-height: 120px;
        padding: 0.5rem;
        border-right: 1px solid #e1e8ed;
        border-bottom: 1px solid #e1e8ed;
        position: relative;
    }
    
    .calendar-day.empty {
        background: #f8f9fa;
    }
    
    .calendar-day.today {
        background: rgba(102, 126, 234, 0.1);
    }
    
    .calendar-day-number {
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 0.5rem;
    }
    
    .calendar-day-bookings {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .calendar-booking {
        background: #667eea;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 3px;
        font-size: 0.7rem;
        cursor: pointer;
        transition: background 0.3s ease;
    }
    
    .calendar-booking:hover {
        background: #5a6fd8;
    }
    
    .calendar-booking.pending {
        background: #f39c12;
    }
    
    .calendar-booking.cancelled {
        background: #e74c3c;
    }
    
    .calendar-booking-more {
        color: #5a6c7d;
        font-size: 0.7rem;
        font-style: italic;
    }
    
    .calendar-legend {
        display: flex;
        justify-content: center;
        gap: 2rem;
        flex-wrap: wrap;
    }
    
    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .legend-color {
        width: 16px;
        height: 16px;
        border-radius: 3px;
    }
    
    .legend-color.confirmed {
        background: #667eea;
    }
    
    .legend-color.pending {
        background: #f39c12;
    }
    
    .legend-color.cancelled {
        background: #e74c3c;
    }
    
    .no-results {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .no-results-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    
    .no-results h3 {
        color: #2c3e50;
        margin-bottom: 1rem;
    }
    
    .no-results p {
        color: #5a6c7d;
        margin-bottom: 2rem;
    }
    
    @media (max-width: 768px) {
        .page-title {
            font-size: 2rem;
        }
        
        .bookings-summary {
            gap: 1rem;
        }
        
        .summary-card {
            min-width: 100px;
            padding: 1rem;
        }
        
        .summary-number {
            font-size: 1.5rem;
        }
        
        .controls-row {
            flex-direction: column;
            gap: 1rem;
        }
        
        .search-group {
            min-width: auto;
        }
        
        .filter-group,
        .sort-group {
            min-width: auto;
        }
        
        .booking-header {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .booking-date {
            text-align: left;
        }
        
        .booking-actions {
            flex-direction: column;
        }
        
        .calendar-day {
            min-height: 80px;
        }
        
        .calendar-legend {
            gap: 1rem;
        }
        
        .view-toggle {
            flex-direction: column;
        }
        
        .action-buttons {
            flex-direction: column;
        }
    }
    
    @media (max-width: 480px) {
        .bookings-controls {
            padding: 1.5rem;
        }
        
        .booking-card {
            padding: 1.5rem;
        }
        
        .detail-row {
            flex-direction: column;
            gap: 0.25rem;
        }
        
        .detail-label {
            min-width: auto;
        }
        
        .calendar-day {
            min-height: 60px;
            padding: 0.25rem;
        }
        
        .weekday {
            padding: 0.5rem;
            font-size: 0.8rem;
        }
    }
`;

// Add my bookings CSS to head
const myBookingsStyle = document.createElement('style');
myBookingsStyle.textContent = myBookingsCSS;
document.head.appendChild(myBookingsStyle);

