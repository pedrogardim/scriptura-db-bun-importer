import { client } from "../db";

const theographicBookExample = {
  id: "recMApftYXBHE8lV5",
  createdTime: "2018-05-22T19:36:23.000Z",
  fields: {
    osisName: "3John",
    bookName: "3 John",
    bookDiv: "General Epistles",
    shortName: "3Jn",
    bookOrder: 64,
    verses: ["recQEgzU2qUisV8cc", "recjJZ3fXYtHKaKjg", "rec5USXY8XKMq52R5"],
    chapters: ["recC7eHfosTXlVT5U"],
    testament: "New Testament",
    chapterCount: 1,
    verseCount: 14,
    writers: ["john_1677"],
    slug: "3john",
    peopleCount: 4,
    placeCount: 0,
  },
};

export type Book = typeof theographicBookExample;

const testamentMap = {
  "Old Testament": "ot",
  "New Testament": "nt",
};
export const importBooks = async () => {
  const books = Bun.file("data/theographic/books.json", {
    type: "application/json",
  });
  let jsonBooks = await books.json();

  const divisions: string[] = [];

  jsonBooks.forEach((book: Book) => {
    if (divisions.includes(book.fields.bookDiv)) return;
    divisions.push(book.fields.bookDiv);
  });

  let query = `
  DROP TABLE IF EXISTS books;

  CREATE TABLE books(
	id INT PRIMARY KEY, 
	theographic_id text,
    code text,
    division_id INT,
    testament text,
    name text,
    short_name text,
    chapter_count INT,
    verse_count INT,
    people_count INT,
    place_count INT,
    writters text[]
);

INSERT INTO books(
    theographic_id, 
    code, 
    division_id, 
    testament, 
    name, 
    short_name, 
    chapter_count, 
    verse_count, 
    people_count, 
    place_count, 
    writters
    ) 

    VALUES 
  `;

  const newBooks = jsonBooks.map((book: Book) => {
    const newBook: any = {
      id: book.fields.bookOrder,
      theographic_id: book.id,
      code: book.fields.slug,
      division_id: divisions.indexOf(book.fields.bookDiv) + 1,
      testament:
        testamentMap[book.fields.testament as keyof typeof testamentMap],
      name: book.fields.bookName,
      short_name: book.fields.shortName,
      chapter_count: book.fields.chapterCount,
      verse_count: book.fields.verseCount,
      people_count: book.fields.peopleCount,
      place_count: book.fields.placeCount,
      writters: book.fields.writers.filter((w) => w),
    };

    query += `(${Object.values(newBook)
      .slice(1, -1)
      .map((e) => (typeof e === "string" ? `'${e}'` : e))
      .join(",")},ARRAY['${newBook.writters.join("','")}']),`;

    return newBook;
  });

  query = query.slice(0, -1) + ";";

  const res = await client.query(query);
  console.log(res);
};
