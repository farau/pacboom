import { updateArenaPageBasedOnConnection } from './metamask.js';

let provider = new ethers.providers.Web3Provider(window.ethereum);
let signer = provider.getSigner();
const contractAddress = config.pacBoomAddress; // Replace with your contract address
const abi = config.pacBoomABI;
let contract;


// Fonction pour créer une carte de boss avec un bouton d'attaque
function createBossCard(boss, serial) {
    if (boss.category == 0) {
    return `
    <div class="boss-card">
        <img src="./img/konk.webp" class="img-fluid" alt="Boss ${serial}">
        <div class="boss-info">
            <h2>Kiyosonk #${serial}</h2>
            <p>Life: ${boss.life}</p>
            <p>Damage: ${boss.damage} PB points</p>
            <p class="entry-fee">Entry fee: ${boss.entryFeeBoss/10**18} <img src="./img/logomark_blast.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
            <p class="prize">Prize: ${boss.prize} <img src="./img/logomark_blast.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
            <button class="attack-btn btn btn-attack-boss" data-serial="${serial}" disabled=true>Connect your wallet</button>
            <p></p>
            <button class="reward-btn btn btn-attack-boss" data-serial="${serial}">Live rewards</button>
        </div>
    </div>
    `;
    } else if (boss.category == 1) {
        return `
        <div class="boss-card">
            <img src="./img/blastr.jpg" class="img-fluid" alt="Blastr (Boss #${serial})">
            <div class="boss-info">
                <h2>Boss #${serial}</h2>
                <p>Life: ${boss.life}</p>
                <p>Damage: ${boss.damage} PB points</p>
                <p class="entry-fee">Entry fee: ${boss.entryFeeBoss/10**18} <img src="./img/logomark_blast.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <p class="prize">Prize: ${boss.prize} <img src="./img/gold.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <button class="attack-btn btn btn-attack-boss" data-serial="${serial}" disabled=true>Connect your wallet</button>
                <p></p>
                <button class="reward-btn btn btn-attack-boss" data-serial="${serial}">Live rewards</button>
            </div>
        </div>
        `; 
    } else if (boss.category == 2) {
        return `
        <div class="boss-card">
            <img src="./img/djennboss.png" class="img-fluid" alt="Boss ${serial}">
            <div class="boss-info">
                <h2>Djenn Jong-Un #${serial}</h2>
                <p>Life: ${boss.life}</p>
                <p>Damage: ${boss.damage} PB points</p>
                <p class="entry-fee">Entry fee: ${boss.entryFeeBoss/10**18} <img src="./img/logomark_blast.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <p class="prize">Prize: ${boss.prize} DJENNCOIN</p>
                <button class="attack-btn btn btn-attack-boss" data-serial="${serial}" disabled=true>Connect your wallet</button>
                <p></p>
                <button class="reward-btn btn btn-attack-boss" data-serial="${serial}">Live rewards</button>
            </div>
        </div>
        `; 
    } else if (boss.category == 3) {
        return `
        <div class="boss-card">
            <img src="./img/konk.webp" class="img-fluid" alt="Kiyosonk (Boss #${serial})">
            <div class="boss-info">
                <h2>Boss #${serial}</h2>
                <p>Life: ${boss.life}</p>
                <p>Damage: ${boss.damage} PB points</p>
                <p class="entry-fee">Entry fee: ${boss.entryFeeBoss/10**18} <img src="./img/logomark_blast.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <p class="prize">Prize: ${boss.prize} KONK</p>
                <button class="attack-btn btn btn-attack-boss" data-serial="${serial}" disabled=true>Connect your wallet</button>
                <p></p>
                <button class="reward-btn btn btn-attack-boss" data-serial="${serial}">Live rewards</button><
            </div>
        </div>
        `; 
    } else if (boss.category == 4) {
        return `
        <div class="boss-card">
            <img src="./img/satsy.jpg" class="img-fluid" alt="Fenix ${serial}">
            <div class="boss-info">
                <h2>Fenix #${serial}</h2>
                <p>Life: ${boss.life}</p>
                <p>Damage: ${boss.damage} PB points</p>
                <p class="entry-fee">Entry fee: ${boss.entryFeeBoss/10**18} <img src="./img/logomark_blast.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <p class="prize">Prize: ${boss.prize}$ of FNX</p>
                <button class="attack-btn btn btn-attack-boss" data-serial="${serial}" disabled=true>Connect your wallet</button>
                <p></p>
                <button class="reward-btn btn btn-attack-boss" data-serial="${serial}">Live rewards</button>
            </div>
        </div>
        `; 
    } else if (boss.category == 5) {
        return `
        <div class="boss-card">
            <img src="./img/santaboom.webp" class="img-fluid" alt="Santa Boom (Boss #${serial})">
            <div class="boss-info">
                <h2>Santa Boom #${serial}</h2>
                <p>Life: ${boss.life}</p>
                <p>Damage: ${boss.damage} PB points</p>
                <p class="entry-fee">Entry fee: ${boss.entryFeeBoss/10**18} <img src="./img/logomark_blast.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <p class="prize">Prize: ${boss.prize} <img src="./img/gold.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <button class="attack-btn btn btn-attack-boss" data-serial="${serial}" disabled=true>Connect your wallet</button>
                <p></p>
                <button class="reward-btn btn btn-attack-boss" data-serial="${serial}">Live rewards</button>
            </div>
        </div>
        `; 
    }
}


