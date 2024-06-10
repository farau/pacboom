const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();

const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const session = require('express-session');
const cors = require('cors');
const jwt = require('jsonwebtoken');

require('dotenv').config();

// Middleware pour parser le corps de la requête en JSON
app.use(express.json());

// Utilisation du middleware CORS
app.use(cors());


// Configuration de session
app.use(session({
    secret: 'votre_secret_session',
    resave: false,
    saveUninitialized: true
}));

// Initialiser Passport et session
app.use(passport.initialize());
app.use(passport.session());

// Configurer passport
passport.use(new TwitterStrategy({
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    includeScreenName: true
  },
  function(token, tokenSecret, profile, done) {
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


const router = express.Router();

// Route pour l'authentification avec Twitter (redirection côté serveur)
router.get('/auth/twitter', passport.authenticate('twitter'));

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
            score INTEGER NOT NULL DEFAULT 0
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
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users');
        const users = result.rows;
        res.json(users);
        client.release();
    } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs', err);
        res.status(500).send('Erreur serveur');
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

    try {
        // Insert the score and username into the database
        const client = await pool.connect();

        // Exécution de la requête SQL UPDATE pour mettre à jour les métadonnées
        await client.query(
            `UPDATE metadata 
             SET head = $2, eyes = $3, arm = $4, neck = $5 
             WHERE username = $1`,
            [username, head, eyes, arm, neck]
        );

        // Mettre à jour la colonne metadata_id de user_access_tokens
        await client.query(
            'UPDATE user_access_tokens SET metadata_set = TRUE WHERE username = $1',
            [username]
        );

        client.release();

        // Envoyer une réponse JSON avec un message de réussite
        res.status(200).json({ message: 'Metadata inserted successfully' });

    } catch (error) {
        console.error('Error inserting metadata:', error);
        // Envoyer une réponse JSON avec un message d'erreur
        res.status(500).json({ error: 'Error inserting metadata' });
    }
});



