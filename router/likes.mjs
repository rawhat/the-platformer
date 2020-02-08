import express from "express";

import { getUserByUsername } from "../models/user.mjs";
import { likeComment, likePost, unlikeComment, unlikePost } from "../models/likes.mjs";

const likeRouter = express.Router({mergeParams: true})

likeRouter.route("/posts/:postId/likes")
  .post(async (req, res) => {
    const {username} = req.session;
    const {postId} = req.params;

    try {
      await likePost(getUserByUsername(username), postId);

      res.send(204);
    } catch {
      res.send(400);
    }
  })
  .delete(async (req, res) => {
    const {username} = req.session;
    const {postId} = req.params;

    try {
      await unlikePost(getUserByUsername(username), postId);

      res.send(204);
    } catch {
      res.send(400);
    }
  });

likeRouter.route("/posts/:postId/comments/:commentId/likes")
  .post(async (req, res) => {
    const {username} = req.session;
    const {commentId} = req.params;

    try {
      await likeComment(getUserByUsername(username), commentId);

      res.send(204);
    } catch {
      res.send(400);
    }
  })
  .delete(async (req, res) => {
    const {username} = req.session;
    const {commentId} = req.params;

    try {
      await unlikeComment(getUserByUsername(username), commentId);

      res.send(204);
    } catch {
      res.send(400);
    }
  })

export { likeRouter };
