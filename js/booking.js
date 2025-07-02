// Booking functionality for Venue Manager

let selectedVenueForBooking = null;

// Initialize booking page
document.addEventListener('DOMContentLoaded', function() {
    initializeBookingPage();
    setupBookingEventListeners();
    loadSelectedVenue();
    loadSearchCriteria();
});

// Initialize booking page
function initializeBookingPage() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        dateInput.min = today;
    }
    
    // Check if user is logged in and is a lecturer
    if (!currentUser) {
        showMessage('Please sign in to make a booking', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    if (currentUser.role !== 'lecturer' && currentUser.role !== 'admin') {
        showMessage('Only lecturers can make venue bookings', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
}

// Setup booking event listeners
function setupBookingEventListeners() {
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    // Listen for changes in booking details to suggest venues
    const bookingInputs = document.querySelectorAll('#booking-date, #booking-start-time, #booking-end-time, #attendees, #purpose');
    bookingInputs.forEach(input => {
        input.addEventListener('change', debounce(suggestVenues, 500));
    });
    
    // Listen for facility requirement changes
    const facilityCheckboxes = document.querySelectorAll('input[name="requirements"]');
    facilityCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', debounce(suggestVenues, 300));
    });
}

// Load selected venue from session storage
function loadSelectedVenue() {
    const venueData = sessionStorage.getItem('selectedVenue');
    if (venueData) {
        selectedVenueForBooking = JSON.parse(venueData);
        displaySelectedVenue();
    }
}

// Load search criteria from session storage
function loadSearchCriteria() {
    const criteriaData = sessionStorage.getItem('searchCriteria');
    if (criteriaData) {
        const criteria = JSON.parse(criteriaData);
        
        // Pre-fill form with search criteria
        if (criteria.date) {
            document.getElementById('booking-date').value = criteria.date;
        }
        if (criteria.startTime) {
            document.getElementById('booking-start-time').value = criteria.startTime;
        }
        if (criteria.endTime) {
            document.getElementById('booking-end-time').value = criteria.endTime;
        }
        if (criteria.capacity) {
            document.getElementById('attendees').value = criteria.capacity;
        }
        
        // Trigger venue suggestion
        setTimeout(suggestVenues, 500);
    }
}

// Display selected venue
function displaySelectedVenue() {
    if (!selectedVenueForBooking) return;
    
    const selectedVenueDiv = document.getElementById('selected-venue');
    const venueDisplay = document.getElementById('venue-display');
    
    if (selectedVenueDiv && venueDisplay) {
        venueDisplay.innerHTML = `
            <div class="selected-venue-card">
                <img src="${selectedVenueForBooking.image}" alt="${selectedVenueForBooking.name}" class="selected-venue-image">
                <div class="selected-venue-info">
                    <h4>${selectedVenueForBooking.name}</h4>
                    <p><strong>Location:</strong> ${selectedVenueForBooking.location}</p>
                    <p><strong>Capacity:</strong> ${selectedVenueForBooking.capacity} seats</p>
                    <p><strong>Facilities:</strong> ${selectedVenueForBooking.facilities.join(', ')}</p>
                    <button class="btn btn-outline btn-small" onclick="changeVenue()">Change Venue</button>
                </div>
            </div>
        `;
        selectedVenueDiv.style.display = 'block';
        
        // Hide venue selection section
        const venueSelectionSection = document.getElementById('venue-selection-section');
        if (venueSelectionSection) {
            venueSelectionSection.style.display = 'none';
        }
    }
}

// Change venue selection
function changeVenue() {
    selectedVenueForBooking = null;
    sessionStorage.removeItem('selectedVenue');
    
    const selectedVenueDiv = document.getElementById('selected-venue');
    const venueSelectionSection = document.getElementById('venue-selection-section');
    
    if (selectedVenueDiv) {
        selectedVenueDiv.style.display = 'none';
    }
    if (venueSelectionSection) {
        venueSelectionSection.style.display = 'block';
    }
    
    suggestVenues();
}

// Suggest venues based on booking criteria
function suggestVenues() {
    const date = document.getElementById('booking-date')?.value;
    const startTime = document.getElementById('booking-start-time')?.value;
    const endTime = document.getElementById('booking-end-time')?.value;
    const attendees = document.getElementById('attendees')?.value;
    
    // Get selected requirements
    const requirements = [];
    const requirementCheckboxes = document.querySelectorAll('input[name="requirements"]:checked');
    requirementCheckboxes.forEach(checkbox => {
        requirements.push(checkbox.value);
    });
    
    // Only suggest if we have basic criteria
    if (!date || !startTime || !endTime) {
        return;
    }
    
    // Validate time range
    if (startTime >= endTime) {
        showMessage('End time must be after start time', 'error');
        return;
    }
    
    const criteria = {
        date,
        startTime,
        endTime,
        capacity: attendees ? parseInt(attendees) : 0,
        facilities: requirements
    };
    
    const suggestedVenues = performVenueSearch(criteria);
    displaySuggestedVenues(suggestedVenues);
}

// Display suggested venues
function displaySuggestedVenues(venues) {
    const suggestedVenuesDiv = document.getElementById('suggested-venues');
    if (!suggestedVenuesDiv) return;
    
    if (venues.length === 0) {
        suggestedVenuesDiv.innerHTML = `
            <div class="no-suggestions">
                <p>No venues match your criteria. Please adjust your requirements or try a different time slot.</p>
            </div>
        `;
        return;
    }
    
    suggestedVenuesDiv.innerHTML = venues.map(venue => `
        <div class="suggestion-card" data-venue-id="${venue.id}">
            <div class="suggestion-image">
                <img src="${venue.image}" alt="${venue.name}">
            </div>
            <div class="suggestion-info">
                <h4>${venue.name}</h4>
                <p class="suggestion-location">${venue.location}</p>
                <div class="suggestion-details">
                    <span class="capacity-badge">Capacity: ${venue.capacity}</span>
                    <div class="facilities-badges">
                        ${venue.facilities.map(facility => `<span class="facility-badge">${facility}</span>`).join('')}
                    </div>
                </div>
                <button class="btn btn-primary btn-small" onclick="selectVenueForBooking(${venue.id})">
                    Select This Venue
                </button>
            </div>
        </div>
    `).join('');
}

// Select venue for booking
function selectVenueForBooking(venueId) {
    const venue = venues.find(v => v.id === venueId);
    if (!venue) return;
    
    selectedVenueForBooking = venue;
    sessionStorage.setItem('selectedVenue', JSON.stringify(venue));
    displaySelectedVenue();
}

// Handle booking form submission
function handleBookingSubmit(event) {
    event.preventDefault();
    
    // Check if venue is selected
    if (!selectedVenueForBooking) {
        showMessage('Please select a venue for your booking', 'error');
        return;
    }
    
    // Validate form
    if (!validateBookingForm()) {
        return;
    }
    
    // Get form data
    const formData = new FormData(event.target);
    const bookingData = {
        venueId: selectedVenueForBooking.id,
        venueName: selectedVenueForBooking.name,
        userId: currentUser.id,
        userName: `${currentUser.firstName} ${currentUser.lastName}`,
        date: formData.get('date'),
        startTime: formData.get('start-time'),
        endTime: formData.get('end-time'),
        purpose: formData.get('purpose'),
        attendees: parseInt(formData.get('attendees')),
        requirements: Array.from(document.querySelectorAll('input[name="requirements"]:checked')).map(cb => cb.value),
        notes: formData.get('notes'),
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Show loading
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        
        // Save booking to local storage (in real app, this would go to backend)
        saveBooking(bookingData);
        
        // Show success message
        showBookingConfirmation(bookingData);
        
        // Clear session storage
        sessionStorage.removeItem('selectedVenue');
        sessionStorage.removeItem('searchCriteria');
        
    }, 2000);
}

