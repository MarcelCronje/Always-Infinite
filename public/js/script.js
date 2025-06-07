document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    fetch('/send-email', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
    })
    .catch(error => {
        alert('Error sending email');
    });
});