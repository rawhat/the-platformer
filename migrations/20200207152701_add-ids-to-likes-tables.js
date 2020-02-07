
exports.up = async function(knex) {
  await knex.schema.table('post_likes', t => {
    t.increments('id');
  });

  await knex.schema.table('comment_likes', t => {
    t.increments('id');
  });
};

exports.down = async function(knex) {
  await knex.schema.table('post_likes', t => {
    t.dropColumn('id');
  });
  await knex.schema.table('comment_likes', t => {
    t.dropColumn('id');
  });
};
