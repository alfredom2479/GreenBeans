import { Router } from "express";
const router = Router();
import { getNewSpotifyToken, getSpotifyRecomendations } from "../controllers/spotifyController.js";
router.get("/getrecs", getSpotifyRecomendations);
router.get("/getcctoken", getNewSpotifyToken);
export default router;
//# sourceMappingURL=spotifyRoutes.js.map