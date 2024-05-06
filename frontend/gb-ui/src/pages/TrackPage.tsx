import {useState, useEffect } from "react";
import { Outlet, useLoaderData} from "react-router-dom";
import { requestSpotifyTrack,requestSpotifyTrackAudioFeatures } from "../api";
import type {Params} from "react-router-dom";
import { ITrack, AudioFeatures, TrackSaveState,  } from "../interfaces";
import { isTrack } from "../utils";

import spotifyLogo from "../assets/spotify_logo.png";
//import { Stores, addITrack } from "../idb";

interface IURLParams{
  params:Params
}

export async function loader({params}:IURLParams){
  
  let trackId:string = "bad_track_id";
  let isLoggedIn = true;

  if(typeof params.trackid === "string"){
    trackId = params.trackid;
  }


  let access_token:string|null = localStorage.getItem("access_token");

  if(!access_token || access_token===""){
    isLoggedIn = false;
    access_token = "";
  }

  //const localTrackData = localStorage.getItem("track_data_"+trackId);
  //const localAudioFeatures = localStorage.getItem("audio_features_"+trackId)

  //const localDataExists:boolean[]= [false,false];

  //let audioFeatureLoaderData = null;
  //let trackLoaderData = null;
/*

  if(localAudioFeatures !== null){
    try{
      const localAudioFeaturesJsond = JSON.parse(localAudioFeatures);
      //localDataExists[1] = true;
      audioFeatureLoaderData = localAudioFeaturesJsond;
    }catch(err){
      console.log(err);
      //localDataExists[1] = false;
      localStorage.removeItem("audio_features_"+trackId);
    }
  }
  if(localTrackData !== null){
    try{
      const localTrackDataJsond = JSON.parse(localTrackData);
      //localDataExists[0] = true;
      trackLoaderData = localTrackDataJsond;
    }catch(err){
      console.log(err);
      //localDataExists[0] = true;
      localStorage.removeItem("track_data_"+trackId);
    }
  }

  if(trackLoaderData=== null){
    //console.log("useing local audio features");
    trackLoaderData = await requestSpotifyTrack(access_token, trackId, isLoggedIn);
    localStorage.setItem("track_data_"+trackId,JSON.stringify(trackLoaderData));
    //return {trackLoaderData,audioFeatureLoaderData};
  }
  if(audioFeatureLoaderData === null){
    audioFeatureLoaderData = await requestSpotifyTrackAudioFeatures(access_token,trackId, isLoggedIn);
    localStorage.setItem("audio_features_"+trackId,JSON.stringify(audioFeatureLoaderData));
  }
  return {trackLoaderData,audioFeatureLoaderData};
 */ 
  //else{
    const [trackLoaderData,audioFeatureLoaderData] = await Promise.all([requestSpotifyTrack(access_token, trackId, isLoggedIn),requestSpotifyTrackAudioFeatures(access_token,trackId, isLoggedIn)])
    //localStorage.setItem("audio_features_"+trackId,JSON.stringify(audioFeatureLoaderData));
    console.log(trackLoaderData);
    return {trackLoaderData,audioFeatureLoaderData};
  //}
  

  

}

