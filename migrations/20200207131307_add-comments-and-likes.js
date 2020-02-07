exports.up = async function(knex) {
  if (!await knex.schema.hasTable('comments')) {
    await knex.schema.createTable('comments', (t) => {
      t.increments('id');
      t.integer('user_id').unsigned();
      t.foreign('user_id').references('users.id');
      t.string('content');
      t.datetime('posted_at');
    });
  }

  if (!await knex.schema.hasTable('likes')) {
    await knex.schema.createTable('likes', (t) => {
      t.integer('user_id').unsigned();
      t.foreign('user_id').references('users.id');
      t.integer('post_id').unsigned();
      t.foreign('post_id').references('posts.id');
      t.integer('comment_id').unsigned();
      t.foreign('comment_id').references('comments.id');
    });
  }
};

exports.down = async function(knex) {
  await knex.schema.dropTable('comments');
  await knex.schema.dropTable('likes');
};
