import { client } from "../db";

export const importPeopleVerses = async () => {
  const placeJson = await Bun.file("data/theographic/places.json", {
    type: "application/json",
  }).json();

  const versesJson = await Bun.file("data/theographic/verses.json", {
    type: "application/json",
  }).json();

  await client.query(`
          DROP TABLE IF EXISTS place_verse;

          CREATE TABLE place_verse(
              place_id int,
              verse_id int,
              CONSTRAINT fk_place
                  FOREIGN KEY(place_id)
                  REFERENCES place(id),
              CONSTRAINT fk_verse
                  FOREIGN KEY(verse_id)
                  REFERENCES verse(id)
          );
          `);

  let count = 0;

  for (const place of placeJson) {
    for (const placeVerse of place.fields?.verses || []) {
      const entry = {
        place_id: place.fields.placeID,
        verse_id:
          versesJson.findIndex((verse: any) => verse.id === placeVerse) + 1,
      };

      const columns = Object.keys(entry).join(",");
      const values = Object.values(entry);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(",");

      count++;
      const query = `INSERT INTO place_verse (${columns}) VALUES (${placeholders})`;
      client.query(query, values);
    }
  }

  console.log(count);

  //   check if info is consistent
  //   const relFromVerses = [];
  //   for (const verse of versesJson) {
  //     for (const versePeople of verse.fields?.people || []) {
  //       relFromVerses.push({
  //         verse_id: versesJson.findIndex((v) => v.id === verse.id) + 1,
  //         place_id: placeJson.find((v) => v.id === versePeople).fields.placeID,
  //       });
  //     }
  //   }
  //    console.log(relFromVerses.length); yep, it is the same
};

importPeopleVerses();
