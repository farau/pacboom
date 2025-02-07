import passport from '../../../lib/passport';
import cookie from 'cookie';

export default function handler(req, res) {
  passport.authenticate('twitter', async (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur d\'authentification' });
    }
    if (!user) {
      return res.status(400).json({ message: 'Aucun utilisateur trouvé' });
    }

    // Authentification réussie, on ajoute un cookie pour la session
    res.setHeader('Set-Cookie', cookie.serialize('user_id', String(user.id), {
      httpOnly: true,  // Empêche l'accès au cookie depuis JavaScript
      secure: process.env.NODE_ENV === 'production',  // Assurez-vous que le cookie est sécurisé en production
      sameSite: 'Strict',
      maxAge: 60 * 60 * 24 * 7,  // Durée du cookie (7 jours)
      path: '/',  // Le cookie est accessible sur tout le domaine
    }));

    return res.status(200).json({ message: 'Authentification réussie', user });
  })(req, res);
}
