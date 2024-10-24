const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();
const cookieParser = require('cookie-parser');

const passport = require('passport');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const { Strategy } = require('@superfaceai/passport-twitter-oauth2');
const { ethers, Wallet } = require('ethers');

require('dotenv').config();

const config = require('./config.js');
const privateKey = process.env.PRIVATE_KEY;
const signer = new Wallet(privateKey);

// Chargement de l'adresse du contrat du NFT PacNUB et de l'ABI depuis le fichier de configuration
const contractAddress = config.pacNubAddress; 
const abi = config.pacNubABI;

const pacboomAddress = config.pacBoomAddress; 
const pacboomAbi = config.pacBoomABI;
// Initialisation du provider (vous pouvez utiliser Infura, Alchemy, ou un autre service)
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL); // Assurez-vous que `RPC_URL` est défini dans votre .env

// Instanciation du contrat intelligent PacNub
const contractPacNub = new ethers.Contract(contractAddress, abi, provider);
// Instanciation du contrat intelligent PacBoom
const contractPacBoom = new ethers.Contract(pacboomAddress, pacboomAbi, provider);

// Configurer le moteur EJS pour rendu dynamique des pages html/css
app.set('view engine', 'ejs');

// Indiquer le répertoire où se trouvent vos fichiers EJS
app.set('views', path.join(__dirname, 'public'));

// Dites à Express de faire confiance aux proxies
app.set('trust proxy', true);


// Middleware pour parser le corps de la requête en JSON
app.use(express.json(), flash());
app.use(cookieParser()); // Utiliser cookieParser pour gérer les cookies sécurisés

// Remplacez par vos propres clés et secrets
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;

// Configurer les sessions Express
//app.use(session({ secret: 'votre_secret_de_session' , resave: true, saveUninitialized: true }));
app.use(
    session({
      secret: process.env.SECRET_EXPRESS_SESSION, // Clé secrète pour signer le cookie de session
      resave: false, // Ne pas resauvegarder la session si elle n'est pas modifiée
      saveUninitialized: false, // Ne pas sauvegarder la session si elle est vide
      cookie: {
        maxAge: 60 * 60 * 1000, // Durée de vie du cookie de session : 1 heure (en millisecondes)
        secure: process.env.NODE_ENV === 'production', // Mettre à true si vous utilisez HTTPS pour sécuriser le cookie
        httpOnly: true, // Empêche JavaScript côté client d'accéder au cookie
      },
      rolling: true, // Renouvelle la durée de vie du cookie à chaque requête
    })
  );
// Initialiser Passport et session
app.use(passport.initialize());
app.use(passport.session());

// Utilisation du middleware CORS
app.use(cors());


// Configurer Passport.js pour utiliser la stratégie OAuth2
passport.use(new Strategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    clientType: 'confidential',
    callbackURL: CALLBACK_URL,
    passReqToCallback: true, // Passe l'objet req à la fonction callback
  },
  function(req, accessToken, refreshToken, profile, done) {
    //console.log('Success!', { accessToken, refreshToken });
    // Sauvegarde des jetons d'accès dans la base de données
    saveAccessToken(profile.username, profile.id, profile.photos[0].value, req)
    .then(() => {
    // Extrait des informations pertinentes du profil Twitter
    const user = {
        username: profile.displayName,
        screen_name: profile.username,
        avatarUrl: profile.photos[0].value,
        // Ajoutez d'autres informations utilisateur si nécessaire
    };
    return done(null, user);
    })
    .catch(err => {
    console.error('Erreur lors de la sauvegarde des jetons d\'accès:', err);
    return done(err);
    });
    }
));

// Sérialisation et désérialisation de l'utilisateur
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});


const router = express.Router();

// Autres routes et configurations de votre application Express...
module.exports = router;


// Configuration de la connexion PostgreSQL
const pool = new Pool({
    user: process.env.USR_DATABASE,
    host: 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432 // Port par défaut de PostgreSQL
});


// Route pour commencer l'authentification avec Twitter
app.get('/auth/twitter', (req, res, next) => {
    passport.authenticate('twitter', {
        scope: ['tweet.read', 'users.read', 'offline.access'],
    })(req, res, next);
});

app.get('/auth/twitter/callback', (req, res, next) => {
    passport.authenticate('twitter', async (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            console.log("Aucun utilisateur trouvé. Info:", info);
            console.log("Query parameters:", req.query);  // Log des paramètres de requête pour voir le JWT        
            return res.redirect('/');
        }
        let decodedToken;
        try {
            // Vérifier le JWT
            decodedToken = jwt.verify(req.session.jwt, process.env.SECRET_KEY);

        } catch (error) {
            console.error('Invalid JWT token:', error);
            return res.redirect('/'); // Redirection en cas d'erreur
        }

        req.logIn(user, async (err) => {
            if (err) {
                return next(err);
            }

            // Votre fonction linkTwitter
            const { username, screen_name, avatarUrl } = user;
            const address = decodedToken.address; // Assurez-vous que l'adresse est bien extraite du JWT

            try {
                await linkTwitter(screen_name, address);
                res.redirect('/index'); // Redirection après succès
            } catch (error) {
                console.error('Error linking Twitter:', error);
                res.redirect('/index'); // Redirection en cas d'erreur
            }
        });
    })(req, res, next);
});


// Fonction pour créer les tables dans PostgreSQL
async function createTables() {
    const client = await pool.connect();
    try {
      await client.query(`        
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            wallet_address VARCHAR(42) NOT NULL UNIQUE,
            username VARCHAR(50) UNIQUE,
            score INTEGER NOT NULL DEFAULT 0,
            nub_id INTEGER DEFAULT NULL,
            cheat INTEGER DEFAULT 0,
            bot INTEGER DEFAULT 0
        );
        
        CREATE TABLE IF NOT EXISTS metadata (
            id INTEGER PRIMARY KEY,
            username VARCHAR(50) UNIQUE REFERENCES users(username),
            head VARCHAR(255),
            eyes VARCHAR(255),
            arm VARCHAR(255),
            neck VARCHAR(255),
            rarity VARCHAR(20) DEFAULT 'Common' CHECK (rarity IN ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary')),
            CONSTRAINT fk_username FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS user_access_tokens (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE,
            user_id BIGINT UNIQUE,
            user_wallet_id INTEGER UNIQUE REFERENCES users(id),
            avatarUrl VARCHAR(250),
            metadata_set BOOLEAN DEFAULT FALSE,
            metadata_id INTEGER REFERENCES metadata(id),
            pac_fidelity INTEGER NOT NULL DEFAULT 0,
            discord_id BIGINT UNIQUE,
            discord_username VARCHAR(50),
            CONSTRAINT fk_user_wallet_id FOREIGN KEY (user_wallet_id) REFERENCES users(id),
            CONSTRAINT fk_metadata_id FOREIGN KEY (metadata_id) REFERENCES metadata(id)
        );
        
        CREATE TABLE IF NOT EXISTS score_twitter (
            id SERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES user_access_tokens(user_id),
            score INTEGER NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES user_access_tokens(user_id) ON DELETE CASCADE
        );  
        CREATE TABLE IF NOT EXISTS score_users_daily (
            id SERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES user_access_tokens(user_id),
            username VARCHAR(50),
            score INTEGER NOT NULL,
            date DATE NOT NULL,
            CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES user_access_tokens(user_id) ON DELETE CASCADE
        );  

        CREATE TABLE IF NOT EXISTS points_users_daily (
            id SERIAL PRIMARY KEY,
            wallet_address VARCHAR(42) NOT NULL,
            user_id BIGINT REFERENCES user_access_tokens(user_id),
            username VARCHAR(50),
            points INTEGER NOT NULL,
            date DATE NOT NULL,
            CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES user_access_tokens(user_id) ON DELETE CASCADE
        );  
      `);
  
      console.log('Tables créées ou chargées avec succès');
    } catch (err) {
      console.error('Erreur lors de la création des tables', err);
    } finally {
      client.release();
    }
}

