const { ethers } = require('ethers');
const config = require('./config.js');

require('dotenv').config();

// Connexion au provider (par exemple, Infura ou un nœud local)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Chargement de l'adresse du contrat et de l'ABI depuis le fichier de configuration
const contractAddress = config.pacBoomAddress;
const abi = config.pacBoomABI;

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
            const points = ethers.formatUnits(await contract.getPlayerPoints(address), 18) * 10**18; // Supposons que les points soient en Wei
            //const nfts = ethers.utils.formatUnits(await contract.numberOfNFTsFromACollection(address, 0), 18) * 10**18;
            const kills = ethers.formatUnits(await contract.getPlayerBossKills(address), 18) * 10**18;
            // Conversion pour l'affichage

            // Convertir la chaîne en nombre flottant
            const pointsFloat = parseFloat(points);

            // Arrondir la valeur flottante à l'entier le plus proche
            const pointsRounded = Math.round(pointsFloat);

            //const formattedNfts = ethers.utils.formatUnits(nfts, 18);

            //console.log("address :", address, " bonus : ", bonus, " points : ", points, " nfts : ", nfts);
            // Ajouter les données de l'utilisateur au tableau
            userData.push({ address, username,  points : pointsRounded, killedBoss: kills });

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