// Validate booking form
function validateBookingForm() {
    const form = document.getElementById('booking-form');
    let isValid = true;
    
    // Basic form validation
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
    
    // Time validation
    const startTime = document.getElementById('booking-start-time').value;
    const endTime = document.getElementById('booking-end-time').value;
    
    if (startTime && endTime && startTime >= endTime) {
        showFieldError(document.getElementById('booking-end-time'), 'End time must be after start time');
        isValid = false;
    }
    
    // Capacity validation
    const attendees = parseInt(document.getElementById('attendees').value);
    if (selectedVenueForBooking && attendees > selectedVenueForBooking.capacity) {
        showFieldError(document.getElementById('attendees'), `Maximum capacity for this venue is ${selectedVenueForBooking.capacity}`);
        isValid = false;
    }
    
    // Date validation (not in the past)
    const bookingDate = new Date(document.getElementById('booking-date').value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
        showFieldError(document.getElementById('booking-date'), 'Booking date cannot be in the past');
        isValid = false;
    }
    
    return isValid;
}

// Save booking to local storage
function saveBooking(bookingData) {
    let bookings = JSON.parse(localStorage.getItem('venueManagerBookings') || '[]');
    bookingData.id = Date.now(); // Simple ID generation
    bookings.push(bookingData);
    localStorage.setItem('venueManagerBookings', JSON.stringify(bookings));
}

