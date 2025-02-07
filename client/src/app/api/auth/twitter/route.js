import { NextResponse } from 'next/server';

// Authentification Twitter (app/api/auth/twitter/route.js)

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


