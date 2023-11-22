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
  console.log("in action");
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
  console.log(trackId)
  const requestJson = await request.json();
  //console.log(requestJson);

  audioFeatures = requestJson.audioFeatures;
  console.log("audio features in action: ")
  console.log(audioFeatures);

  settings = requestJson.settings;
  console.log("settings in action: ");
  console.log(settings);
  //console.log(requestJson.settings);

  //Fill audioFeatures
  

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
  /*const actionData = useActionData();
  const [recList,setRecList] = useState<ITrack[]>([]);

  useEffect(()=>{
   if(Array.isArray(actionData)){
    const tempTrackList:ITrack[] = [];
    for(let i=0; i < actionData.length;i++){
      const tempTrackInfo:ITrack = {id:"",name:"",artist:"",image:""}
      if(actionData[i].id){
        tempTrackInfo.id= actionData[i].id
      }
      if(actionData[i].name){
        tempTrackInfo.name = actionData[i].name;
      }
      if(actionData[i].artists){
        if(Array.isArray(actionData[i].artists) && actionData[i].artists.length > 0){
          tempTrackInfo.artist = actionData[i].artists[0].name
        }
      }
      if(actionData[i].album && actionData[i].album.images){
        if(Array.isArray(actionData[i].album.images)
          && actionData[i].album.images.length > 0){
            tempTrackInfo.image = actionData[i].album.images[actionData[i].album.images.length-1].url;
          }
      }
      tempTrackList.push(tempTrackInfo);
    }
    setRecList(tempTrackList);
   } 
  },[actionData]);

  console.log(recList);
  */

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
    <h1>
      This is where u input ur stuff
    </h1> 
      <div className="text-2xl">Vibe Features</div>
      <label htmlFor="acousticnesss">acousticnesss </label>
      <input onClick={()=>handleToggleSettingBox("acousticness")} defaultChecked={isSettingPicked("acousticness")} name="acousticnesss" id="checkbox" type="checkbox"></input>
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
~VIBE Features~
acousticnesss
danceability
energy
liveness
valence (how happy)

~NERD Features~
tempo
duration
time signature
instrumentalness
loudness
*/