// Show booking confirmation
function showBookingConfirmation(bookingData) {
    const modal = document.createElement('div');
    modal.className = 'booking-confirmation-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Booking Confirmation</h2>
            </div>
            <div class="modal-body">
                <div class="confirmation-icon">✅</div>
                <h3>Booking Request Submitted Successfully!</h3>
                <div class="booking-summary">
                    <h4>Booking Details:</h4>
                    <p><strong>Venue:</strong> ${bookingData.venueName}</p>
                    <p><strong>Date:</strong> ${formatDate(bookingData.date)}</p>
                    <p><strong>Time:</strong> ${formatTime(bookingData.startTime)} - ${formatTime(bookingData.endTime)}</p>
                    <p><strong>Purpose:</strong> ${bookingData.purpose}</p>
                    <p><strong>Attendees:</strong> ${bookingData.attendees}</p>
                    <p><strong>Status:</strong> <span class="status-pending">Pending Approval</span></p>
                </div>
                <p class="confirmation-note">
                    Your booking request has been submitted and is pending approval. 
                    You will receive a confirmation email once it's approved.
                </p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="closeConfirmationModal()">
                    OK
                </button>
                <button class="btn btn-secondary" onclick="viewMyBookings()">
                    View My Bookings
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    addConfirmationModalStyles();
}

// Close confirmation modal
function closeConfirmationModal() {
    const modal = document.querySelector('.booking-confirmation-modal');
    if (modal) {
        modal.remove();
    }
    
    // Reset form and redirect
    resetForm();
    window.location.href = 'index.html';
}

// View my bookings
function viewMyBookings() {
    window.location.href = 'my-bookings.html';
}

// Reset form
function resetForm() {
    const form = document.getElementById('booking-form');
    if (form) {
        form.reset();
    }
    
    selectedVenueForBooking = null;
    sessionStorage.removeItem('selectedVenue');
    sessionStorage.removeItem('searchCriteria');
    
    const selectedVenueDiv = document.getElementById('selected-venue');
    const venueSelectionSection = document.getElementById('venue-selection-section');
    
    if (selectedVenueDiv) {
        selectedVenueDiv.style.display = 'none';
    }
    if (venueSelectionSection) {
        venueSelectionSection.style.display = 'block';
    }
    
    // Clear suggested venues
    const suggestedVenuesDiv = document.getElementById('suggested-venues');
    if (suggestedVenuesDiv) {
        suggestedVenuesDiv.innerHTML = '';
    }
}

// Search more venues
function searchMoreVenues() {
    window.location.href = 'index.html#quick-search';
}

// Show terms and conditions
function showTerms() {
    const modal = document.createElement('div');
    modal.className = 'terms-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Terms and Conditions</h2>
                <button class="modal-close" onclick="closeTermsModal()">&times;</button>
            </div>
            <div class="modal-body">
                <h3>Venue Booking Terms and Conditions</h3>
                <ol>
                    <li><strong>Booking Authorization:</strong> Only authorized lecturers and staff members may book venues.</li>
                    <li><strong>Advance Booking:</strong> Venues must be booked at least 24 hours in advance.</li>
                    <li><strong>Cancellation Policy:</strong> Bookings can be cancelled up to 2 hours before the scheduled time.</li>
                    <li><strong>Capacity Limits:</strong> The number of attendees must not exceed the venue's maximum capacity.</li>
                    <li><strong>Equipment Responsibility:</strong> Users are responsible for any damage to venue equipment.</li>
                    <li><strong>Cleanliness:</strong> Venues must be left in the same condition as found.</li>
                    <li><strong>Time Limits:</strong> Bookings must end on time to allow for the next scheduled use.</li>
                    <li><strong>Approval Process:</strong> All bookings are subject to administrative approval.</li>
                    <li><strong>Priority System:</strong> Academic activities take priority over other events.</li>
                    <li><strong>Contact Information:</strong> Accurate contact information must be provided for all bookings.</li>
                </ol>
                <p>By checking the agreement box, you acknowledge that you have read and agree to these terms and conditions.</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="closeTermsModal()">
                    I Understand
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    addTermsModalStyles();
}

