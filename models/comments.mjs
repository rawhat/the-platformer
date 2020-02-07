import { db } from "./db.mjs";

async function getComments(postId) {
  const comments = await db
    .select(
      'posts.id as post_id',
      'users.username as username',
      'comments.id as comment_id',
      'comments.content as content',
      'posted_at',
    )
    .from('comments')
    .join('users', {'comments.user_id': 'users.id'})
    .join('posts', {'comments.post_id': 'posts.id'})
  return comments;
}

async function addComment(postId, userId, content) {
  const postedAt = new Date().toISOString();

  const comment = await db
    .insert({
      post_id: postId,
      user_id: userId,
      content,
      posted_at: postedAt
    }, ['*'])
    .into('comments')
    .first();
  return comment;
}

async function editComment(commentId, content) {
  const comment = await db
    .update({content}, ['*'])
    .where('id', commentId)
    .from('comments');
  return comment;
}

export {
  addComment,
  editComment,
  getComments,
}
