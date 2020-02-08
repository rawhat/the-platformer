import express from "express";

import { addComment, deleteComment, editComment, getComments } from "../models/comments.mjs";
import { getUserByUsername } from "../models/user.mjs";

const commentRouter = express.Router({mergeParams: true});

commentRouter.route("/")
  .get(async (req, res) => {
    const {postId} = req.params;
    const comments = await getComments(postId);
    res.send({comments});
  })
  .post(async (req, res) => {
    const {postId} = req.params;
    const {content} = req.body;
    const {username} = req.session;
    try {
      const comment =
        await addComment(postId, getUserByUsername(username), content);
      //console.log('got comment', comment)
      res.send({comment});
    } catch (err) {
      console.error('err adding comment', err)
      res.status(400).send({err: "Could not create comment"});
    }
  })

commentRouter.route("/:commentId")
  .put(async (req, res) => {
    const {commentId} = req.params;
    const {content} = req.body;
    const updated = await editComment(commentId, content);
    res.send({updated});
  })
  .delete(async (req, res) => {
    const {commentId} = req.params;
    await deleteComment(commentId);
    res.send(204);
  })

export { commentRouter };
