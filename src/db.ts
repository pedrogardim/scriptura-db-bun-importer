import { Client } from "pg";
export const client = new Client({
  connectionString: process.env.PG_CONNECTION_URL,
});

await client.connect();