function createKilledBossCard(boss, serial, killer) {
    if (boss.category == 0) {
        return `
        <div class="boss-card">
            <img src="./img/konk.webp" class="img-fluid" alt="Boss ${serial}">
            <div class="boss-info">
                <h2>Boss #${serial}</h2>
                <p>Life: ${boss.life}</p>
                <p>Damage: ${boss.damage} PB points</p>
                <p class="entry-fee">Entry fee: ${boss.entryFeeBoss/10**18} <img src="./img/logomark_blast.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <p class="prize">Prize: ${boss.prize} <img src="./img/logomark_blast.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <p style="color: red">Killed by ${killer}</p>
                <button class="reward-btn btn btn-attack-boss" data-serial="${serial}">Rewards</button>
            </div>
        </div>
        `;
    } else if (boss.category == 1) {
        return `
        <div class="boss-card">
            <img src="./img/santaboom.webp" class="img-fluid" alt="Blastr (Boss #${serial})">
            <div class="boss-info">
                <h2>Boss #${serial}</h2>
                <p>Life: ${boss.life}</p>
                <p>Damage: ${boss.damage} PB points</p>
                <p class="entry-fee">Entry fee: ${boss.entryFeeBoss/10**18} <img src="./img/logomark_blast.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <p class="prize">Prize: ${boss.prize} <img src="./img/gold.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <p style="color: red">Killed by ${killer}</p>
                <button class="reward-btn btn btn-attack-boss" data-serial="${serial}">Rewards</button>
            </div>
        </div>
        `;
    } else if (boss.category == 2) {
        return `
        <div class="boss-card">
            <img src="./img/djennboss.png" class="img-fluid" alt="Boss ${serial}">
            <div class="boss-info">
                <h2>Djenn Jong-Un #${serial}</h2>
                <p>Life: ${boss.life}</p>
                <p>Damage: ${boss.damage} PB points</p>
                <p class="entry-fee">Entry fee: ${boss.entryFeeBoss/10**18} <img src="./img/logomark_blast.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <p class="prize">Prize: ${boss.prize} DJENNCOIN</p>
                <p style="color: red">Killed by ${killer}</p>
                <button class="reward-btn btn btn-attack-boss" data-serial="${serial}">Rewards</button>
            </div>
        </div>
        `; 
    } else if (boss.category == 3) {
        return `
        <div class="boss-card">
            <img src="./img/konk.webp" class="img-fluid" alt="Kiyosonk ${serial}">
            <div class="boss-info">
                <h2>Konk #${serial}</h2>
                <p>Life: ${boss.life}</p>
                <p>Damage: ${boss.damage} PB points</p>
                <p class="entry-fee">Entry fee: ${boss.entryFeeBoss/10**18} <img src="./img/logomark_blast.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <p class="prize">Prize: ${boss.prize} KONK</p>
                <p style="color: red">Killed by ${killer}</p>
                <button class="reward-btn btn btn-attack-boss" data-serial="${serial}">Rewards</button>
            </div>
        </div>
        `; 
    } else if (boss.category == 4) {
        return `
        <div class="boss-card">
            <img src="./img/satsy.jpg" class="img-fluid" alt="Fenix ${serial}">
            <div class="boss-info">
                <h2>Fenix #${serial}</h2>
                <p>Life: ${boss.life}</p>
                <p>Damage: ${boss.damage} PB points</p>
                <p class="entry-fee">Entry fee: ${boss.entryFeeBoss/10**18} <img src="./img/logomark_blast.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <p class="prize">Prize: ${boss.prize}$ of FNX</p>
                <p style="color: red">Killed by ${killer}</p>
                <button class="reward-btn btn btn-attack-boss" data-serial="${serial}">Rewards</button>
            </div>
        </div>
        `; 
    } else if (boss.category == 5) {
        return `
        <div class="boss-card">
            <img src="./img/santaboom.webp" class="img-fluid" alt="Santa Boom ${serial}">
            <div class="boss-info">
                <h2>Santa Boom #${serial}</h2>
                <p>Life: ${boss.life}</p>
                <p>Damage: ${boss.damage} PB points</p>
                <p class="entry-fee">Entry fee: ${boss.entryFeeBoss/10**18} <img src="./img/logomark_blast.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <p class="prize">Prize: ${boss.prize}$ of FNX</p>
                <p style="color: red">Killed by ${killer}</p>
                <button class="reward-btn btn btn-attack-boss" data-serial="${serial}">Rewards</button>
            </div>
        </div>
        `; 
    } 
}

