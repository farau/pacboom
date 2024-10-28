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
        </div>
    </div>
    `;
    } else if (boss.category == 1) {
        return `
        <div class="boss-card">
            <img src="./img/konk.webp" class="img-fluid" alt="Kiyosonk (Boss #${serial})">
            <div class="boss-info">
                <h2>Boss #${serial}</h2>
                <p>Life: ${boss.life}</p>
                <p>Damage: ${boss.damage} PB points</p>
                <p class="entry-fee">Entry fee: ${boss.entryFeeBoss/10**18} <img src="./img/logomark_blast.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <p class="prize">Prize: ${boss.prize} <img src="./img/gold.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <button class="attack-btn btn btn-attack-boss" data-serial="${serial}" disabled=true>Connect your wallet</button>
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
            </div>
        </div>
        `;
    } else if (boss.category == 1) {
        return `
        <div class="boss-card">
            <img src="./img/konk.webp" class="img-fluid" alt="Boss ${serial}">
            <div class="boss-info">
                <h2>Boss #${serial}</h2>
                <p>Life: ${boss.life}</p>
                <p>Damage: ${boss.damage} PB points</p>
                <p class="entry-fee">Entry fee: ${boss.entryFeeBoss/10**18} <img src="./img/logomark_blast.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <p class="prize">Prize: ${boss.prize} <img src="./img/gold.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <p style="color: red">Killed by ${killer}</p>
            </div>
        </div>
        `;
    } else if (boss.category == 2) {
        return `
        <div class="boss-card">
            <img src="./img/konk.webp" class="img-fluid" alt="Boss ${serial}">
            <div class="boss-info">
                <h2>Boss #${serial}</h2>
                <p>Life: ${boss.life}</p>
                <p>Damage: ${boss.damage} PB points</p>
                <p class="entry-fee">Entry fee: ${boss.entryFeeBoss/10**18} <img src="./img/logomark_blast.png" class="img-fluid" style="width: 20px; height: 20px;"></p>
                <p class="prize">Prize: ${boss.prize} KONK</p>
                <p style="color: red">Killed by ${killer}</p>
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
    
    /*
    console.log("boss au complet:", bossSerialsAsInt);
    console.log("boss morts:", bossKilledSerialsAsInt);
    console.log("boss vivants:", bossAlive);
    */

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
                const boss = await contract.getBoss(serial);
                const killer = await contract.getWhoKilledBoss(serial);
                const killerShort = `${killer.slice(0, 4)}...${killer.slice(-4)}`;

                containerKilled.innerHTML += createKilledBossCard(boss, serial, killerShort);
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


export function addWalletDataBoss() {
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
}

export function clearWalletDataBoss() {

    // Bouton d'attack à griser
    // Ajoutez un listener sur les boutons "Attack Boss"
    document.querySelectorAll('.attack-btn').forEach(button => {
        button.disabled = true;
        button.innerHTML = "Connect your wallet";
    });  
}

document.addEventListener("DOMContentLoaded", async (event) => {   
    await displayBosses();
    await updateArenaPageBasedOnConnection();
});