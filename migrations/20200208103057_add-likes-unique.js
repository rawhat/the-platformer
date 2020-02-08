
exports.up = async function(knex) {
  await knex.schema.alterTable('post_likes', t => {
    t.unique(['user_id', 'post_id']);
  })

  await knex.schema.alterTable('comment_likes', t => {
    t.unique(['user_id', 'comment_id']);
  })
};

exports.down = async function(knex) {
  await knex.schema.alterTable('post_likes', t => {
    t.dropUnique(['user_id', 'post_id']);
  })

  await knex.schema.alterTable('comment_likes', t => {
    t.dropUnique(['user_id', 'comment_id']);
  })
};