// Appel de la fonction pour créer les tables au démarrage du serveur
createTables();


// LEADERBOARD -----------
const leaderboard = require("./leaderboard-blast.js"); // Module contenant getUserData
const fs = require('fs');

let leaderboardData = [];

// Fonction pour sauvegarder le leaderboard dans un fichier JSON
async function saveLeaderboardToFile() {
    try {
        const userData = await leaderboard.getUserData();  // Récupérer les données des utilisateurs
        leaderboardData = {userData : userData, date : new Date()};  // Mettre à jour la variable globale

        // Sauvegarder les données dans un fichier JSON
        fs.writeFileSync('leaderboard.json', JSON.stringify(leaderboardData, null, 2), 'utf8');
        console.log('Leaderboard mis à jour et sauvegardé dans leaderboard.json');
    } catch (error) {
        console.error('Erreur lors de la mise à jour du leaderboard:', error);
    }
}

// Appeler immédiatement la fonction pour calculer et stocker le leaderboard au démarrage du serveur
saveLeaderboardToFile();

// Mettre à jour le leaderboard toutes les 10 minutes
setInterval(saveLeaderboardToFile, 10 * 60 * 1000);

// Route pour renvoyer les données du leaderboard
app.get('/getLeaderboard', (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;  // Page actuelle (par défaut 1)
        const pageSize = parseInt(req.query.pageSize) || 10;  // Taille de la page (par défaut 10)

        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;
        
        // Lire et parser les données du fichier JSON
        const leaderboardData = JSON.parse(fs.readFileSync('leaderboard.json', 'utf8'));

        // Charger les données du leaderboard (stockées dans leaderboardData par exemple)
        const leaderboard = leaderboardData.userData.slice(startIndex, endIndex);  // Extraire la portion paginée
        const last_refresh = leaderboardData.date;

        res.status(200).json({
            leaderboard,  // Renvoyer la portion paginée
            page,
            pageSize,
            last_refresh
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des données du leaderboard' });
    }
});

// Route pour renvoyer les données du leaderboard pour un user
app.post('/getUserLeaderboard', verifyJWT, (req, res) => {
    try {
        // Addresse de l'user
        const address = req.userAddress.toLowerCase();
        // Vérifiez si l'adresse est fournie
        if (!address) {
            return res.status(400).send('Address not provided.');
        }

        // Charger les données du leaderboard (stockées dans leaderboardData par exemple)
        const leaderboardUser = leaderboardData.userData.filter(user => user.address === address);

        // Trouver l'index de l'utilisateur dans le leaderboard
        const index = leaderboardData.userData.findIndex(user => user.address === address);

        res.status(200).json({
            leaderboardUser, rank : index + 1
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des données du leaderboard' });
    }
});

// TOTAL ETH LOCKED ---------------------------
let totallockedEth = 0;

// Fonction pour sauvegarder le leaderboard dans un fichier JSON
async function saveTotalEthLocked() {
    try {
        totallockedEth = await contractPacBoom.getTotalLockedEtherAllPlayers();  // Récupérer les Eth locked
        totallockedEth = parseInt(totallockedEth.toString());
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la TVL de la dApp', error);
    }
}
// Mettre à jour la TVL toutes les 5 minutes secondes
setInterval(saveTotalEthLocked, 5 * 60 * 1000);

// Route pour récupérer les total eth locked
app.post('/get-total-eth-locked', (req, res) => {
    //On récupère le nb total d'eth lock dans la platform
    try {
        const value = totallockedEth;
        res.status(200).json({value});
    } catch {
        console.error('Error fetching total value locked');
        res.status(500).json({ error: 'Error fetching total value locked' });
    }
});

// --------------------------------------------


// Middleware pour servir les fichiers statiques (HTML, CSS, JavaScript, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour permettre d'accéder aux fichiers sans l'extension .html
app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, 'public', `${page}.html`);

    // Vérifier si le fichier .html existe et le renvoyer
    res.sendFile(filePath, (err) => {
        if (err) {
            next(); // Si le fichier n'existe pas, continuer le flux normal
        }
    });
});


// Route pour sauvegarder lees metadata des users dans la base de données
app.post('/saveMetadata', async (req, res) => {
    const username = req.body.username;
    const head = req.body.currentImages.head;
    const eyes = req.body.currentImages.eyes;
    const arm = req.body.currentImages.arm;
    const neck = req.body.currentImages.neck;

    // Check if username is provided
    if (!username) {
        return res.status(400).send('Username not provided.');
    }

    let client;

    try {
        // Obtenir un client de la pool
        client = await pool.connect();

        // Commencez une transaction pour garantir que toutes les requêtes réussissent ou échouent ensemble
        await client.query('BEGIN');

        // Mise à jour des métadonnées de l'utilisateur
        const metadataUpdateQuery = `
            UPDATE metadata 
            SET head = $2, eyes = $3, arm = $4, neck = $5 
            WHERE username = $1
        `;
        await client.query(metadataUpdateQuery, [username, head, eyes, arm, neck]);

        // Mettre à jour la colonne metadata_set
        const userAccessUpdateQuery = `
            UPDATE user_access_tokens 
            SET metadata_set = TRUE 
            WHERE username = $1
        `;
        await client.query(userAccessUpdateQuery, [username]);

        // Valider la transaction
        await client.query('COMMIT');

        // Envoyer la réponse en cas de succès
        res.status(200).json({ message: 'Metadata updated successfully' });
    } catch (error) {
        // Annuler la transaction en cas d'erreur
        if (client) await client.query('ROLLBACK');
        console.error('Error inserting metadata:', error);
        res.status(500).json({ error: 'Error inserting metadata' });
    } finally {
        // Libération du client
        if (client) client.release();
    }
});



