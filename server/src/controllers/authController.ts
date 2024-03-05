import express, { 
  Request, 
  Response,
} from "express";
import asyncHandler from "express-async-handler";
import axios from "axios";

import { generateRandomString } from "../utils/cryptoUtils.js";

const stateKey:string = "spotify_auth_state";

const spotifyLoginUser =  (req:Request,res:Response)
  :void=>{
  //Protection against CSRF
  const state:string = generateRandomString(16);

  res.cookie(stateKey, state);

  const authScope:string = "user-top-read user-read-private user-read-email user-library-read user-library-modify";

  const spotifyRedirectParams = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: authScope,
    redirect_uri: process.env.ORIGIN+"/auth",
    state: state,
    show_dialog: "true"
  })

  res.redirect("https://accounts.spotify.com/authorize?"+
    spotifyRedirectParams.toString()
  );
};

const getInitialTokens = asyncHandler( async (req:Request,res:Response): Promise<void>=>{
  const authCode = req.query.code || null;
  const authState = req.query.state || null;
  const storedState:string|null = req.cookies ? req.cookies[stateKey] : null;

  if(authState === null || authState !== storedState){
    res.status(500);
    res.json({error: {message:'state_mismatch',state:500}});
  }
  else{
    res.clearCookie[stateKey];
    const authHeaderStr = 'Basic '+ (Buffer.from(process.env.SPOTIFY_CLIENT_ID+
          ":"+process.env.SPOTIFY_CLIENT_SECRET,"utf-8").toString('base64'))

    const authData = {
      code: authCode,
      redirect_uri: process.env.ORIGIN+"/auth",
      grant_type: 'authorization_code'
    }

    const {data, status, statusText} = await axios.post(
      "https://accounts.spotify.com/api/token",
      authData,
      {headers: {"Authorization": authHeaderStr, "Content-Type": "application/x-www-form-urlencoded"}}
      );

    if(statusText === 'OK' && status === 200){
      
      const access_token = data.access_token;
      const refresh_token = data.refresh_token;

      res.json({access_token, refresh_token}).status(200);
    }
    else{
      console.log("There was an error getting the initial mcTokens");
      res.status(500);
      res.json({error: {message:'no tokens uwu :(',status:500}});
    }
  }
});

const refreshToken = asyncHandler(async (req:Request, res:Response)=>{
  const old_refresh_token = req.query.refresh_token
  const authData = {
    grant_type: 'refresh_token',
    refresh_token: old_refresh_token
  }

  const authHeaderString = 'Basic '+ (Buffer.from(process.env.SPOTIFY_CLIENT_ID+
    ':'+process.env.SPOTIFY_CLIENT_SECRET, "utf-8").toString('base64'));

  try{
    const {data,status,statusText} = await axios.post(
      "https://accounts.spotify.com/api/token",
      authData,
      {headers: {"Authorization": authHeaderString, "Content-Type": "application/x-www-form-urlencoded"}}
    );
  
    if(statusText==='OK' && status === 200){
      const access_token = data.access_token;
      res.json({access_token }).status(200);
    }
    else{
      res.json({error: {message:"no new tokens :(",status:500}}).status(500);
    }
  }catch(error){
    console.log("Error refreshing token")
    console.log(error)
    res.status(500).json({error: {message:"Sever cannot refresh token",status:500}})
  }
})

export {
  spotifyLoginUser,
  getInitialTokens,
  refreshToken
};

