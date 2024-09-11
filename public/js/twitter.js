
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
    const address = localStorage.getItem("userAddress");
    const jwtToken = localStorage.getItem("jwtToken");

    const { username, screen_name, avatarUrl } = getParamsFromUrl();

    // Stockage des informations utilisateur en base de données (envoi d'une requête POST au serveur)
    fetch('/linkTwitter', {
        method: 'POST',
        headers: {
            'Authorization': `${jwtToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ screen_name, address })
    })
    .then(response => {
        if (response.ok) {
            // La requête s'est déroulée avec succès (utilisateur enregistré ou mis à jour)
            return response.json();
        } else if (response.status === 409) {
            // Cas où l'utilisateur existe déjà dans la base de données
            console.log('Utilisateur déjà linké.');
            const twitterLoginBtn = document.getElementById("twitterLoginBtn");
            twitterLoginBtn.innerHTML = "This X account is already set on another address !";
    

            // Stopper la procédure ici en retournant une promesse rejetée
            return Promise.reject('Utilisateur déjà linké.');
        } else {
            throw new Error('Erreur serveur');
        }
    })
    .then(result => {
        console.log('Informations utilisateur linkées:', result);

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

        // Supprimer l'écouteur d'événement click une fois que l'utilisateur est connecté
        twitterLoginBtn.removeEventListener("click", handleTwitterLoginButtonClick);
        
        //window.location.href = '/index.html';
    })
    .catch(error => {
        // Afficher la modale pour informer l'utilisateur
        showModalTwitterAlreadyLinked(); 
    
        console.error("Erreur lors de l'enregistrement ou de la récupération des informations utilisateur:", error);
    });
}

function getTwitterInfos(address) {
    const jwtToken = localStorage.getItem("jwtToken");

    fetch(`/getTwitterInfos?address=${address}`, {
        method: 'GET',
        headers: {
            'Authorization': `${jwtToken}`,
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
        if (data && data.length > 0) {
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
            console.log("Aucune donnée Twitter trouvée");
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
    // Vérifier si l'URL contient les paramètres 
    if (window.location.search.includes('username') && window.location.search.includes('screen_name')) {
        // Appeler la fonction handleTwitterCallback() pour finaliser l'authentification
        handleTwitterCallback();
    }
    const address = localStorage.getItem("userAddress");
    const jwtToken = localStorage.getItem("jwtToken");

    if (address && jwtToken) {
        getTwitterInfos(address);
    }

});






