import bcrypt from 'bcrypt';

import { db } from "./db.mjs";

const saltRounds = 10;

async function getHash(password) {
  return await bcrypt.hash(password, saltRounds);
}

async function create(username, password, email) {
  const hashed = await getHash(password);
  const created = await db('users')
    .insert({username, password: hashed, email}, ['id', 'username']);
  return created;
}

async function get(id) {
  const user = await db('users')
    .select('id', 'username', 'email')
    .where('id', id);
  return user;
}

async function authenticate(username, password) {
  const [user] = await db("users")
    .select('id', 'password')
    .where('username', username);

  if (!user) {
    return false
  }
  return await bcrypt.compare(password, user.password);
}

async function update(id, username, password, email) {
  const hashed = await getHash(password);
  const user = await db('users')
    .update({username, password: hashed, email})
    .where('id', id);
  return user;
}

export {
  authenticate,
  create,
  get,
  update
}
