const contactForm = document.getElementById('contactForm');
const messageDiv = document.getElementById('message');

contactForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Validaciones básicas
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const successMessageDiv = document.getElementById('message');


    // Verifica si todos los campos tienen contenido
    if (name && email && subject && message) {
        // Mostrar el mensaje de éxito
        messageDiv.classList.remove('hidden');
        messageDiv.classList.add('show');

        // Limpia el formulario y oculta el mensaje después de 2 segundos
        setTimeout(() => {
            messageDiv.classList.remove('show');
            messageDiv.classList.add('hidden');
            contactForm.reset();
        }, 2000);
    } else {
        alert('Por favor, completa todos los campos antes de enviar.');
    }
});
