/* eslint-disable no-console */
// Load environment variables based on NODE_ENV
import path from 'path';
import dotenv from 'dotenv';
const environment = process.env.NODE_ENV || 'development';
const envFile = environment === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

interface IConfig {
    env: string;
    isProduction: boolean;
    port: number;
    session: {
        secret1: string;
        secret2: string;
    };
    google: {
        clientId: string;
        clientSecret: string;
    };
    jwt: {
        accessToken: string;
        refreshToken: string;
    };
    mailgun: {
        key: string;
        domain: string;
        list: string;
    };
    postgres: {
        host: string;
        db_name: string;
        username: string;
        password: string;
    };
    // Add other configuration categories as needed
}

const validateEnvVariables = (envVars: NodeJS.ProcessEnv): void => {
    const required = {
        production: [
            'GOOGLE_CLIENT_ID',
            'GOOGLE_CLIENT_SECRET',
            'MAILGUN_API_KEY',
            'MAILGUN_DOMAIN',
            'MAILGUN_LIST',
            'POSTGRES_URL',
            'DB_USERNAME',
            'DB_NAME',
            'DB_PASSWORD',
            'JWT_ACCESS_KEY',
            'JWT_REFRESH_KEY',
            'SESSION_SECRET_1',
            'SESSION_SECRET_2',
        ],
        development: [
            'DEV_GOOGLE_CLIENT_ID',
            'DEV_GOOGLE_CLIENT_SECRET',
            'DEV_MAILGUN_API_KEY',
            'DEV_MAILGUN_DOMAIN',
            'DEV_MAILGUN_LIST',
            'DEV_URL',
            'DEV_NAME',
            'DEV_USERNAME',
            'DEV_PASSWORD',
            'DEV_JWT_ACCESS_KEY',
            'DEV_JWT_REFRESH_KEY',
            'DEV_SESSION_SECRET_1',
            'DEV_SESSION_SECRET_2',
        ],
    };

    const environment = envVars.NODE_ENV || 'development';
    const requiredVars = required[environment === 'production' ? 'production' : 'development'];

    const missing = requiredVars.filter((key) => !envVars[key]);
    if (missing.length > 0) {
        console.error('❌ Environment configuration is invalid.');
        throw new Error(`Missing required environment variables for ${environment}: ${missing.join(', ')}`);
    } else {
        console.log('✅ Environment configuration is valid');
        console.log('Current environment:', environment);
    }
};

const getConfig = (): IConfig => {
    validateEnvVariables(process.env);

    const environment = process.env.NODE_ENV || 'development';
    const isProduction = environment === 'production';

    return {
        env: environment,
        isProduction,
        port: parseInt(isProduction ? process.env.PORT || '8080' : '3000', 10),
        google: {
            clientId: isProduction ? process.env.GOOGLE_CLIENT_ID! : process.env.DEV_GOOGLE_CLIENT_ID!,
            clientSecret: isProduction ? process.env.GOOGLE_CLIENT_SECRET! : process.env.DEV_GOOGLE_CLIENT_SECRET!,
        },
        session: {
            secret1: isProduction ? process.env.SESSION_SECRET_1! : process.env.DEV_SESSION_SECRET_1!,
            secret2: isProduction ? process.env.SESSION_SECRET_2! : process.env.DEV_SESSION_SECRET_2!,
        },
        jwt: {
            accessToken: isProduction ? process.env.JWT_ACCESS_KEY! : process.env.DEV_JWT_ACCESS_KEY!,
            refreshToken: isProduction ? process.env.JWT_REFRESH_KEY! : process.env.DEV_JWT_REFRESH_KEY!,
        },
        mailgun: {
            key: isProduction ? process.env.MAILGUN_API_KEY! : process.env.DEV_MAILGUN_API_KEY!,
            domain: isProduction ? process.env.MAILGUN_DOMAIN! : process.env.DEV_MAILGUN_DOMAIN!,
            list: isProduction ? process.env.MAILGUN_LIST! : process.env.DEV_MAILGUN_LIST!,
        },
        postgres: {
            host: isProduction ? process.env.URL! : process.env.DEV_URL!,
            db_name: isProduction ? process.env.NAME! : process.env.DEV_NAME!,
            username: isProduction ? process.env.USERNAME! : process.env.DEV_USERNAME!,
            password: isProduction ? process.env.PASSWORD! : process.env.DEV_PASSWORD!,
        },
    };
};

export const config = getConfig();
