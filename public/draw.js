let canvas = document.getElementById('drawingCanvas');
let ctx = canvas.getContext('2d');

let canvas2 = document.getElementById('secondaryCanvas');
let ctx2 = canvas2.getContext('2d');


// Array contenant les chemins d'accès aux images pour chaque catégorie
const categoryImages = {
    head: [null, './img/head/cap.png', './img/head/crown.png', './img/head/hat.png', './img/head/luffy-hat.png', './img/head/magician-hat.png','./img/head/ribbon.png','./img/head/stetson.png'],
    eyes: [null, './img/eyes/glasses.png', './img/eyes/gold-sunglasses.png', './img/eyes/sunglasses-cig.png','./img/eyes/sunglasses.png', './img/eyes/laser.png'],
    neck: [null, './img/neck/gold-necklace.png', './img/neck/bow-tie.png', './img/neck/scarf.png', './img/neck/tie.png'],
    arm: [null, './img/arm/muscle.png', './img/arm/bone-sword.png', './img/arm/robotic.png', './img/arm/zombie.png']

};

document.getElementById("randomize").addEventListener("click", function(event) {
    
    // Exemple d'utilisation pour la catégorie "head"
    const headImages = categoryImages['head'];
    const eyesImages = categoryImages['eyes'];
    const neckImages = categoryImages['neck'];
    const armImages = categoryImages['arm'];

    // Effacer tout le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Charger l'image de fond
    const backgroundImage = new Image();
    backgroundImage.src = 'img/pacmoon.png';

    // Attendre que l'image soit chargée
    backgroundImage.onload = function() {
        // Dessiner l'image de fond sur le canvas
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);    
        
        // On affiche les attributs random sur pacmoon
        const randomHeadImage = headImages[Math.floor(Math.random() * headImages.length)];
        const randomEyesImage = eyesImages[Math.floor(Math.random() * eyesImages.length)];
        const randomNeckImage = neckImages[Math.floor(Math.random() * neckImages.length)];
        const randomArmImage = armImages[Math.floor(Math.random() * armImages.length)];
        drawImage(randomHeadImage, 'head');
        drawImage(randomEyesImage, 'eyes');
        drawImage(randomNeckImage, 'neck');
        drawImage(randomArmImage, 'arm');
    };
    
    showSaveMetaDataButton();

});
        



// Garder une référence aux images actuellement dessinées par catégorie
let currentImages = {
    head: null,
    eyes: null,
    arm: null,
    neck: null
}; 

// Fonction pour dessiner une image sur le canvas
function drawImage(imagePath, category) {
    const image = new Image();
    image.onload = function() {
    // Dessiner la nouvelle image
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height); 
    } 

    let fileName = '';

    if (imagePath !== null) {
        const segments = imagePath.split('/'); // Diviser le chemin en segments
        const fileNameWithExtension = segments[segments.length - 1]; // Prendre le dernier segment (nom de fichier avec extension)
        fileName = fileNameWithExtension.split('.')[0]; // Diviser le nom de fichier pour obtenir le nom seulement
    }

    // Mettre à jour la référence de l'image actuellement dessinée par catégorie
    currentImages[category] = fileName ;
    if (imagePath) {
        image.src = imagePath;
    }
}

// Fonction pour dessiner une image sur le canvas
function drawImage2(imagePath) {
    const image = new Image();
    image.src = imagePath;
    image.onload = function() {
    // Dessiner la nouvelle image
        ctx2.drawImage(image, 0, 0, 200, 200); 
    } 

}

document.addEventListener("DOMContentLoaded", (event) => {   
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Fonction pour obtenir les données de currentImages au format JSON
function getCurrentImagesJSON(images) {
    return JSON.stringify(images);
}



// Sélectionner le bouton de partage Twitter
const shareTwitterBtn = document.getElementById('shareTwitterBtn');

// Ajouter un gestionnaire d'événements pour le clic sur le bouton
shareTwitterBtn.addEventListener('click', () => {
    const imageUrl = canvas.toDataURL(); // Convertir le contenu du canvas en URL de données
    // Exemple d'utilisation
    const currentImagesJSON = getCurrentImagesJSON(currentImages);
    let shareJSON = encodeURIComponent(currentImagesJSON);
    let twitterUrl = `https://twitter.com/intent/tweet?text=Here+is+my+new+PFP+generated+with+PacBoom+!\n+For+the+PacMoon+community+!\n+Metadata:+${shareJSON}`;
    window.open(twitterUrl, '_blank');

});


const saveButton = document.getElementById('saveButton');

// Fonction pour rendre le bouton visible
function showSaveMetaDataButton() {
    const isLoggedIn = document.cookie.includes('username');
    const metadataContainer = document.getElementById('metadataContainer');
    
    if (isLoggedIn && metadataContainer.textContent == 'No metadata available.') {
        saveButton.style.display = 'block';
    }
}

// Ajouter un gestionnaire d'événements pour le clic sur le bouton
saveButton.addEventListener('click', () => {
    // Quand on clique sur saveButton on peut enregistrer les metadata car l'user est logué
    handleMetadata();
});

function getCookie(name) {
    const cookieValue = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);
    return cookieValue ? cookieValue[2] : null;
}

// Fonction pour gérer l'insertion des metadata en BDD
function handleMetadata() {
    const username = getCookie('username');
    const saveErrorMessage = document.getElementById('saveErrorMessage');
    const successMessage = document.getElementById('successMessage');

    // Message de succès
    successMessage.textContent = '';

    // Stockage des informations utilisateur en base de données (envoi d'une requête POST au serveur)
    fetch('/saveMetadata', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, currentImages })
    })
    .then(response => {
        if (response.ok) {
            // La requête s'est déroulée avec succès (metadata enregistrée ou mises à jour)
            return response.json();
        } else if (response.status === 500) {
            // On continue malgré tout pour mettre à jour l'interface utilisateur
            return Promise.resolve({ username, currentImages }); // Simuler une réponse avec les données de l'utilisateur existant
        } else {
            throw new Error('Erreur serveur');
        }
    })
    .then(result => {
        console.log('Metadata saved into database', result);
        successMessage.textContent = 'Metadata saved !';
    })
    .catch(error => {
        console.error("Metadata already saved ! You already got your PFP !", error);
    
    });
}

