export function handleTwitterLoginButtonClick() {
    const twitterAuthUrl = '/auth/twitter';
    window.location.href = twitterAuthUrl;
}


export function getTwitterInfos() {
    fetch(`/getTwitterInfos`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        
        if (response.status === 204) {
            return null; // Pas de contenu
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Convertir la réponse en JSON
    })
    .then(data => {
        if (data && data[0].username && data[0].avatarurl) {
            const userData = data[0]; // Assumant que vous renvoyez un tableau de résultats

            const twitterLoginBtn = document.getElementById("twitterLoginBtn");

            // Créer un conteneur flex pour l'avatar et le texte
            const flexContainer = document.createElement('div');
            flexContainer.style.display = 'flex';
            flexContainer.style.alignItems = 'center';

            // Créer l'élément d'image pour l'avatar
            const avatarImg = document.createElement('img');
            avatarImg.src = userData.avatarurl; // Utiliser l'URL de l'avatar fournie
            avatarImg.alt = 'Avatar';
            avatarImg.style.width = '30px'; // Ajuster la taille de l'avatar si nécessaire

            // Créer un élément span pour le nom d'utilisateur
            const usernameSpan = document.createElement('span');
            usernameSpan.innerText = userData.username;
            localStorage.setItem('username', userData.username);
            // Ajouter l'image d'avatar et le nom d'utilisateur au conteneur flex
            flexContainer.appendChild(avatarImg);
            flexContainer.appendChild(usernameSpan);

            // Effacer le contenu existant du bouton et ajouter le conteneur flex
            twitterLoginBtn.innerHTML = ''; // Effacer le contenu existant du bouton
            twitterLoginBtn.appendChild(flexContainer);
            twitterLoginBtn.removeEventListener("click", handleTwitterLoginButtonClick);
        } else {
            console.log("No Twitter/X data found");
            document.getElementById("twitterLoginBtn").addEventListener("click", handleTwitterLoginButtonClick);
        }
    })
    .catch(error => console.error('Erreur:', error));
}

// Fonction pour afficher la modale
function showModalTwitterAlreadyLinked() {
    const modalElement = document.getElementById('twitterAlreadyLinkedModal');
    const modal = new bootstrap.Modal(modalElement);

    modal.show();
    // Rediriger vers 'index.html' après un délai de 2 secondes
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);

}


// Appeler handleTwitterCallback() lorsque la page se charge
document.addEventListener('DOMContentLoaded', () => {
    getTwitterInfos();
});