export default function TrackPage(){

  const loaderData = useLoaderData();

  const [trackData, setTrackData] = useState<ITrack>({id:"",name: "", artist: "", image:"",trackSaveState:TrackSaveState.CantSave});
  const [currAudioFeatures,setCurrAudioFeatures] = useState<AudioFeatures>({});

    
  useEffect(()=>{

    let trackLoaderData: object|null = {};
    let audioFeatureLoaderData: object|null = {};

    if(typeof loaderData === 'object' && loaderData) { 
      if('trackLoaderData' in loaderData  &&
        typeof loaderData.trackLoaderData==='object' &&
        'audioFeatureLoaderData' in loaderData &&
        typeof loaderData.audioFeatureLoaderData === 'object'
        ){
          trackLoaderData = loaderData.trackLoaderData;
          audioFeatureLoaderData = loaderData.audioFeatureLoaderData
      }
      else{
        trackLoaderData = {};
        audioFeatureLoaderData = {};
      }
    }
    else{
        trackLoaderData = {};
        audioFeatureLoaderData = {};
    }

    //console.log(trackLoaderData);
    //console.log(audioFeatureLoaderData);

    if(typeof trackLoaderData === 'object' && trackLoaderData ){

      const possibleTrack: ITrack|null = isTrack(trackLoaderData,1);
      //some golang influence lol
      if(possibleTrack != null){
        console.log(possibleTrack);
        setTrackData(possibleTrack);
        //addITrack(Stores.Tracks, possibleTrack);
      }

      if(typeof audioFeatureLoaderData === 'object' && audioFeatureLoaderData){
        const tempAudioFeatures:AudioFeatures = {}

        if('acousticness' in audioFeatureLoaderData && typeof audioFeatureLoaderData['acousticness'] === "number"){
          tempAudioFeatures.acousticness = audioFeatureLoaderData.acousticness
        }
        if('danceability' in audioFeatureLoaderData && typeof audioFeatureLoaderData.danceability === "number"){
            tempAudioFeatures.danceability = audioFeatureLoaderData.danceability
        }
        if('energy' in audioFeatureLoaderData && typeof audioFeatureLoaderData.energy === "number"){
            tempAudioFeatures.energy = audioFeatureLoaderData.energy
        }
        if('liveness' in audioFeatureLoaderData && typeof audioFeatureLoaderData.liveness === "number"){
            tempAudioFeatures.liveness = audioFeatureLoaderData.liveness
        }
        if('valence' in audioFeatureLoaderData && typeof audioFeatureLoaderData.valence === "number"){
            tempAudioFeatures.valence = audioFeatureLoaderData.valence
        }
        if('tempo' in audioFeatureLoaderData && typeof audioFeatureLoaderData.tempo=== "number"){
            tempAudioFeatures.tempo = audioFeatureLoaderData.tempo
        }
        if('duration_ms' in audioFeatureLoaderData && typeof audioFeatureLoaderData.duration_ms=== "number"){
            tempAudioFeatures.duration_ms = audioFeatureLoaderData.duration_ms
        }
        if('time_signature' in audioFeatureLoaderData && typeof audioFeatureLoaderData.time_signature=== "number"){
            tempAudioFeatures.time_signature = audioFeatureLoaderData.time_signature
        }
        if('instrumentalness' in audioFeatureLoaderData && typeof audioFeatureLoaderData.instrumentalness=== "number"){
            tempAudioFeatures.instrumentalness= audioFeatureLoaderData.instrumentalness
        }
        if('key' in audioFeatureLoaderData && typeof audioFeatureLoaderData.key === "number"){
            tempAudioFeatures.key= audioFeatureLoaderData.key
        }
        if('mode' in audioFeatureLoaderData && typeof audioFeatureLoaderData.mode === "number"){
            tempAudioFeatures.mode = audioFeatureLoaderData.mode
        }
        setCurrAudioFeatures(tempAudioFeatures);
      }
    }
    
  },[loaderData])

  return(
    <div className=" h-[calc(100%-3.5rem)] w-full flex flex-col ">
        <div className=" bg-stone-900 text-stone-200 flex h-32 w-full ">

          <div className=" shrink-0 flex items-center w-32 h-full">
            <img src={trackData.image} 
              className="flex-1 h-32 w-32 object-cover ">
            </img>
          </div>

          <div className="flex flex-1 basis-5/6  flex-col p-1 overflow-y-scroll overflow-x-hidden">
            <div className="flex-1 text-xl overflow-hidden overflow-y-scroll text-ellipsis">
              {trackData.name}
            </div>
            <div className=" flex-1 text-xl text-stone-300  overflow-y-scroll">
              <i>{trackData.artist}</i>
            </div>
          </div>

          <div className=" flex flex-1 basis-1/6 ">
            <a href={trackData.spotify_url} target="_blank" className=" hover:bg-white w-full flex items-center justify-center ">
              <img src={spotifyLogo} className="h-8"/>
            </a>
          </div>
        </div> 
            <Outlet context={currAudioFeatures satisfies AudioFeatures } />
    </div>
  )
}