// Route pour récupérer les métadonnées de l'utilisateur
app.post('/getMetadata', async (req, res) => {
    const { username } = req.body; // Récupérer le nom d'utilisateur depuis la requête

    const client = await pool.connect();
    try {
        // Vérifier si les métadonnées sont définies pour cet utilisateur
        const query = `SELECT metadata_set FROM user_access_tokens WHERE username = $1`;
        const result = await client.query(query, [username]);

        if (result.rows.length === 0 || !result.rows[0].metadata_set) {
            // Aucun enregistrement trouvé ou metadata_set est faux, renvoyer un statut 204
            return res.status(204).json({ message: 'Metadata not set or user not found.' });
        }

        // Si metadata_set est vrai, récupérer les métadonnées
        const metadataQuery = 'SELECT * FROM metadata WHERE username = $1';
        const metadataResult = await client.query(metadataQuery, [username]);

        if (metadataResult.rows.length === 0) {
            return res.status(404).json({ message: 'Metadata not found.' });
        }

        // Envoyer les métadonnées récupérées en réponse
        res.status(200).json(metadataResult.rows[0]);
    } catch (error) {
        console.error('Error retrieving metadata:', error);
        res.status(500).json({ error: 'Error retrieving metadata' });
    } finally {
        client.release(); // Libérer le client dans tous les cas
    }
});


// Fonction pour sauvegarder l'utilisateur
async function saveUser(userAddress) {
    const client = await pool.connect();
    try {
        // Récupérez le dernier ID inséré dans la table users
        const lastUserIdQuery = 'SELECT MAX(id) AS max_id FROM users';
        const { rows } = await client.query(lastUserIdQuery);
        let nextUserId = 1; // Valeur par défaut pour le premier utilisateur s'il n'y a pas encore d'enregistrement
        if (rows.length > 0 && rows[0].max_id !== null) {
            nextUserId = parseInt(rows[0].max_id) + 1; // Incrémente le dernier ID
        }

        // Insérez le nouvel utilisateur avec l'ID incrémenté
        const insertUserQuery = `
            INSERT INTO users (id, wallet_address) VALUES ($1, LOWER($2)) ON CONFLICT (wallet_address) DO NOTHING RETURNING *`;
        const result = await client.query(insertUserQuery, [nextUserId, userAddress]);

        // Si aucun utilisateur n'est inséré, cela signifie qu'il existe déjà
        if (result.rows.length === 0) {
            return { message: 'User already registered.', status: 201 };
        }
        return { message: 'User successfully logged.', status: 201 };
    } catch (error) {
        console.error("Error during the registering of the user:", error);
        return { message: "Error during the registering of the user.", status: 500 };
    } finally {
        if (client) {
            client.release(); // Libérer le client après utilisation
        }
    }
}

// Route pour créer le JWT et sauvegarder l'utilisateur
app.post('/loginOrSaveUser', async (req, res) => {
    const userAddress = req.body.userAddress.toLowerCase();

    // Remplacez 'votre_clé_secrète' par votre propre clé secrète sécurisée
    const secretKey = process.env.SECRET_KEY;

    // Créez le JWT en incluant l'adresse MetaMask de l'utilisateur
    const token = jwt.sign({ address: userAddress }, secretKey, { expiresIn: '1h' });

    // Stocker le JWT dans la session pour être utilisable pour faire le lien entre userAddress et username twitter lors du link
    req.session.jwt = token;

    // Configurer le cookie sécurisé
    res.cookie('jwt', token, {
        httpOnly: true, // Empêche l'accès au cookie par JavaScript côté client
        secure: process.env.NODE_ENV == 'production',    // Le cookie n'est envoyé que sur HTTPS
        sameSite: 'Strict', // Le cookie n'est envoyé que pour le même site (évite les CSRF)
        maxAge: 3600000  // 1 heure en millisecondes
    });

    // Appel de la fonction saveUser pour enregistrer l'utilisateur
    const saveResult = await saveUser(userAddress);

    // Répondre avec le résultat de l'enregistrement
    res.status(saveResult.status).json({ message: saveResult.message });
});

// Route pour la déconnexion
app.post('/logoutUser', verifyJWT, (req, res) => {

    // Vérifie si le JWT est présent dans la session
    if (!req.cookies.jwt) {
        // Si le JWT est absent, l'utilisateur est déjà déconnecté
        return res.status(400).json({ message: 'User already deconnected.' });
    }
    // Supprime le token de la session
    req.session.jwt = null; // Ou `delete req.session.jwt;` pour le supprimer complètement

    // Supprime le cookie du côté client en définissant une date d'expiration passée
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV == 'production', // Assurez-vous que ceci est en phase avec votre environnement (utilisez 'secure: false' en développement sans HTTPS)
        sameSite: 'Strict',
    });

    // Détruit la session (utile pour supprimer toutes les données de session si nécessaire)
    req.session.destroy((err) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: 'Error during logout process.' });
        }
    });
    // Redirection ou réponse après la déconnexion
    return res.status(200).json({ ok: 'Successfully logout.' });
});

// Middleware pour vérifier le JWT dans les en-têtes de la requête
function verifyJWT(req, res, next) {
    const jwtToken = req.cookies.jwt; // Obtenez le JWT dans les cookies de la requête

    // Vérifiez la validité et la signature du JWT
    jwt.verify(jwtToken, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token invalide' });
        }
        // Extraire l'adresse MetaMask de l'utilisateur
        req.userAddress = decoded.address;
        next();
    });
}

// Route POST pour vérifier le JWT
app.post('/verify-jwt', verifyJWT, (req, res) => {
    // Si nous sommes arrivés ici, le JWT est valide et l'adresse de l'utilisateur est dans req.userAddress
    res.status(200).json({ userAddress: req.userAddress });
});



