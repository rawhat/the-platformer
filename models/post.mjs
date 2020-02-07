import { db } from "./db.mjs";
import { getUserByUsername } from "./user.mjs";

async function bigQuery() {
  const results = await db('posts')
    .leftJoin('comments', {'comments.post_id': 'posts.id'})
    .leftJoin('post_likes', {'posts.id': 'post_likes.post_id'})
    .leftJoin('users', function() {
      this
        .on({'comments.user_id': 'users.id'})
        .orOn({'posts.user_id': 'users.id'})
    })
    .leftJoin('comment_likes', {'comments.id': 'comment_likes.comment_id'})
    .select(
      'users.username as username',
      'users.id as user_id',
      'posts.id as post_id',
      'posts.content as post_content',
      'posts.user_id as poster',
      'posts.created as created',
      'comments.id as comment_id',
      'comments.content as comment_content',
      'comments.user_id as commenter',
      'comments.posted_at as commented_at',
    )
    .count('post_likes.id as post_likes')
    .count('comment_likes.id as comment_likes')
    .groupBy('posts.id')
    .groupBy('comments.id')
    .groupBy('users.id')
  return collectQueryResults(results);
}

async function list() {
  const posts = await db('posts');
  return posts;
}

async function create(username, content) {
  const createdAt = new Date().toISOString();
  const post = await db('posts')
    .insert({
      user_id: getUserByUsername(username),
      created: createdAt,
      content
    }, ['*'])
    .first();
  return post;
}

async function update(postId, username, content) {
  const post = await db('posts')
    .update({content}, ['*'])
    .where('user_id', getUserByUsername(username))
    .first();
  return post;
}

async function remove(id) {
  await db('posts').delete().where('id', id);
}

export {
  bigQuery,
  create,
  list,
  update,
  remove
}

/*
 * Sample result:
 * [
    {
      user_id: 1,
      username: 'rawhat',
      post_id: 1,
      post_content: 'this is a test post!',
      poster: 1,
      created: 2020-02-07T17:33:47.183Z,
      comment_id: 1,
      comment_content: 'this is a test comment',
      commenter: 1,
      commented_at: 2020-02-07T19:09:00.265Z,
      post_likes: '0',
      comment_likes: '0'
    },
*/
function collectQueryResults(results) {
  const comments = {};
  const posts = {};
  const users = {};

  for (const row of results) {
    const comment = getCommentFromRow(row);
    const post = getPostFromRow(row);
    const user = getUserFromRow(row);
  }

  return {
    comments,
    posts,
    users,
  }
}

function getCommentFromRow(row) {
}

function getUserFromRow(row) {
}

function getPostFromRow(row) {
}
