import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Client } = pg;
console.log(process.env.PG_USER, process.env.PG_HOST, process.env.PG_DATABASE, process.env.PG_PASSWORD, process.env.PG_PORT);

const client = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

async function migrate() {
  await client.connect();
  console.log("Connected to database");

  try {
    await client.query("BEGIN");

    // ---------------------------------------------------------
    // TABLES
    // ---------------------------------------------------------

    await client.query(`
      CREATE TABLE users (
        id                VARCHAR        PRIMARY KEY,
        username          VARCHAR,
        access_token_hash VARCHAR        UNIQUE NOT NULL,
        created_at        TIMESTAMPTZ    DEFAULT now() NOT NULL
      )
    `);
    console.log("Created table: users");

    await client.query(`
      CREATE TABLE tracks (
        id          VARCHAR     PRIMARY KEY,
        name        VARCHAR     NOT NULL,
        artist      VARCHAR     NOT NULL,
        preview_url VARCHAR,
        images      TEXT[],
        spotify_url VARCHAR,
        created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
      )
    `);
    console.log("Created table: tracks");

    await client.query(`
      CREATE TABLE searches (
        id          SERIAL      PRIMARY KEY,
        track_id    VARCHAR     NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
        user_id     VARCHAR     REFERENCES users(id)  ON DELETE CASCADE,
        searched_at TIMESTAMPTZ DEFAULT now() NOT NULL
      )
    `);
    console.log("Created table: searches");

    // ---------------------------------------------------------
    // INDEXES
    // ---------------------------------------------------------

    await client.query(`
      CREATE INDEX idx_searches_user_searched
        ON searches(user_id, searched_at DESC)
    `);

    await client.query(`
      CREATE INDEX idx_searches_anon_searched
        ON searches(searched_at DESC)
        WHERE user_id IS NULL
    `);
    console.log("Created indexes");

    // ---------------------------------------------------------
    // CAP TRIGGER: 50 per user (logged-in)
    // ---------------------------------------------------------

    await client.query(`
        CREATE OR REPLACE FUNCTION cap_searches()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW.user_id IS NOT NULL THEN
            DELETE FROM searches
            WHERE user_id = NEW.user_id
              AND id NOT IN (
                SELECT id FROM searches
                WHERE user_id = NEW.user_id
                ORDER BY searched_at DESC
                LIMIT 50
              );
          ELSE
            DELETE FROM searches
            WHERE user_id IS NULL
              AND id NOT IN (
                SELECT id FROM searches
                WHERE user_id IS NULL
                ORDER BY searched_at DESC
                LIMIT 50
              );
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `);
   
      await client.query(`
        CREATE TRIGGER enforce_searches_cap
          AFTER INSERT ON searches
          FOR EACH ROW
          EXECUTE FUNCTION cap_searches()
      `);
      console.log("Created trigger: enforce_searches_cap");

    await client.query("COMMIT");
    console.log("Migration complete");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed, rolled back:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();