import asyncHandler from "express-async-handler";
import axios from "axios";
import { generateRandomString } from "../utils/cryptoUtils.js";
const stateKey = "spotify_auth_state";
//TYPES
const spotifyLoginUser = (req, res) => {
    //Protection against CSRF
    const state = generateRandomString(16);
    res.cookie(stateKey, state);
    const authScope = "user-top-read user-read-private user-read-email";
    const spotifyRedirectParams = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: authScope,
        redirect_uri: "http://localhost:3000/top",
        state: state
    });
    console.log(spotifyRedirectParams);
    res.redirect("https://accounts.spotify.com/authorize?" +
        spotifyRedirectParams.toString());
};
const getInitialTokens = asyncHandler(async (req, res) => {
    console.log("inside of getInitialTokens");
    console.log(req.query);
    const authCode = req.query.code || null;
    const authState = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;
    console.log("stored state: " + storedState);
    /*const errorRedirectParams = new URLSearchParams({
      error: 'state_mismatch'
    });*/
    console.log("auth state:");
    console.log(authState);
    console.log("stored state");
    console.log(storedState);
    console.log("code");
    console.log(authCode);
    if (authState === null || authState !== storedState) {
        //res.redirect('/#'+errorRedirectParams.toString());
        res.json({ error: 'state_mismatch' });
    }
    else {
        //dont need it anymore, throw away for security
        res.clearCookie[stateKey];
        const authHeaderStr = 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID +
            ":" + process.env.SPOTIFY_CLIENT_SECRET, "utf-8").toString('base64'));
        console.log(authHeaderStr);
        const authData = {
            code: authCode,
            redirect_uri: "http://localhost:3000/top",
            grant_type: 'authorization_code'
        };
        const tokenurl = "https://accounts.spotify.com/api/token";
        console.log(authData);
        const { data, status, statusText } = await axios.post("https://accounts.spotify.com/api/token", authData, { headers: { "Authorization": authHeaderStr, "Content-Type": "application/x-www-form-urlencoded" } });
        if (statusText === 'OK' && status === 200) {
            console.log(data);
            const access_token = data.access_token;
            const refresh_token = data.refresh_token;
            res.json({ access_token, refresh_token }).status(200);
        }
        else {
            console.log("There was an error getting the mcTokens");
            console.log(data);
            console.log(status);
            console.log(statusText);
            res.json({ error: 'no tokens :(' }).status(500);
        }
    }
});
export { spotifyLoginUser, getInitialTokens };
//# sourceMappingURL=authController.js.map