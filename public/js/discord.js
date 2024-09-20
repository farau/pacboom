function handleDiscordLoginButtonClick() {

    fetch('/auth/discord', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl; // Redirige l'utilisateur vers Discord
        } else {
            throw new Error('URL de redirection invalide');
        }
    })
    .catch(error => console.error('Erreur:', error));
}

async function unlinkDiscord() {    
    try {
        const response = await fetch('/unlink-discord', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.text();
            window.location.href = '/myaccount';
        } else {
            const error = await response.text();
            // Rediriger vers la page avec le message d'erreur
            window.location.href = '/myaccount';
        }
    } catch (error) {
        console.error('Error during unlinking of Discord account:', error);
        window.location.href = '/myaccount';
    }
}


export function getDiscordInfos() {

    fetch('/getDiscordInfos', {
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
        if (data && data[0].discord_username != null && data[0].discord_id != null) {
            
            const userData = data[0].discord_username; // Assumant que vous renvoyez un tableau de résultats
            localStorage.setItem('username_discord', userData);

            // Si l'élément profileContainer est bien présent on peut ajouter les infos Discord à la suite, sinon on affiche le bouton Link
            if (document.getElementById('profileContainer')) {
                const profileContainer = document.getElementById('profileContainer');
                const existingTable = profileContainer.querySelector('table tbody');

                if (existingTable) {
                    // Remplir les lignes du tableau
                    const profileRows = [
                        { label: 'Discord handle', value: `${userData} <button id='discord-unlink'>Unlink</button>` }  // userData doit être défini
                    ];
                
                    // Ajouter les lignes au tbody
                    profileRows.forEach(rowData => {
                        const row = document.createElement('tr');
                        const labelCell = document.createElement('td');
                        const valueCell = document.createElement('td');
                
                        // Appliquer des styles
                        labelCell.style.color = '#000000';
                        valueCell.style.color = '#000000';
                
                        // Ajouter le contenu aux cellules
                        labelCell.innerHTML = rowData.label;
                        valueCell.innerHTML = rowData.value;
                
                        // Ajouter les cellules à la ligne
                        row.appendChild(labelCell);
                        row.appendChild(valueCell);
                
                        // Ajouter la ligne au tbody existant
                        existingTable.appendChild(row);
                    });

                    //console.log('New rows added successfully.');
                    // On ajoute l'event listener sur discord-unlink
                    document.addEventListener('click', (event) => {
                        if (event.target && event.target.id === 'discord-unlink') {
                            unlinkDiscord();
                        }
                    });
                }
            }
        } else {
            // console.log("No Discord linked");
            // On ajoute alors le bouton Discord LINK
            if (document.getElementById('profileContainer')) {
                const profileContainer = document.getElementById('profileContainer');
                const existingTable = profileContainer.querySelector('table tbody');

                if (existingTable) {
                    // Remplir les lignes du tableau
                    const profileRows = [
                        { label: 'Discord handle', value: `<button id='discord-login'>Link</button>` }  // userData doit être défini
                    ];
                
                    // Ajouter les lignes au tbody
                    profileRows.forEach(rowData => {
                        const row = document.createElement('tr');
                        const labelCell = document.createElement('td');
                        const valueCell = document.createElement('td');
                
                        // Appliquer des styles
                        labelCell.style.color = '#000000';
                        valueCell.style.color = '#000000';
                
                        // Ajouter le contenu aux cellules
                        labelCell.innerHTML = rowData.label;
                        valueCell.innerHTML = rowData.value;
                
                        // Ajouter les cellules à la ligne
                        row.appendChild(labelCell);
                        row.appendChild(valueCell);
                
                        // Ajouter la ligne au tbody existant
                        existingTable.appendChild(row);
                    });

                    //console.log('New rows added successfully.');
                    // Après cela, on peut ajouter un event listener pour le bouton
                    document.addEventListener('click', (event) => {
                        if (event.target && event.target.id === 'discord-login') {
                            handleDiscordLoginButtonClick();
                        }
                    });
                }
                

            }
        }}).catch(error => console.error('Erreur:', error));
}



// Fonction pour afficher la modale
function showModalDiscordAlreadyLinked() {
    const modalElement = document.getElementById('discordAlreadyLinkedModal');
    const modal = new bootstrap.Modal(modalElement);

    modal.show();
    // Rediriger vers 'index' après un délai de 2 secondes
    setTimeout(() => {
        window.location.href = 'myaccount';
    }, 2000);

}









