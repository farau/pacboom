const connectWallet = document.getElementById('connectWallet')


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
async function checkIfUserConnected() {
    const jwtToken = localStorage.getItem('jwtToken'); // Récupérer le JWT depuis sessionStorage
    const transactionButtonElement = document.getElementById('transactionButton');
    const userAddress = localStorage.getItem('userAddress');

    if (jwtToken && userAddress) {
        try {
            // Envoyer une requête au serveur pour vérifier le JWT
            const response = await fetch('/verify-jwt', {
                method: 'POST',
                headers: {
                    'Authorization': `${jwtToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userAddress : userAddress})
            });

            if (response.ok) {
                // Convertir la réponse en JSON
                const data = await response.json();
                if (data.userAddress) {
                    // Afficher les informations de l'utilisateur
                    connectWallet.innerHTML = `${data.userAddress.substring(0, 4)}...${data.userAddress.substring(data.userAddress.length - 4)}`;
                    // Activer d'autres fonctionnalités, etc.
                    // L'utilisateur est connecté, afficher le bouton "Link Twitter Account"
                    document.getElementById('twitterLoginBtn').style.display = 'block';
                    
                    // Désactiver l'écouteur de clic pour connecter le portefeuille
                    connectWallet.removeEventListener('click', connectWalletwithMetaMask);

                    // Activer l'écouteur de clic pour se déconnecter du portefeuille
                    connectWallet.addEventListener('click', signOutOfMetaMask);
                    if (checkNetwork() && transactionButtonElement) {
                        transactionButtonElement.disabled = false;
                    }
                } else {
                    // Gérer les erreurs si le champ address est manquant
                    console.error('Adresse non trouvée dans la réponse.');
                }
            } else {
                // Gérer les erreurs
                console.error('Erreur lors de la vérification du JWT:', response.statusText);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du JWT:', error);
        }
    } else {
        document.getElementById('twitterLoginBtn').style.display = 'none';
        if (transactionButtonElement) {
            transactionButtonElement.disabled = true;
        }
    }
}


// Génére le JWT côté client en appelant la route /create-jwt sur le serveur
function generateJWT(address) {
    return fetch('/create-jwt', {
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
    .then(data => {
        const jwtToken = data.token;
        return jwtToken;
    })
    .catch(error => {
        console.error('Erreur lors de la génération du JWT :', error);
        // Gérer les erreurs si nécessaire
    });
}

async function connectWalletwithMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Vérifier si l'utilisateur est déjà connecté en consultant le stockage local
            const isUserConnected = localStorage.getItem('isUserConnected');
            const userSignature = localStorage.getItem('userSignature');
         
            /*if (isUserConnected && userSignature ??) {
                // L'utilisateur est déjà connecté, n'effectuez aucune action
                return;
            }*/

            // Demander l'autorisation d'accéder au compte Ethereum
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            if (!accounts) { return; }

            const address = accounts[0];

            // Message à signer
            const welcomeMessage = "Welcome to PacBoom ! Play the game and get the best score ! Buy an NFT to get a boost on your score !";
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [welcomeMessage, address],
            });

            // Si le message n'est pas signé, on quitte la fonction
            if (!signature) {
                throw new Error("La signature n'est pas valide.");
            }

            // Générez le JWT
            const jwtToken = generateJWT(address)
            .then(jwtToken => {
                localStorage.setItem('jwtToken', jwtToken);
                // On sauvegarde à ce moment l'utilisateur dans la BDD
                saveUserToDatabase(jwtToken, address);
                getTwitterInfos(address);
            })
            .catch(error => {
                console.error('Erreur lors de la génération du JWT :', error);
                // Gérer les erreurs si nécessaire
            });


            // Tronquer l'adresse pour afficher seulement les 3 premiers et 4 derniers caractères
            const truncatedAddress = `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
            connectWallet.innerHTML = truncatedAddress;

            // On active le bouton link
            document.getElementById('twitterLoginBtn').style.display = 'block';
            
            // Désactiver l'écouteur de clic pour connecter le portefeuille
            connectWallet.removeEventListener('click', connectWalletwithMetaMask);

            // Activer l'écouteur de clic pour se déconnecter du portefeuille après la signature
            setTimeout(() => {
                connectWallet.addEventListener('click', signOutOfMetaMask);
            }, 200);


            // Enregistrer dans le stockage local pour indiquer que l'utilisateur est connecté
            localStorage.setItem('isUserConnected', 'true');

            // Enregistrer la signature dans le stockage local
            localStorage.setItem('userSignature', signature);

            // Vous pouvez maintenant utiliser la signature comme nécessaire dans votre application
            checkUserSignatureDeleted();
        } catch (error) {
            console.error(error.message);
            signOutOfMetaMask();
            // Rejeter la promesse avec l'erreur
            return Promise.reject(error);
        }
    }
    return new Promise((resolve, reject) => {
        // Simulation d'une attente de 2 secondes
        setTimeout(() => {
            resolve(); // Résoudre la promesse lorsque la connexion est réussie
        }, 2000);
    });
}

function signOutOfMetaMask() {

    connectWallet.removeEventListener('click', signOutOfMetaMask)
    setTimeout(() => {
      connectWallet.addEventListener('click', connectWalletwithMetaMask)
    }, 200  )

    // Supprimer l'indicateur de connexion et l'adresse dans le stockage local
    localStorage.removeItem('isUserConnected');
    localStorage.removeItem('userAddress');
    // Il faut aussi supprimer la signature de l user et le jwt token
    localStorage.removeItem('userSignature');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    // Réinitialiser le bouton connectWallet pour qu'il demande la connexion la prochaine fois
    connectWallet.innerHTML = 'Connect Wallet';
    twitterLoginBtn.innerHTML = 'Link your Twitter'
    // On masque le bouton Twitter
    document.getElementById('twitterLoginBtn').style.display = 'none';
    
    // Activer l'écouteur de clic pour connecter le portefeuille
    connectWallet.addEventListener('click', connectWalletwithMetaMask);
    checkUserSignatureDeleted();

}

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


async function saveUserToDatabase(jwtToken, address) {
    try {
        const response = await fetch('/save-user', {
            method: 'POST',
            headers: {
                'Authorization': `${jwtToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ wallet_address: address }) // Convertir l'objet en JSON
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erreur lors de l\'enregistrement de l\'utilisateur dans la base de données:', errorData);
            throw new Error('Erreur lors de l\'enregistrement de l\'utilisateur dans la base de données.');
        } else {
            const successData = await response.json();
            console.log('Utilisateur enregistré avec succès:', successData);
            localStorage.setItem('userAddress', address);
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function handleTwitterLoginButtonClick() {
    // Rediriger l'utilisateur vers l'URL d'authentification Twitter côté serveur
    window.location.href = '/auth/twitter';
}


function getTwitterInfos(address) {
    const jwtToken = localStorage.getItem("jwtToken");

    fetch(`/getTwitterInfos?address=${address}`, {
        method: 'GET',
        headers: {
            'Authorization': `${jwtToken}`,
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
        //console.log("affichage data twitter sur nabar")
        if (data && data.length > 0) {
            const userData = data[0]; // Assumant que vous renvoyez un tableau de résultats

            //console.log("Réponse obtenue :", userData);
            const twitterLoginBtn = document.getElementById("twitterLoginBtn");

            // Créer un conteneur flex pour l'avatar et le texte
            const flexContainer = document.createElement('div');
            flexContainer.style.display = 'flex';
            flexContainer.style.alignItems = 'center';

            // Créer l'élément d'image pour l'avatar
            const avatarImg = document.createElement('img');
            avatarImg.src = userData.avatarurl; // Utiliser l'URL de l'avatar fournie
            avatarImg.alt = 'Avatar';
            avatarImg.style.width = '30px'; // Ajuster la taille de l'avatar si nécessaire

            // Créer un élément span pour le nom d'utilisateur
            const usernameSpan = document.createElement('span');
            usernameSpan.innerText = userData.username;

            // Ajouter l'image d'avatar et le nom d'utilisateur au conteneur flex
            flexContainer.appendChild(avatarImg);
            flexContainer.appendChild(usernameSpan);
            localStorage.setItem('username', userData.username);

            // Effacer le contenu existant du bouton et ajouter le conteneur flex
            twitterLoginBtn.innerHTML = ''; // Effacer le contenu existant du bouton
            twitterLoginBtn.appendChild(flexContainer);
        } else {
            console.log("Aucune donnée Twitter trouvée");
            document.getElementById("twitterLoginBtn").addEventListener("click", handleTwitterLoginButtonClick);
        }
    })
    .catch(error => console.error('Erreur:', error));
}

