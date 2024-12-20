import pg from "pg";
const {Pool} = pg;

import dotenv from 'dotenv';
import {Track,User,AudioFeatures} from "./controllers/databaseController.js";

dotenv.config();

const createPool = () => new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

let pool = createPool();

const MAX_RETRIES:number = 5;
const RETRY_DELAY:number = 5000;

export const testDatabaseQuery = async () => {
  const res = await pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Error executing query', err);
    } else {
      console.log(res.rows);
    }
  });
};

export const checkUserExists = async (userId:string):Promise<User|null> => {
  try {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    return res.rows.length > 0 ? res.rows[0] : null;
  } catch (err) {
    console.error('Error executing query', err);
    return null;
  }
}

export const createUser = async (userId:string, displayName:string, accessToken:string):Promise<boolean> => {
  try {
    const res = await pool.query('INSERT INTO users (id, username, access_token) VALUES ($1, $2, $3)', [userId, displayName, accessToken]);
    console.log("User created");
    console.log(res);
    return true;
  } catch (err) {
    console.error('Error executing query', err);
    return false;
  }
}

export const updateUserAccessToken = async (userId:string, accessToken:string):Promise<boolean> => {
  try {
    const res = await pool.query('UPDATE users SET access_token = $1 WHERE id = $2', [accessToken, userId]);
    console.log("User access token updated");
    console.log(res);
    return true;
  } catch (err) {
    console.error('Error executing query', err);
    return false;
  }
}

export const storeTrackAndHistory = async (track:Track, user:User|null, audioFeatures:AudioFeatures):Promise<boolean> => {
  try {
    //start transaction
    await pool.query('BEGIN');

    //insert track metadata
     await pool.query(
      `INSERT INTO tracks (id, name, artist, preview_url, images) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`, 
      [track.id, track.name, track.artist, track.url, track.image]
    );

    //insert audio features
    await pool.query(
      `INSERT INTO audio_features (
        id, acousticness, danceability, energy, valence,
        tempo, duration_ms, key, mode
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [
        audioFeatures.id,
        audioFeatures.acousticness,
        audioFeatures.danceability,
        audioFeatures.energy,
        audioFeatures.valence,
        audioFeatures.tempo,
        audioFeatures.duration_ms,
        audioFeatures.key,
        audioFeatures.mode
      ]
    );

    //insert user history
    if(user !== null){
      await pool.query(
        `INSERT INTO user_recent_tracks (user_id, track_id) 
         VALUES ($1, $2)
         ON CONFLICT (user_id, track_id) DO UPDATE SET
            viewed_at = CURRENT_TIMESTAMP`,
        [user.id, track.id]
      );
    }

    //insert global history
    await pool.query(
      `INSERT INTO global_recent_tracks (track_id) 
       VALUES ($1)
       ON CONFLICT (track_id) DO UPDATE SET
          viewed_at = CURRENT_TIMESTAMP`,
      [track.id]
    );

    //commit transaction
    await pool.query('COMMIT');

    console.log("Track stored");
    return true;
  } catch (err) {
    try{
      await pool.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Error rolling back transaction:', rollbackErr);
    }
    console.error('Error storing track data:', err);
    return false;
  }
}

const handleDatabaseError = async (err:Error) => {
  console.error('Database connection error', err);
  let retries:number = 0;

  const attemptReconnect = async () => {
    if (retries >= MAX_RETRIES) {
      console.error('Max retries reached. Giving up.');
      //process.exit(1);
      return;
    }
    retries++;
    console.log(`Attempting to reconnect... (${retries}/${MAX_RETRIES})`);

    try {
      await pool.end();
      pool = createPool();
      await pool.query('SELECT 1');
      console.log("Successfully connected to database");

      retries = 0;
      pool.on('error', handleDatabaseError);
    } catch (err) {
      console.log("Reconnect failed: ", err);
      setTimeout(attemptReconnect, RETRY_DELAY);
    }
  }
  await attemptReconnect();
}




pool.on('error', handleDatabaseError);

//testDatabase();
export default pool;
