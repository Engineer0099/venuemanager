async function getVenueWeeklySchedule(venueId, weekStartDate) {
    try {
        const response = await fetch(`/api/timetable/venue_schedule.php?venue_id=${venueId}&week_start=${weekStartDate}`);
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching venue schedule:', error);
        throw error;
    }
}


async function bulkUploadTimetable(entries) {
    try {
        const response = await fetch('/api/timetable/bulk_upload.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ entries })
        });
        
        if (!response.ok && response.status !== 207) {
            throw new Error(await response.text());
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error in bulk upload:', error);
        throw error;
    }
}


async function updateTimetableEntry(entryId, updateData) {
    try {
        const response = await fetch('/api/timetable/update.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: entryId,
                ...updateData
            })
        });
        
        if (!response.ok) {
            throw new Error(await response.text());
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating timetable entry:', error);
        throw error;
    }
}


async function checkTimetableConflict(venueId, day, startTime, endTime, excludeId = null) {
    try {
        const response = await fetch('/api/timetable/check_conflicts.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                venue_id: venueId,
                day_of_week: day,
                start_time: startTime,
                end_time: endTime,
                exclude_id: excludeId
            })
        });
        
        if (!response.ok) {
            throw new Error(await response.text());
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error checking timetable conflicts:', error);
        throw error;
    }
}



async function getLecturerSchedule(lecturerId, weekStart) {
    try {
        const response = await fetch(
            `/api/timetable/lecturer_schedule.php?lecturer_id=${lecturerId}&week_start=${weekStart}`
        );
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching lecturer schedule:', error);
        throw error;
    }
}




async function deleteTimetableEntry(entryId) {
    try {
        const response = await fetch('/api/timetable/delete.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: entryId
            })
        });
        
        if (!response.ok) {
            throw new Error(await response.text());
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error deleting timetable entry:', error);
        throw error;
    }
}