import pg from "pg";
const {Pool} = pg;

import dotenv from 'dotenv';

dotenv.config();

const createPool = () => new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

let pool = createPool();

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

export const testDatabaseQuery = async () => {
  const res = await pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Error executing query', err);
    } else {
      console.log(res.rows);
    }
  });
};

export const checkUserExists = async (userId:string) => {
  try {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    return res.rows.length > 0 ? res.rows[0] : null;
  } catch (err) {
    console.error('Error executing query', err);
    return null;
  }
}

export const createUser = async (userId:string, displayName:string, accessToken:string) => {
  try {
    const res = await pool.query('INSERT INTO users (id, display_name, access_token) VALUES ($1, $2, $3)', [userId, displayName, accessToken]);
    console.log("User created");
    console.log(res);
    return true;
  } catch (err) {
    console.error('Error executing query', err);
    return false;
  }
}

export const updateUserAccessToken = async (userId:string, accessToken:string) => {
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

const handleDatabaseError = async (err:Error) => {
  console.error('Database connection error', err);
  let retries = 0;

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