// Route pour sauvegarder le score des users dans la base de données
app.post('/saveScore', verifyJWT, async (req, res) => {
    const client = await pool.connect();
    try {
        const { score } = req.body;
        const address = req.userAddress.toLowerCase();

        // Vérifiez si l'adresse est fournie
        if (!address) {
            return res.status(400).send('Address not provided.');
        }

        // Récupérer le nom d'utilisateur et l'ID utilisateur en une seule requête
        const userQuery = await client.query(`
            SELECT u.username, ua.user_id
            FROM users u
            JOIN user_access_tokens ua ON u.username = ua.username
            WHERE u.wallet_address = LOWER($1);
        `, [address]);

        if (userQuery.rowCount === 0) {
            return res.status(204).send(); // Aucun utilisateur trouvé
        }

        const { username, user_id } = userQuery.rows[0];

        // Commencer une transaction
        await client.query('BEGIN');

        // Mettre à jour le score de l'utilisateur uniquement si le nouveau score est plus élevé
        const updateResult = await client.query(`
            UPDATE users
            SET score = GREATEST($1, score)
            WHERE wallet_address = LOWER($2)
            RETURNING *;
        `, [score, address]);

        // Vérifier si un score quotidien existe déjà
        const dailyScoreQuery = await client.query(`
            SELECT score FROM score_users_daily
            WHERE user_id = $1 AND date = CURRENT_DATE;
        `, [user_id]);

        if (dailyScoreQuery.rowCount > 0) {
            // Mettre à jour le score quotidien si déjà enregistré
            await client.query(`
                UPDATE score_users_daily
                SET score = GREATEST($1, score)
                WHERE user_id = $2 AND date = CURRENT_DATE;
            `, [score, user_id]);
        } else {
            // Insérer le score quotidien si inexistant
            await client.query(`
                INSERT INTO score_users_daily (user_id, username, score, date)
                VALUES ($1, $2, $3, CURRENT_DATE);
            `, [user_id, username, score]);
        }

        // Valider la transaction
        await client.query('COMMIT');

        // Vérifier le succès de la mise à jour et renvoyer la réponse appropriée
        if (updateResult.rowCount > 0) {
            res.status(201).json('Score successfully saved');
        } else {
            res.status(500).send('Internal Server Error');
        }
    } catch (error) {
        await client.query('ROLLBACK'); // Annuler la transaction en cas d'erreur
        console.error('Error saving score to database:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release(); // Libérer le client dans tous les cas
    }
});


// Route POST pour enregistrer les données utilisateur dans la table users
async function linkTwitter(handle, address) {

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Récupérer le dernier ID inséré dans la table users
        const lastUserIdQuery = 'SELECT MAX(id) AS max_id FROM users';
        const { rows } = await client.query(lastUserIdQuery);
  
        // Id courant user 
        const currentUserId = parseInt(rows[0].max_id);

        // Vérifier si l'utilisateur existe déjà dans la base de données
        const checkUserQuery = `
            SELECT users.username FROM users JOIN user_access_tokens ON users.id = user_access_tokens.user_wallet_id
            WHERE user_access_tokens.username = $1;
        `;
        const checkUserResult = await client.query(checkUserQuery, [handle]);

        if (checkUserResult.rows[0].username != null) {
            // L'utilisateur existe déjà dans la base de données
            const existingUser = checkUserResult.rows[0];
            //console.log("utilisateur déjà enregistré donc on retourne les infos twitter");
            await client.query('COMMIT');
            return;
            //res.status(409).json(null); // on retourne null pour ne pas link le X // Retourner les informations de l'utilisateur existant
        } else {
            //console.log("on insere l'username dans la table user ");

            // Mettre à jour l'utilisateur dans la table users
            const updateUserQuery = `
                UPDATE users
                SET username = $1
                WHERE wallet_address = LOWER($2)
                RETURNING id;
            `;
            const updateUserResult = await client.query(updateUserQuery, [handle, address]);
            let usrId;

            if (updateUserResult.rowCount === 0) {
                // Si pas de user pouvant être update alors on crée un nouvel user.
                // Insérer un nouvel utilisateur avec l'ID incrémenté
                const insertUserQuery = `
                    INSERT INTO users (id, wallet_address, username)
                    VALUES ($1, LOWER($2), $3) RETURNING id;
                `;
                usrId = await client.query(insertUserQuery, [currentUserId, address, handle]);
            } else {
                usrId = updateUserResult.rows[0].id;
            }
            //console.log("Utilisateur inséré ou mis à jour : ", usrId);
            
            // Insérer dans la table metadata
            const insertMetadataQuery = `
                INSERT INTO metadata (id, username) 
                VALUES ($1, $2)
                ON CONFLICT (username) DO NOTHING
                RETURNING id;
            `;
            const insertMetadataResult = await client.query(insertMetadataQuery, [usrId, handle]);

            let metadataId;
            if (insertMetadataResult.rowCount === 0) {
                const selectMetadataQuery = `SELECT id FROM metadata WHERE username = $1`;
                const selectMetadataResult = await client.query(selectMetadataQuery, [handle]);
                metadataId = selectMetadataResult.rows[0].id;
            } else {
                metadataId = insertMetadataResult.rows[0].id;
            }

            // Mettre à jour la colonne metadata_id de user_access_tokens
            const updateUserAccessTokensQuery = `
                UPDATE user_access_tokens 
                SET metadata_id = $1, user_wallet_id = $2 
                WHERE username = $3;
            `;
            await client.query(updateUserAccessTokensQuery, [metadataId, usrId, handle]);

            await client.query('COMMIT');
            //res.status(200).json({ userId: usrId, metadataId: metadataId }); // Retourner les informations du nouvel utilisateur inséré
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erreur lors de l\'enregistrement de l\'utilisateur', err);
        //res.status(500).send('Erreur serveur');
    } finally {
        if (client) {
            client.release(); // Libérer le client après utilisation
        }
    }
}



// Fonction pour sauvegarder les jetons d'accès dans la base de données
async function saveAccessToken(userName, userId, avatarUrl, req) {
    const client = await pool.connect();
    try {
        // Vérifier si l'utilisateur existe déjà dans la base de données
        const checkUserQuery = `
            SELECT user_wallet_id FROM user_access_tokens JOIN users on user_wallet_id = users.id
            WHERE user_access_tokens.username = $1;
        `;
        const checkUserResult = await client.query(checkUserQuery, [userName]);

        if (checkUserResult.rows.length > 0) {
            // L'utilisateur existe déjà dans la base de données
        } 
        else {

            const decodedToken = jwt.verify(req.session.jwt, process.env.SECRET_KEY);
            const address = decodedToken.address;

            // Rechercher user_wallet_id à partir de l'adresse du wallet
            const result = await client.query(
                'SELECT id FROM users WHERE wallet_address = $1',
                [address]
            );

            if (result.rows.length === 0) {
                console.error('User not found');
            }

            const user_wallet_id = result.rows[0].id;

            // Requete d'insertion, si user_wallet_id déjà défini alors on ne fait que update les valeurs username user_id et avatarUrl
            const updateRes = await client.query(
                `INSERT INTO user_access_tokens (user_wallet_id, username, user_id, avatarUrl) 
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (user_wallet_id) 
                DO UPDATE SET 
                    username = EXCLUDED.username, 
                    user_id = EXCLUDED.user_id, 
                    avatarUrl = EXCLUDED.avatarUrl`,
                [user_wallet_id, userName, userId, avatarUrl]
            );
            
            /*
            await client.query('BEGIN');
            await client.query('INSERT INTO user_access_tokens (username, user_id, avatarUrl) VALUES ($1, $2, $3)', [userName, userId, avatarUrl]);
            await client.query('COMMIT');*/
        }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
        if (client) {
            client.release(); // Libérer le client après utilisation
        }
    }
  }


// Route pour récupérer les scores de fidélité (pac_fidelity) agrégés par utilisateur
/*
app.get('/getFidelityboard', async (req, res) => {
    try {
      // Exécutez la requête SQL pour recupérer les scores par utilisateur ayant configuré leur PFP
      const result = await pool.query('SELECT username, pac_fidelity FROM user_access_tokens WHERE metadata_set = TRUE ORDER BY pac_fidelity DESC');

      // Renvoie les données du leaderboard agrégées par utilisateur au format JSON
      res.json(result.rows);
    } catch (error) {
      console.error('Erreur lors de la récupération du leaderboard de fidélité :', error);
      res.status(500).send('Erreur lors de la récupération du leaderboard de fidélité');
    }
  });
*/

// Route pour vérifier les infos Twitter d'un user et les récupérer si ils existent
app.get('/getTwitterInfos', verifyJWT, async (req, res) => {
    const address = req.userAddress.toLowerCase();

    if (!address) {
        return res.status(400).send('Adresse manquante');
    }

    const client = await pool.connect();
    try {

        const checkUserQuery = `
            SELECT user_access_tokens.username, avatarUrl FROM user_access_tokens 
            JOIN users ON users.id = user_access_tokens.user_wallet_id 
            WHERE users.wallet_address = LOWER($1);
        `;
        const result = await client.query(checkUserQuery, [address]);

        if (result.rows.length > 0) {
            //console.log("user a déjà ses infos twitter enregistree");
            return res.json(result.rows);
        } else {
            return res.status(204).send();
        }

    } catch (error) {
        console.error('Erreur lors de la récupération des infos Twitter :', error);
        return res.status(500).send('Erreur lors de la récupération des infos Twitter');
    } finally {
        if (client) {
            client.release(); // Libérer le client après utilisation
        }
    }
});



