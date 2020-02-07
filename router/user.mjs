import express from 'express';

import { authenticate, create, get, update } from "../models/user.mjs";

const userRouter = express.Router();

userRouter.route('/users')
  .post(async (req, res) => {
    try {
      const {email, password, username} = req.body;
      const [created] = await create(username, password, email);
      res.send(created);
    } catch (err) {
      res.status(400).send({error: err});
    }
  })
  .patch(async (req, res) => {
    try {
      const {username, password, email} = req.body;
      const updated = await update(username, pass, email);
      return updated;
    } catch (err) {
      res.status(400).send({error: err});
    }
  })

userRouter.route('/login')
  .post(async (req, res) => {
    try {
      const {username, password} = req.body;
      const authed = await authenticate(username, password);
      if (authed) {
        res.status(200).end();
      } else {
        res.status(403).send({error: "Not authorized"});
      }
    } catch (err) {
      res.status(400).send({error: err})
    }
  })

export { userRouter }