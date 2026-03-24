import {Router} from "express";
const router = Router();

//import {testDatabase,storeTrack} from "../controllers/databaseController.js";
import { getSearchesFromDatabase, storeTrackAndSearchToDatabase } from "../controllers/databaseController2.js";

//router.get("/test",testDatabase);
router.post("/trackseen",storeTrackAndSearchToDatabase);
router.get("/getmyhistory",getSearchesFromDatabase);


export default router;