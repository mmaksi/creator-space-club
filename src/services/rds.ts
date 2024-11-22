import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

const sslCert = fs.readFileSync(path.join(__dirname, '..', '..', 'eu-north-1-bundle.pem'));

// Configuration details
const client = new Client({
    host: process.env.DEV_POSTGRES_URL,
    port: 5432,
    user: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: 'postgres',
    ssl: {
        rejectUnauthorized: config.isProduction ? true : false,
        ca: sslCert,
    },
});

// Connect to PostgreSQL
export const connectToRDS = async () => {
    await client
        .connect()
        .then(() => console.warn('Connected to PostgreSQL RDS'))
        .catch((err: Error) => console.error('Connection error', err.message))
        .finally(() => client.end());
};
