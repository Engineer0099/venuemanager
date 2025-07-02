// Venues page functionality for Venue Manager

let filteredVenues = [];
let currentSearchText = '';

// Initialize venues page
document.addEventListener('DOMContentLoaded', function() {
    loadExtendedVenues();
    displayVenues(venues);
    setupVenueEventListeners();
});

// Load extended venue data
function loadExtendedVenues() {
    // Extended venue data with more venues and realistic statuses
    venues = [
        {
            id: 1,
            name: 'TENT 1',
            location: 'Near to canteen',
            capacity: 270,
            examCapacity1: 135,
            examCapacity2: 125,
            facilities: ['projector', 'whiteboard'],
            image: 'assets/icon.jpg',
            status: 'free',
            description: 'Large lecture venue suitable for night sessions and exams with a lot of attendees.'
        },
        {
            id: 2,
            name: 'TENT 2',
            location: 'Near to canteen',
            capacity: 270,
            examCapacity1: 135,
            examCapacity2: 125,
            facilities: ['projector', 'whiteboard'],
            image: 'assets/image.jpg',
            status: 'timetable',
            description: 'Large lecture venue suitable for night sessions and exams with a lot of attendees.'
        },
        {
            id: 3,
            name: 'TENT 3',
            location: 'Near to canteen',
            capacity: 270,
            examCapacity1: 135,
            examCapacity2: 125,
            facilities: ['projector', 'whiteboard'],
            image: 'assets/logo.jpg',
            status: 'booked',
            description: 'Large lecture venue suitable for night sessions and exams with a lot of attendees.'
        },
        {
            id: 4,
            name: 'TENT 4',
            location: 'Near to canteen',
            capacity: 270,
            examCapacity1: 135,
            examCapacity2: 125,
            facilities: ['projector', 'whiteboard'],
            image: 'assets/icon.jpg',
            status: 'free',
            description: 'Large lecture venue suitable for night sessions and exams with a lot of attendees.'
        },
        {
            id: 5,
            name: 'LB 2-1',
            location: 'New Block B, Second Floor',
            capacity: 200,
            examCapacity1: 100,
            examCapacity2: 80,
            facilities: ['projector', 'whiteboard'],
            image: 'assets/icon.jpg',
            status: 'free',
            description: 'Large lecture venue suitable for exams and presentations with a lot of attendees.'
        },
        {
            id: 6,
            name: 'LB 2-2',
            location: 'New Block B, Second Floor',
            capacity: 200,
            examCapacity1: 100,
            examCapacity2: 80,
            facilities: ['whiteboard','projector'],
            image: 'assets/logo.jpg',
            status: 'timetable',
            description: 'Large lecture venue suitable for exams and presentations with a lot of attendees.'
        }
    ];
}

// Setup event listeners for venues page
function setupVenueEventListeners() {
    const searchInput = document.getElementById('venue-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchVenuesByText, 300));
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchVenuesByText();
            }
        });
    }
}

// Display venues in grid
function displayVenues(venuesToDisplay) {
    const venueGrid = document.getElementById('venue-grid');
    const noVenuesMessage = document.getElementById('no-venues');
    
    if (!venueGrid) return;
    
    if (venuesToDisplay.length === 0) {
        venueGrid.style.display = 'none';
        noVenuesMessage.style.display = 'block';
        return;
    }
    
    venueGrid.style.display = 'grid';
    noVenuesMessage.style.display = 'none';
    
    venueGrid.innerHTML = venuesToDisplay.map(venue => createVenueGridCard(venue)).join('');
}

