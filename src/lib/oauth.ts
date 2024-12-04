import passport from 'passport';

export const googleAuthenticator = passport.authenticate('google', { scope: ['profile', 'email'] });
export const googleCallback = passport.authenticate('google');
