
exports.up = async function(knex) {
  await knex.schema.table('comments', (t) => {
    t.integer('post_id').unsigned();
    t.foreign('post_id').references('posts.id');
  })
};

exports.down = async function(knex) {
  await knex.schema.table('comments', (t) => {
    t.dropColumn('post_id');
  })
};
