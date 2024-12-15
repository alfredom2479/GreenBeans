import {useState, useEffect } from "react";
import { Outlet, useLoaderData} from "react-router-dom";
import { requestSpotifyTrack,requestSpotifyTrackAudioFeatures } from "../api";
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
    usingIDBFeatureData};
  
}



export default function TrackPage(){

  const loaderData = useLoaderData();

  const [trackData, setTrackData] = useState<ITrack>({id:"",name: "", artist: "", image:"",trackSaveState:TrackSaveState.CantSave});
  const [currAudioFeatures,setCurrAudioFeatures] = useState<AudioFeatures>({id:""});

    
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
        possibleTrack = isTrack(trackLoaderData,1);
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
        }
      }
    }
    
  },[loaderData])

  return(
    <div className=" h-[calc(100%-3.5rem)] w-full flex flex-col ">
        <div className=" bg-stone-900 text-stone-200 flex h-32 w-full ">

          <div className=" shrink-0 flex items-center w-32 h-full">
            <a href={"https://open.spotify.com/track/"+trackData.id} target="_blank">
            <img src={trackData.image} 
              className="flex-1 h-32 w-32 object-cover ">
            </img>
            </a>
          </div>

          <div className="flex flex-1 basis-5/6  flex-col p-1 overflow-y-scroll overflow-x-hidden">
            <div className="flex-1 text-xl overflow-hidden overflow-y-scroll text-ellipsis">
              {trackData.name}
            </div>
            <div className=" flex-1 text-xl text-stone-300  overflow-y-scroll">
              <i>{trackData.artist}</i>
            </div>
          </div>

        </div> 
        <Outlet context={{currAudioFeatures:currAudioFeatures satisfies AudioFeatures, trackData:trackData satisfies ITrack }} />
    </div>
  )
}

