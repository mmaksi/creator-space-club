/* eslint-disable no-console */
import knex, { Knex } from 'knex';
import dbConfig from '../../knexfile';
import { config } from '../config';

const environment = config.env;
const knexConfig = dbConfig[environment] as Knex.Config;

if (!knexConfig) {
    throw new Error(`Invalid environment: ${environment}. Check your knexfile.ts configuration.`);
}

// Create and verify database connection
const database = knex(knexConfig);

export async function connectToRDS(): Promise<void> {
    try {
        await database.raw('SELECT 1');
        console.log('✅ Successfully connected to RDS PostgreSQL database');
    } catch (error) {
        console.error('❌ Failed to connect to RDS PostgreSQL database:', error);
        process.exit(1);
    }
}

export const db = database;