// Route pour vérifier si un utilisateur est déjà présent en BDD
app.post('/check-user', verifyJWT, async (req, res) => {
    const { wallet_address } = req.body;
    const client = await pool.connect();

    if (!wallet_address) {
        return res.status(400).json({ error: 'Adresse de portefeuille manquante.' });
    }
    try {
        const result = await client.query(
            'SELECT * FROM users WHERE wallet_address = LOWER($1)',
            [wallet_address]
        );
        if (result.rows.length > 0) {
            res.status(200).json({ exists: true });
        } else {
            res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification de l\'utilisateur.' });
    } finally {
        if (client) {
            client.release(); // Libérer le client après utilisation
        }
    }
});

// Stockage temporaire des scores
let scores = {};

const GhostType = {
    NORMAL: "normal",
    BONUS: "bonus",
    BOMB: "bomb",
    BEEPLE: "beeple",
    JENNDEFER: "jenndefer"
};

// Route pour initialiser le score à zéro pour un joueur donné
app.post('/initialize-score', verifyJWT, (req, res) => {

    req.session.score = 0;
    // Stocker le timestamp actuel dans la session de l'utilisateur
    req.session.scoreInitializedAt = new Date().toISOString(); // Stocke le timestamp en format ISO

    res.send({ score: req.session.score });
    
});

// Route pour enregistrer le score pour un joueur donné à la fin d'une partie et enregistrer le timestamp
app.post('/save-score', verifyJWT, (req, res) => {

    // Initialiser le score à 0 si ce n'est pas déjà fait
    if (!req.session.score) {
        req.session.score = 0;
    }

    const score = req.body.score;
    // Exemple de vérification si le score est invalide 
    if (!score || typeof score !== 'number' || score < 0) {
        // Répondre avec un statut 400 Bad Request si le score est invalide
        return res.status(400).json({ message: 'Invalid score provided' });
    }

    // Générer un nombre aléatoire entre 1 et 500
    const randomValue = Math.floor(Math.random() * (500 - 1 + 1)) + 1; // ou simplement Math.floor(Math.random() * 500) + 1;
    req.session.randomValue = randomValue;

    req.session.score = score;
    // Ajouter ce nombre au score de la session
    req.session.score += randomValue;

    // Stocker le timestamp actuel dans la session de l'utilisateur
    req.session.scoreEndedAt = new Date().toISOString(); // Stocke le timestamp en format ISO

    res.status(200).json({ message: 'Score successfully saved' });
});


// Route pour vérifier le score pour un joueur donné et le tag en cheater ou pas
app.post('/verify-score', verifyJWT, async (req, res) => {

    // Initialiser le score à 0 si ce n'est pas déjà fait
    if (!req.session.score) {
        req.session.score = 0;
    }

    // On garde le score de notre session dédiée et on simule le résultat avec le score potentiellement compromis pour track les cheaters
    const score = req.body.score;

    // Exemple de vérification si le score est invalide (ajustez selon votre logique)
    if (!score || typeof score !== 'number' || score < 0) {
        // Répondre avec un statut 400 Bad Request si le score est invalide
        return res.status(400).json({ message: 'Invalid score provided' });
    }
    
    const timestamp_cheat = new Date().toISOString(); // Stocke le timestamp en format ISO
    // Si req.session.scoreInitializedAt et req.session.endedAt n'existent pas on les initialise à la date courante
    if (!req.session.scoreInitializedAt) {
        req.session.scoreInitializeAt = timestamp_cheat; 
    }
    if (!req.session.endedAt) {
        req.session.endedAt = timestamp_cheat; 
    }

    const initializedTimestamp = req.session.scoreInitializedAt; // Récupérer le timestamp de l'initialisation
    const initializedDate = new Date(initializedTimestamp);
    
    const endedTimestamp = req.session.scoreEndedAt; // Récupérer le timestamp de fin de partie
    const endedDate = new Date(endedTimestamp);
    // Vérifier la différence de temps en millisecondes
    const timeDiffInMilliseconds = endedDate - initializedDate;

    // Définir le score vérifié par défaut
    let verifiedScore = score; // Par défaut, le score vérifié est le score reçu
    let cheatIncrement = 0; // Compteur de tricherie

    try {
        if (score > 50000 && timeDiffInMilliseconds < 120000 && timeDiffInMilliseconds > 0) {
            //verifiedScore = 1; // Score renvoyé en cas de tricherie
            cheatIncrement = 1; // Incrémenter le compteur de tricherie
        } 
        if (score > 10000 && timeDiffInMilliseconds < 30000 && timeDiffInMilliseconds > 0) {
            //verifiedScore = 2; // Score renvoyé en cas de tricherie
            cheatIncrement = 1; // Incrémenter le compteur de tricherie
        //Si le cheater passe tous ces contrôles on en met un dernier qui est fatidique... 
        // ---> la condition sera invalidée grâce à notre aléa, on le considère comme cheater .
        // ---> la condition donnera par ex: if(104300+0 != 0) donc condition bien invalidée
        } 
        if ((score+req.session.randomValue) != req.session.score) {
            cheatIncrement = 1;
        } else {
            cheatIncrement = 0;
        }

        // Mise à jour de la base de données si nécessaire
        if (cheatIncrement > 0) {
            const userAddress = req.userAddress.toLowerCase(); // Récupérer l'adresse de l'utilisateur
            const client = await pool.connect();
            try {
                // Incrémenter la colonne "cheat" pour l'utilisateur
                const updateUserQuery = `
                    UPDATE users 
                    SET cheat = cheat + $1 
                    WHERE wallet_address = $2
                `;
                await client.query(updateUserQuery, [cheatIncrement, userAddress]);
            } catch (dbError) {
                console.error('Erreur lors de la mise à jour de l\'utilisateur:', dbError);
                return res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur.' });
            } finally {
                client.release();
            }
        }

        res.status(200).json({ score: verifiedScore });

    } catch (error) {
        console.error('Erreur lors de la vérification du score:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification du score.' });
    }
});


// Route pour récupérer le score d'un joueur donné
app.get('/get-score', verifyJWT, (req, res) => {
    const address = req.userAddress.toLowerCase();
    const score = scores[address] || 0;
    res.send({ score });
});

