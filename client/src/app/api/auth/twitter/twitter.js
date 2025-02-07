import passport from '../../../lib/passport';

export default function handler(req, res) {
  passport.authenticate('twitter', {
    scope: ['tweet.read', 'users.read', 'offline.access'],
  })(req, res);
}
