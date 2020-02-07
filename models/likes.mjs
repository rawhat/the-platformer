import { db } from "./db.mjs";

async function likePost(userId, postId) {
  await db
    .insert({
      user_id: userId,
      post_id: postId
    })
    .into('post_likes')
}

async function likeComment(userId, commentId) {
  await db
    .insert({
      user_id: userId,
      comment_id: commentId
    })
    .into('comment_likes')
}

export {
  likeComment,
  likePost,
}
