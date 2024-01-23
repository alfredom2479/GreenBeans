import asyncHandler from "express-async-handler";
import axios from "axios";
let clientCredsAuthToken = "";
const getSpotifyTrackInfo = asyncHandler(async (req, res) => {
    const { id } = req.query;
    if (id === null || id === undefined || id === "") {
        console.log("Error getting track info: no id was provided");
        res.status(400).json({ error: "Bad Request: missing id param" });
        return;
    }
    const data = await sendRequest("Spotify Track Info", "https://api.spotify.com/v1/tracks/" + id);
    if (data === null) {
        res.status(500).json({ error: "Server could not make succesful request to spotify api" });
    }
    res.status(200).json({ result: data });
});
const getSpotifyTrackAudioFeatures = asyncHandler(async (req, res) => {
    const { id } = req.query;
    if (id === null || id === undefined || id === "") {
        console.log("Error getting track audio features: no id was provided");
        res.status(400).json({ error: "Bad Request: missing id param" });
        return;
    }
    const data = await sendRequest("Spotify Track Audio Features", "https://api.spotify.com/v1/audio-features/" + id);
    if (data === null) {
        res.status(500).json({ error: "Server could not make a succesful request to spotify track audio features" });
    }
    res.status(200).json({ result: data });
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
    const data = await sendRequest("Spotify Recommendations", requestURI);
    if (data === null) {
        res.status(500).json({ error: "Server could not make a succesful request to spotify recommendations" });
    }
    res.status(200).json({ result: data });
});
const sendRequest = async (requestName, completeEndpoint) => {
    try {
        const { data, status } = await axios.get(completeEndpoint, { headers: { "Authorization": "Bearer " + clientCredsAuthToken } });
        if (status === 200) {
            return data;
        }
        throw Error("The returned status of first attempt was " + status);
    }
    catch (err) {
        console.log("Error making first attempt request to spotify track info: " + err);
        await getNewSpotifyTokenPrivate();
        try {
            const { data, status } = await axios.get(completeEndpoint, { headers: { "Authorization": "Bearer " + clientCredsAuthToken } });
            if (status == 200) {
                return data;
            }
            throw Error("Returned status of second request attempt was " + status);
        }
        catch (err) {
            console.log("Error making second request attempt to " + requestName + ": " + err);
            return null;
        }
    }
};
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