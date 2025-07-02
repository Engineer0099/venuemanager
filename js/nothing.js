   const venues = [
        {
            id: 1,
            name: 'TENT 1',
            location: 'Near to canteen',
            capacity: 270,
            exam_capacity_1: 135,
            exam_capacity_2: 125,
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
            exam_capacity_1: 135,
            exam_capacity_2: 125,
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
            exam_capacity_1: 135,
            exam_capacity_2: 125,
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
            exam_capacity_1: 135,
            exam_capacity_2: 125,
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
            exam_capacity_1: 100,
            exam_capacity_2: 80,
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
            exam_capacity_1: 100,
            exam_capacity_2: 80,
            facilities: ['whiteboard','projector'],
            image: 'assets/logo.jpg',
            status: 'timetable',
            description: 'Large lecture venue suitable for exams and presentations with a lot of attendees.'
        }
   ]
    async function newVenue(venue) {
        const response = await fetch('http://localhost/venue-manager/api/users/nothing.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                body: JSON.stringify({
                    name: venue.name,
                    location: venue.location,
                    capacity: venue.capacity,
                    exam_capacity_1: venue.exam_capacity_1,
                    exam_capacity_2: venue.exam_capacity_2,
                    facilities: venue.facilities,
                    image: venue.image,
                    status: venue.status,
                    description: venue.description
                })
            },
            });   
            if (!response.ok) {
            alert('Error: ' + response.statusText);
            throw new Error('Failed to add new venue');
        }
        return await response.json();
    }

    venues.forEach(venue => {
        newVenue(venue)
            .then(data => {
                alert('Venue added successfully: ' + data.name);
            })
            .catch(error => {
                alert('Error adding venue: ' + error.message);
            });
    });