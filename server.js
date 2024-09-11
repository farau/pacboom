const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();

const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const { Strategy } = require('@superfaceai/passport-twitter-oauth2');
const { ethers, Wallet } = require('ethers');

require('dotenv').config();

// Middleware pour parser le corps de la requête en JSON
app.use(express.json());

// Utilisation du middleware CORS
app.use(cors());

// Remplacez par vos propres clés et secrets
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;

// Configurer les sessions Express
app.use(session({ secret: 'votre_secret_de_session', resave: true, saveUninitialized: true }));

// Initialiser Passport et session
app.use(passport.initialize());
app.use(passport.session());



// Configurer Passport.js pour utiliser la stratégie OAuth2
passport.use(new Strategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    clientType: 'confidential',
    callbackURL: CALLBACK_URL,
  },
  function(accessToken, refreshToken, profile, done) {
    // console.log('Success!', { accessToken, refreshToken });
    // Sauvegarde des jetons d'accès dans la base de données
    saveAccessToken(profile.username, profile.id, profile.photos[0].value)
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

// Route pour l'authentification Twitter
app.get('/auth/twitter', passport.authenticate('twitter', {
    // <6> Scopes
    scope: ['tweet.read', 'users.read', 'offline.access'],
})
);

// <7> Callback handler
app.get('/auth/twitter/callback', (req, res, next) => {
    passport.authenticate('twitter', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            const { username, screen_name, avatarUrl } = user;
            return res.redirect(`/index.html?username=${username}&screen_name=${screen_name}&avatarUrl=${avatarUrl}`);
        });
    })(req, res, next);
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
            nub_id INTEGER DEFAULT NULL
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
            user_id BIGINT UNIQUE NOT NULL,
            user_wallet_id INTEGER REFERENCES users(id),
            avatarUrl VARCHAR(250),
            metadata_set BOOLEAN DEFAULT FALSE,
            metadata_id INTEGER REFERENCES metadata(id),
            pac_fidelity INTEGER NOT NULL DEFAULT 0,

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

// Middleware pour servir les fichiers statiques (HTML, CSS, JavaScript, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));


// Route pour servir la page d'accueil (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route pour servir la page pfpgenerator
app.get('/pfpgenerator', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pfpgenerator.html'));
});


