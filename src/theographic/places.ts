import { client } from "../db";

export const importPlaces = async () => {
  const placesJson = await Bun.file("data/theographic/places.json", {
    type: "application/json",
  }).json();

  await client.query(`
    DROP TABLE IF EXISTS place;

    CREATE TABLE place(
      id INT PRIMARY KEY,
      theographic_id TEXT,
      slug TEXT,
      status TEXT,
      display_title TEXT,
      ambiguous TEXT,
      duplicate_of TEXT,
      latitude NUMERIC,
      longitude NUMERIC,
      kjv_name TEXT,
      esv_name TEXT,
      feature_type TEXT,
      open_bible_lat NUMERIC,
      open_bible_long NUMERIC,
      root_id INT,
      precision TEXT,
      aliases TEXT,
      comment TEXT,
      dict_text TEXT
    );
    `);

  for (const originalPlace of placesJson) {
    const p = originalPlace.fields;

    const place = {
      id: p.placeID,
      slug: p.slug,
      status: p.status,
      display_title: p.displayTitle,
      ambiguous: p.ambiguous || null,
      duplicate_of: p.duplicate_of
        ? placesJson.find((pl: any) => pl.id === p.duplicate_of[0]).placeID
        : null,
      latitude: Number(p.latitude),
      longitude: Number(p.longitude),
      kjv_name: p.kjvName,
      esv_name: p.esvName,
      feature_type: p.featureType,
      open_bible_lat: Number(p.openBibleLat),
      open_bible_long: Number(p.openBibleLong),
      root_id: p.rootID
        ? placesJson.find((pl: any) => pl.id === p.rootID[0]).placeID
        : null,
      precision: p.precision,
      aliases: p.aliases,
      comment: p.comment,
      // verses,
      // verseCount,
      // eastons,
      dict_text: p.dictText ? p.dictText[0] : null,
      // recogito_uri: p.recogitoUri, //TODO: recogito table
      // recogito_lat: p.recogitoLat,
      // recogito_lon: p.recogitoLon,
      // peopleBorn,
      // peopleDied,
      // recogito_status: p.recogitoStatus,
      // recogito_comments: p.recogitoComments,
      // recogito_type: p.recogitoType,
      // recogito_label: p.recogitoLabel,
      // recogito_uid: p.recogitoUID,
      // booksWritten,
      // eventsHere,
      // alphaGroup,
    };

    const columns = Object.keys(place).join(",");
    const values = Object.values(place).map((e) =>
      e !== undefined ? e : null
    );
    const placeholders = values.map((_, i) => `$${i + 1}`).join(",");

    const query = `INSERT INTO place (${columns}) VALUES (${placeholders})`;
    console.log(values);
    await client.query(query, values);
  }
};

await importPlaces();
