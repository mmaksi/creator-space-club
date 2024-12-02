import fs from 'fs';
import path from 'path';
import type { Knex } from 'knex';
import { config } from './src/config';

const sslCert = fs.readFileSync(path.join(__dirname, 'us-east-1-bundle.pem'));

const dbConfig: { [key: string]: Knex.Config } = {
    development: {
        client: 'postgresql',
        connection: {
            host: config.postgres.host,
            port: 5432,
            database: config.postgres.db_name,
            user: config.postgres.username,
            password: config.postgres.password,
            ssl: {
                rejectUnauthorized: false,
                ca: sslCert,
            },
        },
        migrations: {
            directory: './src/database/migrations',
        },
    },
};

export default dbConfig;
