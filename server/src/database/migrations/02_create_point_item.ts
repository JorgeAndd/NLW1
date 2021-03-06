import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('Point_Item', table => {
    table.increments('id').primary();
    table.integer('point_id')
      .notNullable()
      .references('id')
      .inTable('Point');

    table.integer('item_id')
      .notNullable()
      .references('id')
      .inTable('Item');
  });

}

export async function down(knex: Knex) {
  return knex.schema.dropTable('Point_Item');
}