function getMetadata() {
    const username = getCookie('username');

    // Récupérer les métadonnées de l'utilisateur depuis le serveur
    fetch('/getMetadata', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            //throw new Error('Error retrieving metadata');
        }
    })
    .then(metadata => {
        // Mettre à jour l'interface utilisateur avec les métadonnées récupérées
        // Par exemple, remplacer le bouton Save Metadata par les métadonnées
        const metadataContainer = document.getElementById('metadataContainer');
        metadataContainer.innerHTML = ''; // Supprimer tous les éléments enfants
        if (metadata) {
            // Créer un tableau Bootstrap pour afficher les métadonnées
            const beginMessage = document.createElement('p');
            beginMessage.textContent = 'The metadata you registered:';
            metadataContainer.appendChild(beginMessage);
            const table = document.createElement('table');
            table.classList.add('table', 'table-bordered', 'table-striped');
            const tbody = document.createElement('tbody');
            const metadataRows = [
                { label: 'Head', value: metadata.head },
                { label: 'Eyes', value: metadata.eyes },
                { label: 'Arm', value: metadata.arm },
                { label: 'Neck', value: metadata.neck }
            ];
            metadataRows.forEach(rowData => {
                const row = document.createElement('tr');
                const labelCell = document.createElement('td');
                const valueCell = document.createElement('td');
                labelCell.textContent = rowData.label;
                valueCell.textContent = rowData.value;
                row.appendChild(labelCell);
                row.appendChild(valueCell);
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            metadataContainer.appendChild(table);

            // Afficher un message indiquant que les métadonnées ne peuvent pas être enregistrées à nouveau
            const cannotSaveMessage = document.createElement('p');
            cannotSaveMessage.textContent = 'You cannot save metadata again but feel free to share other PFP on socials !';
            cannotSaveMessage.style.color = 'red';
            metadataContainer.appendChild(cannotSaveMessage);

            return metadata;

        } else {
            // Aucune métadonnée n'a été récupérée, afficher un message ou effectuer une action appropriée
            metadataContainer.textContent = 'No metadata available.';
            return null;
        }

    })
    .catch(error => {
        console.error('Error retrieving metadata:', error);
    });
}


// Attendez que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Appeler la fonction getMetadata pour récupérer les métadonnées de l'utilisateur
    const isLoggedIn = document.cookie.includes('username');
    if (isLoggedIn) {
        getMetadata();
        getMetadataAndDisplayPFP();
    }
});

function displayPFPOnCanvas(metadata) {
    // Charger l'image de fond
    const backgroundImage = new Image();
    backgroundImage.src = 'img/pacmoon.png';

    // Attendre que l'image soit chargée
    backgroundImage.onload = function() {
        // Dessiner l'image de fond sur le canvas
        ctx2.drawImage(backgroundImage, 0, 0, 200, 200);    
        
        drawImage2('./img/head/'+metadata.head+'.png');
        drawImage2('./img/eyes/'+metadata.eyes+'.png');
        drawImage2('./img/arm/'+metadata.arm+'.png');
        drawImage2('./img/neck/'+metadata.neck+'.png');
    };
}

function getMetadataAndDisplayPFP() {
    const username = getCookie('username');

    // Récupérer les métadonnées de l'utilisateur depuis le serveur
    fetch('/getMetadata', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error retrieving metadata');
        }
    })
    .then(metadata => {
        // Afficher la PFP sur le canvas secondaire à partir des métadonnées récupérées
        displayPFPOnCanvas(metadata);
    })
    .catch(error => {
        //console.log('No metadata found.');
    });
}

// Appeler la fonction pour récupérer les métadonnées et afficher la PFP sur le canvas secondaire