// Route pour incrémenter le score d'un joueur
app.post('/increment-score', verifyJWT, (req, res) => {
    const address = req.userAddress.toLowerCase();
    const typeMonster = req.body.monster;

    // Vérifier si le tokenId est présent dans la requête
    if (!address) {
        return res.status(400).json({ error: 'Log with Metamask is required' });
        //peut-etre retourner une une adresse aleatoire ici pour laisser les joueurs non log test ?
    }

    // Vérifier si le score existe pour ce tokenId
    if (!scores[address]) {
        scores[address] = 0; // Initialiser le score à zéro si ce tokenId n'existe pas
    }

    // Attribuer le score en fonction du type de fantômes eat
    if (typeMonster == GhostType.NORMAL) {
        scores[address] += 100;
    } else if (typeMonster == GhostType.BONUS) {
        scores[address] += 300;
    } else if (typeMonster == GhostType.BEEPLE) {
        scores[address] += 500;
    } else if (typeMonster == GhostType.JENNDEFER) {
        scores[address] += 1000;
    } else {
        scores[address] += 0;
    }
    // Retourner le nouveau score
    res.json({ score: scores[address] });
});

// Route pour sauvegarder l'id du Nub possédé dans la base de données
app.post('/saveNub', verifyJWT, async (req, res) => {
    const client = await pool.connect();

    try {
        const { nub_id } = req.body;

        // Récupération de l'adresse MetaMask de l'utilisateur
        const address = req.userAddress?.toLowerCase();
        if (!address) {
            return res.status(400).send('Address not provided.');
        }

        // Vérification si l'utilisateur existe dans la base de données
        const userQuery = await client.query(
            `SELECT * FROM users WHERE wallet_address = LOWER($1);`,
            [address]
        );

        if (userQuery.rowCount === 0) {
            return res.status(404).send('User not found.');
        }

        // Vérification si le Nub est bien possédé par l'utilisateur
        const nubOwned = await verifyNubOwned(nub_id, address);
        if (!nubOwned) {
            return res.status(400).send('Nub not owned by the user.');
        }

        // Début de la transaction pour la mise à jour
        await client.query('BEGIN');

        // Mise à jour du Nub ID pour l'utilisateur
        const updateQuery = `
            UPDATE users
            SET nub_id = $1
            WHERE wallet_address = LOWER($2)
            RETURNING *;
        `;
        const updateResult = await client.query(updateQuery, [nub_id, address]);

        if (updateResult.rowCount > 0) {
            await client.query('COMMIT');
            res.status(200).json(updateResult.rows[0]); // Renvoie les détails de l'utilisateur mis à jour
        } else {
            await client.query('ROLLBACK');
            res.status(500).send('Failed to update Nub ID.');
        }
    } catch (error) {
        // En cas d'erreur, rollback de la transaction et log de l'erreur
        await client.query('ROLLBACK');
        console.error('Error saving Nub ID to database:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        client.release(); // Libère le client après utilisation
    }
});



// Route pour récupérer l'id du Nub possédé dans la base de données
app.post('/getNub', verifyJWT, async (req, res) => {
    const client = await pool.connect();
    let nub_id = null; // Initialisation de nub_id pour une utilisation ultérieure

    try {
        // Récupérez l'adresse MetaMask de l'utilisateur depuis la requête
        const address = req.userAddress.toLowerCase();

        // Vérifiez si l'adresse est fournie
        if (!address) {
            return res.status(400).send('Address not provided.');
        }

        // Vérification si l'utilisateur existe dans la base de données
        const userQuery = await client.query(
            `SELECT * FROM users WHERE wallet_address = LOWER($1);`,
            [address]
        );

        if (userQuery.rowCount === 0) {
            return res.status(404).send('User not found.');
        }
        // Commencez une transaction
        await client.query('BEGIN');

        // Sélectionner le nub_id de l'utilisateur dans la base de données
        const selectQuery = `
            SELECT nub_id
            FROM users
            WHERE wallet_address = $1;
        `;
        const selectResult = await client.query(selectQuery, [address]);

        // Vérifiez si un nub_id a été trouvé
        if (selectResult.rowCount > 0) {
            nub_id = selectResult.rows[0].nub_id;
            const nub_owned = await verifyNubOwned(nub_id, address);
            // On vérifie si le Nub est bien possédé dans la blockchain
            if (nub_id && !nub_owned) {
                // Si le Nub n'est pas possédé, réinitialiser nub_id à null
                const updateQuery = `
                    UPDATE users
                    SET nub_id = null
                    WHERE wallet_address = $1
                    RETURNING *;
                `;
                const updateResult = await client.query(updateQuery, [address]);
                nub_id = updateResult.rows[0].nub_id;
            }
        } else {
            // Si aucun nub_id n'est trouvé
            await client.query('ROLLBACK');
            return res.status(404).send('Nub not found for the provided address.');
        }

        // Validez la transaction
        await client.query('COMMIT');

        // Répondez avec le résultat
        res.status(200).json({ nub_id : nub_id });
    } catch (error) {
        // Annulez la transaction en cas d'erreur
        await client.query('ROLLBACK');
        console.error('Error retrieving nub id for user:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        // Libérer le client après utilisation
        client.release();
    }
});

// Fonction pour vérifier si un Nub est possédé
async function verifyNubOwned(nub_id, address) {

    if (nub_id == null) {
        return true;
    }
    let nubOwned = await contractPacNub.tokensOwnedBy(address);

    // cela teste la condition pour tous les éléments du tableau nubOwned et retourne true si au moins 1 élément nub_id est présent dans nubOwned
    return nubOwned.some(nub => {
        const nub_id_owned = parseInt(nub.toString(), 10);
        return nub_id_owned === nub_id ;
    });

}

// Route pour récupérer la signature servant à valider le claim de PB points
app.post('/getSignature', verifyJWT, async (req, res) => {
    try {
        // Récupérez l'adresse MetaMask de l'utilisateur depuis la requête
        const address = req.userAddress.toLowerCase();
        const score = req.body.score;  // Supposons que le score soit passé dans le corps de la requête ... LOL !

        // Vérifiez si l'adresse est fournie
        if (!address) {
            return res.status(400).send('Address not provided.');
        }

        // Vérifiez si le score est fourni
        // Définir une limite maximale de score raisonnable
        const MAX_SCORE_LIMIT = 150000; // Limite de score de 150 000

        // Vérification du score reçu
        if (
            typeof score !== 'number' || // Vérifie que c'est un nombre
            !Number.isInteger(score) || // Vérifie que c'est un entier
            score <= 0 || // Vérifie que le score est positif
            score > MAX_SCORE_LIMIT // Vérifie que le score ne dépasse pas une limite raisonnable
        ) {
            return res.status(400).send('Score not provided or invalid.');
        }

        // On attrape ici les botters 
        // car même si req.session.score peut être modifié via la route /save-score ...
        // on a encore la possibilité de vérifier si score est différent de req.session.score même si req.session.score n'a
        // pas été défini avant car dans le cas où pas def on l'initialise à zéro. 
        if (!req.session.score) {
            req.session.score = 0;
        }
        if (!req.session.randomValue) {
            req.session.randomValue = 0;
        }


        // Le bot requête sur la route /getSignature avec un score au pif.
        // aucune variable session ne sera présente donc on les initialise à 0 et cela permet de détecter les bots
        if (req.session.randomValue == 0 || req.session.score == 0) {
            //On ajoute à la BDD un incrément bot
            const botIncrement = 1;
            const userAddress = req.userAddress.toLowerCase(); // Récupérer l'adresse de l'utilisateur
            const client = await pool.connect();
            try {
                // Incrémenter la colonne "cheat" pour l'utilisateur
                const updateUserQuery = `
                    UPDATE users 
                    SET bot = bot + $1 
                    WHERE wallet_address = $2
                `;
                await client.query(updateUserQuery, [botIncrement, userAddress]);
            } catch (dbError) {
                return res.status(500).json({ error: 'Error.' });
            } finally {
                client.release();
            }
        }
        // Si tentative de triche
        if ((score+req.session.randomValue) != req.session.score) {
            req.session.score = 1;
        } 
        // Générer un message
        const timestamp = Math.floor(Date.now() / 1000);
        const message = `${timestamp}${address}${req.session.score}`;

        // Signer le message
        const messageHash = ethers.utils.id(message);
        const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));

        // Envoyer la signature et le message signé au client
        res.status(200).json({
            score: req.session.score,
            message,
            signature,
            timestamp
        });
    } catch (error) {
        console.error('Error sending signature:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route pour récupérer la signature servant à valider l'attaque d'un boss
app.post('/getSignatureBoss', verifyJWT, async (req, res) => {
    try {
        // Récupérez l'adresse MetaMask de l'utilisateur depuis la requête
        const address = req.userAddress.toLowerCase();

        // Vérifiez si l'adresse est fournie
        if (!address) {
            return res.status(400).send('Address not provided.');
        }

        // Générer un message
        const timestamp = Math.floor(Date.now() / 1000);
        const message = `${timestamp}${address}`;

        // Signer le message
        const messageHash = ethers.utils.id(message);
        const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));

        // Envoyer la signature et le message signé au client
        res.status(200).json({
            message,
            signature,
            timestamp
        });
    } catch (error) {
        console.error('Error sending signature:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Route pour rediriger l'utilisateur vers Discord pour autorisation
app.get('/auth/discord', (req, res) => {

    const token = req.cookies.jwt; // Assurez-vous que `req.userAddress` est défini correctement
    if (!token) {
        return res.status(400).send('Missing token');
    }
    const state = token
    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI)}&response_type=code&scope=${process.env.DISCORD_SCOPE}&state=${state}`;
    
    return res.json({ redirectUrl : discordAuthUrl });
});


// Route de callback Discord (gérée après que l'utilisateur a autorisé l'application)
app.get('/discord/callback', async (req, res) => {
    const { code, state } = req.query;
    let address;

    // Vérifiez la validité et la signature du JWT présente dans l'élément state passé en paramètre optionnel
    jwt.verify(state, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token invalide' });
        }
        // Extraire l'adresse MetaMask de l'utilisateur
        address = decoded.address;
    });

    if (!code) {
        //return res.redirect('/myaccount');
    }

    try {
        // Échanger le code d'autorisation contre un access_token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.DISCORD_REDIRECT_URI,
                scope: process.env.DISCORD_SCOPE,
            })
        });

        if (!tokenResponse.ok) {
            throw new Error('Error exchanging authorization code for access token');
        }

        const tokenData = await tokenResponse.json();
        const { access_token } = tokenData;

        // Utiliser l'access_token pour obtenir les infos de l'utilisateur
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (!userResponse.ok) {
            throw new Error('Error retrieving user information');
        }

        const user = await userResponse.json();
        const { id, username } = user;

        // Vérification des paramètres reçus
        if (!address || !username || !id) {
            return res.status(400).send('Missing parameters');
        }

        // Connexion à la base de données
        const client = await pool.connect();

        try {
            // Rechercher user_wallet_id à partir de l'adresse du wallet
            const result = await client.query(
                'SELECT id FROM users WHERE wallet_address = $1',
                [address]
            );

            if (result.rows.length === 0) {
                return res.status(404).send('User not found');
            }

            const user_wallet_id = result.rows[0].id;

            // Vérifier si l'utilisateur existe déjà dans user_access_tokens
            const existingUser = await client.query(
                'SELECT discord_id FROM user_access_tokens WHERE user_wallet_id = $1',
                [user_wallet_id]
            );

            if (existingUser.rows.length > 0 && existingUser.rows[0].discord_id) {
                // Utilisateur existant : Envoyer une erreur 409 
                req.flash('error','User already linked to a Discord account');
                throw new Error('Error');
            } else {
                // Nouvel utilisateur : Mettre à jour les informations

                // Requete d'insertion, si user_wallet_id déjà défini alors on ne fait que update les valeurs discord_username et discord_id
                const updateRes = await client.query(
                    `INSERT INTO user_access_tokens (user_wallet_id, discord_username, discord_id) 
                    VALUES ($1, $2, $3)
                    ON CONFLICT (user_wallet_id) 
                    DO UPDATE SET discord_username = EXCLUDED.discord_username, discord_id = EXCLUDED.discord_id`,
                    [user_wallet_id, username, id]
                );
                

                // Si les informations ont été mises à jour, procéder à l'ajout du rôle
                if (updateRes.rowCount > 0) {
                    // Ajout d'un rôle à l'utilisateur sur le serveur Discord
                    const guildId = process.env.DISCORD_GUILD_ID; // ID du serveur Discord
                    const roleId = process.env.DISCORD_ROLE_ID; // ID du rôle à attribuer
                    const botToken = process.env.DISCORD_BOT_TOKEN; // Token du bot Discord
                    const channelId = process.env.DISCORD_CHANNEL_ID; // ID du canal où le message sera envoyé

                    try {
                        // Ajouter le rôle
                        const roleResponse = await fetch(`https://discord.com/api/guilds/${guildId}/members/${id}/roles/${roleId}`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bot ${botToken}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        if (!roleResponse.ok) {
                            // Si l'utilisateur n'est pas dans le serveur, on logue l'erreur
                            if (roleResponse.status === 404) {
                                req.flash('error','User not found in the guild.');
                            } else {
                                req.flash('error','Failed to assign Discord role.');
                            }
                            throw new Error('Error');
                        }

                        // Envoyer un message de confirmation dans le canal Discord
                        const messageResponse = await fetch(`https://discord.com/api/channels/${channelId}/messages`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bot ${botToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                content: `User ${username} got Verified Discord role !`
                            })
                        });

                        if (!messageResponse.ok) {
                            const messageText = await messageResponse.text();
                            req.flash('error', `Failed to send the message on PacBoom Discord channel.`);
                            throw new Error('Error');
                        }
                        req.flash('success', 'Discord account successfully linked !');
                    } catch (error) {
                        req.flash('error', 'Failed to handle Discord role or message.');
                        throw new Error('Error');
                    }
                } else {
                    req.flash('error','Failed to link Discord account.');
                    throw new Error('Error');
                }
            }
        } catch (error) {
            req.flash('error', 'Error updating Discord info.');
            throw new Error('Error');
        } finally {
            client.release();
            return res.redirect('/myaccount');
        }

    } catch (error) {
        req.flash('error', 'Error authenticating with Discord:');
        return res.redirect('/myaccount');
    }
});




