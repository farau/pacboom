import passport from 'passport';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import cookie from 'cookie';
import pool from './db.js'

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

            const decodedToken = req.getAuth
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


export default passport;
