
exports.up = async function(knex) {
  await knex.schema.alterTable('comment_likes', t => {
    t.dropForeign('comment_id')
    t.foreign('comment_id').references('comments.id').onDelete('CASCADE');
  })

  await knex.schema.alterTable('post_likes', t => {
    t.dropForeign('post_id')
    t.foreign('post_id').references('posts.id').onDelete('CASCADE');
  })

  await knex.schema.alterTable('comments', t => {
    t.dropForeign('post_id')
    t.foreign('post_id').references('posts.id').onDelete('CASCADE');
  })
};

exports.down = async function(knex) {};