// Route pour récupérer les métadonnées de l'utilisateur
app.post('/getMetadata', async (req, res) => {
    const username = req.body.username; // Récupérer le nom d'utilisateur depuis la requête

    const client = await pool.connect();
    // Exécution de la requête SQL SELECT pour vérifier si les métadonnées sont définies pour cet utilisateur
    const query = `SELECT metadata_set FROM user_access_tokens WHERE username = $1`;
    client.query(query, [username], async (error, results) => {
        if (error) {
            console.error('Error retrieving metadata:', error);
            res.status(500).json({ error: 'Error retrieving metadata' });
        } else {
            // Vérifier si des résultats ont été retournés
            if (results.rows.length === 0 || !results.rows[0].metadata_set) {
                // Aucun enregistrement trouvé ou metadata_set est faux, renvoyer un statut 204 pour indiquer que les métadonnées ne sont pas disponibles
                //console.log("Aucun enregistrement trouvé dans user_access_tokens pour l'utilisateur:", username);
                res.status(204).send();
            } else {
                // Metadata_set est vrai, récupérer les métadonnées depuis la table metadata
                const metadataQuery = 'SELECT * FROM metadata WHERE username = $1';
                try {
                    const metadataResult = await client.query(metadataQuery, [username]);
                    // Envoyer les métadonnées récupérées en réponse
                    res.status(200).json(metadataResult.rows[0]);
                } catch (metadataError) {
                    console.error('Error retrieving metadata:', metadataError);
                    res.status(500).json({ error: 'Error retrieving metadata' });
                }
            }
        }
        client.release();
    });
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
    try {
        const { score } = req.body;
        
        // Récupérez l'adresse MetaMask de l'utilisateur depuis la requête
        const address = req.userAddress;
        // Vérifiez si l'adresse est fournie
        if (!address) {
            return res.status(400).send('Address not provided.');
        }

        // Commencez une nouvelle transaction
        const client = await pool.connect();

        // Vérifiez si le nom d'utilisateur est fourni dans la base de données
        const usernameQuery = await client.query(`
            SELECT username FROM users
            WHERE wallet_address = $1; 
        `, [address]);

        const username = usernameQuery.rows ? usernameQuery.rows[0].username : null;
        const user_id_query = username ? await client.query(`
            SELECT user_id FROM user_access_tokens
            WHERE username = $1; 
        `, [username]) : null;

        const user_id = user_id_query.rows ? user_id_query.rows[0].user_id : null;

        if (!username || !user_id) {
            client.release();
            res.status(204).send();
            return;
        }

        // Commencez la transaction
        await client.query('BEGIN');

        // Mettez à jour le score de l'utilisateur
        const updateQuery = `
            UPDATE users
            SET score = CASE
                        WHEN $1 > score THEN $1
                        ELSE score
                    END
            WHERE wallet_address = $2
            RETURNING *;
        `;
        const updateResult = await client.query(updateQuery, [score, address]);

        // Vérifiez si le score quotidien est déjà enregistré
        const dailyScoreQuery = await client.query(`
            SELECT * FROM score_users_daily
            WHERE user_id = $1 AND date = DATE_TRUNC('day', CURRENT_TIMESTAMP);
        `, [user_id]);

        if (dailyScoreQuery.rows.length > 0) {
            // Mettez à jour le score quotidien si déjà enregistré
            const updateDailyScoreQuery = `
                UPDATE score_users_daily
                SET score = CASE
                        WHEN $1 > score THEN $1
                        ELSE score
                    END
                WHERE user_id = $2 AND date = DATE_TRUNC('day', CURRENT_TIMESTAMP);
            `;
            await client.query(updateDailyScoreQuery, [score, user_id]);
        } else {
            // Insérez le score quotidien si non enregistré
            const insertQuery = `
                INSERT INTO score_users_daily (user_id, username, score, date) 
                VALUES ($1, $2, $3, DATE_TRUNC('day', CURRENT_TIMESTAMP));
            `;
            await client.query(insertQuery, [user_id, username, score]);
        }

        // Validez la transaction
        await client.query('COMMIT');

        // Libérez le client
        client.release();

        // Vérifiez le succès de la mise à jour
        if (updateResult.rowCount > 0) {
            res.status(201).json(updateResult.rows);
        } else {
            res.status(500).send('Internal Server Error');
        }
    } catch (error) {
        console.error('Error saving score to database:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Backend route to fetch leaderboard data
app.get('/getLeaderboard', async (req, res) => {
    try {
        const query = `
            SELECT username, score
            FROM users
            WHERE username IS NOT NULL
            ORDER BY score DESC;
        `;
        const result = await pool.query(query);

        const leaderboardData = result.rows;
        res.json(leaderboardData);
    } catch (error) {
        console.error('Erreur lors de la récupération des données du leaderboard :', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
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
            res.status(200).json(existingUser); // Retourner les informations de l'utilisateur existant
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
        client.release();
    }
});



// Route pour l'authentification avec Twitter
app.get('/auth/twitter', passport.authenticate('twitter'));

// Route de rappel après l'authentification Twitter
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  (req, res) => {
    // Authentification réussie, rediriger l'utilisateur vers la page principale
    const { username, screen_name, avatarUrl } = req.user;
    res.redirect(`/index.html?username=${username}&screen_name=${screen_name}&avatarUrl=${avatarUrl}`);
  }
);


// Fonction pour sauvegarder les jetons d'accès dans la base de données
async function saveAccessToken(userName, userId, avatarUrl) {
    const client = await pool.connect();
    try {

        
        // Vérifier si l'utilisateur existe déjà dans la base de données
        const checkUserQuery = `
            SELECT username, user_id, avatarUrl FROM user_access_tokens
            WHERE username = $1;
        `;
        const checkUserResult = await pool.query(checkUserQuery, [userName]);

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
      client.release();
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

    try {

        const checkUserQuery = `
            SELECT user_access_tokens.username, avatarUrl FROM user_access_tokens 
            JOIN users ON users.id = user_access_tokens.user_wallet_id 
            WHERE users.wallet_address = $1;
        `;
        const result = await pool.query(checkUserQuery, [address]);

        if (result.rows.length > 0) {
            //console.log("user a déjà ses infos twitter enregistree");
            return res.json(result.rows);
        } else {
            return res.status(204).send();
        }

    } catch (error) {
        console.error('Erreur lors de la récupération des infos Twitter :', error);
        return res.status(500).send('Erreur lors de la récupération des infos Twitter');
    }
});


app.post('/save-user', verifyJWT, async (req, res) => {
    const { wallet_address } = req.body; // Obtenez l'adresse du portefeuille depuis le corps de la requête
    if (!wallet_address) {
        return res.status(400).json({ error: 'Adresse de portefeuille manquante.' });
    }
    try {
        // Récupérez le dernier ID inséré dans la table users
        const lastUserIdQuery = 'SELECT MAX(id) AS max_id FROM users';
        const { rows } = await pool.query(lastUserIdQuery);
        let nextUserId = 1; // Valeur par défaut pour le premier utilisateur s'il n'y a pas encore d'enregistrement
        if (rows.length > 0 && rows[0].max_id !== null) {
            nextUserId = parseInt(rows[0].max_id) + 1; // Incrémente le dernier ID
        }

        // Insérez le nouvel utilisateur avec l'ID incrémenté
        const insertUserQuery = `
            INSERT INTO users (id, wallet_address) VALUES ($1, $2) ON CONFLICT (wallet_address) DO NOTHING RETURNING *`;
        const result = await pool.query(insertUserQuery, [nextUserId, wallet_address]);
        
        if (result.rows.length === 0) {
            return res.status(201).json({ message: 'Utilisateur déjà enregistré.' });
        }
        res.status(201).json({ message: 'Utilisateur loggué avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', error);
        res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'utilisateur.' });
    }
});


// Route pour vérifier si un utilisateur est déjà présent en BDD
app.post('/check-user', verifyJWT, async (req, res) => {
    const { wallet_address } = req.body;
    if (!wallet_address) {
        return res.status(400).json({ error: 'Adresse de portefeuille manquante.' });
    }
    try {
        const result = await pool.query(
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
    }
});

// Stockage temporaire des scores
let scores = {};

const GhostType = {
    NORMAL: "normal",
    BONUS: "bonus",
    BOMB: "bomb",
    BEEPLE: "beeple"
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
    } else {
        scores[address] += 0;
    }
    // Retourner le nouveau score
    res.json({ score: scores[address] });
});




app.get('/profile', verifyJWT, (req, res) => {
    const userAddress = req.userAddress;
    if (!userAddress) {
        return res.status(400).send('User not connected.');
    }
    if (!req.query.isUserConnected) {
        return res.status(403).send('Accès refusé.');
    }
    res.send(`
        <html>
        <body>
            <h1>Profile</h1>
            <p>Wallet Address: ${userAddress}</p>
            <button onclick="linkTwitter()">Link Twitter Account</button>
            <script>
                function linkTwitter() {
                    // Add logic to link Twitter account
                    alert('Functionality to link Twitter will be added here.');
                }
            </script>
        </body>
        </html>
    `);
});


// Route pour sauvegarder le score des users dans la base de données
app.post('/add-pacboom-points', verifyJWT, async (req, res) => {
    try {
        const points_ = req.body.points;
        const points = parseInt(points_.hex, 16);
        
        // Récupérez l'adresse MetaMask de l'utilisateur depuis la requête
        const address = req.userAddress;
        // Vérifiez si l'adresse est fournie
        if (!address) {
            return res.status(400).send('Address not provided.');
        }

        // Commencez une nouvelle transaction
        const client = await pool.connect();

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

        // Libérez le client
        client.release();

        // Vérifiez le succès de la mise à jour
        if (insertQuery.rowCount > 0) {
            res.status(201).json(insertQuery.rows);
        } else {
            res.status(500).send('Internal Server Error');
        }
    } catch (error) {
        console.error('Error saving points to database:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Démarre le serveur Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, 'localhost', () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
