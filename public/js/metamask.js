import { clearWalletDataBoost, getWalletDataBoost, getPlayerLevel } from "./bonus.js";
import { addWalletDataBoss, clearWalletDataBoss } from "./boss.js";
import { getMetadataNub} from "./nub.js";
import { getTwitterInfos } from "./twitter.js";

const connectWallet = document.getElementById('connectWallet')

// Définition du fournisseur de signer (provider) Ethereum
const provider = new ethers.providers.Web3Provider(window.ethereum);

// Chargement de l'adresse du contrat du NFT PacNUB et de l'ABI depuis le fichier de configuration
const contractAddress = config.pacNubAddress; 
const abi = config.pacNubABI;

// Chargement de l'adresse du contrat du PacBoom et de l'ABI depuis le fichier de configuration
const contractAddressPacBoom = config.pacBoomAddress; 
const abiPacBoom = config.pacBoomABI;

// Instanciation du contrat intelligent PacNub
const contract = new ethers.Contract(contractAddress, abi, provider);
// Instanciation du contrat intelligent PacBoom
const contractPB = new ethers.Contract(contractAddressPacBoom, abiPacBoom, provider);

// Récupération de l'adresse Ethereum actuellement connectée
const signerAddress = provider.getSigner().getAddress();

// Vérification si l'adresse est connectée
if (!signerAddress) {
    console.error("No Ethereum address connected. Please connect with your wallet.");
}

export let nubOwned = [];

// Fonction pour écouter les changements de compte MetaMask
async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // L'utilisateur s'est déconnecté de MetaMask
        // Mettez à jour l'état de votre application en conséquence
        signOutOfMetaMask();
    } else {
        // L'utilisateur s'est connecté ou a changé de compte
        // Mettez à jour l'état de votre application si nécessaire
        signOutOfMetaMask();
        //await connectWalletwithMetaMask();
    }
}

function checkInstalled() {
    if (typeof window.ethereum == 'undefined') {
      connectWallet.innerText = 'MetaMask isnt installed, please install it';
      connectWallet.classList.remove();
      connectWallet.classList.add();
      return false;
    }
    connectWallet.addEventListener('click', connectWalletwithMetaMask);
    return true;
}

// Fonction pour vérifier si l'utilisateur est déjà connecté
export async function checkIfUserConnected() {
    const transactionButtonElement = document.getElementById('transactionButton');
    const userAddress = localStorage.getItem('userAddress');
    const connectWalletButton = document.getElementById('connectWallet');
    const twitterLoginBtn = document.getElementById('twitterLoginBtn');
    if (userAddress) {
        try {
            // Envoyer une requête au serveur pour vérifier le JWT
            const response = await fetch('/verify-jwt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userAddress : userAddress})
            });

            if (response.ok) {
                // Convertir la réponse en JSON
                const data = await response.json();
                if (data && data.userAddress) {
                    // Afficher les informations de l'utilisateur
                    connectWalletButton.innerHTML = `${data.userAddress.substring(0, 4)}...${data.userAddress.substring(data.userAddress.length - 4)}`;
                    
                    // Activer d'autres fonctionnalités, etc.
                    // L'utilisateur est connecté, afficher le bouton "Link Twitter Account"
                    twitterLoginBtn.style.display = 'block';
                    
                    // Désactiver l'écouteur de clic pour connecter le portefeuille
                    connectWalletButton.removeEventListener('click', connectWalletwithMetaMask);

                    // Ajouter un écouteur de clic sur connectWalletButton pour afficher/masquer le dropdown
                    connectWalletButton.addEventListener('click', toggleWalletInfo);


                    // Activer l'écouteur de clic pour se déconnecter du portefeuille
                    document.getElementById('logoutWallet').addEventListener('click', signOutOfMetaMask);
                    
                    // Vérifier le réseau et activer le bouton de transaction si valide
                    if (checkNetwork() && transactionButtonElement) {
                        transactionButtonElement.disabled = false;
                    }

                    await nubLogin();
                    return true; // L'utilisateur est connecté
                } else {
                    // Gérer les erreurs si le champ address est manquant
                    console.error('Adresse not found in the response.');
                    await nubLogout()
                    return false; // L'utilisateur n'est pas connecté
                }
            } else {
                // Gérer les erreurs de réponse non OK
                const errorText = await response.text();
                console.error('Error during processing of JWT:', errorText);
                await nubLogout();
                return false; // L'utilisateur n'est pas connecté
            }
        } catch (error) {
            // Gérer les erreurs de la requête fetch
            console.error('Error during processing of JWT:', error);
            await nubLogout();
            return false; // L'utilisateur n'est pas connecté
        }
    } else {
        twitterLoginBtn.style.display = 'none';
        if (transactionButtonElement) {
            transactionButtonElement.disabled = true;
        }
        await nubLogout();
        return false; // L'utilisateur n'est pas connecté
    }
}

