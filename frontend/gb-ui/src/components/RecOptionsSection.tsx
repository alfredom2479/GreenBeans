import {  redirect,useSubmit } from "react-router-dom";
import type {Params} from "react-router-dom";

import { AudioFeatures } from "../interfaces";
import { requestSpotifyRec } from "../api";


interface IURLParams{
  params: Params,
  request: Request
}

export async function action({params,request}:IURLParams){  
  let access_token:string|null = localStorage.getItem("access_token");
  let isLoggedIn = true;

  let trackId:string = "default_track_id";

  if(!access_token || access_token === undefined){
    access_token = "";
    isLoggedIn = false;
  }

  if(params.trackid && typeof params.trackid === "string"){
    trackId = params.trackid;
  }
  else{
    redirect("/");
  }
  let audioFeatures:AudioFeatures = {};
  let settings:string[] = [];
  const requestJson = await request.json();

  audioFeatures = requestJson.audioFeatures;

  settings = requestJson.settings;

    const data = await requestSpotifyRec(access_token,trackId,settings,audioFeatures, isLoggedIn);
    console.log(data);

    if(data.tracks && Array.isArray(data.tracks)){
      return data.tracks;
    }

    return [];
}

interface RecOptionsSectionProps{
  checkedBoxes: string[],
  setCheckedBoxes: React.Dispatch<string[]>,
  audioFeatures: AudioFeatures,
  setIsSelectingOptions: React.Dispatch<boolean>
}

export default function RecOptionsSection({checkedBoxes,setCheckedBoxes, audioFeatures, setIsSelectingOptions}:RecOptionsSectionProps){

  const submit = useSubmit();

  const vibeFeatures: string[][] = [
    ["acousticness", "Acousticness"],
    ["danceability","Danceability"],
    ["energy","Energy"],
    ["liveness","Liveness"],
    ["valence","Valence"]
  ]

  const techFeatures: string[][] = [
    ["tempo","Tempo"],
    ["duration_ms","Duration"],
    ["time_signature","Time Signature"],
    ["instrumentalness","Instrumentalness"],
    ["key","Key"]
  ]

  //Functions

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
    <div className="flex flex-col justify-between max-w-full h-full py-2  overflow-y-scroll">
      <div className="flex justify-items-center">
      <div className="w-full">
      {vibeFeatures.map((feature)=>{
        return (
          <div key={feature[0]} className="m-2">
            <input 
              onClick={()=>handleToggleSettingBox(feature[0])} 
              defaultChecked={isSettingPicked(feature[0])} 
              name={feature[0]} 
              id={feature[0]} 
              type="checkbox">
            </input>
            <label className="text-2xl text-green-50" htmlFor={feature[0]}> {feature[1]}</label>
            <br/>
          </div>
        )
      })}
      
      {techFeatures.map((feature)=>{
        return (
          <div key={feature[0]} className="m-2">
            <input 
              onClick={()=>handleToggleSettingBox(feature[0])} 
              defaultChecked={isSettingPicked(feature[0])} 
              name={feature[0]} 
              id={feature[0]} 
              type="checkbox">
            </input>
            <label className="text-2xl text-green-50"htmlFor={feature[0]}> {feature[1]}</label>
            <br/>
          </div>
        )
      })}
      </div>
      </div>

      
    </div>
<div className="flex flex-col items-center">
      <button 
        onClick={()=>{
          const submissionJSON = JSON.stringify({settings:checkedBoxes,audioFeatures});
          submit(
            submissionJSON,
            { method: "post", encType: "application/json" }
          );
          setIsSelectingOptions(false)
        }}
        className=" max-h-[10vh] bg-green-50 hover:bg-green-200 text-stone-900 text-xl rounded-xl font-bold p-2 w-1/2 text-center flex justify-center items-center"
        >Recommend!
      </button>
      
      </div>
      </>
  )
}
