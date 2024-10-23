// Définition du fournisseur de signer (provider) Ethereum
const provider = new ethers.providers.Web3Provider(window.ethereum);

// Chargement de l'adresse du contrat et de l'ABI depuis le fichier de configuration
const contractAddress = config.pacBoomAddress;
const abi = config.pacBoomABI;

// Instanciation du contrat intelligent PacBoom
const contract = new ethers.Contract(contractAddress, abi, provider);

// Récupération de l'adresse Ethereum actuellement connectée
const signerAddress = await provider.getSigner().getAddress();

if (document.getElementById("entryFeeGame")) {
    document.getElementById("entryFeeGame").innerHTML = await contract.getEntryFee() / 10**18;
}

// Vérification si l'adresse est connectée
if (!signerAddress) {
    console.error("No Ethereum address connected. Please connect with your wallet.");
}

// Déclaration de nbNFTs
let nbNFTs = '';

// Écouteur d'événement pour le clic sur le bouton
transactionButton.addEventListener("click", async () => {
    try {
        transactionButton.disabled = true;
        transactionButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Waiting...';

        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        
        // Le contrat ERC20
        const tokenContractAddress = "0xb1a5700fa2358173fe465e6ea4ff52e36e88e2ad"; // Remplacer par l'adresse du contrat ERC20
        const tokenContract = new ethers.Contract(tokenContractAddress, [
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function allowance(address owner, address spender) public view returns (uint256)"
        ], signer);

        // Montant à approuver (1 BLAST)
        let amountToApprove = ethers.utils.parseUnits("1.0", 18); // Montant de 1 BLAST avec 18 décimales

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

        const entryFee = await contract.getEntryFee() / 10**18; //récupère le prix à payer en Blast

        transactionButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> You approved BLAST to be spent for claiming points... you can validate the transaction and pay ${entryFee} BLAST now.`;

        // Récupérer le score à partir des données
        const score = parseInt(document.getElementById("finalScore").innerText, 10);
        await saveScoreAndClaimPoints(score);

    } catch (error) {
        console.error('Error during the transaction:', error);
        if (error.code === 4001) {
            transactionButton.disabled = false;
            transactionButton.innerHTML = 'Claim PAC BOOM Points !';
        } else {
            transactionButton.disabled = false;
            transactionButton.innerHTML = error.data?.message || 'Transaction failed';
        }
    }
});

async function saveScoreAndClaimPoints(score) {

    // Récupérer le signer    
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    
    // Récupérer le nombre de NFTs possédés par le joueur
    const nbCollec = await contract.getNbNftContract();
    let numberOfNFTs = []; //tableau du nombre de NFT pour chaque collec
    for (let i=0; i<nbCollec; i++) {
        numberOfNFTs.push(await contract.numberOfNFTsFromACollection(userAddress, 0)); 
    }

    try {
        // Envoyer la requête POST pour sauvegarder le score
        const response = await fetch('/verify-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ score: score })
        });

        // Vérifier si la requête a réussi
        if (!response.ok) {
            throw new Error('Failed to save score');
        }

        // Lire la réponse JSON
        const data = await response.json();
        // Obtenir la signature du score, assurez-vous que getSignature retourne une promesse
        const signatureData = await getSignature(data.score);

        // Envoyer la transaction pour appeler claimPoints
        const contractWithSigner = contract.connect(signer);
        const transaction = await contractWithSigner.claimPoints(signatureData.score, signatureData.timestamp, signatureData.signature);

        // Attendre la confirmation de la transaction
        const receipt = await transaction.wait();

        // Extraire le hash de la transaction
        const txHash = receipt.transactionHash;
        console.log('Transaction Hash:', txHash);

        // Rechercher les points attribués dans les événements
        const pointsAwarded = receipt.events?.find(event => event.event === "PointsEarned")?.args?.[1];

        // Mettre à jour l'interface utilisateur
        const nbNFTs = `You own ${numberOfNFTs[0]} NFTs from PAC BOOM collection.<br/>`;
        
        transactionButton.innerHTML = `Claimed ${pointsAwarded} PAC BOOM Points !`;
        const txLink = `<a href="https://blastscan.io/tx/${txHash}" target="_blank">View Transaction</a>`;
        document.getElementById("txHash").innerHTML = txLink;
        document.getElementById("infosUser").innerHTML = nbNFTs;

    } catch (error) {
        console.error('Erreur lors de l\'initialisation du score:', error);
        transactionButton.disabled = false;
        transactionButton.innerHTML = error.data?.message || 'Transaction failed';
    }
}

async function getSignature(score) {
    try {
        // Récupérer l'adresse du compte connecté avec MetaMask
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

        // Créer un objet pour la requête
        const requestBody = {
            score: score
        };

        // Envoyer la requête POST au back-end
        const response = await fetch('/getSignature', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('Failed to get signature');
        }

        // Récupérer la réponse JSON du serveur
        const data = await response.json();

        // Utiliser les données retournées (message, signature, timestamp)
        //console.log("Response from backend:", data);

        if (!data.message || !data.timestamp || !data.signature) {
            throw new Error("Missing values in the response");
        }
        // Vous pouvez maintenant envoyer ces données à votre contrat intelligent
        return data;

    } catch (error) {
        console.error('Error getting signature:', error);
    }
}


// Exemple d'appel de la fonction claimPoints avec des valeurs correctes
async function claimPoints(score, timestamp, signature) {
    try {
        if (!score || !timestamp || !signature) {
            throw new Error("Invalid arguments passed to the function.");
        }

        // Assurez-vous que score et timestamp sont correctement définis
        const bigNumberScore = ethers.BigNumber.from(score); // Convertir en BigNumber si nécessaire
        const bigNumberTimestamp = ethers.BigNumber.from(timestamp); // Idem pour timestamp

        // Créer la transaction pour appeler claimPoints
        const transaction = await contract.connect(provider.getSigner()).claimPoints(bigNumberScore, bigNumberTimestamp, signature);

        // Attendre la confirmation de la transaction
        const receipt = await transaction.wait();
        console.log("Transaction successfull :", receipt);

    } catch (error) {
        console.error("Erreur lors de l'appel de claimPoints:", error);
    }
}