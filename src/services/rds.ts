import { Client } from 'pg';

// Configuration details
const client = new Client({
    host: process.env.DEV_POSTGRES_URL,
    port: 5432,
    user: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: 'postgres',
});

// Connect to PostgreSQL
export const connectToRDS = async () => {
    await client.connect()
        .then(() => console.log('Connected to PostgreSQL RDS'))
        .catch((err: any) => console.error('Connection error', err.message))
        .finally(() => client.end());
};
