import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from '../config';
import { googleSignIn } from '../models/users/users.model';

const googleStrategy = new GoogleStrategy(
    {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: '/api/auth/google/callback',
        proxy: true,
    },
    googleSignIn
);

export { googleStrategy };
