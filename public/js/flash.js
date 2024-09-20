// JavaScript pour faire disparaître automatiquement les messages flash après 5 secondes
setTimeout(() => {
    const flashMessages = document.querySelectorAll('.flash-error, .flash-success');
    flashMessages.forEach(message => {
        message.style.display = 'none';
    });
}, 5000); // 5000 millisecondes = 5 secondes