// Fonction pour afficher/masquer le menu déroulant au clic sur walletAddress
export async function toggleWalletInfo() {
    const address = localStorage.getItem("userAddress");
    const walletInfo = document.getElementById('walletInfo');
    if (walletInfo.style.display === 'none' || walletInfo.style.display === '') {
        walletInfo.style.display = 'block'; // Affiche le contenu
        document.getElementById('logoutWallet').style.display = 'block'; // Affiche le bouton logout

        const bonus = await contractPB.getPlayerBonus(address);
        const points = await contractPB.getPlayerPoints(address);
        const pointsInt = points.toNumber();
        document.getElementById('mypbpoints').innerHTML = pointsInt;
        document.getElementById('myboost').innerHTML = "x"+bonus;

        // Puis on met à jour le level et la progress bar avec points
        getPlayerLevel(pointsInt);

    } else {
        walletInfo.style.display = 'none'; // Masque le contenu
    }
}


// Génére le JWT en appelant la route /loginOrSaveUser sur le serveur
function loginOrSaveUser(address) {
    return fetch('/loginOrSaveUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userAddress: address })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la génération du JWT');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Erreur lors de la génération du JWT :', error);
        // Gérer les erreurs si nécessaire
    });
}

// Détruit le JWT en appelant la route /logout sur le serveur
function logoutUser() {
    return fetch('/logoutUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error.');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error during the process of logout:', error);
        // Gérer les erreurs si nécessaire
    });
}

