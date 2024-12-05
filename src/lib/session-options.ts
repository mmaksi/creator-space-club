import { config } from '../config';

const sessionOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    signed: true,
    keys: [config.session.secret1, config.session.secret2],
    secure: config.isProduction,
};

export default sessionOptions;
