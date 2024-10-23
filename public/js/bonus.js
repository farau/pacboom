import { updateBoostPageBasedOnConnection } from './metamask.js';

let provider = new ethers.providers.Web3Provider(window.ethereum);
let signer = provider.getSigner();
let contract;
const contractAddress = config.pacBoomAddress; // Replace with your contract address
const abi = config.pacBoomABI;

let maxEthWallet, maxEthWalletInEther;
let updateIntervals = []; // To keep track of update intervals



export async function getWalletDataBoost() {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    maxEthWallet = await signer.getBalance();
    maxEthWalletInEther = Math.round(ethers.utils.formatEther(maxEthWallet)*100)/100;

    contract = new ethers.Contract(contractAddress, abi, signer);

    const walletAddress = await signer.getAddress();

    document.getElementById("availableEth").innerText = maxEthWalletInEther;

    updateInformationsWallet(walletAddress);
    updateLockedETH(walletAddress);

    // Bouton lock ETH à activer et texte 'CONFIRM
    document.getElementById("lockButton").disabled = false; 
    document.getElementById("lockButton").innerText = 'CONFIRM';

}

async function updateInformationsWallet(address) {
    const informationsContainer = document.getElementById("wallet-info");
    informationsContainer.innerText = ''; // Supprimer tous les éléments enfants
                
    // Données onchain à récupérer
    const bonus = await contract.getPlayerBonus(address);
    const nfts = await contract.numberOfNFTsFromAllCollections(address);
    const points = await contract.getPlayerPoints(address);
    const pointsInt = points.toNumber();

    const beginMessage = document.createElement('p');
    beginMessage.innerHTML = '<h2 class="text-center">My boosts</h2>';
    informationsContainer.appendChild(beginMessage);

    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered', 'table-striped', 'table-dark');
    const tbody = document.createElement('tbody');

    const informationsRows = [
        { label: 'Current bonus', value: "x"+bonus.toString()},
        { label: 'NFTs owned', value: nfts },
        { label: 'PacBoom points', value: pointsInt},
        { label: 'Level', value: '<p id="player-level-text2"></p>' },
        { 
            label: 'EXP', 
            value: `
                <div class="progress mb-2">
                    <div id="player-progress-bar2" class="progress-bar bg-success" role="progressbar" style="width: 1%;" aria-valuenow="1" aria-valuemin="0" aria-valuemax="100">0%</div>
                </div>`
        }
    ];
    
    // Ajouter les lignes de base (Name et Description)
    informationsRows.forEach(rowData => {
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
    informationsContainer.appendChild(table);
    getPlayerLevel(pointsInt); // récupérer le level 
    getTotalLockedEth(); // On récupère le total eth locked
}


// Function to clear wallet data from the UI
export function clearWalletDataBoost() {

    document.getElementById("availableEth").innerText = '';
    document.getElementById("lockedBody").innerHTML = ''; // Clear previous entries
    document.getElementById("lockButton").innerText = 'Connect your wallet';
    // Bouton confirmation de lock à griser
    document.getElementById("lockButton").disabled = true;

    // Clear all update intervals
    updateIntervals.forEach(interval => clearInterval(interval));
    updateIntervals = []; // Reset the array

    // On efface ce qui est contenu dans la div wallet-info
    document.getElementById("wallet-info").innerHTML = `<p class="text-center">Please connect your wallet</p>`;

}

async function updateLockedETH(address) {

    const lockedEther = await contract.getTotalLocks(address);
    const lockedTableBody = document.getElementById("lockedBody");
    lockedTableBody.innerHTML = ''; // Clear previous entries

    // Assuming lockedEther is an array of lock objects
    lockedEther.forEach(async lock => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${ethers.utils.formatEther(lock.amount)} <i class="fab fa-ethereum"></i></td>
            <td>${Math.floor(lock.lockDuration / 86400)}</td>
            <td>${new Date(lock.lockEndTime * 1000).toLocaleDateString()}</td>
            <td id="remaining-time-${lock.lockEndTime}"></td>
            <td><button class="unlockButton" id="unlock-btn-${lock.lockEndTime}" disabled>Withdraw</button></td>
        `;
        lockedTableBody.appendChild(row);

        const unlockBtn = document.getElementById(`unlock-btn-${lock.lockEndTime}`);

        // Attacher l'événement de clic au bouton, une seule fois
        unlockBtn.addEventListener('click', () => unlockEther(lock.lockEndTime));

        // Mise à jour du temps restant
        async function updateRemainingTime() {
            const currentTime = Math.floor(Date.now() / 1000);
            // Récupérer le dernier bloc
            const block = await provider.getBlock("latest");
           
            // Étape 1 : Convertir le blocktime en timestamp Unix
            const blockTimestamp = block.timestamp;

            // Étape 2 : Convertir lockEndTime (BigNumber) en un nombre
            const lockEndTimestamp = lock.lockEndTime.toNumber(); // Si lockEndTime est un BigNumber (Ethers.js)

            // Étape 3 : Calculer la différence en secondes
            const timeRemainingInSeconds = lockEndTimestamp - blockTimestamp;

            // Element du tableau locked à mettre à jour
            const timeElement = document.getElementById(`remaining-time-${lock.lockEndTime}`);

            if (timeRemainingInSeconds > 0) {
                const days = Math.floor(timeRemainingInSeconds / (3600 * 24));
                const hours = Math.floor((timeRemainingInSeconds % (3600 * 24)) / 3600);
                const minutes = Math.floor((timeRemainingInSeconds % 3600) / 60);
                timeElement.textContent = `${days}d ${hours}h ${minutes}m`;
                unlockBtn.hidden = true;  // Désactiver le bouton si le verrou n'est pas expiré
            } else {
                timeElement.textContent = "Unlocked";
                unlockBtn.hidden = false; // Activer le bouton si le verrou est expiré
                unlockBtn.disabled = false;
            }
        }
        
        // Appeler la mise à jour immédiatement pour initialiser l'affichage
        await updateRemainingTime();

        // Mettre à jour chaque minute
        const intervalId = setInterval(updateRemainingTime, 60000); // 60 000 ms pour une mise à jour chaque minute
        updateIntervals.push(intervalId); // Store interval ID for later clearing

    });

}


// Fonction pour déverrouiller les ETH
async function unlockEther(lockEndTime) {
    const unlockBtn = document.getElementById(`unlock-btn-${lockEndTime}`);
    const timeElement = document.getElementById(`remaining-time-${lockEndTime}`);

    try {
        // Disable the button and show loading indicator on the specific unlock button
        unlockBtn.disabled = true;
        unlockBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Unlocking...`;

        // Call the contract function to unlock the ETH
        const tx = await contract.withdrawUnlockedEther();
        await tx.wait(); // Wait for transaction confirmation

        // Update the UI on success
        unlockBtn.innerHTML = 'Withdrawn';
        timeElement.textContent = 'Withdrawn';
        unlockBtn.disabled = false;  // Optionally, hide or disable the button after unlocking if no longer needed
        
        // Appel getWalletDataBoost() pour mettre à jour l'UI
        await getWalletDataBoost();
    

    } catch (error) {
        console.error("Error during the unlocking:", error);

        // Show the error message on the specific unlock button
        unlockBtn.innerHTML = error.data?.message || 'Transaction failed';
        unlockBtn.disabled = false; // Re-enable the button for retry
    }
}


// Function to get the selected lock duration
function getLockDuration() {
    const selectedDuration = document.querySelector('input[name="duration"]:checked').value;
    return selectedDuration;
}


export async function getPlayerLevel(points) {
    try {
        const response = await fetch('/get-player-level', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({points})
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error:', error);
            if (document.getElementById('player-level-text')) {
                document.getElementById('player-level-text').textContent = 'Error fetching player level';
            }
            return;
        }

        const data = await response.json();
        const level = data.level;  // Niveau actuel du joueur
        const currentPoints = data.currentPoints;  // Points actuels du joueur
        const pointsToNextLevel = data.pointsToNextLevel;  // Points nécessaires pour atteindre le prochain niveau

        // Mettre à jour le texte du niveau
        const playerLevelText = document.getElementById('player-level-text');
        if (playerLevelText) {
            playerLevelText.textContent = `${level}/100`;
        }
        const playerLevelText2 = document.getElementById('player-level-text2');
        if (playerLevelText2) {
            playerLevelText2.textContent = `${level}/100`;
        }

        // Calculer le pourcentage de progression
        const progressPercentage = (currentPoints / pointsToNextLevel) * 100;

        // Mettre à jour la barre de progression pour l'onglet déroulant
        const playerProgressBar = document.getElementById('player-progress-bar');
        if (playerProgressBar) {
            playerProgressBar.style.width = `${progressPercentage}%`;  // Ajuster la largeur en fonction des points
            playerProgressBar.setAttribute('aria-valuenow', progressPercentage);  // Mise à jour de la valeur actuelle
            playerProgressBar.textContent = `${progressPercentage.toFixed(2)}%`;  // Afficher le pourcentage arrondi à 2 décimales
        }

        // Calculer le pourcentage de progression pour la page myboost
        const progressPercentage2 = (currentPoints / pointsToNextLevel) * 100;

        // Mettre à jour la barre de progression
        const playerProgressBar2 = document.getElementById('player-progress-bar2');
        if (playerProgressBar2) {
            playerProgressBar2.style.width = `${progressPercentage2}%`;  // Ajuster la largeur en fonction des points
            playerProgressBar2.setAttribute('aria-valuenow', progressPercentage2);  // Mise à jour de la valeur actuelle
            playerProgressBar2.textContent = `${progressPercentage2.toFixed(2)}%`;  // Afficher le pourcentage arrondi à 2 décimales
        }
    } catch (error) {
        console.error('Error fetching player level:', error);
        if (document.getElementById('player-level-text')) {
            document.getElementById('player-level-text').textContent = 'Error fetching player level';
        }
        if (document.getElementById('player-level-text2')) {
            document.getElementById('player-level-text2').textContent = 'Error fetching player level';
        }
    }
}

async function getTotalLockedEth() {
    //On récupère le nb total d'eth lock dans la platform
    const totallockedEth = await fetch('/get-total-eth-locked', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
    });

    if (!totallockedEth.ok) {
        console.error('Error fetching TVL value');
        const tvlElement = document.querySelector('.tvl-eth .eth-amount');
        if (tvlElement) {
            tvlElement.innerHTML = 'Error fetching TVL value';
        }
        return; 
    } 

    const res = await totallockedEth.json();
    const tvlElement = document.querySelector('.tvl-eth .eth-amount');
    if (tvlElement) {
        tvlElement.innerHTML = res.value / 10**18;
    } else {
        console.error('Element .eth-amount non trouvé !');
    }
}


// Appeler la fonction pour reload le total Eth locked à chaque chargement
if (document.getElementById('lock')) {
    getTotalLockedEth();
}

// --------- LISTENERS -------------

// Présence de cet élément nécessaire pour créer le listener
const lockButton = document.getElementById("lockButton");

if (lockButton) {
    lockButton.addEventListener("click", async () => {
        try {
            const ethAmount = parseFloat(document.getElementById("ethAmount").value); // Convert to float
            const lockDuration = getLockDuration();

            // Check for invalid ETH amount or missing duration
            if (!lockDuration || ethAmount < 0.01 || isNaN(ethAmount)) {
                lockButton.innerText = 'Value in ETH must be > 0.01';
                return; // Exit early if invalid input
            }

            // Valid input: proceed with transaction
            lockButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Waiting...`;

            const tx = await contract.lockEther(lockDuration, { value: ethers.utils.parseEther(ethAmount.toString()) });
            await tx.wait(); // Wait for transaction confirmation

            // Update the UI after successful transaction
            await Promise.all([
                // Appel getWalletDataBoost() pour mettre à jour l'UI
                getWalletDataBoost()
            ]);

            lockButton.innerHTML = `ETH locked!`;

        } catch (error) {
            console.error('Error during the locking of ETH: ', error);
            lockButton.innerHTML = error.data?.message || 'Transaction failed';
        }
    });
}


// Présence de cet élément nécessaire pour créer le listener
if (document.getElementById("maxButton")) {
    document.getElementById('maxButton').addEventListener('click', () => {
        // Mettre à jour le champ ETH avec la valeur max disponible
        document.getElementById('ethAmount').value = maxEthWalletInEther; // Exemple de valeur disponible
    });

    // Gestion des options de durée
    const durationOptions = document.querySelectorAll('.duration-option label');
    durationOptions.forEach(option => {
        option.addEventListener('click', () => {
            durationOptions.forEach(o => o.closest('.duration-option').classList.remove('selected'));
            option.closest('.duration-option').classList.add('selected');
        });
    });
}

document.addEventListener("DOMContentLoaded", (event) => {   
    if (document.getElementById('lockButton')) {
        //On update le canvas en fonction de la connexion ou pas à chaque refresh de la page
        updateBoostPageBasedOnConnection();
    }
});


