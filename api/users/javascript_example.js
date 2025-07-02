async function getUserProfile(userId) {
    try {
        const response = await fetch(`../api/users/profile.php?id=${userId}`);
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}

async function registerUser(userData) {
    try {
        const response = await fetch(`../api/users/register.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: userData
        })
    }catch(error){
        console.error('Error Registering User:', error);
        throw error;
    }
}



async function updateUserProfile(userId, updateData) {
    try {
        const response = await fetch('/api/users/update.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                ...updateData
            })
        });
        
        if (!response.ok) {
            throw new Error(await response.text());
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}




async function updateUserStatus(userId, status) {
    try {
        const response = await fetch('/api/users/admin/manage_user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                account_status: status
            })
        });
        
        if (!response.ok) {
            throw new Error(await response.text());
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
    }
}