// Fonction pour récupérer les informations des boss et afficher les cartes
export async function displayBosses() {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    
    contract = new ethers.Contract(contractAddress, abi, signer);

    // Récupérer les serials des boss vivants
    const bossSerials = await contract.getListBossSerials();
    // Récupérer les serials des boss tués
    const bossKilledSerials = await contract.getListBossKilledSerials();

    let bossAlive = [];
    const bossSerialsAsInt = bossSerials.map(serial => serial.toNumber());
    const bossKilledSerialsAsInt = bossKilledSerials.map(serial => serial.toNumber());
    for (const serial of bossSerialsAsInt) {
        // si un serial de alive est dans killed on le supprime de bossAlive
        if (!bossKilledSerialsAsInt.includes(serial)) {
            const bigNumberSerial = ethers.BigNumber.from(serial);
            bossAlive.push(bigNumberSerial);
        }
    }

    const container = document.getElementById('boss-container');

    if (container && bossAlive.length > 0) {
        container.innerHTML = '';

        for (const serial of bossAlive) {
            try {
                const boss = await contract.getBoss(serial);
                //console.log("boss vivants:", boss);
                // Ajouter chaque carte dans une colonne Bootstrap (par ex. col-md-4 pour 3 cartes par ligne)
                container.innerHTML += createBossCard(boss, serial);
            } catch (error) {
                console.error(`Error when retrieving Boss ID ${serial}:`, error);
            }
        }
    }

    // Afficher la longueur du tableau (nombre de boss)
    const containerKilled = document.getElementById('boss-killed-container');
    if (containerKilled && bossKilledSerials.length > 0) {
        containerKilled.innerHTML = '';

        for (const serial of bossKilledSerials) {
            try {
                // Afficher uniquement les boss tués de la saison 2
                if (serial > 15) {
                    const boss = await contract.getBoss(serial);
                    const killer = await contract.getWhoKilledBoss(serial);
                    const killerShort = `${killer.slice(0, 4)}...${killer.slice(-4)}`;
    
                    containerKilled.innerHTML += createKilledBossCard(boss, serial, killerShort);
                }
            } catch (error) {
                console.error(`Error when retrieving Boss Killed ID ${serial}:`, error);
            }
        } 
    }


}


