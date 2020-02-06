//import * as knex from "knex"
const knex = require('knex');
//import { db } from "../models/db.mjs";

exports.up = async function(knex) {
  try {
    const exists = await knex.schema.hasTable('posts');
    if (!exists) {
      return await knex.schema.createTable('posts', (table) => {
        table.increments('id');
        table.integer('user_id')
          .unsigned()
          .references('users.id');
        table.string('content');
        table.datetime('created');
      })
    }
  } catch (err) {
    console.error("Error running migration", err);
  }
};

exports.down = async function(knex) {
  await knex.schema.dropTable('posts');
};
