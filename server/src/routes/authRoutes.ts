import {Router} from "express";
const router = Router();

import { 
  spotifyLoginUser,
  getInitialTokens,
  refreshToken
} from "../controllers/authController.js";

router.get("/requestauth",spotifyLoginUser);
router.get("/gettokens", getInitialTokens)
router.get("/refresh_token",refreshToken)

export default router;