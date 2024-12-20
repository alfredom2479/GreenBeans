import  {
  Request,
  Response,
  request
} from "express";

import asyncHandler from "express-async-handler";
import axios from "axios";

let clientCredsAuthToken = "";

const getSpotifyTrackInfo = asyncHandler(async (req:Request,res:Response)=>{

  const {id} = req.query

  if(id === null || id === undefined || id === ""){
    res.status(400).json({error: {message: "Bad Request: missing id param",status:400}});
    return;
  }

  const data = await sendRequest(
    "Spotify Track Info",
    "https://api.spotify.com/v1/tracks/"+id
  )

  if(data === null){
    res.status(500).json({error:{message:"Server could not make succesful request to spotify api",status:500}});
  }
  res.status(200).json({result:data});
})

const getSpotifyTrackAudioFeatures = asyncHandler(async (req:Request,res:Response)=>{
  const {id} = req.query

  if(id === null || id === undefined || id === ""){
    res.status(400).json({error: {message: "Bad Request: missing id param", status: 400}});
    return;
  }

  const data = await sendRequest(
    "Spotify Track Audio Features",
    "https://api.spotify.com/v1/audio-features/"+id
  );

  if(data === null ){
    res.status(500).json({error: {message:"Server could not make a succesful request to spotify track audio features", status: 500}});
  }
  res.status(200).json({result:data});
})

const getSpotifyRecs = asyncHandler(async (req:Request,res:Response)=>{
    
    const {querysuffix} = req.query

    if(querysuffix === null || querysuffix === undefined || typeof querysuffix !== "string" || querysuffix === "" ){
      res.status(400);
      res.json({error: {message:"missing querysuffix param", status: 400}});
      return;
    }

    const requestURI: string = "https://api.spotify.com/v1/recommendations?limit=50&seed_tracks="+decodeURI(querysuffix)

    const data = await sendRequest(
      "Spotify Recommendations",
      requestURI
    )


    if(data === null){
      res.status(500).json({error:{message:"Server could not make a succesful request to spotify recommendations",status:500}});
    }
    res.status(200).json({result:data});
    
    }
)


const sendRequest = async (requestName: string, completeEndpoint:string, ) =>{
  console.log(requestName,completeEndpoint);
  try{
    const {data, status} = await axios.get(
      completeEndpoint,
      {headers: {"Authorization": "Bearer "+clientCredsAuthToken}}
    );
    if(status === 200){
      return data;
    }
    throw Error("The returned status of first attempt was "+status);
  }catch(err){
    await getNewSpotifyTokenPrivate();

    try{
      const {data, status} = await axios.get(
        completeEndpoint,
        {headers: {"Authorization": "Bearer "+clientCredsAuthToken}}
      );
      if(status == 200){
        return data;
      }
      throw Error("Returned status of second request attempt was "+status)
    }catch(err){
      console.log("Error making second request attempt to "+requestName+": "+err);
      return null;
    }
  }
}

const getNewSpotifyTokenPrivate = async () =>{
const authHeaderString = 'Basic '+ (Buffer.from(process.env.SPOTIFY_CLIENT_ID+
    ':'+process.env.SPOTIFY_CLIENT_SECRET, "utf-8").toString('base64'));

  const authData = {
    grant_type: 'client_credentials', 
  }
  
  try{
  const {data, status} = await axios.post(
    "https://accounts.spotify.com/api/token",
    authData,
    {headers: {"Authorization": authHeaderString, "Content-Type":"application/x-www-form-urlencoded"}}
  )
  clientCredsAuthToken = data.access_token;
  return data.access_token;
  }catch(err){
    console.log("big token oof: "+err);
    return null;
  }
}

export {
  getSpotifyTrackInfo,
  getSpotifyTrackAudioFeatures,
  getSpotifyRecs
}