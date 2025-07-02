// Example using Fetch API to interact with the PHP endpoints

// Create a new booking
async function createBooking(bookingData) {
    try {
        const response = await fetch('/api/bookings/create.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create booking');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
}

// Update booking status
async function updateBookingStatus(bookingId, status, userId, reason = '') {
    try {
        const response = await fetch('/api/bookings/update.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                booking_id: bookingId,
                status: status,
                user_id: userId,
                rejection_reason: reason
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update booking status');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating booking status:', error);
        throw error;
    }
}

// Get bookings with filters
async function getBookings(filters = {}) {
    try {
        const queryString = new URLSearchParams(filters).toString();
        const response = await fetch(`/api/bookings/list.php?${queryString}`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch bookings');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
}










