import {Router} from "express";
const router = Router();

import { 
  getSpotifyTrackAudioFeatures,
  getSpotifyTrackInfo,
  getSpotifyRecs,
  searchForSpotifyTrack
} from "../controllers/spotifyController.js";

router.get("/gettrack", getSpotifyTrackInfo);
router.get("/getaudiofeatures",getSpotifyTrackAudioFeatures);
router.get("/getrecs" ,getSpotifyRecs);
router.get("/getsearch",searchForSpotifyTrack);
export default router;