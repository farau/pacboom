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


// Fonction pour récupérer les données des utilisateurs
async function getUserData() {
    try {
        // Récupérer les utilisateurs depuis la base de données
        const response = await fetch('/users');
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        const users = await response.json();

        // Initialiser un tableau pour stocker les données des utilisateurs
        const userData = [];

        // Boucler sur les utilisateurs
        for (const user of users) {
            // Récupérer l'adresse Ethereum de l'utilisateur
            const address = user.wallet_address;
            // Appeler les fonctions du contrat Ethereum pour récupérer les données
            const points = ethers.utils.formatUnits(await contract.getPlayerPoints(address), 18) * 10**18; // Supposons que les points soient en Wei
            const nfts = ethers.utils.formatUnits(await contract.numberOfNFTs(address), 18) * 10**18;

            //console.log("address :", address, " bonus : ", bonus, " points : ", points, " nfts : ", nfts);
            // Ajouter les données de l'utilisateur au tableau
            userData.push({ address, points, nfts });
        }
        // Retourner les données des utilisateurs
        return userData;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}

// Fonction pour afficher le leaderboard
async function displayLeaderboard(pageNumber, pageSize) {
    try {
        // Récupérer les données des utilisateurs
        const userData = await getUserData();

        // Trier les données par points
        userData.sort((a, b) => b.points - a.points);

        // Paginer les données
        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const usersOnPage = userData.slice(startIndex, endIndex);

        // Construire le tableau HTML avec les classes Bootstrap
        let leaderboardTable = '<h1 class="text-center">PAC BOOM Points Leaderboard</h1><table class="table table-striped">';
        leaderboardTable += '<thead><tr class="white-text"><th>Rank</th><th>Address</th><th>Points</th><th><img src="img/pacboom-nfts.gif" alt="PAC BOOM NFTs" style="max-width: 30px;"></th></tr></thead><tbody>';

        // Compteur de rang
        let rank = startIndex + 1;

        usersOnPage.forEach(user => {
            let shortenedAddresses = '';
            shortenedAddresses = user.address.substring(0, 4) + '...' + user.address.substring(user.address.length - 4);
            leaderboardTable += `<tr class="white-text"><td>${rank}</td><td>${shortenedAddresses}</td><td>${user.points}</td><td>${user.nfts}</td></tr>`;
            rank++; // Incrémenter le rang pour le prochain utilisateur
        });
        leaderboardTable += '</tbody></table>';

        // Afficher le tableau dans la page HTML
        const leaderboardContainer = document.getElementById('leaderboard-container');
        leaderboardContainer.innerHTML = leaderboardTable;
    } catch (error) {
        console.error('Error displaying leaderboard:', error);
    }
}




// Appel de la fonction pour afficher le leaderboard des PB points (par exemple, page 1 avec 10 utilisateurs par page)
const pageNumber = 1;
const pageSize = 10;
displayLeaderboard(pageNumber, pageSize);