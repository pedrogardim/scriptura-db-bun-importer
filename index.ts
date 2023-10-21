import { client } from "./src/db";
import { importBibleVersion } from "./src/theographic/verses";
import { importBooks } from "./src/theographic/books";
await importBibleVersion();
// await importBooks();
await client.end();
