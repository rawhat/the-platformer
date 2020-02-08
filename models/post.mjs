import { db } from "./db.mjs";
import { getUserByUsername } from "./user.mjs";

function getBigQuery() {
  return db('posts')
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
    .groupBy('users.id');
}

async function bigQuery(userId) {
  const results = await getBigQuery();
  const queryResults = collectQueryResults(userId, results);
  console.log(queryResults);
  return queryResults;
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
    }, ['*']);
  return post;
}

async function update(postId, username, content) {
  const post = await db('posts')
    .update({content}, ['*'])
    .where('user_id', getUserByUsername(username));
  return post;
}

async function remove(id) {
  await db('posts').delete().where('id', id);
}

export {
  bigQuery,
  create,
  getBigQuery,
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
function collectQueryResults(userId, results) {
  const initial = {comments: {}, posts: {}, users: {}}

  return results.reduce(({comments, posts, users}, row) => {
    let comment = getCommentFromRow(userId, row);
    let post = getPostFromRow(userId, row);
    let user = getUserFromRow(row);

    let commentIds = [];
    if (comment) {
      if (post.id in posts) {
        commentIds = posts[post.id].commentIds.concat(commentIds);
      } else {
        commentIds = [comment.id];
      }
    }

    let postToUpdate = {
      ...posts[post.id] || post,
      commentIds
    }

    return {
      comments: updateById(comments, comment),
      users: updateById(users, user),
      posts: updateById(posts, postToUpdate),
    }
  }, initial)
}

function updateById(coll, obj) {
  if (!obj) {
    return coll;
  }
  return {
    ...coll,
    [obj.id]: obj
  }
}

function getCommentFromRow(userId, row) {
  const {
    comment_id: id,
    comment_content: content,
    commenter: commenterId,
    commented_at: posted,
    comment_likes: likes,
    post_id: postId,
  } = row;

  if (!id || !content || !commenterId || !posted || !likes) {
    return null;
  }

  return {
    id,
    content,
    posted,
    likes: parseInt(likes),
    userId: commenterId,
    postId,
    editable: commenterId === userId,
  }
}

function getUserFromRow(row) {
  const {user_id, username} = row;
  return {
    id: user_id,
    username,
  }
}

function getPostFromRow(userId, row) {
  const {
    post_id: id,
    post_content: content,
    post_likes: likes,
    poster: posterId,
    created
  } = row;

  return {
    id,
    content,
    likes,
    userId: posterId,
    created,
    editable: posterId === userId,
  }
}