// Fonction pour attaquer un boss
async function attackBoss(serial, attackBtn) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    
    contract = new ethers.Contract(contractAddress, abi, signer);

    try {

        attackBtn.disabled = true;
        attackBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Attacking...`;

        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        
        // On converti serial en BigNumber
        const serialBigNumber = ethers.BigNumber.from(serial);
        //On récupère les infos du boss courant
        const currBoss = await contract.getBoss(serialBigNumber);

        // Le contrat ERC20
        const tokenContractAddress = "0xb1a5700fa2358173fe465e6ea4ff52e36e88e2ad"; // Remplacer par l'adresse du contrat ERC20
        const tokenContract = new ethers.Contract(tokenContractAddress, [
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function allowance(address owner, address spender) public view returns (uint256)"
        ], signer);

        // Montant à approuver (entryFeeBoss BLAST)
        let amountToApprove = currBoss.entryFeeBoss;//ethers.utils.parseUnits("1.0", 18); // Montant de 1 BLAST avec 18 décimales

        // Vérifier combien de BLAST ont déjà été approuvés
        const allowance = await tokenContract.allowance(userAddress, contract.address);

        if (allowance.gte(amountToApprove)) {
            //console.log("Pas besoin d'approuver, l'allocation est suffisante.");
        } else {
            //console.log("L'allocation n'est pas suffisante. Approve nécessaire.");
            // Approuver la dépense des tokens supplémentairesconst 
            amountToApprove = ethers.constants.MaxUint256; // Assurez-vous que c'est le bon nombre de décimales
            const approvalTx = await tokenContract.approve(contract.address, amountToApprove);
            await approvalTx.wait(); // Attendre la confirmation de l'approbation
        }

        attackBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> You approved BLAST to be spent for claiming points... you can validate the transaction and pay ${amountToApprove/10**18} BLAST now.`;

        // Obtenir le timestamp actuel (en secondes)
        const response = await fetch('/getSignatureBoss', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error('Error retrieving the signature.');
        }

        // Convertir la réponse en JSON
        const { message, timestamp, signature } = await response.json(); // Déstructuration correcte du JSON retourné

        // Convertir timestamp en BigNumber
        const bigNumberTimestamp = ethers.BigNumber.from(timestamp);

        // Appel de la fonction `attackBoss` sur le contrat
        const tx = await contract.connect(provider.getSigner()).attackBoss(serialBigNumber, bigNumberTimestamp, signature);

        // Attente de la confirmation de la transaction
        await tx.wait();

        // Update the UI on success
        attackBtn.innerHTML = 'Attacked !';
        attackBtn.disabled = false;  // Optionally, hide or disable the button after unlocking if no longer needed
        
        setTimeout(async function() {
            // Code à exécuter après 2 secondes
            // Mettre à jour l'affichage des boss après l'attaque
            await displayBosses();
            await updateArenaPageBasedOnConnection();
        }, 2000);
        

    } catch (error) {
        console.error("Error during attack of the boss :", error);
        // Show the error message on the specific unlock button
        attackBtn.innerHTML = error.data?.message || 'Transaction failed';
        attackBtn.disabled = false; // Re-enable the button for retry
    }
}

// Fonction pour récupérer et transformer les data de damage/player
async function viewDamage(serial, rewardBtn) {

    try {
        const response = await fetch('fetchDamagePlayers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ serial: serial })
        });
        if (!response.ok) {
            throw new Error('Error retrieving data.');
        }
        const data = await response.json();

        return data;

    } catch (error) {
        console.error("Error during retrieving of data from Graph :", error);
    }
}


export function addWalletDataBoss() {
    // On ajoute les events pour le bouton Attack de chaque boss
    document.querySelectorAll('.attack-btn').forEach(button => {
        // Clone the button to remove previous event listeners
        const newButton = button.cloneNode(true);

        // Replace the original button with the cloned one
        button.replaceWith(newButton);

        // Add new event listener
        newButton.addEventListener('click', async (e) => {
            const serial = e.target.getAttribute('data-serial');
            await attackBoss(serial, e.target);
        });

        // Enable the button and set the innerHTML
        newButton.disabled = false;
        newButton.innerHTML = "Attack!";
    });

    // On ajoute les events pour le bouton Rewards de chaque boss
    document.querySelectorAll('.reward-btn').forEach(button => {
        // Clone the button to remove previous event listeners
        const newButton = button.cloneNode(true);

        // Replace the original button with the cloned one
        button.replaceWith(newButton);

        // Add new event listener
        newButton.addEventListener('click', async (e) => {
            try {
                const serial = e.target.getAttribute('data-serial');
                const damageByPlayers = await viewDamage(serial, e.target);
                if (damageByPlayers && Object.keys(damageByPlayers).length > 0) {
                    // Remplir le tableau avec les données de dégâts
                    const dataDamage = damageByPlayers.aggregatedDamage.damageDistribution;
                    fillDamageTable(dataDamage);
                    // Afficher la modale avec Bootstrap
                    $('#damageModal').modal('show');
                } else {
                    console.log("No damage data available for this serial.");
                }
            } catch (err) {
                console.error("Error during retrieving of damaga data:", err);
            }
        });

    });
}


