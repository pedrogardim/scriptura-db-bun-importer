import { client } from "../db";

export const importPeople = async () => {
  const peopleJson = await Bun.file("data/theographic/people.json", {
    type: "application/json",
  }).json();

  const periodsJson = await Bun.file("data/theographic/periods.json", {
    type: "application/json",
  }).json();

  await client.query(`
    DROP TABLE IF EXISTS people;

    CREATE TABLE people(
      id INT PRIMARY KEY,
      theographic_id TEXT,
      slug TEXT,
      gender TEXT,
      name TEXT,
      surname TEXT,
      display_name TEXT,
      alias TEXT,
      is_proper_name BOOLEAN,
      ambiguous BOOLEAN,
      disambiguation_temp TEXT,
      min_year INT,
      max_year INT,
      birth_year INT,
      death_year INT,
      status TEXT
    );
    `);

  for (const originalPerson of peopleJson) {
    const birthYearPeriod = periodsJson.find(
      (p: any) =>
        p.id ===
        (originalPerson.fields.birthYear && originalPerson.fields.birthYear[0])
    );
    const deathYearPeriod = periodsJson.find(
      (p: any) =>
        p.id ===
        (originalPerson.fields.deathYear && originalPerson.fields.deathYear[0])
    );

    const person = {
      id: originalPerson.fields.personID,
      theographic_id: originalPerson.id,
      slug: originalPerson.fields.slug || null,
      gender: originalPerson.fields.gender === "Female" ? "F" : "M",
      name: originalPerson.fields.name || null,
      surname: originalPerson.fields.surname || null,
      display_name: originalPerson.fields.displayTitle || null,
      alias: originalPerson.fields.alsoCalled || null,
      is_proper_name: !!originalPerson.fields.isProperName,
      ambiguous: !!originalPerson.fields.ambiguous,
      disambiguation_temp:
        originalPerson.fields["Disambiguation (temp)"] || null,
      min_year: originalPerson.fields.minYear || null,
      max_year: originalPerson.fields.maxYear || null,
      birth_year: birthYearPeriod?.fields?.isoYear || null,
      death_year: deathYearPeriod?.fields?.isoYear || null,
      status: originalPerson.fields.status || null,
    };

    const columns = Object.keys(person).join(",");
    const values = Object.values(person);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(",");

    const query = `INSERT INTO people (${columns}) VALUES (${placeholders})`;
    console.log(query, values);
    await client.query(query, values);
  }
};

importPeople();
