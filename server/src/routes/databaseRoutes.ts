import {Router} from "express";
const router = Router();

//import {testDatabase,storeTrack} from "../controllers/databaseController.js";
import { getSearchesFromDatabase, storeTrackAndSearchToDatabase, clearUserHistoryFromDatabase } from "../controllers/databaseController2.js";

//router.get("/test",testDatabase);
router.post("/trackseen",storeTrackAndSearchToDatabase);
router.get("/getmyhistory",getSearchesFromDatabase);
router.post("/clearmyhistory",clearUserHistoryFromDatabase);


export default router;