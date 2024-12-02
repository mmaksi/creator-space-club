import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('users', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        // table.string('first_name');
        // table.string('last_name');
        // table.boolean('is_active').defaultTo(true);
        // table.boolean('is_verified').defaultTo(false);
        // table.string('role').defaultTo('user');
        // table.timestamp('created_at').defaultTo(knex.fn.now());
        // table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('users');
}
