import { Router } from "express";
const router = Router();
import { getSpotifyTrackAudioFeatures, getSpotifyTrackInfo, getSpotifyRecs } from "../controllers/spotifyController.js";
router.get("/gettrack", getSpotifyTrackInfo);
router.get("/getaudiofeatures", getSpotifyTrackAudioFeatures);
router.get("/getrecs", getSpotifyRecs);
export default router;
//# sourceMappingURL=spotifyRoutes.js.map