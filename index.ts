import { client } from "./src/db";

const res = await client.query(
  "SELECT * from book_divisions WHERE book_divisions.testament = 'ot'"
);

console.log(res.rows);
await client.end();
