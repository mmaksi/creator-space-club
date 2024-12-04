import { config } from '../config';

const sessionOptions = {
    httpOnly: true,
    signed: true,
    keys: [config.session.secret1, config.session.secret2],
    secure: config.isProduction,
};

export default sessionOptions;
