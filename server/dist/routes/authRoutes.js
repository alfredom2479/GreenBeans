import { Router } from "express";
const router = Router();
import { spotifyLoginUser, getInitialTokens } from "../controllers/authController.js";
router.get("/requestauth", spotifyLoginUser);
router.get("/gettokens", getInitialTokens);
export default router;
//# sourceMappingURL=authRoutes.js.map