import {  redirect,useSubmit } from "react-router-dom";
import type {Params} from "react-router-dom";

import { AudioFeatures } from "../interfaces";
import { requestSpotifyRec } from "../api";


interface IURLParams{
  params: Params,
  request: Request
}

export async function action({params,request}:IURLParams){  
  const access_token:string|null = localStorage.getItem("access_token");

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
}

interface RecOptionsSectionProps{
  checkedBoxes: string[],
  setCheckedBoxes: React.Dispatch<string[]>,
  audioFeatures: AudioFeatures
}

export default function RecOptionsSection({checkedBoxes,setCheckedBoxes, audioFeatures}:RecOptionsSectionProps){

  const submit = useSubmit();

  const vibeFeatures: string[] = [
    "acousticness",
    "danceability",
    "energy",
    "liveness",
    "valence"
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
      <div className="text-xl w-screen text-center  font-bold text-green-100">What do you like about this song?</div>
      <div className="basis-6/12  grid grid-cols-2 justify-items-center">
      <div>
      <div className="text-2xl font-bold text-green-400">Vibe Features</div>
      {vibeFeatures.map((feature)=>{
        return (
          <div key={feature} className="m-2">
            <input 
              onClick={()=>handleToggleSettingBox(feature)} 
              defaultChecked={isSettingPicked(feature)} 
              name={feature} 
              id={feature} 
              type="checkbox">
            </input>
            <label className="text-lg text-green-200"htmlFor={feature}> {feature}</label>
            <br/>
          </div>
        )
      })}
      </div>

      <div>
      <div className="text-2xl font-bold text-green-400">Tech Features</div>
      
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
            <label className="text-lg text-green-200"htmlFor={feature[0]}> {feature[1]}</label>
            <br/>
          </div>
        )
      })}
      </div>
      </div>

      <div className="flex flex-col basis-2/12 grow-[3]">
      <button 
        onClick={()=>{
          const submissionJSON = JSON.stringify({settings:checkedBoxes,audioFeatures});
          submit(
            submissionJSON,
            { method: "post", encType: "application/json" }
          );
        }}
        className="basis-1/2 bg-green-950 hover:bg-green-600 text-white text-2xl font-bold p-2 w-full mt-2"
        >Get Recommendations
      </button>
      <a 
        href="/real-top/month"
        className="basis-1/2 flex items-center justify-center  bg-stone-900 hover:text-purple-600 text-purple-200 text-2xl font-bold p-2 w-screen mb-0 text-center"
        >View Top Songs
      </a>
      </div>
    </>
  )
}
