document.getElementById('addUserForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Simple JS validation
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const resultDiv = document.getElementById('result');

    if (name === '' || email === '') {
        resultDiv.textContent = 'Please fill in all fields.';
        return;
    }
    // Basic email format check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        resultDiv.textContent = 'Please enter a valid email address.';
        return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);

    const test = {
        name: 'frank',
        email: 'engineerfm99@gmail.com'
    }
    // Call the function to register the user
    registerUser(test);
    async function registerUser(formData) {
        fetch('http://localhost/venue-manager/api/users/test.php', {
            method: 'POST',
            body: formData
            })
            .then(response => response.text())
            .then(data => {
                resultDiv.textContent = data;
                document.getElementById('addUserForm').reset();
            })
            .catch(error => {
                resultDiv.textContent = 'An error occurred.';
            });

        }
});
