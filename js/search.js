// Search functionality for Venue Manager

// Search venues based on criteria
function searchVenues() {
    const date = document.getElementById('search-date')?.value;
    const startTime = document.getElementById('search-start-time')?.value;
    const endTime = document.getElementById('search-end-time')?.value;
    const capacity = document.getElementById('search-capacity')?.value;
    
    // Get selected facilities
    const facilities = [];
    const facilityCheckboxes = document.querySelectorAll('input[name="facilities"]:checked');
    facilityCheckboxes.forEach(checkbox => {
        facilities.push(checkbox.value);
    });
    
    // Validate required fields
    if (!date || !startTime || !endTime) {
        showMessage('Please fill in date and time fields', 'error');
        return;
    }
    
    // Validate time range
    if (startTime >= endTime) {
        showMessage('End time must be after start time', 'error');
        return;
    }
    
    // Show loading
    showLoading();
    
    // Simulate search delay
    setTimeout(() => {
        const results = performVenueSearch({
            date,
            startTime,
            endTime,
            capacity: capacity ? parseInt(capacity) : 0,
            facilities
        });
        
        hideLoading();
        displaySearchResults(results);
    }, 1000);
}

// Perform venue search logic
function performVenueSearch(criteria) {
    return venues.filter(venue => {
        // Check capacity
        if (criteria.capacity > 0 && venue.capacity < criteria.capacity) {
            return false;
        }
        
        // Check facilities
        if (criteria.facilities.length > 0) {
            const hasAllFacilities = criteria.facilities.every(facility => 
                venue.facilities.includes(facility)
            );
            if (!hasAllFacilities) {
                return false;
            }
        }
        
        // Check availability (simplified - in real app would check against bookings)
        if (venue.status === 'booked') {
            return false;
        }
        
        // Check timetable conflicts (simplified)
        if (isVenueBookedAtTime(venue.id, criteria.date, criteria.startTime, criteria.endTime)) {
            return false;
        }
        
        return true;
    });
}

// Check if venue is booked at specific time
function isVenueBookedAtTime(venueId, date, startTime, endTime) {
    // In a real application, this would check against the database
    // For demo purposes, we'll simulate some bookings
    const simulatedBookings = [
        {
            venueId: 1,
            date: '2025-06-30',
            startTime: '09:00',
            endTime: '11:00'
        },
        {
            venueId: 2,
            date: '2025-06-30',
            startTime: '14:00',
            endTime: '16:00'
        }
    ];
    
    return simulatedBookings.some(booking => {
        if (booking.venueId !== venueId || booking.date !== date) {
            return false;
        }
        
        // Check for time overlap
        return (startTime < booking.endTime && endTime > booking.startTime);
    });
}

