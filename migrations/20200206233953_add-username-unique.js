
exports.up = async function(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.unique('username')
  })
};

exports.down = async function(knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropUnique('username');
  })
};
