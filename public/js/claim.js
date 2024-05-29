// Définition du fournisseur de signer (provider) Ethereum
const provider = new ethers.providers.Web3Provider(window.ethereum);

// Chargement de l'adresse du contrat et de l'ABI depuis le fichier de configuration
const contractAddress = config.pacBoomAddress;
const abi = config.pacBoomABI;

// Instanciation du contrat intelligent PacBoomTest
const contract = new ethers.Contract(contractAddress, abi, provider);

// Récupération de l'adresse Ethereum actuellement connectée
const signerAddress = await provider.getSigner().getAddress();

// Vérification si l'adresse est connectée
if (!signerAddress) {
    console.error("No Ethereum address connected. Please connect with your wallet.");
}

// Déclaration de nbNFTs
let nbNFTs = '';

// Écouteur d'événement pour les événements PointsEarned
contract.on("PointsEarned", (player, points) => {
    console.log("Points earned:", points);
    // Mettre à jour le texte du bouton avec les points gagnés
    transactionButton.innerText = `Claimed ${points} PAC BOOM points !`;
});

// Écouteur d'événement pour le clic sur le bouton
transactionButton.addEventListener("click", async () => {
    try {
        transactionButton.disabled = true;
        // Afficher une icône de chargement sur le bouton
        transactionButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Waiting...';

        // Récupérer le nombre de NFTs possédés par le joueur
        const numberOfNFTs = await contract.numberOfNFTs(provider.getSigner().getAddress());

        // Effectuer une requête pour récupérer le score du joueur
        const response = await fetch('/get-score', {
            method: 'GET',
            headers: {
                'Authorization': `${localStorage.getItem("jwtToken")}` // Remplacer jwtToken par le jeton JWT de l'utilisateur
            }
        });

        // Vérifier si la réponse est réussie (statut HTTP 200)
        if (response.ok) {
            // Extraire les données JSON de la réponse
            const data = await response.json();
            // Récupérer le score à partir des données
            const score = data.score;
            // Création d'une transaction signée avec le fournisseur de signer
            const transaction = await contract.connect(provider.getSigner()).claimPoints(score);

            // Attente de la confirmation de la transaction
  
            const receipt = await transaction.wait();
            const txHash = receipt.transactionHash; // Récupérer le hash de la transaction

            // Récupérer le nombre de PB points du joueur
            const totalPoints = await contract.getPlayerPoints(provider.getSigner().getAddress());
            // Mettre à jour le texte du bouton avec le nombre de NFTs
            nbNFTs = `You own currently ${numberOfNFTs} NFTs from PAC BOOM collection.<br/>Your total PB points : ${totalPoints} `;

            const txLink = `<a href="https://blastscan.io/tx/${txHash}" target="_blank">View Transaction</a>`;
            document.getElementById("txHash").innerHTML = txLink;
            document.getElementById("infosUser").innerHTML = nbNFTs;
            
        } else {
            // Si la réponse n'est pas réussie, afficher le message d'erreur correspondant
            console.error("Failed to fetch score:", response.statusText);
        }

    } catch (error) {
        console.error("Error:", error);
        if (error.code === 4001) {
            // Rejet par l'utilisateur : rétablir l'état du bouton
            transactionButton.disabled = false;
            transactionButton.innerHTML = 'Claim PAC BOOM Points !';
        }
        // Gérer les autres erreurs ici
    }
});



