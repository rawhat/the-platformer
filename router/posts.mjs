import express from 'express'

import { bigQuery, create, getBigQuery, remove, update } from '../models/post.mjs'
import { getUserByUsername } from "../models/user.mjs";

import { isAuthenticated } from "./user.mjs";
import { commentRouter } from "./comments.mjs";

const postRouter = express.Router();

postRouter.use(isAuthenticated);

postRouter.route('/posts')
  .get(async (req, res) => {
    const {username} = req.session;
    const user = await getUserByUsername(username).first();
    try {
      const data = await bigQuery(user.id);
      res.render('postlist', {
        curruser: username,
        data,
        title: "Posts",
      });
    } catch (err) {
      res.status(400).send(err);
    }
  })
  .post(async (req, res) => {
    const { username } = req.session;
    const { content } = req.body;

    const created = await create(username, content);
    res.send(created)
  });

postRouter.route('/posts/:postId')
  .get(async (req, res) => {
    const {postId} = req.params;
    const post = await getBigQuery().where({id: postId}).first();
    res.send({post});
  })
  .put(async (req, res) => {
    const { username } = req.cookies;
    const { newContent } = req.body;
    const { postId } = req.params;
    const updated = await update(username, postId, newContent);
    res.send(updated);
  })
  .delete(async (req, res) => {
    const {postId} = req.params;
    await remove(postId);
    res.sendStatus(204);
  });

postRouter.use("/posts/:postId/comments", commentRouter);

export { postRouter };
