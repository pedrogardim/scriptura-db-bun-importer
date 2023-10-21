import { client } from "./src/db";
import { importVerses } from "./src/theographic/verses";
import { importBooks } from "./src/theographic/books";
await importVerses();
// await importBooks();
await client.end();