// Close terms modal
function closeTermsModal() {
    const modal = document.querySelector('.terms-modal');
    if (modal) {
        modal.remove();
    }
}

// Add confirmation modal styles
function addConfirmationModalStyles() {
    if (document.getElementById('confirmation-modal-styles')) return;
    
    const modalCSS = `
        .booking-confirmation-modal {
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
        
        .confirmation-icon {
            font-size: 4rem;
            text-align: center;
            margin-bottom: 1rem;
        }
        
        .booking-summary {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 5px;
            margin: 1rem 0;
        }
        
        .booking-summary h4 {
            margin-bottom: 1rem;
            color: #2c3e50;
        }
        
        .booking-summary p {
            margin-bottom: 0.5rem;
        }
        
        .status-pending {
            color: #f39c12;
            font-weight: bold;
        }
        
        .confirmation-note {
            background: #d1ecf1;
            padding: 1rem;
            border-radius: 5px;
            border-left: 4px solid #17a2b8;
            margin-top: 1rem;
        }
        
        .selected-venue-card {
            display: flex;
            gap: 1rem;
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 5px;
            border: 2px solid #667eea;
        }
        
        .selected-venue-image {
            width: 100px;
            height: 80px;
            object-fit: cover;
            border-radius: 5px;
        }
        
        .selected-venue-info {
            flex: 1;
        }
        
        .selected-venue-info h4 {
            margin-bottom: 0.5rem;
            color: #2c3e50;
        }
        
        .selected-venue-info p {
            margin-bottom: 0.25rem;
            font-size: 0.9rem;
        }
        
        .btn-small {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
        }
        
        .suggestion-card {
            display: flex;
            gap: 1rem;
            background: white;
            padding: 1rem;
            border-radius: 5px;
            border: 1px solid #e1e8ed;
            margin-bottom: 1rem;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .suggestion-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .suggestion-image img {
            width: 80px;
            height: 60px;
            object-fit: cover;
            border-radius: 5px;
        }
        
        .suggestion-info {
            flex: 1;
        }
        
        .suggestion-info h4 {
            margin-bottom: 0.25rem;
            color: #2c3e50;
        }
        
        .suggestion-location {
            color: #5a6c7d;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }
        
        .suggestion-details {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }
        
        .capacity-badge {
            background: #e9ecef;
            padding: 0.25rem 0.5rem;
            border-radius: 3px;
            font-size: 0.8rem;
        }
        
        .facilities-badges {
            display: flex;
            gap: 0.25rem;
            flex-wrap: wrap;
        }
        
        .facility-badge {
            background: #667eea;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 3px;
            font-size: 0.8rem;
        }
        
        .no-suggestions {
            text-align: center;
            padding: 2rem;
            color: #5a6c7d;
            background: #f8f9fa;
            border-radius: 5px;
        }
        
        .form-section {
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #e1e8ed;
        }
        
        .form-section:last-child {
            border-bottom: none;
        }
        
        .form-section h3 {
            margin-bottom: 1rem;
            color: #2c3e50;
        }
        
        .form-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
        }
        
        @media (max-width: 768px) {
            .selected-venue-card,
            .suggestion-card {
                flex-direction: column;
            }
            
            .selected-venue-image,
            .suggestion-image img {
                width: 100%;
                height: 150px;
            }
            
            .form-actions {
                flex-direction: column;
            }
            
            .suggestion-details {
                flex-direction: column;
            }
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'confirmation-modal-styles';
    style.textContent = modalCSS;
    document.head.appendChild(style);
}

// Add terms modal styles
function addTermsModalStyles() {
    if (document.getElementById('terms-modal-styles')) return;
    
    const modalCSS = `
        .terms-modal {
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
        
        .terms-modal .modal-content {
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .terms-modal ol {
            margin-left: 1rem;
        }
        
        .terms-modal li {
            margin-bottom: 0.5rem;
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'terms-modal-styles';
    style.textContent = modalCSS;
    document.head.appendChild(style);
}