export function clearWalletDataBoss() {

    // Bouton d'attack à griser
    // Ajoutez un listener sur les boutons "Attack Boss"
    document.querySelectorAll('.attack-btn').forEach(button => {
        button.disabled = true;
        button.innerHTML = "Connect your wallet";
    });  

    // On ajoute les events pour le bouton Rewards de chaque boss
    document.querySelectorAll('.reward-btn').forEach(button => {
        // Clone the button to remove previous event listeners
        const newButton = button.cloneNode(true);

        // Replace the original button with the cloned one
        button.replaceWith(newButton);

        // Add new event listener
        newButton.addEventListener('click', async (e) => {
            try {
                const serial = e.target.getAttribute('data-serial');
                const damageByPlayers = await viewDamage(serial, e.target);
                if (damageByPlayers && Object.keys(damageByPlayers).length > 0) {
                    // Remplir le tableau avec les données de dégâts
                    const dataDamage = damageByPlayers.aggregatedDamage.damageDistribution;
                    fillDamageTable(dataDamage);
                    // Afficher la modale avec Bootstrap
                    $('#damageModal').modal('show');
                    
                    // Evenements d'écoute des boutons de pagination
                    document.getElementById('prevButton').addEventListener('click', goToPreviousPage);
                    document.getElementById('nextButton').addEventListener('click', goToNextPage);

                } else {
                    console.log("No damage data available for this serial.");
                }
            } catch (err) {
                console.error("Error during retrieving of damaga data:", err);
            }
        });

    });
}


// Fonction pour réduire l'adresse
function shortenAddress(address) {
    return address.slice(0, 4) + '...' + address.slice(-4);
}

// Gérer l'ouverture et la fermeture de la modale
const modal = document.getElementById("damageModal");
const modalContent = document.getElementById("modalContent");

// Fermer la modale si l'utilisateur clique à l'extérieur de la modale
window.onclick = function(event) {
    if (event.target === modal && !modalContent.contains(event.target)) {
        $('#damageModal').modal('hide');
    }
};


let currentPage = 0; // Page courante
const entriesPerPage = 5; // Nombre d'entrées par page
let damageDistribution = []; // Répartition des dégâts à afficher

function fillDamageTable(distribution) {
    damageDistribution = distribution; // Stocker les données de répartition
    currentPage = 0; // Réinitialiser la page courante à 0
    renderTable(); // Afficher le tableau avec les données de la page courante
}

function renderTable() {
    const damageTableBody = document.getElementById('damageTableBody');
    damageTableBody.innerHTML = ''; // Vider le corps du tableau avant de le remplir

    // Calculer l'index de début et de fin pour les entrées de la page courante
    const start = currentPage * entriesPerPage;
    const end = start + entriesPerPage;

    // Parcourir chaque entrée pour la page courante
    damageDistribution.slice(start, end).forEach(entry => {
        const row = document.createElement('tr');

        const cellRank = document.createElement('td');
        cellRank.className = 'white-text';
        cellRank.textContent = `${entry.rank}`;

        const cellAddress = document.createElement('td');
        cellAddress.className = 'white-text';
        cellAddress.textContent = `${entry.player.slice(0, 4)}...${entry.player.slice(-4)}`;

        const cellPercentage = document.createElement('td');
        cellPercentage.className = 'white-text';
        cellPercentage.textContent = `${entry.percentage}%`;

        row.appendChild(cellRank);
        row.appendChild(cellAddress);
        row.appendChild(cellPercentage);
        damageTableBody.appendChild(row);
    });

    updatePaginationControls(); // Mettre à jour les contrôles de pagination
}

function updatePaginationControls() {
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    // Afficher ou masquer le bouton "Précédent"
    prevButton.style.display = currentPage === 0 ? 'none' : 'inline-block';

    // Afficher ou masquer le bouton "Suivant"
    nextButton.style.display = (currentPage + 1) * entriesPerPage >= damageDistribution.length ? 'none' : 'inline-block';
}

// Fonction pour aller à la page précédente
function goToPreviousPage() {
    if (currentPage > 0) {
        currentPage--;
        renderTable(); // Rendre le tableau avec la page précédente
    }
}

// Fonction pour aller à la page suivante
function goToNextPage() {
    if ((currentPage + 1) * entriesPerPage < damageDistribution.length) {
        currentPage++;
        renderTable(); // Rendre le tableau avec la page suivante
    }
}

document.addEventListener("DOMContentLoaded", async (event) => {   
    await displayBosses();
    await updateArenaPageBasedOnConnection();
});
