const { ethers } = require('ethers');

// Connexion au provider (par exemple, Infura ou un nœud local)
const provider = new ethers.providers.JsonRpcProvider("https://rpc.blast.io");

// Chargement de l'adresse du contrat et de l'ABI depuis le fichier de configuration
const contractAddress = '0x3743E1dFC5D91BA60c8B9561A436982f92866843';
const abi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_nftContract",
                "type": "address"
            }
        ],
        "name": "addNftContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "score",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
            }
        ],
        "name": "claimPoints",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "_nftContracts",
                "type": "address[]"
            },
            {
                "internalType": "address",
                "name": "_blastTokenAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_entryFee",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "ECDSAInvalidSignature",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "length",
                "type": "uint256"
            }
        ],
        "name": "ECDSAInvalidSignatureLength",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "ECDSAInvalidSignatureS",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "length",
                "type": "uint256"
            }
        ],
        "name": "StringsInsufficientHexLength",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "score",
                "type": "uint256"
            }
        ],
        "name": "PointsEarned",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "removeNftContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_fee",
                "type": "uint256"
            }
        ],
        "name": "setEntryFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_signer",
                "type": "address"
            }
        ],
        "name": "setSigner",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawBlastTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "blastToken",
        "outputs": [
            {
                "internalType": "contract IERC20",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getEntryFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "player",
                "type": "address"
            }
        ],
        "name": "getPlayerBonus",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "player",
                "type": "address"
            }
        ],
        "name": "getPlayerPoints",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getSigner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "player",
                "type": "address"
            }
        ],
        "name": "hasNFTFromAnyCollection",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "numberOfNFTsFromACollection",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "player",
                "type": "address"
            }
        ],
        "name": "numberOfNFTsFromAllCollections",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Instanciation du contrat intelligent PacBoomTest
const contract = new ethers.Contract(contractAddress, abi, provider);
const { Pool } = require('pg');
require('dotenv').config();

// Configuration de la connexion PostgreSQL
const pool = new Pool({
    user: process.env.USR_DATABASE,
    host: 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432 // Port par défaut de PostgreSQL
});

// Fonction pour récupérer tous les utilisateurs
async function getUsers() {
    let client;
    try {
        // Obtenez un client de la pool
        client = await pool.connect();

        // Exécutez la requête SQL pour récupérer les utilisateurs
        const { rows: users } = await client.query(`
            SELECT username, wallet_address 
            FROM users
            WHERE wallet_address = LOWER(wallet_address)
        `);
        return users;  // Retourne les utilisateurs
    } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        throw err;  // Propager l'erreur pour que l'appelant puisse la gérer
    } finally {
        // Libérez toujours le client, même en cas d'erreur
        if (client) client.release();
    }
}

// Déclaration de nbNFTs
let nbNFTs = '';


// Fonction pour récupérer les données des utilisateurs
async function getUserData() {
    try {
        // Récupérer les utilisateurs depuis la base de données
        const users = await getUsers();
        // Initialiser un tableau pour stocker les données des utilisateurs
        const userData = [];
        let i = 1;
        // Boucler sur les utilisateurs
        for (const user of users) {
            // Récupérer l'adresse Ethereum de l'utilisateur
            const address = user.wallet_address;
            
            const username = user.username;
            // Appeler les fonctions du contrat Ethereum pour récupérer les données
            const points = ethers.utils.formatUnits(await contract.getPlayerPoints(address), 18) * 10**18; // Supposons que les points soient en Wei
            //const nfts = ethers.utils.formatUnits(await contract.numberOfNFTsFromACollection(address, 0), 18) * 10**18;

            // Conversion pour l'affichage

            // Convertir la chaîne en nombre flottant
            const pointsFloat = parseFloat(points);

            // Arrondir la valeur flottante à l'entier le plus proche
            const pointsRounded = Math.round(pointsFloat);

            //const formattedNfts = ethers.utils.formatUnits(nfts, 18);

            //console.log("address :", address, " bonus : ", bonus, " points : ", points, " nfts : ", nfts);
            // Ajouter les données de l'utilisateur au tableau
            userData.push({ address, username,  points : pointsRounded });

            i++;
        }
        // Trier les données par points
        userData.sort((a, b) => b.points - a.points);

        // Retourner les données des utilisateurs
        return userData;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}

// Exporter les fonctions pour pouvoir les utiliser ailleurs
module.exports = {
    getUserData
};