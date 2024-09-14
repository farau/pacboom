import { checkIfUserConnected, nubOwned, updateCanvasBasedOnConnection, showSaveMetaDataButton} from "./metamask.js";

let nubCanvas;
let ctx;
let nubSelectedcanvas;
let ctx2;

// On récupère l'adresse IPFS du contrat de NFT PacArmy
const pacArmyIpfs = config.pacArmyIpfs;


if (document.getElementById('nubCanvas')) {
    nubCanvas = document.getElementById('nubCanvas');
    ctx = nubCanvas.getContext('2d') != null ? nubCanvas.getContext('2d') : null ;
}

if (document.getElementById('secondaryNubCanvas')) {
    nubSelectedcanvas = document.getElementById('secondaryNubCanvas');
    ctx2 = nubSelectedcanvas.getContext('2d') != null ? nubSelectedcanvas.getContext('2d') : null;
}

document.addEventListener("DOMContentLoaded", (event) => {   
    if (document.getElementById('nubCanvas')) {
        ctx.clearRect(0, 0, nubCanvas.width, nubCanvas.height);
        //On update le canvas en fonction de la connexion ou pas à chaque refresh de la page
        updateCanvasBasedOnConnection();
    }
});

if (document.getElementById('saveButton')) {

    const saveButton = document.getElementById('saveButton');
    // Ajouter un gestionnaire d'événements pour le clic sur le bouton
    saveButton.addEventListener('click', () => {
        // Quand on clique sur saveButton on peut enregistrer les metadata car l'user est logué
        saveMetadataNub();
    });
}





