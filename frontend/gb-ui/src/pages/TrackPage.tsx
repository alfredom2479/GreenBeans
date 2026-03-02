import {useState, useEffect } from "react";
import { Outlet, useActionData, useLoaderData} from "react-router-dom";
import { requestSpotifyTrack,requestSpotifyTrackAudioFeatures,sendTrackSeenRequest } from "../api";
import type {Params} from "react-router-dom";
import { ITrack, AudioFeatures, TrackSaveState,  } from "../interfaces";
import { isAudioFeatures, isITrackObject, isTrack } from "../utils";
//import spotifyLogo from "../assets/spotify_logo.png";
//import { Stores, getITrack,addITrack, getAudioFeatures, addAudioFeatures} from "../idb";
import { didb } from "../dexiedb";

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

  //begin the queries
  let trackLoaderData = null;  
  let audioFeatureLoaderData = null;
  let usingIDBTrackData:boolean = false;
  let usingIDBFeatureData:boolean = false;

  //const idbTrackData:ITrack|null= await getITrack(Stores.Tracks,trackId);
  //const idbAudioFeatureData:AudioFeatures|null = await getAudioFeatures(Stores.AudioFeatures,trackId);

  let didbTrackData:ITrack|null; 
  let didbAudioFeatureData:AudioFeatures|null;

  try {
    didbTrackData = await didb.tracks.get(trackId) || null;
  }
  catch(err){
    didbTrackData = null;
    console.log("error getting track from dexie");
  }

  try {
    didbAudioFeatureData = await didb.audio_features.get(trackId) || null;
  }
  catch(err){
    didbAudioFeatureData = null;
    console.log("error getting audio features from dexie");
  }


  if(didbTrackData != null){
    usingIDBTrackData = true;
    trackLoaderData = didbTrackData;
  }
  if(didbAudioFeatureData != null){
    usingIDBFeatureData = true;
    audioFeatureLoaderData = didbAudioFeatureData; 
  }

  if(!usingIDBTrackData){
    trackLoaderData = await requestSpotifyTrack(access_token, trackId, isLoggedIn);
  }
  if(!usingIDBFeatureData){
    audioFeatureLoaderData = await requestSpotifyTrackAudioFeatures(access_token,trackId, isLoggedIn);
  }

  
  return {
    trackLoaderData,
    audioFeatureLoaderData, 
    usingIDBTrackData,
    usingIDBFeatureData
  };
  
}



export default function TrackPage(){

  const loaderData = useLoaderData();
  const actionData = useActionData();

  const [trackData, setTrackData] = useState<ITrack>({id:"",name: "", artist: "", image:[],trackSaveState:TrackSaveState.CantSave});
  const [currAudioFeatures,setCurrAudioFeatures] = useState<AudioFeatures>({id:""});

  useEffect(()=>{
    console.log("TrackPage actionData",actionData);
  },[actionData])
    
  useEffect(()=>{


    let trackLoaderData: object|null = {};
    let audioFeatureLoaderData: object|null = {};
    let usingIDBTrackData: boolean = false;
    let usingIDBFeatureData:boolean = false; 

    async function addTrackToDexie(track:ITrack){
      try{
         await didb.tracks.add(track);
      }
      catch(err){
        console.log("error adding track to dexie "+err);
      }
    }
    async function addAudioFeaturesToDexie(audioFeatures:AudioFeatures){
     try{
      await didb.audio_features.add(audioFeatures);
     } 
     catch(err){
      console.log("error adding audio features to dexie "+err);
     }
    }

    if(typeof loaderData === 'object' && loaderData) { 

      if('trackLoaderData' in loaderData  &&
        typeof loaderData.trackLoaderData==='object' &&
        'audioFeatureLoaderData' in loaderData &&
        typeof loaderData.audioFeatureLoaderData === 'object'
        && 'usingIDBTrackData' in loaderData &&
        typeof loaderData.usingIDBTrackData === 'boolean' &&
        'usingIDBFeatureData' in loaderData &&
        typeof loaderData.usingIDBFeatureData === 'boolean'
        ){
          trackLoaderData = loaderData.trackLoaderData;
          audioFeatureLoaderData = loaderData.audioFeatureLoaderData
          usingIDBTrackData = loaderData.usingIDBTrackData;
          usingIDBFeatureData = loaderData.usingIDBFeatureData;
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

    if(typeof trackLoaderData === 'object' && trackLoaderData ){

      let possibleTrack: ITrack |null = null;
      if(usingIDBTrackData === true){
        possibleTrack = isITrackObject(trackLoaderData);
      }
      else{
        possibleTrack = isTrack(trackLoaderData);
      }

      //some golang influence lol

      
      if(possibleTrack != null){
        setTrackData(possibleTrack);
        if(!usingIDBTrackData){
          addTrackToDexie(possibleTrack);
        }
      }

      if(typeof audioFeatureLoaderData === 'object' && audioFeatureLoaderData){
        const possibleAudioFeatures = isAudioFeatures(audioFeatureLoaderData);
        if (possibleAudioFeatures != null){
          setCurrAudioFeatures(possibleAudioFeatures);
          if(!usingIDBFeatureData){
            addAudioFeaturesToDexie(possibleAudioFeatures);
          }
          if(possibleTrack != null){
            sendTrackSeenRequest(possibleTrack,possibleAudioFeatures);
          }
        }
      }

    }
    //console.log("currAudioFeatures",currAudioFeatures);
    //console.log("trackData",loaderData);
    
  },[loaderData])

  return (
    <div className="min-h-[calc(100%-3.5rem)] w-full flex flex-col">
      <header className="shrink-0 border-b border-zinc-800/80 bg-zinc-900/50 p-4">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 rounded-2xl shadow-xl shadow-green-900/50 bg-gradient-to-br from-zinc-900 via-zinc-800/80 to-green-800/30 border border-green-600/40 ring-1 ring-green-300/20 transition-all duration-300">
          <div className="flex items-center gap-4 sm:gap-5">
            <a
              href={"https://open.spotify.com/track/" + trackData.id}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-lg overflow-hidden ring-1 ring-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            >
              <img
                src={trackData.image[0]}
                alt=""
                className="h-20 w-20 sm:h-24 sm:w-24 object-cover"
              />
            </a>
            <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
              <h1 className="text-lg sm:text-xl font-semibold text-white truncate">
                {trackData.name}
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 truncate">
                {trackData.artist}
              </p>
              <a
                href={"https://open.spotify.com/track/" + trackData.id}
                target="_blank"
                rel="noreferrer"
                className="mt-1 text-xs text-zinc-500 hover:text-green-500 transition-colors w-fit"
              >
                Open in Spotify →
              </a>
            </div>
          </div>

        </div> 
        </header>
        <Outlet context={{currAudioFeatures:currAudioFeatures satisfies AudioFeatures, trackData:trackData satisfies ITrack }} />
    </div>
  )
}