// Fonction qui vérifie la connexion via le wallet 
async function connectWalletwithMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Vérifier si l'utilisateur est déjà connecté en consultant le stockage local
            const isUserConnected = localStorage.getItem('isUserConnected');
            const userSignature = localStorage.getItem('userSignature');

            // Demander l'autorisation d'accéder au compte Ethereum
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            if (!accounts) { return; }

            const address = accounts[0];

            // Message à signer
            const welcomeMessage = "Welcome to PacBoom ! Play the game and get the best score ! Buy an NFT or lock ETH to get a boost on your score !";
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [welcomeMessage, address],
            });

            // Si le message n'est pas signé, on quitte la fonction
            if (!signature) {
                throw new Error("La signature n'est pas valide.");
            }

            // Génère le jwt, enregistre l'utilisateur en BDD et attend la réponse
            const result = await loginOrSaveUser(address);

            // On enregistre l'adresse Metamask de l'utilisateur courant dans le localStorage
            localStorage.setItem("userAddress", address);

            // On tente d'afficher les infos Twitter
            await getTwitterInfos(); // Attendre la réponse

            // Tronquer l'adresse pour afficher seulement les 3 premiers et 4 derniers caractères
            const truncatedAddress = `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
            connectWallet.innerHTML = truncatedAddress;

            // On active le bouton link
            document.getElementById('twitterLoginBtn').style.display = 'block';

            // Désactiver l'écouteur de clic pour connecter le portefeuille
            connectWallet.removeEventListener('click', connectWalletwithMetaMask);

            // Activer l'écouteur de clic pour se déconnecter du portefeuille après la signature
            setTimeout(() => {
                document.getElementById('logoutWallet').addEventListener('click', signOutOfMetaMask);
            }, 200);

            // Ajouter un écouteur de clic sur connectWalletButton pour afficher/masquer le dropdown
            connectWallet.addEventListener('click', toggleWalletInfo);

            // Enregistrer dans le stockage local pour indiquer que l'utilisateur est connecté
            localStorage.setItem('isUserConnected', 'true');

            // Enregistrer la signature dans le stockage local
            localStorage.setItem('userSignature', signature);

            // Vous pouvez maintenant utiliser la signature comme nécessaire dans votre application
            await checkUserSignatureDeleted(); // Attendre la réponse

            // On MAJ le canvas et les boutons associés au canvas
            await nubLogin(); // Attendre la réponse
            await updateCanvasBasedOnConnection(); // Attendre la réponse
            await updateBoostPageBasedOnConnection(); // Attendre la réponse
            await updateArenaPageBasedOnConnection();

        } catch (error) {
            console.error(error.message);
            signOutOfMetaMask();
            // Rejeter la promesse avec l'erreur
            return Promise.reject(error);
        }
    }
    return new Promise((resolve) => {
        // Simulation d'une attente de 2 secondes
        setTimeout(() => {
            resolve(); // Résoudre la promesse lorsque la connexion est réussie
        }, 2000);
    });
}


// Gestion de la déconnexion
async function signOutOfMetaMask() {
    try {
        // Appeler la route pour se logout
        const result = await logoutUser(); // Assurez-vous que logoutUser retourne une Promise

        // Vérifiez si la réponse est OK
        if (!result.ok) {
            throw new Error('Error during logout.');
        }

        if (result.ok) {
            document.getElementById('logoutWallet').removeEventListener('click', signOutOfMetaMask);
            connectWallet.removeEventListener('click', toggleWalletInfo); // on supprime l'event affichage du toggle si on se déco
            setTimeout(() => {
                connectWallet.addEventListener('click', connectWalletwithMetaMask);
            }, 200);

            // Supprimer l'indicateur de connexion et l'adresse dans le stockage local
            localStorage.removeItem('isUserConnected');
            localStorage.removeItem('userAddress');
            // Il faut aussi supprimer la signature de l'user et le jwt token
            localStorage.removeItem('userSignature');
            localStorage.removeItem('username');
            localStorage.removeItem('username_discord'); // discord username

            // Réinitialiser le bouton connectWallet pour qu'il demande la connexion la prochaine fois
            connectWallet.innerHTML = 'Connect Wallet';
            twitterLoginBtn.innerHTML = 'Link your Twitter';

            // On masque le bouton Twitter
            document.getElementById('twitterLoginBtn').style.display = 'none';

            // On rend invisible l'onglet coulissant contenant les infos de l'user
            document.getElementById('walletInfo').style.display = 'none'; // Affiche le bouton de déconnexion
            

            // Activer l'écouteur de clic pour connecter le portefeuille
            connectWallet.addEventListener('click', connectWalletwithMetaMask);

            // Vérifiez que la signature utilisateur est supprimée
            checkUserSignatureDeleted();

            // On MAJ les éléments réactifs : canvas et boutons
            await checkIfUserConnected();
            await updateBoostPageBasedOnConnection();
            await updateCanvasBasedOnConnection();
            await updateArenaPageBasedOnConnection();
        }
    } catch (error) {
        console.error('Error during logout process:', error);
        // Gérer les erreurs si nécessaire
    }
}


// Gestion de la chain sélectionnée
function checkNetwork() {
    // Vérifier si MetaMask est installé et disponible
    const transactionButtonElement = document.getElementById('transactionButton');

    if (typeof window.ethereum !== 'undefined') {
        const ethereum = window.ethereum;

        // Vérifier le réseau au chargement de la page
        ethereum.request({ method: 'eth_chainId' })
            .then(chainId => {
                if (chainId !== config.chain_id) { // Vérifier si le chainId correspond à Step Network Mainnet
                    // Afficher un message d'erreur ou désactiver les boutons de transaction
                    document.getElementById('networkModal').style.display = 'block';
                    
                    // Ajouter un écouteur pour le bouton de changement de réseau
                    document.getElementById('changeNetworkButton').addEventListener('click', async () => {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_switchEthereumChain',
                                params: [{ chainId: config.chain_id }],
                            });
                            // Recharger la page après avoir changé de réseau
                            window.location.reload();
                        } catch (switchError) {
                            if (switchError.code === 4902) {
                                // Si le réseau n'est pas ajouté dans MetaMask
                                try {
                                    await window.ethereum.request({
                                        method: 'wallet_addEthereumChain',
                                        params: [
                                            {
                                                chainId: config.chain_id,
                                                rpcUrl: 'https://rpc.blast.io', // Remplacez par votre URL RPC
                                                chainName: 'Blast', // Remplacez par le nom du réseau
                                            },
                                        ],
                                    });
                                    window.location.reload();
                                } catch (addError) {
                                    console.error('Erreur lors de l\'ajout du réseau:', addError);
                                }
                            }
                            console.error('Erreur lors du changement de réseau:', switchError);
                        }
                    });
                    // Désactiver les boutons de transaction (exemple avec un bouton ayant l'ID "transactionButton")
                    if (transactionButtonElement) {
                        transactionButtonElement.disabled = true;
                    }
                    return false;
                } else {
                    // Activer les boutons de transaction si le réseau est Step Network Mainnet
                    if (transactionButtonElement) {
                    transactionButtonElement.disabled = false;
                    }
                    return true;
                }
            })
            .catch(error => {
                console.error('Error during retrieval of the network :', error);
            });
    } else {
        // MetaMask n'est pas installé ou n'est pas disponible
        console.error('MetaMask isnt installed.');
        if (transactionButtonElement) {
            transactionButtonElement.disabled = false;
        }
        return false;
    }
}


// Fonction pour vérifier si userSignature est supprimé de la mémoire locale
function checkUserSignatureDeleted() {
    const userSignature = localStorage.getItem('userSignature');
    const transactionButtonElement = document.getElementById('transactionButton');
    if (!userSignature) {
        // Désactiver le bouton de transaction si userSignature est supprimé
        if (transactionButtonElement) {
            transactionButtonElement.disabled = true;
        }
    } else {
        // Activer le bouton de transaction si userSignature est présent
        if (transactionButtonElement) {
            transactionButtonElement.disabled = false;
        }
    }
}


window.addEventListener('DOMContentLoaded', () => {
    checkInstalled();
    checkIfUserConnected();
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    // Écouter les changements de réseau MetaMask
    checkNetwork();
    window.ethereum.on('chainChanged', checkNetwork);
})


async function nubLogin() {
    if (document.getElementById("nubCanvas")) {
        // Check du bouton NEXT de la page mynub.html
        console.log('User logged');
        document.getElementById("next").style='block';

        //document.getElementById("next").innerText='Next';

        // Le bouton Save doit être visible ici. On veillera à vérifier une condition de compte log et nft en possession pour ajouter le nub ingame
        document.getElementById("saveButton").style='block';
        // On réactive le bouton Next si on est log
        document.getElementById("next").disabled = false;
    }
}

async function nubLogout() {
    if (document.getElementById("nubCanvas")) {
        // console.log('The user is not logged');
        // Effectuer des actions pour un utilisateur non connecté
        document.getElementById("next").style='block';
        document.getElementById("next").innerText='You must connect your wallet';
        // On désactive le bouton Next si on est log
        document.getElementById("next").disabled = true;
        // Le bouton Save doit être invisible aussi. On veillera à vérifier une condition de compte log et nft en possession pour ajouter le nub ingame
        document.getElementById("saveButton").style.display = 'none';
    }
}



let nub_id = null; // nub_id par défaut à null

export async function updateCanvasBasedOnConnection() {

    let currentIndex = 0; // index de l'image réinitialisé à chaque appel

    if (document.getElementById("nubCanvas")) {
        let nubOwned = await contract.tokensOwnedBy(provider.getSigner().getAddress());
        // Créer une copie du tableau et ajouter 'null' au début
        let extensibleNubOwned = ['null', ...nubOwned];
    
        let isConnected = await checkIfUserConnected();
        let nubCanvas = document.getElementById('nubCanvas');
        let ctx = nubCanvas.getContext('2d');
    
        let nubSelectedcanvas = document.getElementById('secondaryNubCanvas');
        let ctx2 = nubSelectedcanvas.getContext('2d');
        
        if (isConnected && extensibleNubOwned.length <= 1) {
            document.getElementById("next").innerText='';
            // Ajouter un lien vers Blastr.xyz
            let link = document.createElement('a');
            link.href = 'https://blastr.xyz/pacboom-armyera';
            link.textContent = 'Buy one Nub from the PacBoom : Army era Blastr collection';// Appliquer le style en ligne pour rendre le texte blanc
            link.style.color = 'white';
            link.target = '_blank'; // Ouvrir dans un nouvel onglet

            // Ajouter le lien à l'élément avec id="next"
            document.getElementById("next").appendChild(link);
        }
        else if (isConnected && extensibleNubOwned.length > 1) {
            
            //Si on est connecté on ajoute à la liste nubOwned le nub NULL qui correspond à aucun NFT
            //console.log("NUB :", nubOwned);
    
            // Supprimer l'écouteur précédent (si existant) pour éviter les duplications
            const nextButton = document.getElementById("next");
            nextButton.innerText='Next';
            const newNextButton = nextButton.cloneNode(true); // Créer un nouveau bouton cloné
            nextButton.parentNode.replaceChild(newNextButton, nextButton); // Remplacer l'ancien par le nouveau
    
            // Ajouter un nouvel écouteur d'événement
            newNextButton.addEventListener("click", function(event) {

                ctx.clearRect(0, 0, nubCanvas.width, nubCanvas.height);

                const backgroundImage = new Image();
                // modulo ici pour afficher l'image enregistrée sur le serveur entre 0 et 9
                // BUT : éviter les multi appels ipfs
                backgroundImage.src = (extensibleNubOwned[currentIndex] !== 'null' ? config.pacArmyImgIpfs+extensibleNubOwned[currentIndex] : 'img/nub/null') + '.png';

                backgroundImage.onload = function() {
                    ctx.clearRect(0, 0, nubCanvas.width, nubCanvas.height);
                    ctx.drawImage(backgroundImage, 0, 0, nubCanvas.width, nubCanvas.height);    
                };

                nub_id = extensibleNubOwned[currentIndex] !== null ? extensibleNubOwned[currentIndex] : null;
                showSaveMetaDataButton();

                currentIndex = (currentIndex + 1) % extensibleNubOwned.length;
            });
        } else {
            // Effacer tout le canvas
            ctx.clearRect(0, 0, nubCanvas.width, nubCanvas.height);

            // Ne pas afficher le bouton save
            dontShowSaveMetaDataButton();
    
            // Charger l'image de fond
            const backgroundImage = new Image();
            backgroundImage.src = 'img/nub/null.png';
    
            // Attendre que l'image soit chargée
            backgroundImage.onload = function() {
                // Dessiner l'image de fond sur le canvas
                ctx.drawImage(backgroundImage, 0, 0, nubCanvas.width, nubCanvas.height);    
            };

        }

        // Mettre à jour le petit canvas indiquant le nub sélectionné.
        //console.log("on appelle getMetadataNub ici lors du login");
        getMetadataNub();
    }
}

const saveButton = document.getElementById('saveButton');

// Fonction pour rendre le bouton visible et retourner le nub_id courant
export function showSaveMetaDataButton() {
    saveButton.style.display = 'block';
    return nub_id == null ? null : nub_id; //on fait l'opération de modulo pour afficher les bonnes images dans le petit canvas et le jeu directement.
}

function dontShowSaveMetaDataButton() {
    saveButton.style.display = 'none';
}

export async function verifyNubOwned(nub_id) {
    let nubOwned = await contract.tokensOwnedBy(provider.getSigner().getAddress());

    // cela teste la condition pour tous les éléments du tableau nubOwned et retourne true si au moins 1 élément nub_id est présent dans nubOwned
    return nubOwned.some(nub => {
        const nub_id_owned = parseInt(nub.toString(), 10);
        return nub_id_owned === nub_id ;
    });

}

// Fonction qui met à jour la section Boost (infos+eth lock+ eth unlock)
export async function updateBoostPageBasedOnConnection() {

    let isConnected = await checkIfUserConnected();
    if (isConnected && document.getElementById("locked-info")) {
        getWalletDataBoost();
    } else if (!isConnected && document.getElementById("locked-info")) {
        clearWalletDataBoost();
    }
}

// Fonction qui met à jour la section Arena
export async function updateArenaPageBasedOnConnection() {
    let isConnected = await checkIfUserConnected();
    if (isConnected && document.getElementById("boss-container")) {
        // Ajoutez un listener sur les boutons "Attack Boss"  
        addWalletDataBoss();
    } else if (!isConnected && document.getElementById("boss-container")) {
        clearWalletDataBoss();
    }
}