// Create venue card for grid display
function createVenueGridCard(venue) {
    const statusClass = `status-${venue.status}`;
    const statusText = venue.status.charAt(0).toUpperCase() + venue.status.slice(1);
    
    const facilitiesHTML = venue.facilities.map(facility => 
        `<span class="facility-tag">${facility}</span>`
    ).join('');
    
    const bookButtonHTML = (venue.status === 'free' && isLecturer()) 
        ? `<button class="btn btn-primary" onclick="bookVenue(${venue.id})">Book Now</button>`
        : `<button class="btn btn-outline" onclick="viewVenueDetails(${venue.id})">View Details</button>`;
    
    return `
        <div class="venue-grid-card" data-venue-id="${venue.id}">
            <div class="venue-card-image">
                <img src="${venue.image}" alt="${venue.name}" loading="lazy">
                <div class="venue-status ${statusClass}">${statusText}</div>
            </div>
            <div class="venue-card-content">
                <h3 class="venue-card-title">${venue.name}</h3>
                <p class="venue-card-location">${venue.location}</p>
                <p class="venue-card-description">${venue.description}</p>
                
                <div class="venue-card-details">
                    <div class="capacity-info">
                        <strong>Capacity:</strong> ${venue.capacity} seats
                    </div>
                    <div class="exam-capacity-info">
                        <strong>Exam Capacity:</strong> ${venue.examCapacity1}/${venue.examCapacity2} seats
                    </div>
                    <div class="facilities-info">
                        <strong>Facilities:</strong>
                        <div class="facilities-tags">
                            ${facilitiesHTML}
                        </div>
                    </div>
                </div>
                
                <div class="venue-card-actions">
                    ${bookButtonHTML}
                    <button class="btn btn-outline" onclick="checkAvailability(${venue.id})">
                        Check Availability
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Search venues by text
function searchVenuesByText() {
    const searchInput = document.getElementById('venue-search');
    const searchText = searchInput ? searchInput.value.trim() : '';
    
    currentSearchText = searchText;
    applyAllFilters();
}

// Filter venues based on all criteria
function filterVenues() {
    applyAllFilters();
}

// Apply all filters and search
function applyAllFilters() {
    let filtered = [...venues];
    
    // Text search
    if (currentSearchText) {
        filtered = filterVenuesByText(filtered, currentSearchText);
    }
    
    // Capacity filter
    const minCapacity = document.getElementById('min-capacity')?.value;
    if (minCapacity) {
        filtered = filtered.filter(venue => venue.capacity >= parseInt(minCapacity));
    }
    
    // Facility filters
    const selectedFacilities = [];
    const facilityCheckboxes = document.querySelectorAll('.facility-filters input[type="checkbox"]:checked');
    facilityCheckboxes.forEach(checkbox => {
        selectedFacilities.push(checkbox.value);
    });
    
    if (selectedFacilities.length > 0) {
        filtered = filtered.filter(venue => 
            selectedFacilities.every(facility => venue.facilities.includes(facility))
        );
    }
    
    // Status filter
    const statusFilter = document.getElementById('status-filter')?.value;
    if (statusFilter) {
        filtered = filtered.filter(venue => venue.status === statusFilter);
    }
    
    filteredVenues = filtered;
    displayVenues(filtered);
}

// Filter venues by text (enhanced version)
function filterVenuesByText(venueList, searchText) {
    if (!searchText) return venueList;
    
    const text = searchText.toLowerCase();
    return venueList.filter(venue => 
        venue.name.toLowerCase().includes(text) ||
        venue.location.toLowerCase().includes(text) ||
        venue.description.toLowerCase().includes(text) ||
        venue.facilities.some(facility => facility.toLowerCase().includes(text))
    );
}

// Sort venue list
function sortVenueList() {
    const sortBy = document.getElementById('sort-venues')?.value;
    if (!sortBy) return;
    
    const currentVenues = filteredVenues.length > 0 ? filteredVenues : venues;
    const sorted = sortVenues(currentVenues, sortBy);
    displayVenues(sorted);
}

// Enhanced sort venues function
function sortVenues(venueList, sortBy) {
    const sorted = [...venueList];
    
    switch (sortBy) {
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'capacity':
            return sorted.sort((a, b) => b.capacity - a.capacity);
        case 'location':
            return sorted.sort((a, b) => a.location.localeCompare(b.location));
        case 'status':
            const statusOrder = { 'free': 1, 'timetable': 2, 'booked': 3 };
            return sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        default:
            return sorted;
    }
}

// Book venue directly
function bookVenue(venueId) {
    const venue = venues.find(v => v.id === venueId);
    if (!venue) return;
    
    // Check if user is logged in and is a lecturer
    if (!currentUser) {
        showMessage('Please sign in to book a venue', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    if (!isLecturer()) {
        showMessage('Only lecturers can book venues', 'error');
        return;
    }
    
    // Store selected venue and redirect to booking page
    sessionStorage.setItem('selectedVenue', JSON.stringify(venue));
    window.location.href = 'booking.html';
}

// Check venue availability
function checkAvailability(venueId) {
    const venue = venues.find(v => v.id === venueId);
    if (!venue) return;
    
    // Create availability modal
    const modal = document.createElement('div');
    modal.className = 'availability-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Check Availability - ${venue.name}</h2>
                <button class="modal-close" onclick="closeAvailabilityModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="availability-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="check-date">Date</label>
                            <input type="date" id="check-date" name="date" required>
                        </div>
                        <div class="form-group">
                            <label for="check-start-time">Start Time</label>
                            <input type="time" id="check-start-time" name="start-time" required>
                        </div>
                        <div class="form-group">
                            <label for="check-end-time">End Time</label>
                            <input type="time" id="check-end-time" name="end-time" required>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="performAvailabilityCheck(${venueId})">
                        Check Availability
                    </button>
                </div>
                <div id="availability-results" class="availability-results"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = modal.querySelector('#check-date');
    if (dateInput) {
        dateInput.min = today;
    }
    
    addAvailabilityModalStyles();
}

// Perform availability check
function performAvailabilityCheck(venueId) {
    const date = document.getElementById('check-date')?.value;
    const startTime = document.getElementById('check-start-time')?.value;
    const endTime = document.getElementById('check-end-time')?.value;
    
    if (!date || !startTime || !endTime) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (startTime >= endTime) {
        showMessage('End time must be after start time', 'error');
        return;
    }
    
    const venue = venues.find(v => v.id === venueId);
    const isAvailable = !isVenueBookedAtTime(venueId, date, startTime, endTime);
    
    const resultsDiv = document.getElementById('availability-results');
    if (resultsDiv) {
        resultsDiv.innerHTML = `
            <div class="availability-result ${isAvailable ? 'available' : 'unavailable'}">
                <h3>${isAvailable ? '✅ Available' : '❌ Not Available'}</h3>
                <p>
                    ${venue.name} is ${isAvailable ? 'available' : 'not available'} 
                    on ${formatDate(date)} from ${formatTime(startTime)} to ${formatTime(endTime)}.
                </p>
                ${isAvailable && isLecturer() ? `
                    <button class="btn btn-primary" onclick="bookVenueFromAvailability(${venueId}, '${date}', '${startTime}', '${endTime}')">
                        Book This Time Slot
                    </button>
                ` : ''}
            </div>
        `;
    }
}

// Book venue from availability check
function bookVenueFromAvailability(venueId, date, startTime, endTime) {
    const venue = venues.find(v => v.id === venueId);
    if (!venue) return;
    
    // Store booking details in session storage
    sessionStorage.setItem('selectedVenue', JSON.stringify(venue));
    sessionStorage.setItem('searchCriteria', JSON.stringify({
        date,
        startTime,
        endTime
    }));
    
    closeAvailabilityModal();
    window.location.href = 'booking.html';
}

// Close availability modal
function closeAvailabilityModal() {
    const modal = document.querySelector('.availability-modal');
    if (modal) {
        modal.remove();
    }
}

// Add availability modal styles
function addAvailabilityModalStyles() {
    if (document.getElementById('availability-modal-styles')) return;
    
    const modalCSS = `
        .availability-modal {
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
        
        .availability-form {
            margin-bottom: 2rem;
        }
        
        .availability-results {
            margin-top: 2rem;
        }
        
        .availability-result {
            padding: 1.5rem;
            border-radius: 5px;
            text-align: center;
        }
        
        .availability-result.available {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .availability-result.unavailable {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .availability-result h3 {
            margin-bottom: 1rem;
        }
        
        .availability-result p {
            margin-bottom: 1rem;
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'availability-modal-styles';
    style.textContent = modalCSS;
    document.head.appendChild(style);
}

// Add venues page styles
const venuesCSS = `
    .page-title {
        text-align: center;
        margin-bottom: 2rem;
        color: #2c3e50;
        font-size: 2.5rem;
    }
    
    .venue-filters {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        margin-bottom: 2rem;
    }
    
    .filter-row {
        display: flex;
        gap: 2rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        align-items: end;
    }
    
    .filter-row:last-child {
        margin-bottom: 0;
    }
    
    .search-group {
        display: flex;
        gap: 0.5rem;
        flex: 1;
        min-width: 250px;
    }
    
    .search-input {
        flex: 1;
        padding: 12px;
        border: 2px solid #e1e8ed;
        border-radius: 5px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
    }
    
    .search-input:focus {
        outline: none;
        border-color: #667eea;
    }
    
    .sort-group,
    .capacity-filter,
    .status-filter {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .sort-group label,
    .capacity-filter label,
    .status-filter label {
        font-weight: 600;
        color: #2c3e50;
        font-size: 0.9rem;
    }
    
    .sort-group select,
    .capacity-filter input,
    .status-filter select {
        padding: 8px;
        border: 2px solid #e1e8ed;
        border-radius: 5px;
        font-size: 0.9rem;
    }
    
    .facility-filters {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .facility-filters label {
        font-weight: 600;
        color: #2c3e50;
        font-size: 0.9rem;
    }
    
    .venue-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 2rem;
    }
    
    .venue-grid-card {
        background: white;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .venue-grid-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }
    
    .venue-card-image {
        position: relative;
        height: 200px;
        overflow: hidden;
    }
    
    .venue-card-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .venue-status {
        position: absolute;
        top: 1rem;
        right: 1rem;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
    }
    
    .venue-status.status-free {
        background: #27ae60;
        color: white;
    }
    
    .venue-status.status-booked {
        background: #e74c3c;
        color: white;
    }
    
    .venue-status.status-timetable {
        background: #f39c12;
        color: white;
    }
    
    .venue-card-content {
        padding: 1.5rem;
    }
    
    .venue-card-title {
        margin-bottom: 0.5rem;
        color: #2c3e50;
        font-size: 1.3rem;
    }
    
    .venue-card-location {
        color: #5a6c7d;
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }
    
    .venue-card-description {
        color: #5a6c7d;
        margin-bottom: 1.5rem;
        line-height: 1.5;
    }
    
    .venue-card-details {
        margin-bottom: 1.5rem;
    }
    
    .capacity-info,
    .exam-capacity-info,
    .facilities-info {
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
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
    
    .venue-card-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    .venue-card-actions .btn {
        flex: 1;
        min-width: 120px;
        padding: 0.75rem;
        font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
        .page-title {
            font-size: 2rem;
        }
        
        .venue-filters {
            padding: 1.5rem;
        }
        
        .filter-row {
            flex-direction: column;
            gap: 1rem;
        }
        
        .search-group {
            min-width: auto;
        }
        
        .venue-grid {
            grid-template-columns: 1fr;
        }
        
        .venue-card-actions {
            flex-direction: column;
        }
        
        .checkbox-group {
            flex-direction: column;
            gap: 0.5rem;
        }
    }
`;

// Add venues CSS to head
const venuesStyle = document.createElement('style');
venuesStyle.textContent = venuesCSS;
document.head.appendChild(venuesStyle);