// Fonction pour gérer l'insertion du NUB en BDD
function saveMetadataNub() {
    const jwtToken = localStorage.getItem('jwtToken'); // Récupérer le JWT depuis localStorage
    
    const saveErrorMessage = document.getElementById('saveErrorMessage');
    const successMessage = document.getElementById('successMessage');

    // Message de succès
    successMessage.textContent = '';

    // On récupère nub_id courant 
    const nub_id = showSaveMetaDataButton();
    //console.log("nub id recu par show save button :", nub_id);
    const nub_id_int = nub_id == null ? null : parseInt(nub_id.toString(), 10);
    //console.log(parseInt(nub_id.toString(), 10));
    // Stockage des informations utilisateur en base de données (envoi d'une requête POST au serveur)
    fetch('/saveNub', {
        method: 'POST',
        headers: {
            'Authorization': `${jwtToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nub_id : nub_id_int })
    })
    .then(response => {
        if (response.ok) {
            // La requête s'est déroulée avec succès (metadata enregistrée ou mises à jour)
            return response.json();
        } else if (response.status === 500) {
            // On continue malgré tout pour mettre à jour l'interface utilisateur
            return Promise.resolve({ nub_id_int }); // Simuler une réponse avec les données de l'utilisateur existant
        } else {
            throw new Error('Erreur serveur');
        }
    })
    .then(result => {
        console.log('Nub Metadata saved into database', nub_id_int);
        successMessage.textContent = 'This nub has been selected !';

        // On reload la page pour afficher les changements directement
        location.reload();
    })
    .catch(error => {
        console.error("Error during saving of nub metadata !", error);
        saveErrorMessage.textContent = error;
    });
}

export async function getMetadataNub() {

    const jwtToken = localStorage.getItem('jwtToken'); // Récupérer le JWT depuis localStorage

    // On récupère aussi les données user pour afficher juste avant le nom de l'user et son wallet ainsi que son rank
    fetch('/getUserLeaderboard', {
        method: 'POST',
        headers: {
            'Authorization': `${jwtToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            if (response.status === 204) {
                // Aucune donnée n'est présente, vous pouvez gérer cela comme nécessaire
                console.log('No profile found.');
                return null; // Ou toute autre action que vous souhaitez prendre
            } else {
                // Il y a des données dans la réponse, vous pouvez la traiter comme d'habitude
                return response.json();
            }
        } else {
            
            if (document.getElementById('profileContainer')) {
                const profileContainer = document.getElementById('profileContainer');

                profileContainer.innerHTML = ''; // Supprimer tous les éléments enfants
                // Aucune métadonnée n'a été récupérée, afficher un message ou effectuer une action appropriée
                profileContainer.textContent = 'Please login to see your profile.';
                
            }
            return null;
        }
    })
    .then(async profile => {
        // Mettre à jour l'interface utilisateur avec les métadonnées récupérées
        // Par exemple, remplacer le bouton Save Metadata par les métadonnées
        if (document.getElementById('profileContainer')) {
            const profileContainer = document.getElementById('profileContainer');
            const profileCard = document.getElementById('profileCard');
            
            if (profile) {
                profileContainer.innerHTML = ''; // Supprimer tous les éléments enfants
                
                const beginMessage = document.createElement('p');
                beginMessage.textContent = '';
                profileContainer.appendChild(beginMessage);
            
                const table = document.createElement('table');
                table.classList.add('table', 'table-bordered', 'table-striped');
                const tbody = document.createElement('tbody');
            
                const profileRows = [
                    { label: 'X handle', value: profile.leaderboardUser[0].username },
                    { label: 'Discord handle', value: 'Soon' },
                    { label: 'Unlink X', value: 'Soon' },
                    { label: 'Unlink Discord', value: 'Soon' },
                    { label: '', value: null },
                    { 
                        label: '<span style="color: blue;">Rank</span>', 
                        value: `<span style="color: blue;">${profile.rank}</span>` 
                    },
                    { 
                        label: '<span style="color: blue;">PacBoom points</span>', 
                        value: `<span style="color: blue;">${profile.leaderboardUser[0].points}</span>` 
                    }
                ];
            
                // Ajouter les lignes de base (Name et Description)
                profileRows.forEach(rowData => {
                    const row = document.createElement('tr');
                    const labelCell = document.createElement('td');
                    const valueCell = document.createElement('td');
            
                    labelCell.style.color = '#000000';
                    valueCell.style.color = '#000000';
            
                    labelCell.innerHTML = rowData.label;
                    valueCell.innerHTML = rowData.value;
                    row.appendChild(labelCell);
                    row.appendChild(valueCell);
                    tbody.appendChild(row);
                });
            
            
                table.appendChild(tbody);
                profileContainer.appendChild(table);
                
                return profile.username;

            } else {

                if (document.getElementById('profileContainer')) {
                    const profileContainer = document.getElementById('profileContainer');
    
                    profileContainer.innerHTML = ''; // Supprimer tous les éléments enfants
                    profileContainer.textContent = 'Please login to see your profile.';
                }
                return null;
            }

        } else {
            // Aucune métadonnée n'a été récupérée, afficher un message ou effectuer une action appropriée

            if (document.getElementById('profileContainer')) {
                const metadataContainer = document.getElementById('profileContainer');

                metadataContainer.innerHTML = ''; // Supprimer tous les éléments enfants
                metadataContainer.textContent = 'Please login to see your profile.';
            }

            return null;
        }

    })
    .catch(error => {
        console.error('Error retrieving profile:', error);
    });


    let backgroundImage = new Image();

    // Récupérer les métadonnées de l'utilisateur depuis le serveur
    fetch('/getNub', {
        method: 'POST',
        headers: {
            'Authorization': `${jwtToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            if (response.status === 204) {
                // Aucune donnée n'est présente, vous pouvez gérer cela comme nécessaire
                console.log('No nub selected.');
                return null; // Ou toute autre action que vous souhaitez prendre
            } else {
                // Il y a des données dans la réponse, vous pouvez la traiter comme d'habitude
                return response.json();
            }
        } else {
            //throw new Error('Error retrieving metadata');

            // On enlève l'image du nub sur le petit canvas
            backgroundImage.src = './img/nub/null.png';

            document.getElementById('secondaryNubCanvas').getContext('2d').clearRect(0, 0, 200, 200);
            // Attendre que l'image soit chargée
            backgroundImage.onload = function() {
                // Dessiner l'image de fond sur le canvas
                document.getElementById('secondaryNubCanvas').getContext('2d').drawImage(backgroundImage, 0, 0, 200, 200); 
            };
            if (document.getElementById('metadataNubContainer')) {
                const metadataContainer = document.getElementById('metadataNubContainer');

                metadataContainer.innerHTML = ''; // Supprimer tous les éléments enfants
                // Aucune métadonnée n'a été récupérée, afficher un message ou effectuer une action appropriée
                metadataContainer.textContent = 'No nub selected. The default Pacman will be used in-game.';
                
            }
            return null;
        }
    })
    .then(async metadata => {
        // Mettre à jour l'interface utilisateur avec les métadonnées récupérées
        // Par exemple, remplacer le bouton Save Metadata par les métadonnées
        if (document.getElementById('metadataNubContainer')) {
            const metadataContainer = document.getElementById('metadataNubContainer');
            const metadataCard = document.getElementById('metadataCard');

            if (metadata && metadata.length > 0 && metadata[0].nub_id != null) {

                // Récupération des metadata via l'IPFS
                const ipfsData = await fetchData(pacArmyIpfs+metadata[0].nub_id);
        
                if (ipfsData) {
                    metadataContainer.innerHTML = ''; // Supprimer tous les éléments enfants
                    
                    const beginMessage = document.createElement('p');
                    beginMessage.textContent = 'The metadata you registered:';
                    metadataContainer.appendChild(beginMessage);
                
                    const table = document.createElement('table');
                    table.classList.add('table', 'table-bordered', 'table-striped');
                    const tbody = document.createElement('tbody');
                
                    const metadataRows = [
                        { label: 'Name', value: ipfsData.name },
                        { label: 'Description', value: ipfsData.description },
                        { label: 'Attributes' },
                    ];
                
                    // Ajouter les lignes de base (Name et Description)
                    metadataRows.forEach(rowData => {
                        const row = document.createElement('tr');
                        const labelCell = document.createElement('td');
                        const valueCell = document.createElement('td');
                
                        labelCell.style.color = '#000000';
                        valueCell.style.color = '#000000';
                
                        labelCell.textContent = rowData.label;
                        valueCell.textContent = rowData.value;
                        row.appendChild(labelCell);
                        row.appendChild(valueCell);
                        tbody.appendChild(row);
                    });
                
                    // Ajouter les attributs au tableau
                    ipfsData.attributes.forEach(attribute => {
                        const row = document.createElement('tr');
                        const labelCell = document.createElement('td');
                        const valueCell = document.createElement('td');
                
                        labelCell.style.color = '#000000';
                        valueCell.style.color = '#000000';
                
                        labelCell.textContent = attribute.trait_type; // Nom du trait 
                        valueCell.textContent = attribute.value !== null ? attribute.value : 'N/A'; // Valeur ou 'N/A' si null
                
                        row.appendChild(labelCell);
                        row.appendChild(valueCell);
                        tbody.appendChild(row);
                    });
                
                    table.appendChild(tbody);
                    metadataContainer.appendChild(table);
                }
                if (document.getElementById('secondaryNubCanvas')) {
                    backgroundImage.src = config.pacArmyImgIpfs + metadata[0].nub_id +'.png';
                    document.getElementById('secondaryNubCanvas').getContext('2d').clearRect(0, 0, 200, 200);
                    backgroundImage.onload = function() {
                        // Dessiner l'image de fond sur le canvas
                        document.getElementById('secondaryNubCanvas').getContext('2d').drawImage(backgroundImage, 0, 0, 200, 200); 
                    };
                }
                return metadata[0].nub_id;

            } else {
                if (document.getElementById('secondaryNubCanvas')) {
                    backgroundImage.src = './img/nub/null.png';
                    document.getElementById('secondaryNubCanvas').getContext('2d').clearRect(0, 0, 200, 200);
                    backgroundImage.onload = function() {
                        // Dessiner l'image de fond sur le canvas
                        document.getElementById('secondaryNubCanvas').getContext('2d').drawImage(backgroundImage, 0, 0, 200, 200); 
                    };
                }
                if (document.getElementById('metadataNubContainer')) {
                    const metadataContainer = document.getElementById('metadataNubContainer');
    
                    metadataContainer.innerHTML = ''; // Supprimer tous les éléments enfants
                    metadataContainer.textContent = 'No nub selected. The default Pacman will be used in-game.';
                }
                return null;
            }

        } else {
            // Aucune métadonnée n'a été récupérée, afficher un message ou effectuer une action appropriée

            if (document.getElementById('secondaryNubCanvas')) {
                // On enlève l'image du nub sur le petit canvas
                backgroundImage.src = './img/nub/null.png';

                //console.log("background img:", backgroundImage.src);
                document.getElementById('secondaryNubCanvas').getContext('2d').clearRect(0, 0, 200, 200);
                backgroundImage.onload = function() {
                    // Dessiner l'image de fond sur le canvas
                    document.getElementById('secondaryNubCanvas').getContext('2d').drawImage(backgroundImage, 0, 0, 200, 200); 
                };

            }
            if (document.getElementById('metadataNubContainer')) {
                const metadataContainer = document.getElementById('metadataNubContainer');

                metadataContainer.innerHTML = ''; // Supprimer tous les éléments enfants
                metadataContainer.textContent = 'No nub selected. The default Pacman will be used in-game.';
            }

            return null;
        }

    })
    .catch(error => {
        console.error('Error retrieving nub:', error);
    });
}


async function fetchData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
      return null; // En cas d'erreur, retournez null ou gérez l'erreur selon vos besoins
    }
  }
  


