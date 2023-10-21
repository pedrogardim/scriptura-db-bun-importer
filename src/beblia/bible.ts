import { client } from "../db";
import convert from "xml-js";

export const importBibleVersion = async (version: string) => {
  const xml = await Bun.file(`data/beblia/${version}.xml`).text();
  var result = convert.xml2json(xml, { compact: true, spaces: 1 });
  const verses = JSON.parse(result)
    .bible.testament.map((t: any) => t.book)
    .flat(1)
    .map((t: any) => t.chapter)
    .flat(1)
    .map((t: any) => t.verse)
    .flat(1)
    .map((t: any) => t._text);

  await client.query(`
    DROP TABLE IF EXISTS bible_${version};

    CREATE TABLE bible_${version}(
      verse_id INT PRIMARY KEY,
      text TEXT,
      CONSTRAINT fk_verse
        FOREIGN KEY(verse_id)
        REFERENCES verses(id)
    );
  `);

  for (const verseIndex in verses) {
    const verseId = parseInt(verseIndex) + 1;
    const text = verses[verseIndex];
    const verse = {
      verse_id: verseId,
      text,
    };

    // console.log(verse);
    const res = await client.query(
      `INSERT INTO bible_${version} VALUES (${Object.values(verse)
        .map((e) => (typeof e === "string" ? `'${e}'` : e))
        .join(",")});`
    );
    console.log(verse.verse_id, verse.text, res.rowCount);
  }
};

importBibleVersion("es_rvr1960");
