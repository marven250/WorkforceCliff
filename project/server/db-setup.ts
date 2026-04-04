import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Database } from "sqlite";
import fs from "fs";

const migrations: string[] = [
  "CREATE TABLE providers (id int, name varchar(255), PRIMARY KEY (id));",
  'INSERT INTO providers (id, name) VALUES (1, "Strayer University");',
  'INSERT INTO providers (id, name) VALUES (2, "Capella University");',
  'INSERT INTO providers (id, name) VALUES (3, "Torrens University Australia");',

  "CREATE TABLE users (id int, name varchar(255), email varchar(100), PRIMARY KEY (id));",
  'INSERT INTO users (id, name, email) VALUES (1, "Charlie Monsoon", "Charlie@gmail.com");',
  'INSERT INTO users (id, name, email) VALUES (2, "Joseph Lee", "Joseph123@gmail.com");',
  'INSERT INTO users (id, name, email) VALUES (3, "Janet Grace", "Jgrace465@gmail.com");',

  "CREATE TABLE provider_integrations (id int, provider_id int, integration_type varchar(30) CHECK (integration_type IN ('none', 'redirect', 'sso')) DEFAULT 'none', redirect_url varchar(100), is_enabled BOOLEAN NOT NULL DEFAULT 0, PRIMARY KEY (id), FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE);",
  'INSERT INTO provider_integrations (id, provider_id, integration_type, redirect_url, is_enabled) VALUES (1, 1, "redirect", "https://www.strayer.edu/", true);',
  'INSERT INTO provider_integrations (id, provider_id, integration_type, redirect_url, is_enabled) VALUES (2, 2, "redirect", "https://www.capella.edu/", true);',
  'INSERT INTO provider_integrations (id, provider_id, integration_type, redirect_url, is_enabled) VALUES (3, 3, "redirect", "https://www.torrens.edu.au/", false);',

  "CREATE TABLE eligibility_submissions (id int, user_id int, provider_id int, status varchar(15) CHECK (status IN ('pending', 'eligible', 'ineligible')) DEFAULT 'pending', PRIMARY KEY (id),  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE);",
  'INSERT INTO eligibility_submissions (id, user_id, provider_id, status) VALUES (1, 1, 1, "pending");',
  'INSERT INTO eligibility_submissions (id, user_id, provider_id, status) VALUES (2, 2, 2, "eligible");',
  'INSERT INTO eligibility_submissions (id, user_id, provider_id, status) VALUES (3, 3, 3, "ineligible");',
  'INSERT INTO eligibility_submissions (id, user_id, provider_id, status) VALUES (4, 1, 3, "eligible");',
  'INSERT INTO eligibility_submissions (id, user_id, provider_id, status) VALUES (5, 1, 2, "ineligible");',
];

export const runDBMigrations = async (db: Database): Promise<Boolean> => {
  for (const stmt of migrations) {
    try {
      await db.run(stmt);
    } catch (err: unknown) {
      if (err instanceof Error) console.error(err.message);
    }
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
