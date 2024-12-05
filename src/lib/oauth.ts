import passport from 'passport';

export const googleAuthenticator = passport.authenticate('google', { scope: ['profile', 'email'], session: true });
export const googleCallback = passport.authenticate('google', {
    successRedirect: 'https://www.google.com',
    failureRedirect: '/',
});