// Display search results
function displaySearchResults(results) {
    // Remove existing results
    const existingResults = document.getElementById('search-results');
    if (existingResults) {
        existingResults.remove();
    }
    
    // Create results container
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'search-results';
    resultsContainer.className = 'search-results';
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <h3>No venues found</h3>
                <p>Try adjusting your search criteria or selecting a different date/time.</p>
            </div>
        `;
    } else {
        resultsContainer.innerHTML = `
            <h3>Available Venues (${results.length} found)</h3>
            <div class="results-grid">
                ${results.map(venue => createVenueCard(venue)).join('')}
            </div>
        `;
    }
    
    // Insert results after search form
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.parentNode.insertBefore(resultsContainer, searchForm.nextSibling);
    }
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// Create venue card HTML
function createVenueCard(venue) {
    const facilitiesHTML = venue.facilities.map(facility => 
        `<span class="facility-tag">${facility}</span>`
    ).join('');
    
    return `
        <div class="venue-card" data-venue-id="${venue.id}">
            <div class="venue-image">
                <img src="${venue.image}" alt="${venue.name}" loading="lazy">
            </div>
            <div class="venue-info">
                <h4>${venue.name}</h4>
                <p class="venue-location">${venue.location}</p>
                <div class="venue-details">
                    <div class="capacity-info">
                        <strong>Capacity:</strong> ${venue.capacity} seats
                    </div>
                    <div class="facilities-info">
                        <strong>Facilities:</strong>
                        <div class="facilities-tags">
                            ${facilitiesHTML}
                        </div>
                    </div>
                </div>
                <div class="venue-actions">
                    <button class="btn btn-primary" onclick="selectVenue(${venue.id})">
                        Select This Venue
                    </button>
                    <button class="btn btn-outline" onclick="viewVenueDetails(${venue.id})">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Select venue for booking
function selectVenue(venueId) {
    const venue = venues.find(v => v.id === venueId);
    if (!venue) return;
    
    // Store selected venue in session storage
    sessionStorage.setItem('selectedVenue', JSON.stringify(venue));
    
    // Get search criteria
    const searchCriteria = {
        date: document.getElementById('search-date')?.value,
        startTime: document.getElementById('search-start-time')?.value,
        endTime: document.getElementById('search-end-time')?.value,
        capacity: document.getElementById('search-capacity')?.value
    };
    
    sessionStorage.setItem('searchCriteria', JSON.stringify(searchCriteria));
    
    // Redirect to booking page
    window.location.href = 'booking.html';
}

// View venue details
function viewVenueDetails(venueId) {
    const venue = venues.find(v => v.id === venueId);
    if (!venue) return;
    
    // Create modal for venue details
    const modal = document.createElement('div');
    modal.className = 'venue-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${venue.name}</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <img src="${venue.image}" alt="${venue.name}" class="venue-detail-image">
                <div class="venue-detail-info">
                    <p><strong>Location:</strong> ${venue.location}</p>
                    <p><strong>Total Capacity:</strong> ${venue.capacity} seats</p>
                    <p><strong>Exam Capacity (Type 1):</strong> ${venue.examCapacity1} seats</p>
                    <p><strong>Exam Capacity (Type 2):</strong> ${venue.examCapacity2} seats</p>
                    <div class="facilities-detail">
                        <strong>Available Facilities:</strong>
                        <ul>
                            ${venue.facilities.map(facility => `<li>${facility}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="selectVenue(${venue.id})">
                    Book This Venue
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    addModalStyles();
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.venue-modal');
    if (modal) {
        modal.remove();
    }
}

// Add modal styles
function addModalStyles() {
    if (document.getElementById('modal-styles')) return;
    
    const modalCSS = `
        .venue-modal {
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
        
        .modal-content {
            background: white;
            border-radius: 10px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #eee;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            color: #999;
        }
        
        .modal-close:hover {
            color: #333;
        }
        
        .modal-body {
            padding: 1.5rem;
        }
        
        .venue-detail-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 5px;
            margin-bottom: 1rem;
        }
        
        .venue-detail-info p {
            margin-bottom: 0.5rem;
        }
        
        .facilities-detail ul {
            margin-left: 1rem;
            margin-top: 0.5rem;
        }
        
        .modal-footer {
            padding: 1.5rem;
            border-top: 1px solid #eee;
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
        }
        
        .search-results {
            margin-top: 2rem;
            padding: 2rem;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin-top: 1.5rem;
        }
        
        .venue-card {
            border: 1px solid #e1e8ed;
            border-radius: 10px;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .venue-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        
        .venue-image img {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        
        .venue-info {
            padding: 1.5rem;
        }
        
        .venue-info h4 {
            margin-bottom: 0.5rem;
            color: #2c3e50;
        }
        
        .venue-location {
            color: #5a6c7d;
            margin-bottom: 1rem;
        }
        
        .venue-details {
            margin-bottom: 1.5rem;
        }
        
        .capacity-info,
        .facilities-info {
            margin-bottom: 0.5rem;
        }
        
        .facilities-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        
        .facility-tag {
            background: #667eea;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 3px;
            font-size: 0.8rem;
        }
        
        .venue-actions {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        .venue-actions .btn {
            flex: 1;
            min-width: 120px;
        }
        
        .no-results {
            text-align: center;
            padding: 3rem;
            color: #5a6c7d;
        }
        
        .no-results h3 {
            margin-bottom: 1rem;
            color: #2c3e50;
        }
        
        @media (max-width: 768px) {
            .results-grid {
                grid-template-columns: 1fr;
            }
            
            .venue-actions {
                flex-direction: column;
            }
            
            .modal-content {
                width: 95%;
                margin: 1rem;
            }
            
            .modal-footer {
                flex-direction: column;
            }
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = modalCSS;
    document.head.appendChild(style);
}

// Filter venues by text search
function filterVenuesByText(searchText) {
    if (!searchText) return venues;
    
    const text = searchText.toLowerCase();
    return venues.filter(venue => 
        venue.name.toLowerCase().includes(text) ||
        venue.location.toLowerCase().includes(text) ||
        venue.facilities.some(facility => facility.toLowerCase().includes(text))
    );
}

// Sort venues by criteria
function sortVenues(venueList, sortBy) {
    const sorted = [...venueList];
    
    switch (sortBy) {
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'capacity':
            return sorted.sort((a, b) => b.capacity - a.capacity);
        case 'location':
            return sorted.sort((a, b) => a.location.localeCompare(b.location));
        default:
            return sorted;
    }
}

// Initialize search functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for real-time search
    const searchInputs = document.querySelectorAll('#search-date, #search-start-time, #search-end-time, #search-capacity');
    searchInputs.forEach(input => {
        input.addEventListener('change', debounce(function() {
            // Auto-search when all required fields are filled
            const date = document.getElementById('search-date')?.value;
            const startTime = document.getElementById('search-start-time')?.value;
            const endTime = document.getElementById('search-end-time')?.value;
            
            if (date && startTime && endTime) {
                searchVenues();
            }
        }, 500));
    });
    
    // Add event listeners for facility checkboxes
    const facilityCheckboxes = document.querySelectorAll('input[name="facilities"]');
    facilityCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', debounce(function() {
            const date = document.getElementById('search-date')?.value;
            const startTime = document.getElementById('search-start-time')?.value;
            const endTime = document.getElementById('search-end-time')?.value;
            
            if (date && startTime && endTime) {
                searchVenues();
            }
        }, 300));
    });
    
    // Close modal when clicking outside
    document.addEventListener('click', function(event) {
        const modal = document.querySelector('.venue-modal');
        if (modal && event.target === modal) {
            closeModal();
        }
    });
    
    // Close modal with escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
});

