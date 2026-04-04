import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Database } from "sqlite";
import fs from "fs";

const migrations: string[] = [
  "CREATE TABLE provider (id int, name varchar(255), is_elligible BOOLEAN NOT NULL DEFAULT 0, PRIMARY KEY (id));",
  'INSERT INTO provider (id, name, is_elligible) VALUES (1, "Strayer University", true);',
  'INSERT INTO provider (id, name, is_elligible) VALUES (2, "Capella University", true);',
  'INSERT INTO provider (id, name, is_elligible) VALUES (3, "Torrens University Australia", false);',
];

export const runDBMigrations = async (db: Database): Promise<Boolean> => {
  for (const stmt of migrations) {
    await db.run(stmt);
  }

  return true;
};

export let db: Database<sqlite3.Database, sqlite3.Statement>;

(async () => {
  const runMigrations = !fs.existsSync("./db/assessment.db");

  // open the database
  db = await open({
    filename: "./db/assessment.db",
    driver: sqlite3.Database,
  });

  if (runMigrations) {
    await runDBMigrations(db);
  }
})();
