function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const cookieValue = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);
    return cookieValue ? cookieValue[2] : null;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

function handleTwitterLoginButtonClick() {
    // Rediriger l'utilisateur vers l'URL d'authentification Twitter côté serveur
    window.location.href = '/auth/twitter';
}


/// Fonction pour extraire les paramètres de l'URL
function getParamsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return {
        username: params.get('username'),
        screen_name: params.get('screen_name'),
        avatarUrl: params.get('avatarUrl')
    };
}

// Fonction pour gérer l'authentification Twitter réussie
function handleTwitterCallback() {
    const { username, screen_name, avatarUrl } = getParamsFromUrl();

    // Stockage des informations utilisateur en base de données (envoi d'une requête POST au serveur)
    fetch('/saveUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ screen_name })
    })
    .then(response => {
        if (response.ok) {
            // La requête s'est déroulée avec succès (utilisateur enregistré ou mis à jour)
            return response.json();
        } else if (response.status === 200) {
            // Cas où l'utilisateur existe déjà dans la base de données
            console.log('Utilisateur déjà enregistré.');

            // On continue malgré tout pour mettre à jour l'interface utilisateur
            return Promise.resolve({ username, screen_name }); // Simuler une réponse avec les données de l'utilisateur existant
        } else {
            throw new Error('Erreur serveur');
        }
    })
    .then(result => {
        console.log('Informations utilisateur enregistrées:', result);

        // Mettre à jour l'interface utilisateur (afficher le pseudo sur le bouton avec l'avatar)
        const twitterLoginBtn = document.getElementById("twitterLoginBtn");

        // Créer un conteneur flex pour l'avatar et le texte
        const flexContainer = document.createElement('div');
        flexContainer.style.display = 'flex';
        flexContainer.style.alignItems = 'center';

        // Créer l'élément d'image pour l'avatar
        const avatarImg = document.createElement('img');
        avatarImg.src = avatarUrl; // Utiliser l'URL de l'avatar fournie
        avatarImg.alt = 'Avatar';
        avatarImg.style.width = '30px'; // Ajuster la taille de l'avatar si nécessaire

        // Créer un élément span pour le nom d'utilisateur
        const usernameSpan = document.createElement('span');
        usernameSpan.innerText = `${result.username}`;
        // Ajouter l'image d'avatar et le nom d'utilisateur au conteneur flex
        flexContainer.appendChild(avatarImg);
        flexContainer.appendChild(usernameSpan);

        // Effacer le contenu existant du bouton et ajouter le conteneur flex
        twitterLoginBtn.innerHTML = ''; // Effacer le contenu existant du bouton
        twitterLoginBtn.appendChild(flexContainer);

        setCookie('username', screen_name, 30);
        setCookie('avatarUrl', avatarUrl, 30);
        // Supprimer l'écouteur d'événement click une fois que l'utilisateur est connecté
        twitterLoginBtn.removeEventListener("click", handleTwitterLoginButtonClick);
        //on affiche le bouton Logout par la suite
        disconnectBtn.style.display = 'block'; // Afficher le bouton si l'utilisateur est connecté
        

    })
    .catch(error => {
        console.error("Erreur lors de l'enregistrement ou de la récupération des informations utilisateur:", error);
    });
}


// Appeler handleTwitterCallback() lorsque la page se charge
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si l'URL contient les paramètres 
    if (window.location.search.includes('username') && window.location.search.includes('screen_name')) {
        // Appeler la fonction handleTwitterCallback() pour finaliser l'authentification
        handleTwitterCallback();
    }

    // Vérifier si l'utilisateur est connecté (par exemple, en vérifiant l'existence du cookie)
    const isLoggedIn = document.cookie.includes('username');

    // Récupérer le bouton Disconnect
    const disconnectBtn = document.getElementById('disconnectBtn');

    // Mettre à jour la visibilité du bouton en fonction de l'état de connexion
    if (isLoggedIn) {
        disconnectBtn.style.display = 'block'; // Afficher le bouton si l'utilisateur est connecté
        // Mettre à jour l'interface utilisateur (afficher le pseudo sur le bouton avec l'avatar)
        const twitterLoginBtn = document.getElementById("twitterLoginBtn");

        // Créer un conteneur flex pour l'avatar et le texte
        const flexContainer = document.createElement('div');
        flexContainer.style.display = 'flex';
        flexContainer.style.alignItems = 'center';

        // Créer l'élément d'image pour l'avatar
        const avatarImg = document.createElement('img');
        avatarImg.src = getCookie("avatarUrl"); // Utiliser l'URL de l'avatar fournie
        avatarImg.alt = 'Avatar';
        avatarImg.style.width = '30px'; // Ajuster la taille de l'avatar si nécessaire

        // Créer un élément span pour le nom d'utilisateur
        const usernameSpan = document.createElement('span');
        usernameSpan.innerText = getCookie("username");
        // Ajouter l'image d'avatar et le nom d'utilisateur au conteneur flex
        flexContainer.appendChild(avatarImg);
        flexContainer.appendChild(usernameSpan);

        // Effacer le contenu existant du bouton et ajouter le conteneur flex
        twitterLoginBtn.innerHTML = ''; // Effacer le contenu existant du bouton
        twitterLoginBtn.appendChild(flexContainer);
        twitterLoginBtn.removeEventListener("click", handleTwitterLoginButtonClick);

    } else {
        disconnectBtn.style.display = 'none'; // Cacher le bouton sinon
        document.getElementById("twitterLoginBtn").addEventListener("click", handleTwitterLoginButtonClick);
    }

    document.getElementById("disconnectBtn").addEventListener("click", () => {
        // Rediriger l'utilisateur vers l'URL d'authentification Twitter côté serveur
        deleteCookie("username");
        deleteCookie("avatarUrl");
    });

});






