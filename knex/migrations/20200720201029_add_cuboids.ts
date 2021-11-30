import { Knex } from 'knex';
import { Bag, Cuboid } from '../../src/models';

export const up = (knex: Knex): Promise<void> =>
  knex.schema.createTable(Cuboid.tableName, (table: Knex.TableBuilder) => {
    table.increments();
    table.timestamps();
    table.integer('width');
    table.integer('height');
    table.integer('depth');
    table.integer('bagId');
    table.integer('volume');
    table.foreign('bagId').references('id').inTable(Bag.tableName);
  });

export const down = (knex: Knex): Promise<void> =>
  knex.schema.dropTable(Cuboid.tableName);
