
exports.up = async function(knex) {
  await knex.schema.dropTable('likes');

  if (!await knex.schema.hasTable('post_likes')) {
    await knex.schema.createTable('post_likes', t => {
      t.integer('post_id').unsigned();
      t.foreign('post_id').references('posts.id');

      t.integer('user_id').unsigned();
      t.foreign('user_id').references('users.id');
    })
  }

  if (!await knex.schema.hasTable('comment_likes')) {
    await knex.schema.createTable('comment_likes', t => {
      t.integer('comment_id').unsigned();
      t.foreign('comment_id').references('comments.id');

      t.integer('user_id').unsigned();
      t.foreign('user_id').references('users.id');
    })
  }
};

exports.down = async function(knex) {
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
