document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    const result = document.getElementById('result');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        alert('form checking.......!');
        // const formData = new FormData(form);

        // alert('here..!');
        // const name = formData.get['name'];
        // const location = formData.get['location'];

        const name = document.getElementById('name').value;
        const location = document.getElementById('location').value;

        if(!name || !location){
            result.textContent = 'All field Are Requred..!';
            result.style.color = 'red';
            return;
        }

        try{
            const response = await fetch('http://localhost/venue-manager/practice/p.php', {
                method: 'POST',
                body: formData,
            });

            alert('await....!');
            const res = await response.json();

            if(res.success){
                result.textContent = 'Venue Registered successfull..!';
                result.style.color = 'green';
                form.reset();
            }else{
                result.textContent = 'Error:' + res.message;
                result.style.color = 'red';
            }
            if(res){
                result.textContent = 'here...!';
            }
        }catch(err){
            result.textContent = 'Network Error:' + res.message;
            result.style.color = 'red';
        };
        
    });
});