// Exemple de requête pour récupérer des données depuis PostgreSQL (liste des utilisateurs)
app.get('/users', async (req, res) => {
    let client;
    try {
        // Obtenez un client de la pool
        client = await pool.connect();

        // Exécutez la requête SQL pour récupérer les utilisateurs
        const { rows: users } = await client.query('SELECT * FROM users');

        // Renvoyez la réponse avec les utilisateurs
        res.status(200).json(users);
    } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des utilisateurs' });
    } finally {
        // Libérez toujours le client, même en cas d'erreur
        if (client) client.release();
    }
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


// Route pour créer et renvoyer un JWT
app.post('/create-jwt', (req, res) => {
    // Dans cet exemple, nous supposons que vous avez déjà récupéré l'adresse MetaMask de l'utilisateur
    const userAddress = req.body.userAddress;

    // Remplacez 'votre_clé_secrète' par votre propre clé secrète sécurisée
    const secretKey = process.env.SECRET_KEY;

    // Créez le JWT en incluant l'adresse MetaMask de l'utilisateur
    const token = jwt.sign({ address: userAddress }, secretKey, { expiresIn: '1h' }); // Expiration du JWT dans 1 heure
    
    // Renvoyez le JWT créé
    res.json({ token });
});

// Middleware pour vérifier le JWT dans les en-têtes de la requête
function verifyJWT(req, res, next) {
    const jwtToken = req.headers.authorization; // Obtenez le JWT des en-têtes de la requête

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
        const address = req.userAddress;

        // Vérifiez si l'adresse est fournie
        if (!address) {
            return res.status(400).send('Address not provided.');
        }

        // Récupérer le nom d'utilisateur et l'ID utilisateur en une seule requête
        const userQuery = await client.query(`
            SELECT u.username, ua.user_id
            FROM users u
            JOIN user_access_tokens ua ON u.username = ua.username
            WHERE u.wallet_address = $1;
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
            WHERE wallet_address = $2
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
            res.status(201).json(updateResult.rows);
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


// Backend route to fetch leaderboard data
app.get('/getLeaderboard', async (req, res) => {
    const client = await pool.connect();
    try {
        let page = parseInt(req.query.page) || 1;
        let pageSize = parseInt(req.query.pageSize) || 10;

        // Assurer que page et pageSize sont des valeurs valides
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 10;

        const offset = (page - 1) * pageSize;

        // Requête SQL pour récupérer les données du classement
        const query = `
            SELECT
                wallet_address,
                username,
                SUM(points) AS total_points,
                RANK() OVER (ORDER BY SUM(points) DESC) AS ranking
            FROM
                points_users_daily
            GROUP BY
                wallet_address, username
            ORDER BY
                total_points DESC
            LIMIT $1 OFFSET $2;
        `;

        const countQuery = `
            SELECT COUNT(DISTINCT wallet_address) AS total_users
            FROM points_users_daily;
        `;

        // Exécuter les deux requêtes (pour les données et pour le nombre total de résultats)
        const [result, countResult] = await Promise.all([
            client.query(query, [pageSize, offset]),
            client.query(countQuery)
        ]);

        const leaderboardData = result.rows;
        const totalUsers = countResult.rows[0].total_users;
        const totalPages = Math.ceil(totalUsers / pageSize);

        res.json({
            leaderboard: leaderboardData,
            totalUsers: totalUsers,
            totalPages: totalPages,
            currentPage: page
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des données du leaderboard :', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    } finally {
        if (client) {
            client.release(); // Libérer le client après utilisation
        }
    }
});



// Backend route to fetch daily leaderboard data
app.get('/getDailyLeaderboard', async (req, res) => {
    const client = await pool.connect();
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        const query = `
            SELECT username, score
            FROM score_users_daily
            WHERE username IS NOT NULL
            AND date = CURRENT_DATE
            ORDER BY score DESC
            LIMIT $1 OFFSET $2;
        `;
        const result = await client.query(query, [pageSize, offset]);

        const leaderboardData = result.rows;
        res.json(leaderboardData);
    } catch (error) {
        console.error('Erreur lors de la récupération des données du leaderboard :', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    } finally {
        if (client) {
            client.release(); // Libérer le client après utilisation
        }
    }
});



// Route POST pour enregistrer les données utilisateur dans la table users
app.post('/linkTwitter', verifyJWT, async (req, res) => {
    const handle = req.body.screen_name;
    const address = req.body.address;

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
            SELECT * FROM users JOIN user_access_tokens ON users.id = user_access_tokens.user_wallet_id
            WHERE user_access_tokens.username = $1;
        `;
        const checkUserResult = await client.query(checkUserQuery, [handle]);

        if (checkUserResult.rows.length > 0) {
            // L'utilisateur existe déjà dans la base de données
            const existingUser = checkUserResult.rows[0];
            //console.log("utilisateur déjà enregistré donc on retourne les infos twitter");
            await client.query('COMMIT');
            res.status(409).json(null); // on retourne null pour ne pas link le X // Retourner les informations de l'utilisateur existant
        } else {
            //console.log("on insere l'username dans la table user ");

            // Mettre à jour l'utilisateur dans la table users
            const updateUserQuery = `
                UPDATE users
                SET username = $1
                WHERE wallet_address = $2
                RETURNING id;
            `;
            const updateUserResult = await client.query(updateUserQuery, [handle, address]);
            let usrId;

            if (updateUserResult.rowCount === 0) {
                // Si pas de user pouvant être update alors on crée un nouvel user.
                // Insérer un nouvel utilisateur avec l'ID incrémenté
                const insertUserQuery = `
                    INSERT INTO users (id, wallet_address, username)
                    VALUES ($1, $2, $3) RETURNING id;
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
            res.status(200).json({ userId: usrId, metadataId: metadataId }); // Retourner les informations du nouvel utilisateur inséré
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erreur lors de l\'enregistrement de l\'utilisateur', err);
        res.status(500).send('Erreur serveur');
    } finally {
        if (client) {
            client.release(); // Libérer le client après utilisation
        }
    }
});



// Fonction pour sauvegarder les jetons d'accès dans la base de données
async function saveAccessToken(userName, userId, avatarUrl) {
    const client = await pool.connect();
    try {
        // Vérifier si l'utilisateur existe déjà dans la base de données
        const checkUserQuery = `
            SELECT username, user_id, avatarUrl FROM user_access_tokens
            WHERE username = $1;
        `;
        const checkUserResult = await client.query(checkUserQuery, [userName]);

        if (checkUserResult.rows.length > 0) {
            // L'utilisateur existe déjà dans la base de données
        } 
        else {
            await client.query('BEGIN');
            await client.query('INSERT INTO user_access_tokens (username, user_id, avatarUrl) VALUES ($1, $2, $3)', [userName, userId, avatarUrl]);
            await client.query('COMMIT');
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
    const { address } = req.query;

    if (!address) {
        return res.status(400).send('Adresse manquante');
    }

    const client = await pool.connect();
    try {

        const checkUserQuery = `
            SELECT user_access_tokens.username, avatarUrl FROM user_access_tokens 
            JOIN users ON users.id = user_access_tokens.user_wallet_id 
            WHERE users.wallet_address = $1;
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


app.post('/save-user', verifyJWT, async (req, res) => {
    const { wallet_address } = req.body; // Obtenez l'adresse du portefeuille depuis le corps de la requête
    if (!wallet_address) {
        return res.status(400).json({ error: 'Adresse de portefeuille manquante.' });
    }
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
            INSERT INTO users (id, wallet_address) VALUES ($1, $2) ON CONFLICT (wallet_address) DO NOTHING RETURNING *`;
        const result = await client.query(insertUserQuery, [nextUserId, wallet_address]);
        
        if (result.rows.length === 0) {
            return res.status(201).json({ message: 'Utilisateur déjà enregistré.' });
        }
        res.status(201).json({ message: 'Utilisateur loggué avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', error);
        res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'utilisateur.' });
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
            'SELECT * FROM users WHERE wallet_address = $1',
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
    const address = req.userAddress;
    scores[address] = 0;
    res.send({ score: scores[address] });
});

// Route pour récupérer le score d'un joueur donné
app.get('/get-score', verifyJWT, (req, res) => {
    const address = req.userAddress;
    const score = scores[address] || 0;
    res.send({ score });
});

// Route pour incrémenter le score d'un joueur
app.post('/increment-score', verifyJWT, (req, res) => {
    const address = req.userAddress;
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




app.post('/profile', verifyJWT, async (req, res) => {
    const address = req.userAddress;
    if (!address) {
        return res.status(400).send('User not connected.');
    }

    const client = await pool.connect();
    try {
        // Récupération du nom d'utilisateur
        const result = await client.query(
            'SELECT username FROM users WHERE wallet_address = $1',
            [address]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Récupération des points et du classement
        const result2 = await client.query(
            `SELECT
                SUM(points) AS total_points,
                RANK() OVER (ORDER BY SUM(points) DESC) AS ranking
            FROM
                points_users_daily
            WHERE 
                wallet_address = $1
            GROUP BY
                wallet_address, username
            ORDER BY
                total_points DESC`,
            [address]
        );

        // Vérification si l'utilisateur a des points
        let points = 0;
        let ranking = null;

        if (result2.rows.length > 0) {
            points = result2.rows[0].total_points;
            ranking = result2.rows[0].ranking;
        }

        // Réponse avec le nom d'utilisateur, les points et le classement
        res.json({
            username: result.rows[0].username,
            points: points,
            rank: ranking
        });

    } catch (error) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification de l\'utilisateur.' });
    } finally {
        if (client) {
            client.release(); // Libérer le client après utilisation
        }
    }
});



// Route pour sauvegarder le score des users dans la base de données
app.post('/add-pacboom-points', verifyJWT, async (req, res) => {

    // Commencez une nouvelle transaction
    const client = await pool.connect();

    try {
        const points_ = req.body.points;
        const points = parseInt(points_.hex, 16);
        
        // Récupérez l'adresse MetaMask de l'utilisateur depuis la requête
        const address = req.userAddress;
        // Vérifiez si l'adresse est fournie
        if (!address) {
            return res.status(400).send('Address not provided.');
        }


        // Vérifiez si le nom d'utilisateur est fourni dans la base de données
        const usernameQuery = await client.query(`
            SELECT username FROM users
            WHERE wallet_address = $1; 
        `, [address]);

        const username = usernameQuery ? usernameQuery.rows[0].username : null;
        const user_id_query = username ? await client.query(`
            SELECT user_id FROM user_access_tokens
            WHERE username = $1; 
        `, [username]) : null;

        const user_id = user_id_query ? user_id_query.rows[0].user_id : null;

        // Commencez la transaction
        await client.query('BEGIN');

        // Insérez les points par user pour chaque transactions
        const insertQuery = await client.query(`
            INSERT INTO points_users_daily (wallet_address, user_id, username, points, date) 
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP);`
        , [address, user_id, username, `${points}`]);

        
        // Validez la transaction
        await client.query('COMMIT');

        // Vérifiez le succès de la mise à jour
        if (insertQuery.rowCount > 0) {
            res.status(201).json(insertQuery.rows);
        } else {
            res.status(500).send('Internal Server Error');
        }
    } catch (error) {
        console.error('Error saving points to database:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        if (client) {
            client.release(); // Libérer le client après utilisation
        }
    }
});


// Route pour sauvegarder l'id du Nub possédé dans la base de données
app.post('/saveNub', verifyJWT, async (req, res) => {

    // Commencez une nouvelle transaction
    const client = await pool.connect();

    try {
        const { nub_id } = req.body;
        
        // Récupérez l'adresse MetaMask de l'utilisateur depuis la requête
        const address = req.userAddress;
        // Vérifiez si l'adresse est fournie
        if (!address) {
            return res.status(400).send('Address not provided.');
        }


        // Vérifiez si le nom d'utilisateur est fourni dans la base de données
        const usernameQuery = await client.query(`
            SELECT username FROM users
            WHERE wallet_address = $1; 
        `, [address]);

        // Commencez la transaction
        await client.query('BEGIN');

        // Mettez à jour le score de l'utilisateur
        const updateQuery = `
            UPDATE users
            SET nub_id = $1
            WHERE wallet_address = $2
            RETURNING *;
        `;
        const updateResult = await client.query(updateQuery, [nub_id, address]);

        // Validez la transaction
        await client.query('COMMIT');

        // Vérifiez le succès de la mise à jour
        if (updateResult.rowCount > 0) {
            res.status(201).json(updateResult.rows);
        } else {
            res.status(500).send('Internal Server Error');
        }
    } catch (error) {
        console.error('Error saving nub id to database:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        if (client) {
            client.release(); // Libérer le client après utilisation
        }
    }
});


// Route pour récupérer l'id du Nub possédé dans la base de données
app.post('/getNub', verifyJWT, async (req, res) => {

    // Commencez une nouvelle transaction
    const client = await pool.connect();

    try {
        // Récupérez l'adresse MetaMask de l'utilisateur depuis la requête
        const address = req.userAddress;
        // Vérifiez si l'adresse est fournie
        if (!address) {
            return res.status(400).send('Address not provided.');
        }


        // Commencez la transaction
        await client.query('BEGIN');

        // Mettez à jour le score de l'utilisateur
        const updateQuery = `
            SELECT nub_id
            FROM users
            WHERE wallet_address = $1;
        `;
        const returnResult = await client.query(updateQuery, [address]);

        // Validez la transaction
        await client.query('COMMIT');

        // Vérifiez le succès de la mise à jour
        if (returnResult.rowCount > 0) {
            res.status(201).json(returnResult.rows);
        } else {
            res.status(500).send('Internal Server Error');
        }
    } catch (error) {
        console.error('Error retrieving nub id for user :', error);
        res.status(500).send('Internal Server Error');
    } finally {
        if (client) {
            client.release(); // Libérer le client après utilisation
        }
    }
});

const privateKey = process.env.PRIVATE_KEY;
const signer = new Wallet(privateKey);

// Route pour récupérer la signature servant à valider le claim de PB points
app.post('/getSignature', verifyJWT, async (req, res) => {
    try {
        // Récupérez l'adresse MetaMask de l'utilisateur depuis la requête
        const address = req.userAddress;
        const score = req.body.score;  // Supposons que le score soit passé dans le corps de la requête

        // Vérifiez si l'adresse est fournie
        if (!address) {
            return res.status(400).send('Address not provided.');
        }

        // Vérifiez si le score est fourni
        if (typeof score !== 'number') {
            return res.status(400).send('Score not provided or invalid.');
        }

        // Générer un message
        const timestamp = Math.floor(Date.now() / 1000);
        const message = `${timestamp}${address}${score}`;

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



// Démarre le serveur Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, 'localhost', () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
