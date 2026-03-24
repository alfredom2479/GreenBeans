import pg from "pg";
import crypto from "crypto";
import dotenv from "dotenv";

const { Pool } = pg;

dotenv.config();

// ---------------------------------------------------------
// TYPES
// ---------------------------------------------------------

export type User = {
  id: string;
  username: string | null;
  access_token_hash: string;
  created_at: Date;
};

export type Track = {
  id: string;
  name: string;
  artist: string;
  preview_url: string | null;
  image: string[] | null;
  spotify_url: string | null;
  created_at: Date;
};

export type Search = {
  id: number;
  track_id: string;
  user_id: string | null;
  searched_at: Date;
};

// ---------------------------------------------------------
// POOL
// ---------------------------------------------------------

const createPool = () =>
  new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: Number(process.env.PG_PORT),
  });

let pool = createPool();

const MAX_RETRIES: number = 5;
const RETRY_DELAY: number = 5000;

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

export const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

// ---------------------------------------------------------
// USERS
// ---------------------------------------------------------

export const getUserByTokenHash = async (
  tokenHash: string
): Promise<User | null> => {
  try {
    const res = await pool.query(
      "SELECT * FROM users WHERE access_token_hash = $1",
      [tokenHash]
    );
    return res.rows.length > 0 ? res.rows[0] : null;
  } catch (err) {
    console.error("Error in getUserByTokenHash:", err);
    return null;
  }
};



export const createUser = async (
  id: string,
  username: string | null,
  accessTokenHash: string
): Promise<boolean> => {
  try {
    await pool.query(
      `INSERT INTO users (id, username, access_token_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET
       username = EXCLUDED.username,
       access_token_hash = EXCLUDED.access_token_hash`,
        [id, username, accessTokenHash]);
    console.log("User created:", id);
    return true;
  } catch (err) {
    console.error("Error in createUser:", err);
    return false;
  }
};

export const updateUserTokenHash = async (
  spotifyUserId: string,
  newTokenHash: string
): Promise<boolean> => {
  try {
    await pool.query(
      "UPDATE users SET access_token_hash = $1 WHERE id = $2",
      [newTokenHash, spotifyUserId]
    );
    return true;
  } catch (err) {
    console.error("Error in updateUserTokenHash:", err);
    return false;
  }
};

// ---------------------------------------------------------
// TRACKS
// ---------------------------------------------------------

export const storeTrack = async (track: Track): Promise<boolean> => {
  try {
    await pool.query(
      `INSERT INTO tracks (id, name, artist, preview_url, images, spotify_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        track.id,
        track.name,
        track.artist,
        track.preview_url,
        track.image,
        track.spotify_url,
      ]
    );
    return true;
  } catch (err) {
    console.error("Error in storeTrack:", err);
    return false;
  }
};

// ---------------------------------------------------------
// SEARCHES
// ---------------------------------------------------------

export const storeSearch = async (
  trackId: string,
  userId: string | null
): Promise<boolean> => {
  try {
    if (userId !== null){
        await pool.query(
            `INSERT INTO searches (track_id, user_id) 
            VALUES ($1, $2)
            ON CONFLICT (user_id, track_id)
            DO UPDATE SET searched_at = now()`,
            [trackId, userId]
        );
    }
    else{
        await pool.query(
            `INSERT INTO searches (track_id, user_id) 
            VALUES ($1, NULL)
            ON CONFLICT (track_id)
            WHERE user_id is NULL
            DO UPDATE SET searched_at = now()`,
            [trackId]
        );
    }
    return true;
  } catch (err) {
    console.error("Error in storeSearch:", err);
    return false;
  }
};

export const getUserSearches = async (
  spotifyUserId: string
): Promise<Search[]> => {
  try {
    const res = await pool.query(
      `SELECT searches.*, tracks.name, tracks.artist, tracks.preview_url, tracks.images, tracks.spotify_url
       FROM searches
       JOIN tracks ON searches.track_id = tracks.id
       WHERE searches.user_id = $1
       ORDER BY searches.searched_at DESC
       LIMIT 50`,
      [spotifyUserId]
    );
    return res.rows;
  } catch (err) {
    console.error("Error in getUserSearches:", err);
    return [];
  }
};

export const getAnonymousSearches = async (): Promise<Search[]> => {
  try {
    const res = await pool.query(
      `SELECT searches.*, tracks.name, tracks.artist, tracks.preview_url, tracks.images, tracks.spotify_url
       FROM searches
       JOIN tracks ON searches.track_id = tracks.id
       WHERE searches.user_id IS NULL
       ORDER BY searches.searched_at DESC
       LIMIT 50`
    );
    return res.rows;
  } catch (err) {
    console.error("Error in getAnonymousSearches:", err);
    return [];
  }
};

// ---------------------------------------------------------
// COMBINED: store track + search in one transaction
// ---------------------------------------------------------

export const storeTrackAndSearch = async (
  track: Track,
  userId: string | null
): Promise<boolean> => {
  try {
    await pool.query("BEGIN");

    await pool.query(
      `INSERT INTO tracks (id, name, artist, preview_url, images, spotify_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
       name         = EXCLUDED.name,
       artist       = EXCLUDED.artist,
       preview_url  = EXCLUDED.preview_url,
       images       = EXCLUDED.images,
       spotify_url  = EXCLUDED.spotify_url,
       created_at   = now()`,
      [
        track.id,
        track.name,
        track.artist,
        track.preview_url,
        track.image,
        track.spotify_url,
      ]
    );
    if (userId !== null){
       await pool.query(
        `INSERT INTO searches (track_id, user_id) 
        VALUES ($1, $2)
        ON CONFLICT (user_id, track_id)
        DO UPDATE SET searched_at = now()`,
        [track.id, userId]
      );
    }
    else{
        await pool.query(
            `INSERT INTO searches (track_id, user_id) 
            VALUES ($1, NULL)
            ON CONFLICT (track_id)
            WHERE user_id is NULL
            DO UPDATE SET searched_at = now()`,
            [track.id]
        );
    }

    await pool.query("COMMIT");
    return true;
  } catch (err) {
    try {
      await pool.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("Error rolling back transaction:", rollbackErr);
    }
    console.error("Error in storeTrackAndSearch:", err);
    return false;
  }
};

// ---------------------------------------------------------
// CLEAR USER SEARCHES
// ---------------------------------------------------------

export const clearUserSearches = async (
  spotifyUserId: string
): Promise<boolean> => {
  try {
    await pool.query(
      "DELETE FROM searches WHERE user_id = $1",
      [spotifyUserId]
    );
    return true;
  } catch (err) {
    console.error("Error in clearUserSearches:", err);
    return false;
  }
};
// ---------------------------------------------------------
// RECONNECTION
// ---------------------------------------------------------

const handleDatabaseError = async (err: Error) => {
  console.error("Database connection error", err);
  let retries: number = 0;

  const attemptReconnect = async () => {
    if (retries >= MAX_RETRIES) {
      console.error("Max retries reached. Giving up.");
      return;
    }
    retries++;
    console.log(`Attempting to reconnect... (${retries}/${MAX_RETRIES})`);

    try {
      await pool.end();
      pool = createPool();
      await pool.query("SELECT 1");
      console.log("Successfully reconnected to database");
      retries = 0;
      pool.on("error", handleDatabaseError);
    } catch (err) {
      console.log("Reconnect failed:", err);
      setTimeout(attemptReconnect, RETRY_DELAY);
    }
  };

  await attemptReconnect();
};

pool.on("error", handleDatabaseError);

export default pool;