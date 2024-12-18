import {Router} from "express";
const router = Router();

import {testDatabase,storeTrack} from "../controllers/databaseController.js";

router.get("/test",testDatabase);
router.post("/trackseen",storeTrack);


export default router;