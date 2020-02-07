import express from 'express'

import { bigQuery, create, remove, update } from '../models/post.mjs'

const postRouter = express.Router();

postRouter.route('/posts')
  .get(async (req, res) => {
    try {
      const posts = await bigQuery();
      res.render('postlist', {
        curruser: req.session.username,
        posts,
        title: "Posts",
      });
    } catch (err) {
      res.status(400).send(err);
    }
  })
  .post(async (req, res) => {
    const { username } = req.cookies;
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
