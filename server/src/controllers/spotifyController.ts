import express, {
  Request,
  Response
} from "express";
import asyncHandler from "express-async-handler";
import axios from "axios";

let clientCredsAuthToken = "";

const getSpotifyClientCredsAuthToken = async ():Promise<string>=>{

  const authHeaderString = 'Basic '+ (Buffer.from(process.env.SPOTIFY_CLIENT_ID+
    ':'+process.env.SPOTIFY_CLIENT_SECRET, "utf-8").toString('base64'));

  const authData = {
    grant_type: 'client_credentials'
  }
  
  const {data, status, statusText} = await axios.post(
    "https://accounts.spotify.com/api/token",
    authData,
    {headers: {"Authorization": authHeaderString, "Content-Type": "application/x-www-form-urlencoded"}}
  );
  if (statusText === 'OK' && status === 200){
    const access_token = data.access_token;
    console.log("access_token: "+access_token);
    clientCredsAuthToken = access_token;
    return clientCredsAuthToken;
  }
  else{
    console.log("There was an error getting client credentials auth token");
    console.log(data);
    return null;
  }
};

const sendSpotifyAPIRequest = async (endpoint:string,)=>{
  console.log(endpoint);

  let returnedData = null;
  let returnedStatus = 0;

  try{
  const {data,status,statusText} = await axios.get(
    endpoint,
    {headers:{"Authorization": "Bearer "+clientCredsAuthToken}}
  );
  if (status ===200 && statusText === 'OK'){
    returnedData = data;
  }
  returnedStatus = status;
  }catch(err){
    //console.log(err);
    console.log("fauled to GET "+endpoint);
  }

  if (returnedData === null){
    throw Error("Big spotify api err: returned data is null");
  }
  if(returnedStatus !== 200){
    const newAccessToken = await getSpotifyClientCredsAuthToken();
    if(!newAccessToken && newAccessToken !== undefined && newAccessToken !== ""){
      const {data,status,statusText} = await axios.get(
        endpoint,
        {headers:{"Authorization": "Bearer "+clientCredsAuthToken}}
      );
      if(status === 200 && statusText === 'OK'){
        return data;
      }
      else{
        return null;
      }
    }
  }
}

//temp token:
// BQD5iUmBuZUyNAQHaZSst__49OD27lW49_r5CMOZP-fzYzS1sQ6DGnp9OzTHdbYpyRXJ6xD0q4CywS0NHh1k-JU8zASG41MktoCGyXh8cwvDjYL-WqM

const getSpotifyRecomendations = asyncHandler(async (req:Request,res:Response)=>{
  
  console.log("clientcredsauthtoken: "+clientCredsAuthToken);

    //const data = await sendSpotifyAPIRequest("https://api.spotify.com/v1/tracks/11dFghVXANMlKmJXsNCbNl")

    
    try{

    /*
    const {data, status, statusText} = await axios.get(
      "https://api.spotify.com/v1/tracks/11dFghVXANMlKmJXsNCbNl",
      {headers: {"Authorization" : "Bearer BQD5iUmBuZUyNAQHaZSst__49OD27lW49_r5CMOZP-fzYzS1sQ6DGnp9OzTHdbYpyRXJ6xD0q4CywS0NHh1k-JU8zASG41MktoCGyXh8cwvDjYL-WqM"}}
    )
    */

    const {data, status, statusText} = await axios.get(
      "https://api.spotify.com/v1/tracks/11dFghVXANMlKmJXsNCbNl",
      {headers: {"Authorization" : "Bearer "+clientCredsAuthToken}}
      );
    console.log("1st try: "+status);

    res.status(200);
    res.json({result: data})
    }
    catch(err){
      console.log("api oofed: "+err);

      const newToken = await getNewSpotifyTokenPrivate();
      console.log("new token: "+newToken)
      try{

      const {data, status, statusText} = await axios.get(
      "https://api.spotify.com/v1/tracks/11dFghVXANMlKmJXsNCbNl",
      {headers: {"Authorization" : "Bearer "+newToken}}
      );

        console.log("2nd try: "+status);
        res.status(200);
        res.json({result: data})
      }catch(err){
        console.log("second request failed: "+err)
        res.status(500);
        res.json({error:"The backend dev sucks"}); 
      }
      
    }
    }
    
)

const getNewSpotifyTokenPrivate = async () =>{
const authHeaderString = 'Basic '+ (Buffer.from(process.env.SPOTIFY_CLIENT_ID+
    ':'+process.env.SPOTIFY_CLIENT_SECRET, "utf-8").toString('base64'));

  const authData = {
    grant_type: 'client_credentials', 
  }
  
  try{
  const {data, status, statusText} = await axios.post(
    "https://accounts.spotify.com/api/token",
    authData,
    {headers: {"Authorization": authHeaderString, "Content-Type":"application/x-www-form-urlencoded"}}
  )
  console.log(status);
  console.log("DA DATA:");
  console.log(data);
  console.log(data.access_token)
  clientCredsAuthToken = data.access_token;
  return data.access_token;
  }catch(err){
    console.log("big token oof: "+err);
    return null;
  }
}

const getNewSpotifyToken = asyncHandler(async (req:Request, res:Response)=>{

  const authHeaderString = 'Basic '+ (Buffer.from(process.env.SPOTIFY_CLIENT_ID+
    ':'+process.env.SPOTIFY_CLIENT_SECRET, "utf-8").toString('base64'));

  const authData = {
    grant_type: 'client_credentials', 
  }
  
  try{
  const {data, status, statusText} = await axios.post(
    "https://accounts.spotify.com/api/token",
    authData,
    {headers: {"Authorization": authHeaderString, "Content-Type":"application/x-www-form-urlencoded"}}
  )
  console.log(status);
  console.log(statusText);
  console.log("DA DATA:");
  console.log(data);
  res.status(200);
  res.json({data: data});
  return;
  }catch(err){
    console.log("big token oof: "+err);
    res.status(500);
    res.json({error:"The backend dev does not know how try catch works"})
    return;
  }
  res.status(500);
  res.json({error:"The backend dev is a little dumb"})
})

export {
  getSpotifyRecomendations,
  getNewSpotifyToken

}