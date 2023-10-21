import { client } from "../db";

export const importVerses = async () => {
  const versesJson = await Bun.file("data/theographic/verses.json", {
    type: "application/json",
  }).json();
  const chaptersJson = await Bun.file("data/theographic/chapters.json", {
    type: "application/json",
  }).json();
  const booksJson = await Bun.file("data/theographic/books.json", {
    type: "application/json",
  }).json();

  const chapterIdArray = chaptersJson.map((e) => e.id);
  const bookIdArray = booksJson.map((e) => e.id);

  // CREATE TABLE verses(
  //   id INT PRIMARY KEY,
  //   theographic_id TEXT,
  //   book_id INT,
  //   chapter_num INT,
  //   verse_num INT,
  //   verse_code INT,
  //   year_written INT,
  //   CONSTRAINT fk_book
  //     FOREIGN KEY(book_id)
  //       REFERENCES books(id)
  // );
  // `);

  for (const verseIndex in versesJson) {
    const verseId = parseInt(verseIndex) + 1;
    const jsonVerse = versesJson[verseIndex];
    const verse = {
      id: verseId,
      theographic_id: jsonVerse.id,
      book_id: bookIdArray.indexOf(jsonVerse.fields.book[0]) + 1,
      chapter_num: chaptersJson.find(
        (e) => e.id === jsonVerse.fields.chapter[0]
      ).fields.chapterNum,
      verse_num: parseInt(jsonVerse.fields.verseNum),
      verse_code: jsonVerse.fields.verseID,
      year_written: jsonVerse.fields.yearNum || "null",
    };

    // console.log(verse);
    const res = await client.query(
      `INSERT INTO verses VALUES (${Object.values(verse)
        .map((e) => (typeof e === "string" && e !== "null" ? `'${e}'` : e))
        .join(",")});`
    );
    console.log(verse.id, verse.verse_code, res.rowCount);
  }
};
export const importBibleVersion = async () => {
  const versesJson = await Bun.file("data/theographic/verses.json", {
    type: "application/json",
  }).json();

  // await client.query(`
  //   DROP TABLE IF EXISTS bible_en_kjv;

  //   CREATE TABLE bible_en_kjv(
  //     verse_id INT PRIMARY KEY,
  //     text TEXT,
  //     CONSTRAINT fk_verse
  //       FOREIGN KEY(verse_id)
  //       REFERENCES verses(id)
  //   );
  // `);

  for (const verseIndex in versesJson) {
    const verseId = parseInt(verseIndex) + 1;
    const jsonVerse = versesJson[verseIndex];
    const verse = {
      verse_id: verseId,
      text: jsonVerse.fields.verseText,
    };

    // console.log(verse);
    const res = await client.query(
      `INSERT INTO bible_en_kjv VALUES (${Object.values(verse)
        .map((e) => (typeof e === "string" ? `'${e}'` : e))
        .join(",")});`
    );
    console.log(verse.verse_id, verse.text, res.rowCount);
  }
};