// Route pour vérifier les infos Discord d'un user et les récupérer si ils existent
app.get('/getDiscordInfos', verifyJWT, async (req, res) => {
    const address = req.userAddress.toLowerCase();

    if (!address) {
        return res.status(400).send('Address is missing');
    }

    const client = await pool.connect();
    try {

        const checkUserQuery = `
            SELECT user_access_tokens.discord_username, discord_id FROM user_access_tokens 
            JOIN users ON users.id = user_access_tokens.user_wallet_id 
            WHERE users.wallet_address = LOWER($1);
        `;
        const result = await client.query(checkUserQuery, [address]);

        if (result.rows.length > 0) {
            //console.log("user a déjà ses infos twitter enregistree");
            return res.json(result.rows);
        } else {
            return res.status(204).send();
        }

    } catch (error) {
        console.error('Erreur lors de la récupération des infos Discord :', error);
        return res.status(500).send('Erreur lors de la récupération des infos Discord');
    } finally {
        if (client) {
            client.release(); // Libérer le client après utilisation
        }
    }
});


// Route pour délinker un compte Discord
app.post('/unlink-discord', verifyJWT, async (req, res) => {
    const address = req.userAddress; // L'adresse du wallet utilisateur, extrait via verifyJWT

    // Connexion à la base de données
    const client = await pool.connect();
    try {
        // Vérifier si l'utilisateur avec cette adresse de wallet existe
        const resUser = await client.query(
            `SELECT users.id, discord_id, discord_username FROM users
             JOIN user_access_tokens ON users.id = user_access_tokens.user_wallet_id
             WHERE wallet_address = $1`,
            [address]
        );

        if (resUser.rows.length === 0) {
            // Si aucun utilisateur trouvé avec cette adresse
            return res.status(404).send('User not found.');
        }

        const { id, discord_id, discord_username } = resUser.rows[0];

        // Si aucun compte Discord n'est lié
        if (!discord_id) {
            
            return res.status(400).send('No Discord account linked to this user.');
        }

        // Supprimer les informations Discord
        const result = await client.query(
            `UPDATE user_access_tokens 
             SET discord_id = NULL, discord_username = NULL 
             WHERE user_wallet_id = $1`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(500).send('Failed to unlink Discord account.');
        }

        // Retirer le rôle de l'utilisateur sur le serveur Discord
        const guildId = process.env.DISCORD_GUILD_ID; // ID du serveur Discord
        const roleId = process.env.DISCORD_ROLE_ID; // ID du rôle à retirer
        const botToken = process.env.DISCORD_BOT_TOKEN; // Token du bot Discord
        const channelId = process.env.DISCORD_CHANNEL_ID; // ID du canal où le message sera envoyé

        try {
            // Retirer le rôle
            const roleResponse = await fetch(`https://discord.com/api/guilds/${guildId}/members/${discord_id}/roles/${roleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bot ${botToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!roleResponse.ok) {
                // Si l'utilisateur n'est pas dans le serveur, on logue l'erreur
                if (roleResponse.status === 404) {
                    console.error('User not found in the guild.');
                    return res.status(404).send('User not found in the guild.');
                } else {
                    console.error('Failed to remove role:', await roleResponse.text());
                    return res.status(500).send('Failed to remove Discord role.');
                }
            }

            // Envoyer un message de confirmation dans le canal Discord
            const messageResponse = await fetch(`https://discord.com/api/channels/${channelId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bot ${botToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: `The user ${discord_username} has unlinked his Discord account and lost the role.`
                })
            });

            if (!messageResponse.ok) {
                console.error('Failed to send message:', await messageResponse.text());
            }

            return res.status(200).send('Successfully unlinked Discord account and removed role.');
        } catch (error) {
            console.error('Error handling Discord role or message:', error);
            return res.status(500).send('Failed to handle Discord role or message.');
        }
        
    } catch (error) {
        console.error('Error during unlinking of the Discord account:', error);
        return res.status(500).send('Server error.');
    } finally {
        client.release();
    }
});


