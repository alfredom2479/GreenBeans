import {Router} from "express";
const router = Router();

import {testDatabase} from "../controllers/databaseController.js";

router.get("/test",testDatabase);


export default router;