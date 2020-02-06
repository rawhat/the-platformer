import dgraph from 'dgraph-js';
import grpc from 'grpc';

const DB_STRING = process.env.DB_STRING || "localhost:9080"

const stub = new dgraph.DgraphClientStub(
  DB_STRING,
  grpc.credentials.createInsecure()
);

const client = new dgraph.DgraphClient(stub);

export { client }
