import knex from 'knex'

export const db = knex({
  client: 'pg',
  version: '10',
  connection: () => ({
    host: process.env.DB_STRING || "localhost:5432",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "postgres",
    database: process.env.DB_NAME || "platformer-local",
  })
})
