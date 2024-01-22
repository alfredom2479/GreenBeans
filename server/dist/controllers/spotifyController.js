import asyncHandler from "express-async-handler";
import axios from "axios";
let clientCredsAuthToken = "";
//temp token:
// BQD5iUmBuZUyNAQHaZSst__49OD27lW49_r5CMOZP-fzYzS1sQ6DGnp9OzTHdbYpyRXJ6xD0q4CywS0NHh1k-JU8zASG41MktoCGyXh8cwvDjYL-WqM
const getSpotifyTrackInfo = [
    /*
    body("trackid")
      .exists().withMessage("Trackid is missing")
      .trim().notEmpty().withMessage("Trackid is required")
      .isLength({min:2,max:100}).withMessage("Title is too short or too long")
      .escape(),
      */
    asyncHandler(async (req, res) => {
        /*
        const validationErrors = validationResult(req);
    
        if(!validationErrors.isEmpty()){
          res.status(400);
          res.json({error: validationErrors.array()[0]})
        }
        */
        //const {trackid} = req.body;
        //console.log(body);
        const { id } = req.query;
        console.log("the id param is: " + req.query.id);
        console.log("clientcredsauthtoken: " + clientCredsAuthToken);
        if (id === null || id === undefined || id === "") {
            res.status(400);
            res.json({ error: "missing id param" });
            return;
        }
        try {
            const { data, status, statusText } = await axios.get("https://api.spotify.com/v1/tracks/" + id, { headers: { "Authorization": "Bearer " + clientCredsAuthToken } });
            console.log("1st try: " + status);
            res.status(200);
            res.json({ result: data });
            return;
        }
        catch (err) {
            console.log("api oofed: " + err);
            const newToken = await getNewSpotifyTokenPrivate();
            console.log("new token: " + newToken);
            try {
                const { data, status, statusText } = await axios.get("https://api.spotify.com/v1/tracks/" + id, { headers: { "Authorization": "Bearer " + newToken } });
                console.log("2nd try: " + status);
                res.status(200);
                res.json({ result: data });
            }
            catch (err) {
                console.log("second request failed: " + err);
                res.status(500);
                res.json({ error: "The backend dev sucks" });
            }
        }
    })
];
const getSpotifyTrackAudioFeatures = asyncHandler(async (req, res) => {
    const { id } = req.query;
    if (id === null || id === undefined || id === "") {
        res.status(400);
        res.json({ error: "missing id param" });
        return;
    }
    try {
        const { data, status, statusText } = await axios.get("https://api.spotify.com/v1/audio-features/" + id, { headers: { "Authorization": "Bearer " + clientCredsAuthToken } });
        res.status(200);
        res.json({ result: data });
        return;
    }
    catch (err) {
        console.log("api oofed on 1st try: " + err);
        const newToken = await getNewSpotifyTokenPrivate();
        console.log("new token: " + newToken);
        try {
            const { data, status } = await axios.get("https://api.spotify.com/v1/audio-features/" + id, { headers: { "Authorization": "Bearer " + newToken } });
            console.log("2nd try: " + status);
            res.status(200);
            res.json({ result: data });
        }
        catch (err) {
            console.log("second request failed: " + err);
            res.status(500);
            res.json({ error: "The backend dev sucks" });
        }
    }
});
const getSpotifyRecs = asyncHandler(async (req, res) => {
    console.log(req.query);
    const { querysuffix } = req.query;
    if (querysuffix === null || querysuffix === undefined || typeof querysuffix !== "string" || querysuffix === "") {
        res.status(400);
        res.json({ error: "missing querysuffix param" });
        return;
    }
    const requestURI = "https://api.spotify.com/v1/recommendations?limit=99&seed_tracks=" + decodeURI(querysuffix);
    console.log(requestURI);
    try {
        const { data, status, statusText } = await axios.get(requestURI, { headers: { "Authorization": "Bearer " + clientCredsAuthToken } });
        res.status(200);
        res.json({ result: data });
        return;
    }
    catch (err) {
        console.log("api oofed on 1st try: " + err);
        const newToken = await getNewSpotifyTokenPrivate();
        console.log("new token: " + newToken);
        try {
            const { data, status } = await axios.get(requestURI, { headers: { "Authorization": "Bearer " + newToken } });
            console.log("2nd try: " + status);
            res.status(200);
            res.json({ result: data });
        }
        catch (err) {
            console.log("second request failed: " + err);
            res.status(500);
            res.json({ error: "The backend dev sucks" });
        }
    }
});
const getNewSpotifyTokenPrivate = async () => {
    const authHeaderString = 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID +
        ':' + process.env.SPOTIFY_CLIENT_SECRET, "utf-8").toString('base64'));
    const authData = {
        grant_type: 'client_credentials',
    };
    try {
        const { data, status, statusText } = await axios.post("https://accounts.spotify.com/api/token", authData, { headers: { "Authorization": authHeaderString, "Content-Type": "application/x-www-form-urlencoded" } });
        console.log(status);
        console.log("DA DATA:");
        console.log(data);
        console.log(data.access_token);
        clientCredsAuthToken = data.access_token;
        return data.access_token;
    }
    catch (err) {
        console.log("big token oof: " + err);
        return null;
    }
};
export { getSpotifyTrackInfo, getSpotifyTrackAudioFeatures, getSpotifyRecs };
//# sourceMappingURL=spotifyController.js.map