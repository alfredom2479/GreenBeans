//import {useState} from "react"
import {  redirect,useSubmit } from "react-router-dom";
import type {Params} from "react-router-dom";
//import { requestSpotifyRec } from "../api";

import { AudioFeatures } from "../interfaces";

//import { ITrack } from "../interfaces";
//import { requestSpotifyTrackAudioFeatures } from "../api";
import { requestSpotifyRec } from "../api";


interface IURLParams{
  params: Params,
  request: Request
}

/*
export async function loader({params}:IURLParams){
  console.log("in rec options section loader");
  console.log(params);
  let trackId:string = "bad_track_id";

  if(typeof params.trackid === "string"){
    trackId = params.trackid;
    console.log(trackId);
  }
  else{
    return redirect("/");
  }

  const access_token:string|null = localStorage.getItem("access_token");

  if(!access_token ||access_token===""){
    return redirect("/");
  }

  try{
    const data = await requestSpotifyTrackAudioFeatures(access_token,trackId);
    console.log(data);
    return data;
  }catch(err){
    console.log("there has been a req options loader error");
    console.log(err);
    throw err;
  }
}
*/

/*
interface RecommendationOptions{
  acousticnesss : boolean,
  danceability : boolean
  energy : boolean,
  liveness : boolean
  valence : boolean,
  tempo : boolean,
  duration : boolean,
  time_signature : boolean,
  instrumentalness : boolean,
  loudness : boolean,

  allowance: number
}
*/

export async function action({params,request}:IURLParams){  
  const access_token:string|null = localStorage.getItem("access_token");
  //const formData = await request.formData();
  //const selectedOptions:string[] = [];

  let trackId:string = "default_track_id";

  if(!access_token || access_token === ""){
    return redirect("/")
  }

  if(typeof params.trackid === "string"){
    trackId = params.trackid;
  }
  else{
    redirect("/");
  }
  let audioFeatures:AudioFeatures = {};
  let settings:string[] = [];
  const requestJson = await request.json();
  //console.log(requestJson);

  audioFeatures = requestJson.audioFeatures;

  settings = requestJson.settings;

  try{
    const data = await requestSpotifyRec(access_token,trackId,settings,audioFeatures);
    console.log(data);

    if(data.tracks && Array.isArray(data.tracks)){
      return data.tracks;
    }

    return [];
  }catch(err){
    console.log("There has been a rec action error");
    console.log(err);
    throw err;
  }
  //send the rec request from here.
  //u alreadi wrote it, its in RecsSection

}

interface RecOptionsSectionProps{
  checkedBoxes: string[],
  setCheckedBoxes: React.Dispatch<string[]>,
  audioFeatures: AudioFeatures
}

export default function RecOptionsSection({checkedBoxes,setCheckedBoxes, audioFeatures}:RecOptionsSectionProps){

  console.log("audio features in RecOptionsSection")
  console.log(audioFeatures);
  const submit = useSubmit();

  const isSettingPicked = (setting:string)=>{
    return checkedBoxes.includes(setting)
  }

  const handleToggleSettingBox = (setting:string)=>{
    let newSettings:string[] = checkedBoxes;
    
    if(isSettingPicked(setting)){
      newSettings = newSettings.filter((s)=> s != setting);
    }
    else{
      newSettings.push(setting)
    }

    setCheckedBoxes(newSettings)
  }
  
  return(
    <>
      <div className="text-2xl">Vibe Features</div>

      <label htmlFor="acousticnesss">acousticnesss </label>
      <input onClick={()=>handleToggleSettingBox("acousticness")} defaultChecked={isSettingPicked("acousticness")} name="acousticnesss" id="acousticness" type="checkbox"></input>
      <br/>

      <label htmlFor="danceability">danceability </label>
      <input onClick={()=>handleToggleSettingBox("danceability")} defaultChecked={isSettingPicked("danceability")}name="danceability" id="danceability" type="checkbox"></input>
      <br/>

      <label htmlFor="energy">energy </label>
      <input onClick={()=>handleToggleSettingBox("energy")} defaultChecked={isSettingPicked("energy")} name="energy" id="energy" type="checkbox"></input>
      <br/>

      <label htmlFor="liveness">liveness </label>
      <input onClick={()=>handleToggleSettingBox("liveness")} defaultChecked={isSettingPicked("liveness")} name="liveness" id="liveness" type="checkbox"></input>
      <br/>

      <label htmlFor="valence">valence </label>
      <input onClick={()=>handleToggleSettingBox("valence")} defaultChecked={isSettingPicked("valence")} name="valence" id="valence" type="checkbox"></input>
      <br/>

      <div className="text-2xl">Tech Features</div>

      <label htmlFor="tempo">tempo </label>
      <input onClick={()=>handleToggleSettingBox("tempo")} defaultChecked={isSettingPicked("acousticness")} name="tempo" id="tempo" type="checkbox"></input>
      <br/>

      <label htmlFor="duration">duration </label>
      <input onClick={()=>handleToggleSettingBox("duration")} defaultChecked={isSettingPicked("danceability")}name="duration" id="duration" type="checkbox"></input>
      <br/>

      <label htmlFor="time_signature">time signature </label>
      <input onClick={()=>handleToggleSettingBox("time_signature")} defaultChecked={isSettingPicked("energy")} name="time_signature" id="time_signature" type="checkbox"></input>
      <br/>

      <label htmlFor="instrumentalness">instrumentalness </label>
      <input onClick={()=>handleToggleSettingBox("instrumentalness")} defaultChecked={isSettingPicked("instrumentalness")} name="instrumentalness" id="liveness" type="checkbox"></input>
      <br/>

      <label htmlFor="key">key </label>
      <input onClick={()=>handleToggleSettingBox("key")} defaultChecked={isSettingPicked("key")} name="key" id="key" type="checkbox"></input>
      <br/>

      <label htmlFor="mode">mode </label>
      <input onClick={()=>handleToggleSettingBox("mode")} defaultChecked={isSettingPicked("mode")} name="mode" id="mode" type="checkbox"></input>
      <br/>
      <button 
      onClick={()=>{
        const submissionJSON = JSON.stringify({settings:checkedBoxes,audioFeatures});
        console.log(submissionJSON)
        submit(
  submissionJSON,
  { method: "post", encType: "application/json" }
);
        /*submit(
          JSON.stringify({settings:'test', audioFeatures: 'test2'}),
          {method:"post", encType:"application/json"}
        )*/
      }}
      className="bg-green-900 text-purple-300 p-2 rounded-full"
      >
        Recommend!
      </button>
    </>
  )
}
/*

~NERD Features~
tempo
duration
time signature
instrumentalness
key
mode
*/