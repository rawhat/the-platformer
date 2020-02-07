exports.up = async function(knex) {
  try {
    if (!await knex.schema.hasTable('users')) {
      await knex.schema.createTable('users', (table) => {
        table.increments('id');
        table.string('username');
        table.string('password')
        table.string('email');
      });
    }

    if (!await knex.schema.hasTable('posts')) {
      await knex.schema.createTable('posts', (table) => {
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
  await knex.schema.dropTable('users');
  await knex.schema.dropTable('posts');
};
