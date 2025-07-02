async function getAvailableVenues(date, startTime, endTime, filters = {}) {
    try {
        const response = await fetch('/api/venues/availability.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date,
                start_time: startTime,
                end_time: endTime,
                ...filters
            })
        });
        
        if (!response.ok) {
            throw new Error(await response.text());
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error checking venue availability:', error);
        throw error;
    }
}




async function createVenue(venueData) {
    try {
        const response = await fetch('/api/venues/create.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(venueData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create venue');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating venue:', error);
        throw error;
    }
}





async function updateVenueFeatures(venueId, featuresToAdd, featuresToRemove) {
    try {
        // Add features
        for (const feature of featuresToAdd) {
            await fetch('/api/venues/features/add.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    venue_id: venueId,
                    feature
                })
            });
        }
        
        // Remove features (similar to add.php but with FALSE instead of TRUE)
        for (const feature of featuresToRemove) {
            await fetch('/api/venues/features/remove.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    venue_id: venueId,
                    feature
                })
            });
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error updating venue features:', error);
        throw error;
    }
}


async function getVenueDetails(venueId) {
    try {
        const response = await fetch(`/api/venues/read.php?id=${venueId}`);
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching venue details:', error);
        throw error;
    }
}


async function updateVenue(venueId, updateData) {
    try {
        const response = await fetch('/api/venues/update.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                venue_id: venueId,
                ...updateData
            })
        });
        
        if (!response.ok) {
            throw new Error(await response.text());
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating venue:', error);
        throw error;
    }
}



async function getVenueStatistics() {
    try {
        const response = await fetch('/api/venues/stats.php');
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching venue statistics:', error);
        throw error;
    }
}