// Route pour afficher la page "myaccount"
app.get('/myaccount', (req, res) => {
    const errorMessage = req.flash('error'); // Récupération du message d'erreur flash
    const successMessage = req.flash('success'); // Récupération du message de succès flash

    res.render('myaccount', { 
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null, // Si un message existe
        successMessage: successMessage.length > 0 ? successMessage[0] : null // Si un message existe
    });
});

// Fonction de calcul de progression
function getPointsToNextLevel(level) {
    const basePoints = 30; // Ajusté pour la moyenne des points par partie
    const difficultyFactor = 1.5; // Facteur pour augmenter la difficulté progressivement
    const maxLevel = 100; // Niveau maximum

    if (level >= maxLevel) {
        return 0; // Aucun point nécessaire si le joueur a atteint le niveau max
    }

    // Progression quadratique ajustée avec facteur de difficulté
    const pointsToNextLevel = basePoints * Math.pow(level, difficultyFactor);

    return Math.round(pointsToNextLevel); // Arrondir pour avoir des valeurs entières
}

// Fonction de récupération des points pour le prochain niveau
function getPointsToNextLevel(level) {
    const basePoints = 30; // Ajusté pour la moyenne des points par partie
    const difficultyFactor = 1.5; // Facteur pour augmenter la difficulté progressivement
    const maxLevel = 100; // Niveau maximum

    if (level >= maxLevel) {
        return 0; // Aucun point nécessaire si le joueur a atteint le niveau max
    }

    // Progression quadratique ajustée avec facteur de difficulté
    const pointsToNextLevel = basePoints * Math.pow(level, difficultyFactor);

    return Math.round(pointsToNextLevel); // Arrondir pour avoir des valeurs entières
}

// Fonction pour récupérer les points et calculer dynamiquement le niveau
function getPlayerLevel(points) {
    let level = 0;
    let pointsToNextLevel = 0;
    
    while (points >= pointsToNextLevel) {
        points -= pointsToNextLevel;
        level++;
        pointsToNextLevel = getPointsToNextLevel(level); // Fonction qui retourne les points nécessaires pour le prochain niveau
    }
    
    return level;
}


// Fonction pour récupérer le niveau d'un user
app.post('/get-player-level', verifyJWT, async (req, res) => {
    const address = req.userAddress.toLowerCase(); // L'adresse du wallet utilisateur, extraite via verifyJWT
    const points = req.body.points;
    
    // Vérifiez si l'adresse est fournie
    if (!address) {
        return res.status(400).send('Address not provided.');
    }
    if (points === null || points === undefined) {
        return res.status(400).send('Points not provided.');
    }
    try {
        // Charger les données du leaderboard (stockées dans leaderboardData par exemple)
        const leaderboardUser = leaderboardData.userData.filter(user => user.address === address);

        if (!leaderboardUser) {
            // Si aucun utilisateur trouvé avec cette adresse
            return res.status(404).json({ error: 'User not found.' });
        }
        
        const levelUser = getPlayerLevel(points); // on convertit en int car points est BigNumber
        // Envoyer la réponse avec le niveau de l'utilisateur
        return res.status(200).json({ level: levelUser, currentPoints : points , pointsToNextLevel: getPointsToNextLevel(levelUser)});

    } catch (error) {
        console.error('Error retrieving the player level:', error);
        return res.status(500).json({ error: 'Server error.' });
    } 
});


// Démarre le serveur Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, 'localhost', () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
