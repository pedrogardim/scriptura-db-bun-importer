import { client } from "../db";

export const importPeopleVerses = async () => {
  const peopleJson = await Bun.file("data/theographic/people.json", {
    type: "application/json",
  }).json();

  const versesJson = await Bun.file("data/theographic/verses.json", {
    type: "application/json",
  }).json();

  //   await client.query(`
  //         DROP TABLE IF EXISTS people_verses;

  //         CREATE TABLE people_verses(
  //             person_id int,
  //             verse_id int,
  //             CONSTRAINT fk_people
  //                 FOREIGN KEY(person_id)
  //                 REFERENCES people(id),
  //             CONSTRAINT fk_verses
  //                 FOREIGN KEY(verse_id)
  //                 REFERENCES verses(id)
  //         );
  //         `);

  let count = 0;

  for (const person of peopleJson) {
    for (const personVerse of person.fields?.verses || []) {
      const entry = {
        person_id: person.fields.personID,
        verse_id:
          versesJson.findIndex((verse: any) => verse.id === personVerse) + 1,
      };

      const columns = Object.keys(entry).join(",");
      const values = Object.values(entry);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(",");

      count++;
      //   console.log(values);
      //   const query = `INSERT INTO people_verses (${columns}) VALUES (${placeholders})`;
      //   client.query(query, values);
    }
  }

  console.log(count);

  //   check if info is consistent
  //   const relFromVerses = [];
  //   for (const verse of versesJson) {
  //     for (const versePeople of verse.fields?.people || []) {
  //       relFromVerses.push({
  //         verse_id: versesJson.findIndex((v) => v.id === verse.id) + 1,
  //         person_id: peopleJson.find((v) => v.id === versePeople).fields.personID,
  //       });
  //     }
  //   }
  //    console.log(relFromVerses.length); yep, it is the same
};

importPeopleVerses();
