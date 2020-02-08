import express from 'express'

import { bigQuery, create, remove, update } from '../models/post.mjs'

import { isAuthenticated } from "./user.mjs";

const postRouter = express.Router();

postRouter.use(isAuthenticated);

postRouter.route('/posts')
  .get(async (req, res) => {
    try {
      const data = await bigQuery();
      res.render('postlist', {
        curruser: req.session.username,
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

export { postRouter };
