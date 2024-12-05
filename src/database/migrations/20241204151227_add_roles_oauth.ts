import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('users', (table) => {
        table.string('googleId');
        table.specificType('roles', 'text[]').defaultTo('{admin}');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('users', (table) => {
        table.dropColumn('googleId');
        table.dropColumn('roles');
    });
}
