import { client } from "./db.mjs";

const listQuery = `all() {
  all() {
    id
    content
  }
}
`
async function list() {
  const res = await client.newTxn().query(listQuery);
  const posts = res.getJson();
  return posts;
}

async function create(username, content) {
  const created = new Date().getTime() / 1000;

  return {
    username,
    content,
    created
  }
}

async function update(username, postId, content) {
  return {
    username,
    content
  }
}

async function remove(id) {
  return
}

export {
  create,
  list,
  update,
  remove
}
