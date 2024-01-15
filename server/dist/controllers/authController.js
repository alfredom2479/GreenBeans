import asyncHandler from "express-async-handler";
import axios from "axios";
import { generateRandomString } from "../utils/cryptoUtils.js";
const stateKey = "spotify_auth_state";
//TYPES
const spotifyLoginUser = (req, res) => {
    //Protection against CSRF
    const state = generateRandomString(16);
    res.cookie(stateKey, state);
    const authScope = "user-top-read user-read-private user-read-email user-library-read user-library-modify";
    const spotifyRedirectParams = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: authScope,
        redirect_uri: "http://localhost:3000/top",
        state: state,
        show_dialog: "true"
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
        //const tokenurl = "https://accounts.spotify.com/api/token"
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
const refreshToken = asyncHandler(async (req, res) => {
    console.log("in server refresh tokens");
    const old_refresh_token = req.query.refresh_token;
    const authData = {
        grant_type: 'refresh_token',
        refresh_token: old_refresh_token
    };
    console.log(old_refresh_token);
    const authHeaderString = 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID +
        ':' + process.env.SPOTIFY_CLIENT_SECRET, "utf-8").toString('base64'));
    try {
        const { data, status, statusText } = await axios.post("https://accounts.spotify.com/api/token", authData, { headers: { "Authorization": authHeaderString, "Content-Type": "application/x-www-form-urlencoded" } });
        if (statusText === 'OK' && status === 200) {
            const access_token = data.access_token;
            res.json({ access_token }).status(200);
        }
        else {
            console.log("There was an error refreshing ze tokens");
            console.log(data);
            //console.log(status);
            //console.log(statusText);
            res.json({ error: "no new tokens :(" }).status(500);
        }
    }
    catch (error) {
        console.log(error);
    }
    /*
  
    if(statusText === 'OK' && status === 200){
        
        console.log(data)
        const access_token = data.access_token;
        const refresh_token = data.refresh_token;
  
  
        res.json({access_token, refresh_token}).status(200);
      }
      else{
        console.log("There was an error getting the mcTokens");
        console.log(data);
        console.log(status);
        console.log(statusText);
  
        res.json({error: 'no tokens :('}).status(500);
      }
    */
});
export { spotifyLoginUser, getInitialTokens, refreshToken };
//# sourceMappingURL=authController.js.map