// Load environment variables based on NODE_ENV
import path from 'path';
import dotenv from 'dotenv';
const environment = process.env.NODE_ENV || 'development';
const envFile = environment === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

interface Config {
    env: string;
    isProduction: boolean;
    port: number;
    mailgun: {
        key: string;
        domain: string;
        list: string;
    };
    postgres: {
        uri: string;
        username: string;
        password: string;
    };
    // Add other configuration categories as needed
}

const validateEnvVariables = (envVars: NodeJS.ProcessEnv): void => {
    const required = {
        production: ['MAILGUN_API_KEY', 'MAILGUN_DOMAIN', 'MAILGUN_LIST', 'POSTGRES_URL'],
        development: ['DEV_MAILGUN_API_KEY', 'DEV_MAILGUN_DOMAIN', 'DEV_MAILGUN_LIST', 'DEV_POSTGRES_URL'],
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

const getConfig = (): Config => {
    validateEnvVariables(process.env);

    const environment = process.env.NODE_ENV || 'development';
    const isProduction = environment === 'production';

    return {
        env: environment,
        isProduction,
        port: parseInt(isProduction ? process.env.SERVER_PORT || process.env.PORT || '8080' : '4000', 10),
        mailgun: {
            key: isProduction ? process.env.MAILGUN_API_KEY! : process.env.DEV_MAILGUN_API_KEY!,
            domain: isProduction ? process.env.MAILGUN_DOMAIN! : process.env.DEV_MAILGUN_DOMAIN!,
            list: isProduction ? process.env.MAILGUN_LIST! : process.env.DEV_MAILGUN_LIST!,
        },
        postgres: {
            uri: isProduction ? process.env.DEV_POSTGRES_URL! : process.env.POSTGRES_URL!,
            username: isProduction ? process.env.DEV_DB_USERNAME! : process.env.POSTGRES_URL!,
            password: isProduction ? process.env.DEV_DB_PASSWORD! : process.env.POSTGRES_URL!,
        },
    };
};

export const config = getConfig();
