//import pool from "./db.ts";
import pg from "pg";
const {Pool} = pg;


//set env variables manually
//def bc of security or whatever and not bc I dont wanna figure out how to do it 
//automatically rn

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

const createTables = async () => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(255) PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            access_token VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS tracks (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            artist VARCHAR(255) NOT NULL,
            preview_url VARCHAR(255),
            images VARCHAR(255)[] NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS audio_features (
            id VARCHAR(255) PRIMARY KEY REFERENCES tracks(id) ON DELETE CASCADE,
            acousticness FLOAT CHECK (acousticness >= 0 AND acousticness <= 1),
            danceability FLOAT CHECK (danceability >= 0 AND danceability <= 1),
            energy FLOAT CHECK (energy >= 0 AND energy <= 1),
            valence FLOAT CHECK (valence >= 0 AND valence <= 1),
            tempo FLOAT CHECK (tempo > 0),
            duration_ms INTEGER CHECK (duration_ms > 0),
            key INTEGER CHECK (key >= -1 AND key <= 11),
            mode INTEGER CHECK (mode IN (0, 1)),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS user_recent_tracks (
            user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
            track_id VARCHAR(255) REFERENCES tracks(id) ON DELETE CASCADE,
            viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, track_id)
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS global_recent_tracks (
            track_id VARCHAR(255) REFERENCES tracks(id) ON DELETE CASCADE,
            viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (track_id)
        )`);

        console.log("Tables created successfully");
    } catch (error) {
        console.error("Error creating tables:", error);
    }finally{
        await pool.end();
    }
};

createTables();
