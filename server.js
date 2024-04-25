const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs').promises;

const app = express();

const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const session = require('express-session');
const cors = require('cors');
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
    // Enregistrer le token et tokenSecret dans la session si nécessaire
    // Extrait des informations pertinentes du profil Twitter
    const user = {
        username: profile.displayName,
        screen_name: profile.username,
        avatarUrl: profile.photos[0].value
      };
      return done(null, user);
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
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                score INTEGER NOT NULL DEFAULT 0
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

// Route pour sauvegarder le score des users dans la base de données
app.post('/saveScore', async (req, res) => {
    try {
        const { score, username } = req.body;
        
        // Check if username is provided
        if (!username) {
            return res.status(400).send('Username not provided.');
        }

        // Insert the score and username into the database
        const client = await pool.connect();
        const result = await client.query(`
            UPDATE users
            SET score = CASE
                        WHEN $2 > score THEN $2
                        ELSE score
                    END
            WHERE username = $1
            RETURNING *; 
        `, [username, score]);

        const newScore = result.rows[0];
        client.release();

        // Respond with success
        res.status(201).json(newScore);
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
app.post('/saveUser', async (req, res) => {
    const handle = req.user.screen_name;

    try {
        // Vérifier si l'utilisateur existe déjà dans la base de données
        const checkUserQuery = `
            SELECT * FROM users
            WHERE username = $1;
        `;
        const checkUserResult = await pool.query(checkUserQuery, [handle]);

        if (checkUserResult.rows.length > 0) {
            // L'utilisateur existe déjà dans la base de données
            const existingUser = checkUserResult.rows[0];
            res.status(200).json(existingUser); // Retourner les informations de l'utilisateur existant
        } else {
            // Insérer l'utilisateur dans la base de données s'il n'existe pas déjà
            const insertUserQuery = `
                INSERT INTO users (username)
                VALUES ($1)
                RETURNING *;
            `;
            const insertUserResult = await pool.query(insertUserQuery, [handle]);

            const newUser = insertUserResult.rows[0];
            res.json(newUser); // Retourner les informations du nouvel utilisateur inséré
        }
    } catch (err) {
        console.error('Erreur lors de l\'enregistrement de l\'utilisateur', err);
        res.status(500).send('Erreur serveur');
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



// Démarre le serveur Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
